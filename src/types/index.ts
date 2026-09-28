export type UserRole = 'student' | 'admin';
export type AttemptType = 'NDA 1' | 'NDA 2' | 'Both';
export type AppLanguage = 'en' | 'hi' | 'bn';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  targetExam: string;
  targetAttempt: AttemptType;
  preferredLanguage: AppLanguage;
  dailyTarget: number;
  streak: number;
  lastActiveAt?: string;
  createdAt: string;
  updatedAt?: string;
  onboardingCompleted: boolean;
}

export type PriorityType = 'HIGH' | 'MEDIUM' | 'LOW';
export type ArticleStatus = 'draft' | 'review' | 'published' | 'rejected' | 'archived';

export interface CurrentAffair {
  id: string;
  title: string;
  summary: string;
  detailedExplanation: string;
  category: string;
  subCategory?: string;
  publishedAt: string;
  retrievedAt?: string;
  sourceName: string;
  sourceUrl?: string;
  ndaRelevance: string;
  priority: PriorityType;
  importantFacts: string[];
  people?: string[];
  places?: string[];
  organizations?: string[];
  dates?: string[];
  numbers?: string[];
  staticGK: string;
  relatedTopics?: string[];
  status: ArticleStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface Question {
  id: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  source: string;
  articleId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  quizType: 'daily' | 'weekly' | 'monthly' | 'category' | 'weak-areas' | 'custom' | 'rapid-fire';
  category?: string;
  score: number;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  timeSpentSeconds: number;
  answers: Record<string, string>; // Maps questionId to selected option (A/B/C/D)
  attemptedAt: string;
}

export interface Bookmark {
  id: string;
  userId: string;
  itemType: 'article' | 'question';
  itemId: string;
  createdAt: string;
}

export interface RevisionItem {
  id: string;
  userId: string;
  itemId: string;
  itemType: 'article' | 'question';
  status: 'new' | 'learning' | 'review' | 'mastered';
  reviewCount: number;
  lastReviewedAt?: string;
  nextReviewAt: string;
  correctCount: number;
  wrongCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionReport {
  id: string;
  userId: string;
  userEmail: string;
  questionId: string;
  reason: 'Wrong Answer' | 'Ambiguous Question' | 'Incorrect Fact' | 'Typo' | 'Other';
  description: string;
  status: 'pending' | 'resolved' | 'rejected';
  createdAt: string;
  resolvedAt?: string;
}

export interface ContentSource {
  sourceId: string;
  name: string;
  url: string;
  type: string;
  enabled: boolean;
  trustLevel: 'official' | 'reputable' | 'user-submitted';
  lastFetchedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AuditLog {
  id: string;
  adminUid: string;
  action: string;
  target: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface AIMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export interface UserQuery {
  id: string;
  name: string;
  email: string;
  phone?: string;
  category: 'Exam Guidance' | 'Syllabus Topic Request' | 'Defense News Inquiry' | 'Feature Suggestion' | 'Other';
  query: string;
  urgency?: 'Normal' | 'High' | 'Immediate';
  status: 'received' | 'in-review' | 'answered';
  aiAnswerPreview?: string;
  createdAt: string;
}
