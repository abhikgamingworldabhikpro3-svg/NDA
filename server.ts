import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from "@google/genai";
import * as admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Initialize Gemini API
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Category definition for validations
const ALLOWED_CATEGORIES = [
  "National", "Defence", "International", "Science & Technology", "Space",
  "Economy", "Government Schemes", "Environment", "Awards", "Sports",
  "Appointments", "Important Days", "Reports & Indexes", "International Organisations",
  "Places in News"
];

// Initialize Firebase Admin with Application Default Credentials
// and configuration from firebase-applet-config.json
const configPath = path.resolve(__dirname, './firebase-applet-config.json');
let firebaseConfig: any = {};
let dbAdmin: any = null;

try {
  if (fs.existsSync(configPath)) {
    firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    const adminAny: any = admin;
    adminAny.initializeApp({
      credential: adminAny.credential.applicationDefault(),
      projectId: firebaseConfig.projectId
    });
    // Use the specific firestore database ID from the applet config
    dbAdmin = getFirestore(firebaseConfig.firestoreDatabaseId);
    console.log(`Firebase Admin initialized successfully with Database: ${firebaseConfig.firestoreDatabaseId}`);
  } else {
    console.warn("firebase-applet-config.json not found. Database updates might be unavailable.");
  }
} catch (err) {
  console.error("Failed to initialize Firebase Admin SDK:", err);
}

// Helper: Seed or background update for a missing date
async function generateDailyAffairsForDate(dateStr: string) {
  if (!dbAdmin) return;
  
  console.log(`[AutoUpdate] Starting automated content synthesis for date: ${dateStr}`);
  
  // Choose 3 major diverse categories to generate for each day so we cover everything broadly without quota exhaustion
  const categoriesToGenerate = [
    "Defence", "National", "International", "Science & Technology", "Space", "Economy", "Government Schemes", "Awards", "Sports"
  ];
  
  // Pick 3 categories randomly or systematically based on day of month to ensure variety
  const dayNum = new Date(dateStr).getDate() || 1;
  const selectedCategories = [
    categoriesToGenerate[dayNum % categoriesToGenerate.length],
    categoriesToGenerate[(dayNum + 3) % categoriesToGenerate.length],
    categoriesToGenerate[(dayNum + 6) % categoriesToGenerate.length]
  ];

  for (const category of selectedCategories) {
    try {
      // Check if an article already exists for this category on this day
      const existingSnap = await dbAdmin.collection('currentAffairs')
        .where('category', '==', category)
        .where('publishedAt', '>=', `${dateStr}T00:00:00Z`)
        .where('publishedAt', '<=', `${dateStr}T23:59:59Z`)
        .limit(1)
        .get();

      if (!existingSnap.empty) {
        console.log(`[AutoUpdate] Article already exists for ${category} on ${dateStr}. Skipping...`);
        continue;
      }

      console.log(`[AutoUpdate] Synthesizing high-yield ${category} current affairs for ${dateStr}...`);

      const prompt = `You are a professional UPSC NDA/NA exam analyst. 
Search the web for real, major, high-yield current affairs news that happened on or around ${dateStr} in the category "${category}".
Compile it into an exhaustive, highly detailed study package (at least 300-500 words of detailed explanation) suitable for GAT GK preparation.
Structure the detailedExplanation in beautiful, multi-chapter markdown format including sections on Strategic Context, Technical/Syllabus Parameters, Geopolitical Implications, and static GK linkages. 
Include a realistic multiple-choice practice question based on this event.
Respond strictly with valid JSON.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "Clear exam-oriented headline." },
              summary: { type: Type.STRING, description: "A short 2-3 sentence overview." },
              detailedExplanation: { type: Type.STRING, description: "The full breakdown in clean Markdown formatting, using bullet points." },
              subCategory: { type: Type.STRING, description: "A specific topic tag." },
              ndaRelevance: { type: Type.STRING, description: "Why an NDA candidate must know this." },
              priority: { type: Type.STRING, enum: ["HIGH", "MEDIUM", "LOW"] },
              importantFacts: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Short key bullet facts (max 5)."
              },
              organizations: { type: Type.ARRAY, items: { type: Type.STRING } },
              places: { type: Type.ARRAY, items: { type: Type.STRING } },
              staticGK: { type: Type.STRING, description: "Static GK connections." },
              question: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  optionA: { type: Type.STRING },
                  optionB: { type: Type.STRING },
                  optionC: { type: Type.STRING },
                  optionD: { type: Type.STRING },
                  correctAnswer: { type: Type.STRING, enum: ["A", "B", "C", "D"] },
                  explanation: { type: Type.STRING }
                },
                required: ["question", "optionA", "optionB", "optionC", "optionD", "correctAnswer", "explanation"]
              }
            },
            required: ["title", "summary", "detailedExplanation", "ndaRelevance", "priority", "importantFacts", "staticGK", "question"]
          }
        }
      });

      const text = response.text;
      if (!text) continue;

      const result = JSON.parse(text);
      const articleId = `art_auto_${category.toLowerCase().replace(/[^a-z]/g, '')}_${dateStr.replace(/-/g, '')}`;
      const questionId = `q_auto_${category.toLowerCase().replace(/[^a-z]/g, '')}_${dateStr.replace(/-/g, '')}`;

      // Save Article
      await dbAdmin.collection('currentAffairs').doc(articleId).set({
        id: articleId,
        title: result.title,
        summary: result.summary,
        detailedExplanation: result.detailedExplanation,
        category: category,
        subCategory: result.subCategory || "General",
        publishedAt: `${dateStr}T10:00:00Z`,
        retrievedAt: new Date().toISOString(),
        sourceName: "Automated Global Intelligence Monitor",
        sourceUrl: "https://pib.gov.in",
        ndaRelevance: result.ndaRelevance,
        priority: result.priority || "MEDIUM",
        importantFacts: result.importantFacts || [],
        organizations: result.organizations || [],
        places: result.places || [],
        staticGK: result.staticGK || "",
        status: "published",
        createdAt: new Date().toISOString()
      });

      // Save associated Question
      await dbAdmin.collection('questions').doc(questionId).set({
        id: questionId,
        articleId: articleId,
        question: result.question.question,
        optionA: result.question.optionA,
        optionB: result.question.optionB,
        optionC: result.question.optionC,
        optionD: result.question.optionD,
        correctAnswer: result.question.correctAnswer,
        explanation: result.question.explanation,
        category: category,
        difficulty: result.priority === "HIGH" ? "hard" : (result.priority === "LOW" ? "easy" : "medium"),
        source: "Daily Automatic Intelligence Update",
        createdAt: new Date().toISOString()
      });

      console.log(`[AutoUpdate] Synthesized and saved article & question for ${category} on ${dateStr}`);
    } catch (err) {
      console.error(`[AutoUpdate] Failed to generate update for ${category} on ${dateStr}:`, err);
    }
  }
}

// Background Task: Checks and runs the automated daily update cycle since July 1, 2026
async function checkAndRunDailyUpdates() {
  if (!dbAdmin) return;
  console.log("[AutoUpdate] Initiating automated background daily update check...");

  try {
    const startDate = new Date("2026-07-01");
    const today = new Date();
    
    // We only update up to today. Let's list a few target dates to check.
    // To prevent API abuse, we always check today, yesterday, and 3-5 random dates since July 1
    const targetDates: string[] = [];
    
    // Add today & yesterday
    const formatDate = (d: Date) => d.toISOString().split('T')[0];
    targetDates.push(formatDate(today));
    
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    targetDates.push(formatDate(yesterday));

    // Select 3 random historical dates since July 1st, 2026 to gradually populate all history
    const totalDaysDiff = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 3000 * 24));
    for (let i = 0; i < 3; i++) {
      const randomOffset = Math.floor(Math.random() * (totalDaysDiff || 1));
      const randomDate = new Date(startDate.getTime());
      randomDate.setDate(startDate.getDate() + randomOffset);
      const randomDateStr = formatDate(randomDate);
      if (!targetDates.includes(randomDateStr) && randomDateStr <= formatDate(today)) {
        targetDates.push(randomDateStr);
      }
    }

    console.log(`[AutoUpdate] Selected target dates for daily audit: ${JSON.stringify(targetDates)}`);

    for (const dateStr of targetDates) {
      await generateDailyAffairsForDate(dateStr);
    }

    console.log("[AutoUpdate] Automated background daily update check completed.");
  } catch (err) {
    console.error("[AutoUpdate] Background check error:", err);
  }
}

// Kickoff background updates on startup and run every 12 hours
setTimeout(() => {
  checkAndRunDailyUpdates();
  setInterval(checkAndRunDailyUpdates, 12 * 60 * 60 * 1000);
}, 5000);


// Endpoint: Dynamic AI generation when search returns empty matches
app.post('/api/gemini/generate-on-demand', async (req, res) => {
  try {
    const { searchQuery, category } = req.body;
    if (!searchQuery) {
      return res.status(400).json({ error: "Missing searchQuery for generation" });
    }

    console.log(`[OnDemand] Request received for search query: "${searchQuery}" in category: "${category}"`);

    const prompt = `You are an expert UPSC NDA General Ability Test (GAT) exam prep analyst.
A student searched for "${searchQuery}" but found no results in the static database.
Search the web for real, major, high-yield defense, national, international, or scientific developments matching or closely related to "${searchQuery}" since July 1, 2026.
Compile this into an exhaustive, highly detailed study capsule (at least 300-500 words of detailed explanation) formatted in clear, professional markdown chapters (Strategic Context, Technical/Syllabus Parameters, Geopolitical Implications, and static GK linkages).
Also, generate exactly ONE practice multiple choice question with options A, B, C, D, a correct answer, and an educational explanation.
Respond strictly with valid JSON.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "A high-quality exam-oriented headline." },
            summary: { type: Type.STRING, description: "A short 2-3 sentence overview." },
            detailedExplanation: { type: Type.STRING, description: "The full breakdown in clean Markdown formatting, using bullet points." },
            category: { type: Type.STRING, enum: ALLOWED_CATEGORIES, description: "The primary NDA syllabus category." },
            subCategory: { type: Type.STRING, description: "A more specific topic tag." },
            ndaRelevance: { type: Type.STRING, description: "Specific NDA exam angle. Why an NDA aspirant must know this." },
            priority: { type: Type.STRING, enum: ["HIGH", "MEDIUM", "LOW"] },
            importantFacts: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Short, quick remember facts (maximum 6 points)."
            },
            organizations: { type: Type.ARRAY, items: { type: Type.STRING } },
            places: { type: Type.ARRAY, items: { type: Type.STRING } },
            staticGK: { type: Type.STRING, description: "Static GK facts related to the topic." },
            question: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                optionA: { type: Type.STRING },
                optionB: { type: Type.STRING },
                optionC: { type: Type.STRING },
                optionD: { type: Type.STRING },
                correctAnswer: { type: Type.STRING, enum: ["A", "B", "C", "D"] },
                explanation: { type: Type.STRING }
              },
              required: ["question", "optionA", "optionB", "optionC", "optionD", "correctAnswer", "explanation"]
            }
          },
          required: ["title", "summary", "detailedExplanation", "category", "ndaRelevance", "priority", "importantFacts", "staticGK", "question"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response text returned from Gemini API");
    }

    const parsedData = JSON.parse(text);

    // Save directly to the Firestore database if admin connection is active
    if (dbAdmin) {
      const artId = `art_ondemand_${Math.random().toString(36).substr(2, 9)}`;
      const qId = `q_ondemand_${Math.random().toString(36).substr(2, 9)}`;

      const newArticle = {
        id: artId,
        title: parsedData.title,
        summary: parsedData.summary,
        detailedExplanation: parsedData.detailedExplanation,
        category: parsedData.category || category || "National",
        subCategory: parsedData.subCategory || "General",
        publishedAt: new Date().toISOString(),
        retrievedAt: new Date().toISOString(),
        sourceName: "On-Demand Search Intelligence Engine",
        sourceUrl: "https://pib.gov.in",
        ndaRelevance: parsedData.ndaRelevance,
        priority: parsedData.priority || "MEDIUM",
        importantFacts: parsedData.importantFacts || [],
        organizations: parsedData.organizations || [],
        places: parsedData.places || [],
        staticGK: parsedData.staticGK || "",
        status: "published",
        createdAt: new Date().toISOString()
      };

      const newQuestion = {
        id: qId,
        articleId: artId,
        question: parsedData.question.question,
        optionA: parsedData.question.optionA,
        optionB: parsedData.question.optionB,
        optionC: parsedData.question.optionC,
        optionD: parsedData.question.optionD,
        correctAnswer: parsedData.question.correctAnswer,
        explanation: parsedData.question.explanation,
        category: parsedData.category || category || "National",
        difficulty: parsedData.priority === "HIGH" ? "hard" : (parsedData.priority === "LOW" ? "easy" : "medium"),
        source: "On-Demand Search Query Generator",
        createdAt: new Date().toISOString()
      };

      await dbAdmin.collection('currentAffairs').doc(artId).set(newArticle);
      await dbAdmin.collection('questions').doc(qId).set(newQuestion);
      console.log(`[OnDemand] Successfully generated and stored custom current affair & MCQ for query: "${searchQuery}"`);
    }

    res.json(parsedData);
  } catch (error: any) {
    console.error("Gemini OnDemand Ingestion Error:", error);
    res.status(500).json({ error: error.message || "Failed to process current affairs article on-demand" });
  }
});


// Endpoint: AI Ingestion / Article Processing
app.post('/api/gemini/process-article', async (req, res) => {
  try {
    const { rawContent, sourceName, sourceUrl } = req.body;
    if (!rawContent) {
      return res.status(400).json({ error: "Missing rawContent for processing" });
    }

    const prompt = `You are an expert UPSC NDA/NA exam preparation content analyst.
Analyze the following raw current affairs content and convert it into a highly structured, exam-oriented study package.
Focus on:
- Exam-oriented presentation: crisp, bulleted, and factual.
- "NDA Relevance" or "Why it matters for NDA" highlighting strategic defense agreements, geographical locations in the news, ministries, dates, international summits, sports awards, and appointments.
- Extraction of high-value static GK connections (e.g., if DRDO is mentioned, add details about DRDO founding, head, and key labs).
- Generating short bullet points for important facts.

Raw Content:
${rawContent}

Respond strictly with valid JSON fitting the requested format schema.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "A high-quality exam-oriented headline." },
            summary: { type: Type.STRING, description: "A short 2-3 sentence overview." },
            detailedExplanation: { type: Type.STRING, description: "The full breakdown in clean Markdown formatting, using bullet points." },
            category: { type: Type.STRING, enum: ALLOWED_CATEGORIES, description: "The primary NDA syllabus category." },
            subCategory: { type: Type.STRING, description: "A more specific topic tag." },
            ndaRelevance: { type: Type.STRING, description: "Specific NDA exam angle. Why an NDA aspirant must know this." },
            priority: { type: Type.STRING, enum: ["HIGH", "MEDIUM", "LOW"], description: "Exam importance priority." },
            importantFacts: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Short, quick remember facts (maximum 8 points)."
            },
            people: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Key people names mentioned." },
            places: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Key geographic places mentioned." },
            organizations: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Organizations like DRDO, ISRO, WHO, UN." },
            dates: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Critical dates mentioned." },
            numbers: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Key numbers or statistics mentioned." },
            staticGK: { type: Type.STRING, description: "Static GK facts related to the topic (Founding dates, capitals, currencies, headquarters, geography)." },
            relatedTopics: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["title", "summary", "detailedExplanation", "category", "ndaRelevance", "priority", "importantFacts", "staticGK"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("No response text returned from Gemini API");
    }

    const parsedData = JSON.parse(resultText);
    res.json(parsedData);
  } catch (error: any) {
    console.error("Gemini Ingestion Error:", error);
    res.status(500).json({ error: error.message || "Failed to process current affairs article" });
  }
});

// Endpoint: AI MCQ Generator from Ingested Article
app.post('/api/gemini/generate-questions', async (req, res) => {
  try {
    const { articleTitle, category, content, count = 5, difficulty = "medium" } = req.body;
    if (!content) {
      return res.status(400).json({ error: "Missing content to generate questions" });
    }

    const prompt = `You are a UPSC NDA examiner creating mock test questions for the General Ability Test (GAT) section.
Generate exactly ${count} multiple-choice questions based on the following article content:
Article Title: ${articleTitle}
Category: ${category}
Content: ${content}

Requirements:
- Difficulty level: ${difficulty} (easy, medium, hard).
- Each question must have exactly ONE clearly correct answer.
- Distractors must be realistic but distinct.
- Provide a clear, educational explanation connecting the question back to the article and any relevant static GK.
- Avoid duplicate options or ambiguous wording.

Respond strictly with valid JSON in the requested schema format.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING, description: "Clear, syllabus-aligned question." },
              optionA: { type: Type.STRING },
              optionB: { type: Type.STRING },
              optionC: { type: Type.STRING },
              optionD: { type: Type.STRING },
              correctAnswer: { type: Type.STRING, enum: ["A", "B", "C", "D"], description: "The single correct option." },
              explanation: { type: Type.STRING, description: "Explanation detailing why the option is correct and static GK context." }
            },
            required: ["question", "optionA", "optionB", "optionC", "optionD", "correctAnswer", "explanation"]
          }
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("No response text returned from Gemini API");
    }

    const parsedQuestions = JSON.parse(resultText);
    res.json(parsedQuestions);
  } catch (error: any) {
    console.error("Gemini MCQ Generator Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate practice questions" });
  }
});

// Endpoint: NDA AI General Assistant
app.post('/api/gemini/assistant', async (req, res) => {
  try {
    const { query, history = [], context = "" } = req.body;
    if (!query) {
      return res.status(400).json({ error: "Missing user query" });
    }

    const systemInstruction = `You are "NDA AI", a serious and dedicated General Knowledge & Current Affairs preparation coach for the UPSC NDA (National Defence Academy) entrance exam.
Your purpose is to explain complex national, international, defense, scientific, and space developments simply and professionally.
When explaining, always format your response with clean Markdown:
- Use bullet points for critical points.
- Structure your answer with clear headers:
  - **CURRENT AFFAIR CONTEXT** (What is the current news)
  - **STATIC GK CONNECTION** (Capital/currency, treaty, organization history, missile technology detail, etc.)
  - **NDA EXAM ANGLE** (Why this is high-priority for the NDA exam, what type of question UPSC can ask)
- If the student asks you for mock questions, generate 3-5 high-quality NDA MCQs with correct answers and explanations.
- Remain neutral on political or sensitive events. Report factual developments and official citations.
- If you have insufficient verified information to answer, state: "Insufficient verified information available."`;

    const contents = [...history, { role: "user", parts: [{ text: query + (context ? `\n\n[Context Data for Grounding]:\n${context}` : "") }] }];

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("NDA AI Assistant Error:", error);
    res.status(500).json({ error: error.message || "Failed to communicate with NDA AI" });
  }
});

// Endpoint: Article Specific Chat Assistant
app.post('/api/gemini/article-chat', async (req, res) => {
  try {
    const { query, articleTitle, articleContent, category } = req.body;
    if (!query || !articleContent) {
      return res.status(400).json({ error: "Missing parameters" });
    }

    const prompt = `You are "NDA AI", coaching an NDA aspirant on a specific current affair article.
Article Title: ${articleTitle}
Category: ${category}
Article Content:
${articleContent}

Student's Question:
"${query}"

Answer the student's question based strictly on this article and related static GK connections. Ensure your response is professional, educational, structured with bullet points, and directly outlines:
1. **Direct Answer**
2. **NDA Preparation Context** (How this fits GAT preparation)
Keep explanations crisp.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Article Chat Error:", error);
    res.status(500).json({ error: error.message || "Failed to get AI explanation" });
  }
});

// Endpoint: Text to Speech Briefing generator using Gemini Voice Engine
app.post('/api/gemini/tts', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Missing text for speech generation" });
    }

    const truncatedText = text.length > 500 ? text.substring(0, 500) + "..." : text;

    console.log(`[TTS] Synthesizing professional voice briefing for: "${truncatedText.substring(0, 50).replace(/\n/g, ' ')}..."`);

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash-lite-tts",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Here is the latest current affairs news update: ${truncatedText}`,
              speechMetadata: {
                style: "Clear, professional, authoritative military intelligence anchor",
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: "Kore" },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      throw new Error("No speech audio returned from voice engine");
    }

    res.json({ audio: base64Audio });
  } catch (error: any) {
    console.error("Gemini TTS Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate briefing audio" });
  }
});

// Serve frontend assets in production
if (process.env.NODE_ENV === 'production' || process.env.RENDER || path.resolve(__dirname, './dist')) {
  const distPath = path.join(__dirname, './dist');
  app.use(express.static(distPath));

  app.get('*', (req, res, next) => {
    // Avoid intercepting API routes
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Start Server on Port 3000 (prod) or 3001 (dev/proxy)
const PORT = process.env.NODE_ENV === 'production' ? 3000 : 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`NDA Current Affairs AI Backend listening on http://0.0.0.0:${PORT}`);
});
