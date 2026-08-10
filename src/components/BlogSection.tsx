import React, { useState } from 'react';
import { HealthArticle } from '../types';
import { BookOpen, Calendar, User, Search, Heart, Share2, MessageSquare, Clock, ArrowRight, ArrowLeft, CheckCircle2, Sparkles, Send, X } from 'lucide-react';

interface BlogSectionProps {
  articles: HealthArticle[];
  language?: 'urdu' | 'english';
  onOpenAppointment?: (doctorName?: string) => void;
}

interface ArticleComment {
  id: string;
  articleId: string;
  name: string;
  comment: string;
  date: string;
}

export const BlogSection: React.FC<BlogSectionProps> = ({
  articles,
  language = 'english',
  onOpenAppointment,
}) => {
  const isUrdu = language === 'urdu';
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedArticle, setSelectedArticle] = useState<HealthArticle | null>(null);
  const [likedArticles, setLikedArticles] = useState<Record<string, number>>({});
  const [userLikes, setUserLikes] = useState<Record<string, boolean>>({});
  const [copiedLink, setCopiedLink] = useState(false);

  // Comments state
  const [comments, setComments] = useState<ArticleComment[]>([
    {
      id: 'c1',
      articleId: 'art-1',
      name: 'محمد عثمان (Gujranwala)',
      comment: 'ماشاءاللہ ڈاکٹر صاحب، وٹامن ڈی اور زیتون مساج کے عمل سے گھٹنے کا درد بہت بہتر ہوا ہے۔ جزاک اللہ!',
      date: '18 مئی 2026',
    },
    {
      id: 'c2',
      articleId: 'art-2',
      name: 'سعدیہ ملک (Lahore)',
      comment: 'بلو کٹ چشمے کے استعمال کے بعد لیپ ٹاپ پر کام کے دوران آنکھوں کی سرخی ختم ہو گئی ہے۔',
      date: '22 جون 2026',
    },
  ]);

  const [newCommentName, setNewCommentName] = useState('');
  const [newCommentText, setNewCommentText] = useState('');

  // Extract categories
  const categories = [
    { id: 'all', labelUrdu: 'تمام مضامین', labelEnglish: 'All Articles' },
    { id: 'درد اور مہرے', labelUrdu: 'درد اور مہرے', labelEnglish: 'Joint & Pain Care' },
    { id: 'آئی کیئر', labelUrdu: 'آئی کیئر (چشمے)', labelEnglish: 'Eye & Optical Care' },
    { id: 'ڈائیگنوسس', labelUrdu: 'کمپیوٹر چیک اپ', labelEnglish: 'Computer Diagnostics' },
    { id: 'معدہ و جگر', labelUrdu: 'معدہ و جگر', labelEnglish: 'Gastric & Liver' },
    { id: 'ہیئر کیئر', labelUrdu: 'ہیئر کیئر', labelEnglish: 'Hair Care & Herbal' },
  ];

  // Filtering
  const filteredArticles = articles.filter((art) => {
    const title = isUrdu ? art.titleUrdu : art.titleEnglish || art.titleUrdu;
    const category = art.category;
    const author = isUrdu ? art.authorUrdu || art.author : art.authorEnglish || art.author;
    const excerpt = isUrdu ? art.excerptUrdu || art.summaryUrdu : art.excerptEnglish || art.summaryUrdu;

    const matchesCategory =
      selectedCategory === 'all' ||
      category.toLowerCase().includes(selectedCategory.toLowerCase()) ||
      (art.categoryUrdu && art.categoryUrdu.toLowerCase().includes(selectedCategory.toLowerCase()));

    const matchesSearch =
      !searchQuery ||
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (author && author.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (excerpt && excerpt.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  const handleLike = (articleId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const currentLiked = userLikes[articleId];
    setUserLikes((prev) => ({ ...prev, [articleId]: !currentLiked }));
    setLikedArticles((prev) => {
      const base = prev[articleId] ?? (articles.find((a) => a.id === articleId)?.likes || 0);
      return { ...prev, [articleId]: currentLiked ? base - 1 : base + 1 };
    });
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentName.trim() || !newCommentText.trim() || !selectedArticle) return;

    const commentObj: ArticleComment = {
      id: Date.now().toString(),
      articleId: selectedArticle.id,
      name: newCommentName,
      comment: newCommentText,
      date: new Date().toLocaleDateString(isUrdu ? 'ur-PK' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
    };

    setComments([commentObj, ...comments]);
    setNewCommentName('');
    setNewCommentText('');
  };

  const handleShare = (article: HealthArticle) => {
    const title = isUrdu ? article.titleUrdu : article.titleEnglish || article.titleUrdu;
    const text = `${title} - Hafiz Clinic Blog`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.href}#article-${article.id}`);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <section id="articles" className="py-16 bg-gradient-to-b from-slate-50 via-white to-slate-50 text-slate-900 min-h-[600px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Top Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-4">
          <div className="inline-flex items-center gap-2 bg-emerald-100/80 text-emerald-950 px-4 py-1.5 rounded-full text-xs font-black tracking-wide border border-emerald-200 shadow-sm">
            <BookOpen className="w-4 h-4 text-emerald-700" />
            <span>{isUrdu ? 'طبی معلومات اور مضمون نگاری' : 'Medical Insights & Health Blog'}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {isUrdu ? 'طبی مضامین و ہیلتھ بلاگ (Health Articles)' : 'Medical Health Articles & Clinical Research'}
          </h2>
          <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            {isUrdu
              ? 'ڈاکٹرز کی تحریر کردہ طبی آگاہی، بیماریوں کا علاج اور گھریلو پرہیز کے اصول'
              : 'Clinical awareness guides, preventive care strategies, and medical advice authored by senior MBBS physicians.'}
          </p>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm mb-10 space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Category Badges */}
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-emerald-800 text-white shadow-sm scale-105'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  {isUrdu ? cat.labelUrdu : cat.labelEnglish}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className={`w-4 h-4 text-slate-400 absolute top-3 ${isUrdu ? 'right-3' : 'left-3'}`} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isUrdu ? 'مضمون کا نام یا عنوان تلاش کریں...' : 'Search article title or topic...'}
                className={`w-full bg-slate-50 border border-slate-200 rounded-xl text-xs py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all ${
                  isUrdu ? 'pr-9 pl-3' : 'pl-9 pr-3'
                }`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className={`absolute top-2.5 text-slate-400 hover:text-slate-600 text-xs ${isUrdu ? 'left-3' : 'right-3'}`}
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Articles Grid */}
        {filteredArticles.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center space-y-3">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-700">
              {isUrdu ? 'کوئی مضمون نہیں ملا' : 'No Articles Found'}
            </h3>
            <p className="text-xs text-slate-500">
              {isUrdu ? 'براہ کرم تلاش کا لفظ یا کیٹیگری تبدیل کریں۔' : 'Try searching for a different keyword or category.'}
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="text-xs font-bold text-emerald-700 hover:underline pt-2"
            >
              {isUrdu ? 'تمام مضامین دیکھیں' : 'Reset Filters'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArticles.map((art) => {
              const title = isUrdu ? art.titleUrdu : art.titleEnglish || art.titleUrdu;
              const author = isUrdu ? art.authorUrdu || art.author : art.authorEnglish || art.author;
              const excerpt = isUrdu ? art.excerptUrdu || art.summaryUrdu : art.excerptEnglish || art.summaryUrdu;
              const likesCount = likedArticles[art.id] ?? (art.likes || 12);
              const isLiked = !!userLikes[art.id];

              return (
                <div
                  key={art.id}
                  onClick={() => setSelectedArticle(art)}
                  className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col cursor-pointer group"
                >
                  {/* Banner Image */}
                  <div className="relative overflow-hidden h-48 bg-slate-100">
                    <img
                      src={art.image || art.imageUrl}
                      alt={title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-emerald-900/90 backdrop-blur-md text-amber-300 px-3 py-1 rounded-full text-[11px] font-bold shadow-md border border-amber-300/30">
                      {isUrdu ? art.categoryUrdu || art.category : art.category}
                    </div>
                    {art.readTime && (
                      <div className="absolute bottom-3 right-3 bg-slate-900/80 text-white px-2.5 py-0.5 rounded-md text-[10px] font-medium flex items-center gap-1 backdrop-blur-sm">
                        <Clock className="w-3 h-3 text-emerald-400" />
                        <span>{art.readTime}</span>
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      {/* Author & Date */}
                      <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-100 pb-2.5">
                        <span className="flex items-center gap-1.5 font-medium text-slate-700">
                          <User className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{author}</span>
                        </span>
                        <span className="flex items-center gap-1 text-slate-400">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{art.date}</span>
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="font-bold text-slate-900 text-lg leading-snug group-hover:text-emerald-800 transition-colors line-clamp-2">
                        {title}
                      </h3>

                      {/* Excerpt */}
                      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                        {excerpt}
                      </p>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-black text-emerald-800 group-hover:text-emerald-900 flex items-center gap-1">
                        <span>{isUrdu ? 'مکمل مضمون پڑھیں' : 'Read Full Article'}</span>
                        {isUrdu ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                      </span>

                      {/* Like button */}
                      <button
                        onClick={(e) => handleLike(art.id, e)}
                        className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full transition-colors ${
                          isLiked ? 'bg-rose-50 text-rose-600 font-bold' : 'text-slate-400 hover:text-rose-500 hover:bg-slate-50'
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                        <span>{likesCount}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Article Full View Modal */}
        {selectedArticle && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 my-auto">
              {/* Modal Banner Header */}
              <div className="relative h-64 sm:h-80 bg-slate-900">
                <img
                  src={selectedArticle.image || selectedArticle.imageUrl}
                  alt={isUrdu ? selectedArticle.titleUrdu : selectedArticle.titleEnglish || selectedArticle.titleUrdu}
                  className="w-full h-full object-cover opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                {/* Close Button */}
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full transition-colors backdrop-blur-md"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Floating Tag */}
                <div className="absolute bottom-6 left-6 right-6 space-y-2 text-white">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-emerald-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                      {isUrdu ? selectedArticle.categoryUrdu || selectedArticle.category : selectedArticle.category}
                    </span>
                    {selectedArticle.readTime && (
                      <span className="bg-slate-800/80 text-slate-200 px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 backdrop-blur-sm">
                        <Clock className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{selectedArticle.readTime}</span>
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black leading-snug drop-shadow-md">
                    {isUrdu ? selectedArticle.titleUrdu : selectedArticle.titleEnglish || selectedArticle.titleUrdu}
                  </h1>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 sm:p-8 space-y-8">
                {/* Author Info Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-emerald-800 text-amber-300 font-black rounded-full flex items-center justify-center text-lg border-2 border-amber-300/40 shadow-sm">
                      Dr
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm">
                        {isUrdu ? selectedArticle.authorUrdu || selectedArticle.author : selectedArticle.authorEnglish || selectedArticle.author}
                      </div>
                      <div className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{isUrdu ? 'مستند ایم بی بی ایس فزیشن - حافظ کلینک' : 'Certified MBBS Physician - Hafiz Clinic'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <button
                      onClick={() => handleLike(selectedArticle.id)}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        userLikes[selectedArticle.id]
                          ? 'bg-rose-50 border-rose-200 text-rose-600 shadow-sm'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${userLikes[selectedArticle.id] ? 'fill-rose-500 text-rose-500' : ''}`} />
                      <span>{likedArticles[selectedArticle.id] ?? (selectedArticle.likes || 12)} Likes</span>
                    </button>

                    <button
                      onClick={() => handleShare(selectedArticle)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100 transition-all"
                    >
                      <Share2 className="w-4 h-4 text-emerald-700" />
                      <span>{copiedLink ? (isUrdu ? 'لنک کاپی ہو گیا!' : 'Link Copied!') : (isUrdu ? 'شیئر کریں' : 'Share')}</span>
                    </button>
                  </div>
                </div>

                {/* Formatted Article Content */}
                <div className="prose prose-slate max-w-none text-slate-800 text-sm sm:text-base leading-relaxed space-y-4">
                  {((isUrdu ? selectedArticle.contentUrdu : selectedArticle.contentEnglish || selectedArticle.contentUrdu) || '')
                    .split('\n\n')
                    .map((paragraph, idx) => (
                      <p key={idx} className="bg-slate-50/50 p-4 rounded-xl border-l-4 border-emerald-600 text-slate-800">
                        {paragraph}
                      </p>
                    ))}
                </div>

                {/* Call To Action Box inside Article */}
                <div className="bg-gradient-to-r from-emerald-900 to-teal-950 text-white p-6 rounded-2xl shadow-lg space-y-4">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-6 h-6 text-amber-300 shrink-0 mt-1" />
                    <div>
                      <h4 className="font-black text-base text-amber-300">
                        {isUrdu ? 'کیا آپ اس بیماری یا مسئلے کا مستقل علاج چاہتے ہیں؟' : 'Need Personal Medical Advice or Consultation?'}
                      </h4>
                      <p className="text-xs text-emerald-100 mt-1 leading-relaxed">
                        {isUrdu
                          ? 'حافظ کلینک کے ماہر ڈاکٹرز سے کمپیوٹرائزڈ چیک اپ اور معائنے کے لیے فوری اپائنٹمنٹ بُک کریں۔'
                          : 'Schedule a physical or online consultation with our senior doctors at Hafiz Clinic today.'}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3 pt-2">
                    <button
                      onClick={() => {
                        const author = selectedArticle.authorUrdu || selectedArticle.author;
                        if (onOpenAppointment) onOpenAppointment(author);
                        setSelectedArticle(null);
                      }}
                      className="bg-amber-400 hover:bg-amber-300 text-emerald-950 px-5 py-2.5 rounded-xl text-xs font-black shadow-md transition-all flex items-center gap-2"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>{isUrdu ? 'ڈاکٹر سے اپائنٹمنٹ لیں' : 'Book Doctor Appointment'}</span>
                    </button>
                  </div>
                </div>

                {/* Patient Comments & Q&A Section */}
                <div className="border-t border-slate-200 pt-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-emerald-700" />
                      <span>{isUrdu ? 'مریضوں کے تبصرے اور سوالات' : 'Reader Comments & Doctor Q&A'}</span>
                    </h3>
                    <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">
                      {comments.filter((c) => c.articleId === selectedArticle.id).length} {isUrdu ? 'تبصرے' : 'Comments'}
                    </span>
                  </div>

                  {/* Comment Form */}
                  <form onSubmit={handleAddComment} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                    <h4 className="font-bold text-xs text-slate-700">
                      {isUrdu ? 'اپنا سوال یا رائے لکھیں:' : 'Leave a comment or question for the doctor:'}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        required
                        value={newCommentName}
                        onChange={(e) => setNewCommentName(e.target.value)}
                        placeholder={isUrdu ? 'آپ کا نام اور شہر' : 'Your Name & City'}
                        className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      />
                    </div>
                    <textarea
                      required
                      rows={2}
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                      placeholder={isUrdu ? 'مضمون کے متعلق اپنا تبصرہ یا سوال ٹائپ کریں...' : 'Type your question or feedback...'}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="bg-emerald-800 hover:bg-emerald-900 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{isUrdu ? 'تبصرہ ارسال کریں' : 'Post Comment'}</span>
                      </button>
                    </div>
                  </form>

                  {/* Existing Comments List */}
                  <div className="space-y-3">
                    {comments
                      .filter((c) => c.articleId === selectedArticle.id)
                      .map((comm) => (
                        <div key={comm.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-900">{comm.name}</span>
                            <span className="text-[11px] text-slate-400">{comm.date}</span>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed">{comm.comment}</p>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
