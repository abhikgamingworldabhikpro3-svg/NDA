import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { bookmarkService, articleService, questionService } from '../services/dbServices';
import { Bookmark, CurrentAffair, Question } from '../types';
import { 
  BookmarkCheck, 
  BookOpen, 
  HelpCircle, 
  Clock, 
  Trash2, 
  ChevronRight, 
  Search,
  Eye
} from 'lucide-react';
import { translations, LanguageCode } from '../i18n/translations';

interface BookmarksProps {
  setPath: (path: string) => void;
  lang: LanguageCode;
}

export const Bookmarks: React.FC<BookmarksProps> = ({ setPath, lang }) => {
  const { userProfile } = useAuth();
  const t = (key: keyof typeof translations.en) => translations[lang][key] || translations.en[key];

  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [articles, setArticles] = useState<Record<string, CurrentAffair>>({});
  const [questions, setQuestions] = useState<Record<string, Question>>({});
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState<'article' | 'question'>('article');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchBookmarksData = async () => {
      if (!userProfile) return;
      setLoading(true);
      try {
        const list = await bookmarkService.getUserBookmarks(userProfile.uid);
        setBookmarks(list || []);

        // Load detail maps
        const pubArticles = await articleService.getPublishedArticles();
        const allQuestions = await questionService.getAllQuestions();

        const aMap: Record<string, CurrentAffair> = {};
        pubArticles.forEach(a => aMap[a.id] = a);
        setArticles(aMap);

        const qMap: Record<string, Question> = {};
        allQuestions.forEach(q => qMap[q.id] = q);
        setQuestions(qMap);

      } catch (err) {
        console.error("Bookmarks load error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookmarksData();
  }, [userProfile]);

  const handleRemoveBookmark = async (id: string, itemType: 'article' | 'question', itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!userProfile) return;
    try {
      await bookmarkService.toggleBookmark(userProfile.uid, itemType, itemId);
      setBookmarks(prev => prev.filter(b => b.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const filteredBookmarks = bookmarks.filter(b => {
    if (b.itemType !== activeTab) return false;
    
    if (activeTab === 'article') {
      const art = articles[b.itemId];
      if (!art) return false;
      return art.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
             art.summary.toLowerCase().includes(searchQuery.toLowerCase());
    } else {
      const q = questions[b.itemId];
      if (!q) return false;
      return q.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
             q.category.toLowerCase().includes(searchQuery.toLowerCase());
    }
  });

  if (loading) {
    return (
      <div className="flex-1 p-8 space-y-4 bg-slate-50 dark:bg-slate-950 animate-pulse">
        <div className="h-6 bg-slate-300 dark:bg-slate-800 rounded w-1/4"></div>
        <div className="h-32 bg-slate-300 dark:bg-slate-800 rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 lg:p-8 space-y-6 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 min-h-screen pb-24">
      {/* Title */}
      <div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white leading-tight">
          {t('bookmarks')}
        </h2>
        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
          Organize Your Flagged Current Affairs and Practice Questions
        </p>
      </div>

      {/* Tabs Switcher and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-850 pb-3">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('article')}
            className={`px-4 py-2 text-xs font-bold rounded-lg border transition ${
              activeTab === 'article' 
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 border-slate-900 dark:border-white shadow-xs' 
                : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800 dark:bg-slate-900 dark:border-slate-800'
            }`}
          >
            Articles Bookmark
          </button>
          <button
            onClick={() => setActiveTab('question')}
            className={`px-4 py-2 text-xs font-bold rounded-lg border transition ${
              activeTab === 'question' 
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 border-slate-900 dark:border-white shadow-xs' 
                : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800 dark:bg-slate-900 dark:border-slate-800'
            }`}
          >
            Questions Bookmark
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search bookmarks..."
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg py-1.5 pl-10 pr-4 text-xs font-medium outline-none focus:border-indigo-600"
          />
        </div>
      </div>

      {/* Bookmarks Display List */}
      <section className="space-y-4">
        {filteredBookmarks.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-12 rounded-2xl text-center space-y-2 max-w-xl mx-auto">
            <BookmarkCheck className="h-8 w-8 text-slate-300 mx-auto" />
            <p className="text-xs text-slate-500 font-semibold">You haven't bookmarked any items here yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredBookmarks.map((b) => {
              const art = articles[b.itemId];
              const q = questions[b.itemId];

              if (activeTab === 'article' && art) {
                return (
                  <div 
                    key={b.id}
                    onClick={() => setPath(`/current-affairs/${art.id}`)}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition duration-150 cursor-pointer flex flex-col justify-between"
                  >
                    <div className="space-y-2.5">
                      <div className="flex justify-between items-start">
                        <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-[9px] font-extrabold text-slate-500 dark:text-slate-300 uppercase tracking-wide">
                          {art.category}
                        </span>
                        
                        <button
                          onClick={(e) => handleRemoveBookmark(b.id, 'article', art.id, e)}
                          className="p-1 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-400 hover:text-red-500 transition"
                          title="Remove bookmark"
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
                      </div>

                      <h3 className="text-sm font-extrabold text-slate-900 dark:text-white leading-snug">
                        {art.title}
                      </h3>

                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                        {art.summary}
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-50 dark:border-slate-800 pt-3 mt-4 text-[10px] text-slate-400 font-bold uppercase">
                      <span>Source: {art.sourceName}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(art.publishedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                );
              }

              if (activeTab === 'question' && q) {
                return (
                  <div 
                    key={b.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-3"
                  >
                    <div className="flex justify-between items-center border-b border-slate-50 dark:border-slate-850 pb-2">
                      <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-[9px] font-extrabold text-slate-500 dark:text-slate-300 uppercase tracking-wide">
                        {q.category} • MCQ
                      </span>
                      
                      <button
                        onClick={(e) => handleRemoveBookmark(b.id, 'question', q.id, e)}
                        className="p-1 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-400 hover:text-red-500 transition"
                        title="Remove bookmark"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </div>

                    <h4 className="text-xs font-extrabold text-slate-850 dark:text-white leading-relaxed">
                      {q.question}
                    </h4>

                    <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                      <div>A. {q.optionA}</div>
                      <div>B. {q.optionB}</div>
                      <div>C. {q.optionC}</div>
                      <div>D. {q.optionD}</div>
                    </div>
                  </div>
                );
              }

              return null;
            })}
          </div>
        )}
      </section>
    </div>
  );
};
export default Bookmarks;
