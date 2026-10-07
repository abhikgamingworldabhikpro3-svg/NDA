import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { articleService, bookmarkService } from '../services/dbServices';
import { CurrentAffair } from '../types';
import { 
  Search, 
  Filter, 
  BookOpen, 
  Bookmark, 
  BookmarkCheck, 
  Zap, 
  Eye, 
  Clock, 
  Award,
  ChevronRight,
  ListFilter,
  Sparkles
} from 'lucide-react';
import { translations, LanguageCode } from '../i18n/translations';

interface CurrentAffairsProps {
  setPath: (path: string) => void;
  lang: LanguageCode;
  selectedCategory?: string;
}

export const CurrentAffairs: React.FC<CurrentAffairsProps> = ({ 
  setPath, 
  lang, 
  selectedCategory = 'All' 
}) => {
  const { userProfile } = useAuth();
  const t = (key: keyof typeof translations.en) => translations[lang][key] || translations.en[key];

  const [articles, setArticles] = useState<CurrentAffair[]>([]);
  const [bookmarks, setBookmarks] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState(selectedCategory);
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [quickRead, setQuickRead] = useState(false);
  
  const [generatingOnDemand, setGeneratingOnDemand] = useState(false);
  const [generationError, setGenerationError] = useState('');

  const handleGenerateOnDemand = async () => {
    if (!searchQuery.trim()) return;
    setGeneratingOnDemand(true);
    setGenerationError('');
    try {
      const response = await fetch('/api/gemini/generate-on-demand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ searchQuery, category: category === 'All' ? 'General' : category })
      });
      if (!response.ok) {
        throw new Error("Failed to generate article on-demand");
      }
      const data = await response.json();
      
      // Re-fetch articles to show the newly generated one!
      let pubArticles = await articleService.getPublishedArticles(category === 'All' ? undefined : category);
      setArticles(pubArticles || []);
      
      alert(`Success! Generated high-yield study capsule: "${data.title}"`);
    } catch (err: any) {
      setGenerationError(err.message || 'Error occurred during generation');
    } finally {
      setGeneratingOnDemand(false);
    }
  };

  const categories = [
    "All", "Defence", "National", "International", "Science & Technology", "Space",
    "Economy", "Government Schemes", "Environment", "Awards", "Sports",
    "Appointments", "Important Days", "Reports & Indexes", "International Organisations",
    "Places in News"
  ];

  useEffect(() => {
    setCategory(selectedCategory);
  }, [selectedCategory]);

  useEffect(() => {
    const fetchArticlesAndBookmarks = async () => {
      setLoading(true);
      try {
        const { seedSampleFirestoreData, sampleArticles } = await import('../data/seedData');
        let pubArticles = await articleService.getPublishedArticles(category === 'All' ? undefined : category) || [];
        
        // Check if October 7, 2026 articles are present
        const hasOct2026 = pubArticles.some(a => a.id.includes('oct2026') || a.id.includes('2026'));
        
        if (!hasOct2026 || pubArticles.length < sampleArticles.length) {
          // Merge local seed articles with fetched articles to guarantee instant display
          const existingIds = new Set(pubArticles.map(a => a.id));
          const missingLocal = sampleArticles.filter(a => !existingIds.has(a.id) && (category === 'All' || a.category === category));
          pubArticles = [...missingLocal, ...pubArticles];

          // Trigger background upload to Firestore
          seedSampleFirestoreData().then(async () => {
            const fresh = await articleService.getPublishedArticles(category === 'All' ? undefined : category);
            if (fresh && fresh.length >= sampleArticles.length) setArticles(fresh);
          }).catch(() => {});
        }

        setArticles(pubArticles);

        if (userProfile) {
          const userBookmarks = await bookmarkService.getUserBookmarks(userProfile.uid);
          const bookmarkMap: Record<string, boolean> = {};
          userBookmarks.forEach(b => {
            if (b.itemType === 'article') {
              bookmarkMap[b.itemId] = true;
            }
          });
          setBookmarks(bookmarkMap);
        }
      } catch (err) {
        console.error("Failed to load articles:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchArticlesAndBookmarks();
  }, [category, userProfile]);

  const handleToggleBookmark = async (articleId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!userProfile) return;
    try {
      const isBookmarkedNow = await bookmarkService.toggleBookmark(userProfile.uid, 'article', articleId);
      setBookmarks(prev => ({
        ...prev,
        [articleId]: isBookmarkedNow
      }));
    } catch (err) {
      console.error("Bookmark toggle failed:", err);
    }
  };

  const handleArticleClick = (id: string) => {
    window.history.pushState({}, '', `/current-affairs/${id}`);
    setPath(`/current-affairs/${id}`);
  };

  const handleTestMe = (articleCategory: string, articleId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Navigate directly to quiz with parameters
    window.history.pushState({}, '', `/quiz?category=${articleCategory}&articleId=${articleId}`);
    setPath(`/quiz`);
  };

  // Filter local records by search query and priority
  const filteredArticles = articles.filter(art => {
    const matchesSearch = 
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.ndaRelevance.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPriority = priorityFilter === 'All' || art.priority === priorityFilter;

    return matchesSearch && matchesPriority;
  });

  const counts = {
    Defence: articles.filter(a => a.category === 'Defence').length,
    National: articles.filter(a => a.category === 'National').length,
    International: articles.filter(a => a.category === 'International').length,
    Science: articles.filter(a => a.category === 'Science & Technology').length,
    Space: articles.filter(a => a.category === 'Space').length,
    Economy: articles.filter(a => a.category === 'Economy').length,
    GovSchemes: articles.filter(a => a.category === 'Government Schemes').length,
    Awards: articles.filter(a => a.category === 'Awards').length,
    Sports: articles.filter(a => a.category === 'Sports').length,
  };

  return (
    <div className="flex-1 p-6 lg:p-8 space-y-6 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 min-h-screen pb-24">
      
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white leading-tight">
            {t('currentAffairs')}
          </h2>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
            Syllabus: NDA General Ability Test (GAT) GK Section
          </p>
        </div>

        {/* Quick read mode switcher */}
        <button
          onClick={() => setQuickRead(!quickRead)}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition shadow-sm border ${
            quickRead 
              ? 'bg-amber-600 border-amber-500 text-white' 
              : 'bg-white border-slate-200 text-slate-700 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300'
          }`}
        >
          <Zap className={`h-4 w-4 ${quickRead ? 'fill-current text-white' : 'text-amber-500'}`} />
          <span>{t('quickRead')}</span>
        </button>
      </div>

      {/* Ultra Pro Max Intel Command Center Banner */}
      <div className="bg-slate-900 border border-slate-800/80 text-white p-5 rounded-2xl shadow-md space-y-3.5 relative overflow-hidden">
        {/* Subtle decorative mesh */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Intel Command Crawler: Active & Syncing
            </span>
          </div>
          <span className="text-[9px] font-mono text-slate-500 font-bold uppercase tracking-tight">
            Last Sync: Today, 02:45 AM (Local Time) · Refresh Period: 12h
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] text-slate-400 font-bold">
          <span className="text-slate-500 font-extrabold uppercase">GAT Category Density:</span>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>Defence: <span className="font-mono text-white tabular-nums">{counts.Defence}</span></span>
            <span className="text-slate-700">·</span>
            <span>National: <span className="font-mono text-white tabular-nums">{counts.National}</span></span>
            <span className="text-slate-700">·</span>
            <span>International: <span className="font-mono text-white tabular-nums">{counts.International}</span></span>
            <span className="text-slate-700">·</span>
            <span>Science & Space: <span className="font-mono text-white tabular-nums">{counts.Science + counts.Space}</span></span>
            <span className="text-slate-700">·</span>
            <span>Economy: <span className="font-mono text-white tabular-nums">{counts.Economy}</span></span>
            <span className="text-slate-700">·</span>
            <span>Gov Schemes: <span className="font-mono text-white tabular-nums">{counts.GovSchemes}</span></span>
            <span className="text-slate-700">·</span>
            <span>Sports/Awards: <span className="font-mono text-white tabular-nums">{counts.Sports + counts.Awards}</span></span>
          </div>
        </div>
      </div>

      {/* Search and priority row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-4 rounded-xl shadow-xs">
        <div className="relative sm:col-span-2">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-lg py-2 pl-10 pr-4 text-xs font-medium outline-none focus:border-indigo-600 transition"
          />
        </div>

        <div className="relative">
          <select 
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-lg py-2 px-3 text-xs font-bold text-slate-500 dark:text-slate-300 outline-none focus:border-indigo-600 transition"
          >
            <option value="All">All Priority</option>
            <option value="HIGH">High Exam Relevance</option>
            <option value="MEDIUM">Medium Relevance</option>
            <option value="LOW">Low Relevance</option>
          </select>
        </div>
      </div>

      {/* Category Chips Carousel */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
              category === cat 
                ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm' 
                : 'bg-white border-slate-200 hover:border-slate-300 text-slate-600 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Loading list */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(n => (
            <div key={n} className="h-28 bg-slate-200 dark:bg-slate-850 rounded-xl animate-pulse"></div>
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-12 rounded-2xl text-center space-y-4 max-w-xl mx-auto">
          <BookOpen className="h-10 w-10 text-slate-300 mx-auto animate-bounce" />
          <p className="text-sm font-black text-slate-800 dark:text-white">Your Current Affairs Database is Empty</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
            Let's pre-populate it with high-yield NDA current affairs (Exercise Malabar, Gaganyaan, G20 Sustainable Accord) and GAT GK Practice MCQs!
          </p>
          <button
            onClick={async () => {
              setLoading(true);
              try {
                const { seedSampleFirestoreData } = await import('../data/seedData');
                await seedSampleFirestoreData();
                const pubArticles = await articleService.getPublishedArticles(category === 'All' ? undefined : category);
                setArticles(pubArticles || []);
              } catch (err) {
                console.error("Failed to seed:", err);
              } finally {
                setLoading(false);
              }
            }}
            className="mt-2 inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-xs font-black text-white px-5 py-2.5 rounded-xl shadow-md transition active:scale-[0.98] cursor-pointer"
          >
            <Zap className="h-4 w-4 fill-current text-amber-400" />
            <span>Seed High-Yield NDA Current Affairs</span>
          </button>
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-12 rounded-2xl text-center space-y-4 max-w-xl mx-auto shadow-sm">
          <BookOpen className="h-10 w-10 text-slate-300 mx-auto" />
          <p className="text-sm font-black text-slate-900 dark:text-white">No current affairs matches your search filters.</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
            You can either reset your filters, or use our high-fidelity search synthesis engine to find and compile recent news on this topic using AI!
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => {
                setSearchQuery('');
                setCategory('All');
                setPriorityFilter('All');
              }}
              className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 px-4 py-2 rounded-xl transition cursor-pointer"
            >
              Reset Filters
            </button>
            
            {searchQuery.trim() && (
              <button
                onClick={handleGenerateOnDemand}
                disabled={generatingOnDemand}
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-xs font-black text-white px-5 py-2.5 rounded-xl shadow-md transition active:scale-[0.98] cursor-pointer"
              >
                <Sparkles className={`h-4 w-4 ${generatingOnDemand ? 'animate-spin' : 'text-amber-400 fill-current'}`} />
                <span>{generatingOnDemand ? 'Synthesizing with AI...' : `Generate Capsule on "${searchQuery}"`}</span>
              </button>
            )}
          </div>
          
          {generationError && (
            <p className="text-[10px] font-bold text-rose-500 mt-2">{generationError}</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredArticles.map((art) => {
            const isBookmarked = !!bookmarks[art.id];
            
            // Render regular detail card
            if (!quickRead) {
              return (
                <div 
                  key={art.id}
                  onClick={() => handleArticleClick(art.id)}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition duration-150 cursor-pointer flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                        <span>{art.category}</span>
                        {art.subCategory && (
                          <>
                            <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                            <span className="text-slate-400 dark:text-slate-500 font-semibold">{art.subCategory}</span>
                          </>
                        )}
                      </div>

                      <button
                        onClick={(e) => handleToggleBookmark(art.id, e)}
                        className="p-1 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-500 transition-all"
                      >
                        {isBookmarked ? (
                          <BookmarkCheck className="h-4.5 w-4.5 text-indigo-500 fill-indigo-500" />
                        ) : (
                          <Bookmark className="h-4.5 w-4.5" />
                        )}
                      </button>
                    </div>

                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white leading-snug">
                      {art.title}
                    </h3>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                      {art.summary}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-50 dark:border-slate-800/80 pt-3 mt-4 text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                    <span>Source: {art.sourceName}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(art.publishedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              );
            }

            // Quick Read Mode: Focused factual bullets and direct mock test trigger
            return (
              <div 
                key={art.id}
                className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl shadow-xs hover:border-amber-500 dark:hover:border-amber-500 transition duration-150"
              >
                <div className="flex justify-between items-start mb-3 border-b border-slate-50 dark:border-slate-850 pb-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                    <span>{art.category}</span>
                    <span aria-hidden="true" className="text-slate-350 dark:text-slate-700">·</span>
                    <span>Quick Read</span>
                  </div>

                  <button
                    onClick={(e) => handleToggleBookmark(art.id, e)}
                    className="p-1 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-500 transition"
                  >
                    {isBookmarked ? (
                      <BookmarkCheck className="h-4 w-4 text-indigo-500 fill-indigo-500" />
                    ) : (
                      <Bookmark className="h-4 w-4" />
                    )}
                  </button>
                </div>

                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mb-3">
                  {art.title}
                </h3>

                <div className="space-y-1.5 mb-4">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Remember This Factsheet</p>
                  {art.importantFacts.slice(0, 4).map((fact, index) => (
                    <div key={index} className="flex items-start gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                      <span className="text-amber-500 mt-1 shrink-0">•</span>
                      <span>{fact}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-850 pt-3">
                  <button 
                    onClick={() => handleArticleClick(art.id)}
                    className="text-[11px] font-extrabold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Read Detailed Article
                  </button>
                  
                  <button
                    onClick={(e) => handleTestMe(art.category, art.id, e)}
                    className="flex items-center gap-1 bg-amber-600 hover:bg-amber-700 text-[10px] font-bold text-white rounded px-2.5 py-1 shadow-sm transition"
                  >
                    Test Me <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
export default CurrentAffairs;
