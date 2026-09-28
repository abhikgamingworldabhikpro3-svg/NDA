import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db, auth, OperationType, handleFirestoreError } from '../firebase/config';
import { 
  UserProfile, 
  CurrentAffair, 
  Question, 
  QuizAttempt, 
  Bookmark, 
  RevisionItem, 
  QuestionReport, 
  ContentSource, 
  AuditLog,
  PriorityType,
  AttemptType,
  AppLanguage,
  UserQuery
} from '../types';

// ==========================================
// 1. AUTH & USER SERVICE
// ==========================================
export const userService = {
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const userRef = doc(db, 'users', uid);
      const snapshot = await getDoc(userRef);
      if (snapshot.exists()) {
        return snapshot.data() as UserProfile;
      }
      return null;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `users/${uid}`);
    }
  },

  async createUserProfile(profile: Omit<UserProfile, 'createdAt'>): Promise<void> {
    const path = `users/${profile.uid}`;
    try {
      const userRef = doc(db, 'users', profile.uid);
      await setDoc(userRef, {
        ...profile,
        createdAt: new Date().toISOString(),
        streak: 0,
        onboardingCompleted: false
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  },

  async updateUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
    const path = `users/${uid}`;
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        ...data,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  },

  // Tracks a study action and increments/resets the daily streak.
  async recordUserStudyAction(uid: string): Promise<void> {
    try {
      const profile = await this.getUserProfile(uid);
      if (!profile) return;

      const now = new Date();
      const lastActiveStr = profile.lastActiveAt;
      let newStreak = profile.streak || 0;

      if (!lastActiveStr) {
        newStreak = 1;
      } else {
        const lastActive = new Date(lastActiveStr);
        
        // Zero out times to calculate date difference in local day terms
        const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const lastDate = new Date(lastActive.getFullYear(), lastActive.getMonth(), lastActive.getDate());
        
        const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          // Continuous streak!
          newStreak += 1;
        } else if (diffDays > 1) {
          // Broken streak, reset
          newStreak = 1;
        } // diffDays === 0 means already studied today, keep streak the same
      }

      await this.updateUserProfile(uid, {
        streak: newStreak,
        lastActiveAt: now.toISOString()
      });
    } catch (err) {
      console.error("Streak tracking error:", err);
    }
  }
};

// ==========================================
// 2. ARTICLES (CURRENT AFFAIRS) SERVICE
// ==========================================
export const articleService = {
  async getPublishedArticles(category?: string, filterPriority?: string): Promise<CurrentAffair[]> {
    try {
      const articlesRef = collection(db, 'currentAffairs');
      let q = query(articlesRef, where('status', '==', 'published'));
      
      if (category && category !== 'All') {
        q = query(q, where('category', '==', category));
      }
      if (filterPriority) {
        q = query(q, where('priority', '==', filterPriority));
      }

      // We perform client-side sorting if index isn't ready
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map((doc: any) => doc.data() as CurrentAffair);
      return list.sort((a: any, b: any) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'currentAffairs');
    }
  },

  async getArticleById(id: string): Promise<CurrentAffair | null> {
    try {
      const ref = doc(db, 'currentAffairs', id);
      const snapshot = await getDoc(ref);
      return snapshot.exists() ? (snapshot.data() as CurrentAffair) : null;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `currentAffairs/${id}`);
    }
  },

  async createAdminArticle(article: CurrentAffair): Promise<void> {
    try {
      const ref = doc(db, 'currentAffairs', article.id);
      await setDoc(ref, article);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `currentAffairs/${article.id}`);
    }
  },

  async updateAdminArticle(id: string, data: Partial<CurrentAffair>): Promise<void> {
    try {
      const ref = doc(db, 'currentAffairs', id);
      await updateDoc(ref, {
        ...data,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `currentAffairs/${id}`);
    }
  },

  async deleteAdminArticle(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'currentAffairs', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `currentAffairs/${id}`);
    }
  }
};

// ==========================================
// 3. QUESTIONS & QUIZZES SERVICE
// ==========================================
export const questionService = {
  async getAllQuestions(): Promise<Question[]> {
    try {
      const snapshot = await getDocs(collection(db, 'questions'));
      return snapshot.docs.map((doc: any) => doc.data() as Question);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'questions');
    }
  },

  async getQuestionsByCategory(category: string): Promise<Question[]> {
    try {
      const q = query(collection(db, 'questions'), where('category', '==', category));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc: any) => doc.data() as Question);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'questions');
    }
  },

  async getQuestionsByArticleId(articleId: string): Promise<Question[]> {
    try {
      const q = query(collection(db, 'questions'), where('articleId', '==', articleId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc: any) => doc.data() as Question);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'questions');
    }
  },

  async saveAdminQuestion(question: Question): Promise<void> {
    try {
      const ref = doc(db, 'questions', question.id);
      await setDoc(ref, question);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `questions/${question.id}`);
    }
  },

  async deleteAdminQuestion(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'questions', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `questions/${id}`);
    }
  }
};

export const quizService = {
  async submitQuizAttempt(userId: string, attempt: Omit<QuizAttempt, 'userId' | 'attemptedAt'>): Promise<void> {
    const attemptId = attempt.id;
    const path = `users/${userId}/quizAttempts/${attemptId}`;
    try {
      const ref = doc(db, 'users', userId, 'quizAttempts', attemptId);
      await setDoc(ref, {
        ...attempt,
        userId,
        attemptedAt: new Date().toISOString()
      });

      // Award study activity streak
      await userService.recordUserStudyAction(userId);

      // Automatically add wrong answers to Revision queue
      for (const [qId, selectedOption] of Object.entries(attempt.answers)) {
        // Fetch question details to confirm correctness
        const qRef = doc(db, 'questions', qId);
        const qSnap = await getDoc(qRef);
        if (qSnap.exists()) {
          const qData = qSnap.data() as Question;
          if (qData.correctAnswer !== selectedOption) {
            // User got it wrong, add to revision queue!
            await revisionService.addOrUpdateRevision(userId, qId, 'question', false);
          } else {
            // Got it right, update revision progress if it exists in revision
            await revisionService.addOrUpdateRevision(userId, qId, 'question', true);
          }
        }
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  },

  async getUserQuizAttempts(userId: string): Promise<QuizAttempt[]> {
    const path = `users/${userId}/quizAttempts`;
    try {
      const snapshot = await getDocs(collection(db, 'users', userId, 'quizAttempts'));
      const list = snapshot.docs.map((doc: any) => doc.data() as QuizAttempt);
      return list.sort((a: any, b: any) => new Date(b.attemptedAt).getTime() - new Date(a.attemptedAt).getTime());
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, path);
    }
  }
};

// ==========================================
// 4. BOOKMARK SERVICE
// ==========================================
export const bookmarkService = {
  async toggleBookmark(userId: string, itemType: 'article' | 'question', itemId: string): Promise<boolean> {
    const bookmarkId = `${itemType}_${itemId}`;
    const path = `users/${userId}/bookmarks/${bookmarkId}`;
    try {
      const ref = doc(db, 'users', userId, 'bookmarks', bookmarkId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        await deleteDoc(ref);
        return false; // unbookmarked
      } else {
        await setDoc(ref, {
          id: bookmarkId,
          userId,
          itemType,
          itemId,
          createdAt: new Date().toISOString()
        });
        return true; // bookmarked
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  },

  async isBookmarked(userId: string, itemType: 'article' | 'question', itemId: string): Promise<boolean> {
    const bookmarkId = `${itemType}_${itemId}`;
    try {
      const ref = doc(db, 'users', userId, 'bookmarks', bookmarkId);
      const snap = await getDoc(ref);
      return snap.exists();
    } catch (err) {
      return false;
    }
  },

  async getUserBookmarks(userId: string): Promise<Bookmark[]> {
    const path = `users/${userId}/bookmarks`;
    try {
      const snapshot = await getDocs(collection(db, 'users', userId, 'bookmarks'));
      return snapshot.docs.map((doc: any) => doc.data() as Bookmark);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, path);
    }
  }
};

// ==========================================
// 5. SPACED REVISION SERVICE
// ==========================================
export const revisionService = {
  async addOrUpdateRevision(userId: string, itemId: string, itemType: 'article' | 'question', wasCorrect: boolean): Promise<void> {
    const revisionId = `${itemType}_${itemId}`;
    const path = `users/${userId}/revisions/${revisionId}`;
    try {
      const ref = doc(db, 'users', userId, 'revisions', revisionId);
      const snap = await getDoc(ref);

      const now = new Date();
      if (snap.exists()) {
        const item = snap.data() as RevisionItem;
        let newStatus = item.status;
        let newReviewCount = item.reviewCount + 1;
        let nextReviewDays = 1;

        const correctCount = item.correctCount + (wasCorrect ? 1 : 0);
        const wrongCount = item.wrongCount + (wasCorrect ? 0 : 1);

        if (wasCorrect) {
          if (item.status === 'new') {
            newStatus = 'learning';
            nextReviewDays = 1;
          } else if (item.status === 'learning') {
            newStatus = 'review';
            nextReviewDays = 3;
          } else if (item.status === 'review') {
            newStatus = 'mastered';
            nextReviewDays = 7;
          } else {
            nextReviewDays = 14;
          }
        } else {
          newStatus = 'learning'; // Reset to learning on incorrect
          nextReviewDays = 1; // Re-evaluate tomorrow
        }

        const nextReviewAt = new Date();
        nextReviewAt.setDate(now.getDate() + nextReviewDays);

        await updateDoc(ref, {
          status: newStatus,
          reviewCount: newReviewCount,
          correctCount,
          wrongCount,
          lastReviewedAt: now.toISOString(),
          nextReviewAt: nextReviewAt.toISOString(),
          updatedAt: now.toISOString()
        });
      } else {
        // Create new revision item
        const nextReviewAt = new Date();
        nextReviewAt.setDate(now.getDate() + (wasCorrect ? 2 : 1));

        await setDoc(ref, {
          id: revisionId,
          userId,
          itemId,
          itemType,
          status: wasCorrect ? 'learning' : 'new',
          reviewCount: 1,
          lastReviewedAt: now.toISOString(),
          nextReviewAt: nextReviewAt.toISOString(),
          correctCount: wasCorrect ? 1 : 0,
          wrongCount: wasCorrect ? 0 : 1,
          createdAt: now.toISOString(),
          updatedAt: now.toISOString()
        });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  },

  async getUserRevisions(userId: string): Promise<RevisionItem[]> {
    const path = `users/${userId}/revisions`;
    try {
      const snapshot = await getDocs(collection(db, 'users', userId, 'revisions'));
      return snapshot.docs.map((doc: any) => doc.data() as RevisionItem);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, path);
    }
  },

  async deleteRevisionItem(userId: string, id: string): Promise<void> {
    const path = `users/${userId}/revisions/${id}`;
    try {
      await deleteDoc(doc(db, 'users', userId, 'revisions', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  }
};

// ==========================================
// 6. REPORTS COLLECTION SERVICE (FOR STUDENTS & ADMINS)
// ==========================================
export const reportService = {
  async submitReport(userId: string, report: Omit<QuestionReport, 'id' | 'userId' | 'userEmail' | 'status' | 'createdAt'>): Promise<void> {
    try {
      const reportId = 'rep_' + Math.random().toString(36).substr(2, 9);
      const userEmail = auth.currentUser?.email || 'unknown';
      const ref = doc(db, 'reports', reportId);
      await setDoc(ref, {
        ...report,
        id: reportId,
        userId,
        userEmail,
        status: 'pending',
        createdAt: new Date().toISOString()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'reports');
    }
  },

  async getAllReports(): Promise<QuestionReport[]> {
    try {
      const snapshot = await getDocs(collection(db, 'reports'));
      return snapshot.docs.map((doc: any) => doc.data() as QuestionReport);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'reports');
    }
  },

  async updateReportStatus(reportId: string, status: 'resolved' | 'rejected'): Promise<void> {
    try {
      const ref = doc(db, 'reports', reportId);
      await updateDoc(ref, {
        status,
        resolvedAt: new Date().toISOString()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `reports/${reportId}`);
    }
  }
};

// ==========================================
// 7. SECURE GEMINI AI CONNECT SERVICE
// ==========================================
export const aiService = {
  async processArticleWithAI(rawContent: string, sourceName: string, sourceUrl?: string): Promise<any> {
    const res = await fetch('/api/gemini/process-article', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rawContent, sourceName, sourceUrl })
    });
    if (!res.ok) {
      const errorMsg = await res.json();
      throw new Error(errorMsg.error || "Failed to process article");
    }
    return res.json();
  },

  async generatePracticeQuestions(articleTitle: string, category: string, content: string, count = 5, difficulty = 'medium'): Promise<any[]> {
    const res = await fetch('/api/gemini/generate-questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ articleTitle, category, content, count, difficulty })
    });
    if (!res.ok) {
      const errorMsg = await res.json();
      throw new Error(errorMsg.error || "Failed to generate questions");
    }
    return res.json();
  },

  async askNdaAI(query: string, history: any[] = [], context = ''): Promise<string> {
    const res = await fetch('/api/gemini/assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, history, context })
    });
    if (!res.ok) {
      const errorMsg = await res.json();
      throw new Error(errorMsg.error || "Failed to query NDA AI Coach");
    }
    const data = await res.json();
    return data.text;
  },

  async askArticleSpecificAI(query: string, articleTitle: string, articleContent: string, category: string): Promise<string> {
    const res = await fetch('/api/gemini/article-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, articleTitle, articleContent, category })
    });
    if (!res.ok) {
      const errorMsg = await res.json();
      throw new Error(errorMsg.error || "Failed to chat on article");
    }
    const data = await res.json();
    return data.text;
  }
};

// ==========================================
// 8. SOURCES CONFIGURATION SERVICE
// ==========================================
export const sourceService = {
  async getAllSources(): Promise<ContentSource[]> {
    try {
      const snapshot = await getDocs(collection(db, 'sources'));
      return snapshot.docs.map((doc: any) => doc.data() as ContentSource);
    } catch (err) {
      return [];
    }
  },

  async saveSource(source: ContentSource): Promise<void> {
    try {
      await setDoc(doc(db, 'sources', source.sourceId), source);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `sources/${source.sourceId}`);
    }
  },

  async deleteSource(sourceId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'sources', sourceId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `sources/${sourceId}`);
    }
  }
};

// ==========================================
// 9. AUDIT LOGGING SERVICE
// ==========================================
export const auditService = {
  async logAdminAction(action: string, target: string, metadata: Record<string, any> = {}): Promise<void> {
    try {
      const logId = 'log_' + Math.random().toString(36).substr(2, 9);
      const adminUid = auth.currentUser?.uid || 'system';
      await setDoc(doc(db, 'auditLogs', logId), {
        id: logId,
        adminUid,
        action,
        target,
        timestamp: new Date().toISOString(),
        metadata
      });
    } catch (err) {
      console.error("Audit log failed:", err);
    }
  },

  async getAuditLogs(): Promise<AuditLog[]> {
    try {
      const snapshot = await getDocs(collection(db, 'auditLogs'));
      const list = snapshot.docs.map((doc: any) => doc.data() as AuditLog);
      return list.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } catch (err) {
      return [];
    }
  }
};

// ==========================================
// 10. USER QUERIES & ASPIRANT INQUIRY SERVICE
// ==========================================
export const userQueryService = {
  async submitQuery(queryData: Omit<UserQuery, 'id' | 'createdAt' | 'status'> & { id?: string }): Promise<UserQuery> {
    const queryId = queryData.id || 'query_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const newQuery: UserQuery = {
      ...queryData,
      id: queryId,
      status: 'received',
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'userQueries', queryId), newQuery);
    } catch (err) {
      console.warn("Firestore query sync note, saving to local offline queue:", err);
      // Fallback to local storage so user query is never lost
      try {
        const local = JSON.parse(localStorage.getItem('nda_user_queries') || '[]');
        local.unshift(newQuery);
        localStorage.setItem('nda_user_queries', JSON.stringify(local.slice(0, 50)));
      } catch (localErr) {
        console.error("Local storage error:", localErr);
      }
    }

    return newQuery;
  },

  async getUserQueries(email?: string): Promise<UserQuery[]> {
    try {
      const snapshot = await getDocs(collection(db, 'userQueries'));
      let list = snapshot.docs.map((doc: any) => doc.data() as UserQuery);
      if (email) {
        list = list.filter(q => q.email?.toLowerCase() === email.toLowerCase());
      }
      return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (err) {
      try {
        const local = JSON.parse(localStorage.getItem('nda_user_queries') || '[]');
        return local;
      } catch (e) {
        return [];
      }
    }
  },

  async updateQueryStatus(queryId: string, status: 'received' | 'in-review' | 'answered'): Promise<void> {
    try {
      await setDoc(doc(db, 'userQueries', queryId), { status }, { merge: true });
    } catch (err) {
      console.warn("Firestore status update failed, updating locally:", err);
    }
    // Update local storage too
    try {
      const local: UserQuery[] = JSON.parse(localStorage.getItem('nda_user_queries') || '[]');
      const idx = local.findIndex(q => q.id === queryId);
      if (idx !== -1) {
        local[idx].status = status;
        localStorage.setItem('nda_user_queries', JSON.stringify(local));
      }
    } catch (e) {}
  },

  async deleteQuery(queryId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'userQueries', queryId));
    } catch (err) {
      console.warn("Firestore delete failed, removing locally:", err);
    }
    // Remove from local storage
    try {
      const local: UserQuery[] = JSON.parse(localStorage.getItem('nda_user_queries') || '[]');
      const filtered = local.filter(q => q.id !== queryId);
      localStorage.setItem('nda_user_queries', JSON.stringify(filtered));
    } catch (e) {}
  }
};

