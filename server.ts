import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Fallback GAT Knowledge Base for common defense & GK queries when network is slow
function getFallbackGATResponse(query: string): string {
  const q = query.toLowerCase();
  if (q.includes("missile") || q.includes("drdo") || q.includes("weapon") || q.includes("defence")) {
    return `### 🛡️ GAT Defense Capsule: Indian Missile Systems & DRDO
- **Agni Series**: Surface-to-Surface Ballistic Missiles (Agni-V: Intercontinental Ballistic Missile with MIRV technology, ~5,000+ km range).
- **Prithvi Series**: Tactical Surface-to-Surface short-range ballistic missile (Liquid propulsion).
- **BrahMos**: Supersonic Cruise Missile (Joint venture between India's DRDO and Russia's NPOM, Mach 2.8 - 3.0).
- **Akash**: Surface-to-Air Missile (SAM) defense system (range ~25–30 km, indigenous seeker).
- **Astra**: Beyond Visual Range Air-to-Air Missile (BVRAAM), integrated on Su-30MKI & Tejas Mk1A.
- **Pinaka**: Multi-Barrel Rocket Launcher System (MBRL) developed by ARDE Pune.

**NDA Exam Angle:**
UPSC frequently asks the propulsion type (solid vs liquid), missile class (Cruise vs Ballistic), and designated testing ranges (Integrated Test Range - Chandipur, Abdul Kalam Island, Odisha).`;
  }
  if (q.includes("command") || q.includes("armed forces") || q.includes("army") || q.includes("navy") || q.includes("air force")) {
    return `### 🎖️ Indian Armed Forces Commands Overview
- **Tri-Service Commands (2)**:
  1. Strategic Forces Command (SFC) - New Delhi
  2. Andaman & Nicobar Command (ANC) - Port Blair (First operational unified theater command)
- **Indian Army (7 Commands)**:
  - Eastern: Kolkata | Western: Chandimandir | Northern: Udhampur
  - Southern: Pune | Central: Lucknow | South-Western: Jaipur | ARTRAC: Shimla
- **Indian Air Force (7 Commands)**:
  - Western: New Delhi | Eastern: Shillong | Central: Prayagraj
  - South-Western: Gandhinagar | Southern: Thiruvananthapuram
  - Training: Bengaluru | Maintenance: Nagpur
- **Indian Navy (3 Commands)**:
  - Western: Mumbai | Eastern: Visakhapatnam | Southern (Training): Kochi

**NDA Exam Angle:**
Questions frequently test matching headquarters locations with respective commands and the roles of Tri-Service unified structures.`;
  }
  return `### 📖 NDA GAT Exam Guidance & Preparation Strategy
- **Syllabus Focus**: GAT (General Ability Test) carries 600 marks in NDA (English: 200 marks, General Knowledge: 400 marks).
- **Key GK Segments**:
  1. **Defence & National Security**: Bilateral military exercises (e.g., Varuna, Malabar, Surya Kiran, Yudh Abhyas), procurement deals, and new ship/aircraft inductions.
  2. **Modern Indian History & Freedom Struggle**: Gandhian Era (1915-1947), Constitutional milestones (Regulating Act to Indian Independence Act).
  3. **Physical & Indian Geography**: River systems, ocean currents, Himalayan mountain passes, and climate classification.
  4. **General Science**: Core Physics laws (Optics, Mechanics, Electricity), Chemistry (Compounds & Metals), and Human Physiology.

Feel free to ask for any specific topic breakdown, military treaty analysis, or high-yield practice MCQs!`;
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

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
- "NDA Relevance" highlighting strategic defense agreements, geographical locations, ministries, dates, international summits, sports awards, and appointments.
- Extraction of high-value static GK connections.
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
              organizations: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Organizations mentioned." },
              dates: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Critical dates mentioned." },
              numbers: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Key numbers or statistics mentioned." },
              staticGK: { type: Type.STRING, description: "Static GK facts related to the topic." },
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

  // Endpoint: NDA AI General Assistant (GAT Coach)
  app.post('/api/gemini/assistant', async (req, res) => {
    try {
      const { query, history = [], context = "" } = req.body;
      if (!query) {
        return res.status(400).json({ error: "Missing user query" });
      }

      const systemInstruction = `You are "NDA AI" (GAT Coach), an elite UPSC NDA/NA General Knowledge and Defence Studies Mentor.
Your role is to guide aspirants with high-precision, exam-oriented knowledge in Defence Technology, Geopolitics, National Schemes, Modern History, Geography, and General Science.
Always format your response with clean, professional Markdown:
- Use bullet points for key facts, dates, headquarters, and military specifications.
- Structure your answer with clear sections:
  - **CURRENT AFFAIR / CORE CONCEPT**
  - **STATIC GK CONNECTION** (Founding dates, treaties, river basins, constitutional articles, missile ranges, etc.)
  - **NDA EXAM ANGLE** (Likely question patterns in NDA GAT, key traps)
- If the student requests mock questions, provide 3-5 high-quality NDA MCQs with correct answers and explanations.
- Maintain an encouraging, authoritative, military-officer caliber tone.`;

      const formattedHistory = Array.isArray(history)
        ? history
            .filter((msg: any) => msg && (msg.role === 'user' || msg.role === 'model') && msg.parts?.[0]?.text)
            .slice(-6)
            .map((msg: any) => ({
              role: msg.role,
              parts: [{ text: String(msg.parts[0].text) }]
            }))
        : [];

      const contents = [
        ...formattedHistory,
        {
          role: "user",
          parts: [{ text: query + (context ? `\n\n[Grounding Knowledge Base]:\n${context}` : "") }]
        }
      ];

      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: contents,
          config: {
            systemInstruction: systemInstruction,
            temperature: 0.7,
          }
        });

        const text = response.text;
        if (text) {
          return res.json({ text });
        }
      } catch (geminiError: any) {
        console.warn("Gemini generation notice, serving GAT knowledge capsule:", geminiError);
        const fallback = getFallbackGATResponse(query);
        return res.json({ text: fallback });
      }

      const fallback = getFallbackGATResponse(query);
      res.json({ text: fallback });
    } catch (error: any) {
      console.error("NDA AI Assistant Error:", error);
      const fallback = getFallbackGATResponse(req.body?.query || "");
      res.json({ text: fallback });
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

      res.json({ text: response.text || "Here is key context regarding this article for your GAT revision." });
    } catch (error: any) {
      console.error("Article Chat Error:", error);
      res.status(500).json({ error: error.message || "Failed to get AI explanation" });
    }
  });

  // Endpoint: Text to Speech Briefing generator
  app.post('/api/gemini/tts', async (req, res) => {
    try {
      const { text } = req.body;
      if (!text) {
        return res.status(400).json({ error: "Missing text for speech generation" });
      }

      const truncatedText = text.length > 500 ? text.substring(0, 500) + "..." : text;

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

  // Setup Vite dev server middleware or static serve in production
  if (process.env.NODE_ENV === 'production') {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) return next();
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NDA Current Affairs AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Fatal error starting server:", err);
});
