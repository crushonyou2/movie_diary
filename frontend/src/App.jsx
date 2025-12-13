import { useState, useEffect } from 'react';
import { Search, Film, Send, X, Loader2, Sparkles, Star, BookOpen, Trash2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- OTT Data ---
const OTT_OPTIONS = [
  { id: 'Netflix', name: 'Netflix', color: 'bg-red-600' },
  { id: 'Watcha', name: 'Watcha', color: 'bg-pink-500' },
  { id: 'Wavve', name: 'Wavve', color: 'bg-blue-500' },
  { id: 'Disney+', name: 'Disney+', color: 'bg-blue-800' },
  { id: 'Apple TV+', name: 'Apple TV+', color: 'bg-gray-800' },
];

// --- Components ---

const MovieCard = ({ movie, onClick, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    whileHover={{ scale: 1.05 }}
    className="relative group cursor-pointer rounded-xl overflow-hidden shadow-lg bg-slate-800/50 border border-slate-700"
    onClick={() => onClick(movie.id)}
  >
    <div className="aspect-[2/3] w-full relative overflow-hidden">
      <img
        src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Image'}
        alt={movie.title}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
        <span className="text-white text-sm font-medium">상세보기</span>
      </div>
    </div>
    <div className="p-4">
      <h3 className="text-lg font-bold truncate text-white">{movie.title}</h3>
      <div className="flex items-center gap-1 text-yellow-400 mt-1">
        <Star size={14} fill="currentColor" />
        <span className="text-sm">{movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}</span>
      </div>
    </div>
  </motion.div>
);

const Modal = ({ movie, onClose }) => {
  if (!movie) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-slate-900 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-slate-700 shadow-2xl relative flex flex-col md:flex-row"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 z-10 p-2 bg-black/50 rounded-full hover:bg-slate-700 transition">
          <X size={20} />
        </button>
        
        <div className="w-full md:w-1/2 aspect-[2/3] md:aspect-auto">
          <img
            src={movie.poster_path ? `https://image.tmdb.org/t/p/original${movie.poster_path}` : ''}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="p-6 md:p-8 flex flex-col gap-4 w-full md:w-1/2">
          <div>
            <h2 className="text-3xl font-bold mb-2">{movie.title}</h2>
            <p className="text-slate-400 italic">{movie.tagline}</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {movie.genres?.map(g => (
              <span key={g.id} className="px-3 py-1 text-xs rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {g.name}
              </span>
            ))}
          </div>

          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
            <h4 className="text-sm font-semibold mb-2 text-slate-300">줄거리</h4>
            <p className="text-sm leading-relaxed text-slate-400">
              {movie.overview || "줄거리 정보가 없습니다."}
            </p>
          </div>
          
          {movie['watch/providers']?.results?.KR && (
             <div className="mt-auto pt-4">
                <p className="text-xs text-slate-500 mb-2">시청 가능한 곳</p>
                <div className="flex gap-2 flex-wrap">
                   {movie['watch/providers'].results.KR.flatrate?.map(provider => (
                      <img key={provider.provider_id} src={`https://image.tmdb.org/t/p/original${provider.logo_path}`} alt={provider.provider_name} className="w-10 h-10 rounded-lg shadow-md" title={provider.provider_name}/>
                   ))}
                   {!movie['watch/providers'].results.KR.flatrate && <span className="text-sm text-slate-500">현재 스트리밍 중인 곳이 없습니다.</span>}
                </div>
             </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// --- Main App ---

const API_BASE_URL = "https://movie-backend-866560009438.asia-northeast3.run.app";

function App() {
  const [activeTab, setActiveTab] = useState('diary'); // 'diary' | 'history' | 'search'
  const [diary, setDiary] = useState('');
  const [query, setQuery] = useState('');
  const [selectedOtt, setSelectedOtt] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); 
  const [selectedMovie, setSelectedMovie] = useState(null);

  // 로컬 스토리지에서 기록 불러오기
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('movie_diary_history');
    return saved ? JSON.parse(saved) : [];
  });

  // 기록이 변경될 때마다 저장
  useEffect(() => {
    localStorage.setItem('movie_diary_history', JSON.stringify(history));
  }, [history]);

  const toggleOtt = (ottId) => {
    setSelectedOtt(prev => 
      prev.includes(ottId) ? prev.filter(id => id !== ottId) : [...prev, ottId]
    );
  };

  const handleRecommend = async () => {
    if (!diary.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/recommend-movie`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ diary, ott_filters: selectedOtt })
      });
      const data = await res.json();
      setResult(data);

      // 기록에 저장 (성공 시)
      if (data.movies && data.movies.length > 0) {
        const newEntry = {
          id: Date.now(),
          date: new Date().toLocaleDateString(),
          diaryPreview: diary.slice(0, 50) + (diary.length > 50 ? '...' : ''),
          emotion: data.emotion,
          reason: data.reason,
          movies: data.movies
        };
        setHistory(prev => [newEntry, ...prev]);
      }

    } catch (e) {
      console.error(e);
      alert("서버 연결에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const deleteHistoryItem = (id, e) => {
    e.stopPropagation();
    if(window.confirm('정말 삭제하시겠습니까?')) {
        setHistory(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/search-movies?query=${query}`);
      const data = await res.json();
      setResult({ movies: data.results });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openDetail = async (id) => {
    try {
        const res = await fetch(`${API_BASE_URL}/api/movie-details/${id}`);
        const data = await res.json();
        setSelectedMovie(data);
    } catch (e) {
        console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-indigo-500 selection:text-white pb-20">
      {/* Header */}
      <header className="fixed top-0 w-full z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-indigo-400 cursor-pointer" onClick={() => window.location.reload()}>
            <img 
              src={`${import.meta.env.BASE_URL}logo.svg`} 
              alt="Movie Diary" 
              className="w-8 h-8 object-contain" 
            />
            <span>MovieDiary</span>
          </div>
          <nav className="flex gap-1 bg-slate-900 p-1 rounded-full border border-slate-800">
            <button 
              onClick={() => { setActiveTab('diary'); setResult(null); }}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${activeTab === 'diary' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              일기 쓰기
            </button>
            <button 
              onClick={() => { setActiveTab('history'); setResult(null); }}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${activeTab === 'history' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              내 일기장
            </button>
            <button 
              onClick={() => { setActiveTab('search'); setResult(null); }}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${activeTab === 'search' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              검색
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 pt-32">
        
        {/* Diary Section */}
        {activeTab === 'diary' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="text-center space-y-2 mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-white">오늘 하루는 어땠나요?</h1>
              <p className="text-slate-400">당신의 감정에 딱 맞는 영화를 처방해 드릴게요.</p>
            </div>
            
            <div className="relative bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-inner">
              <textarea
                value={diary}
                onChange={(e) => setDiary(e.target.value)}
                placeholder="오늘 있었던 일, 느꼈던 감정을 자유롭게 적어주세요..."
                className="w-full h-40 bg-transparent border-none text-lg focus:outline-none resize-none placeholder-slate-600"
              />
              
              {/* OTT Filter */}
              <div className="mt-4 pt-4 border-t border-slate-800">
                <p className="text-xs text-slate-500 mb-3 font-semibold">구독 중인 OTT만 선택 (선택 안 하면 전체 검색)</p>
                <div className="flex flex-wrap gap-2">
                  {OTT_OPTIONS.map(ott => (
                    <button
                      key={ott.id}
                      onClick={() => toggleOtt(ott.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all border ${selectedOtt.includes(ott.id) ? `border-transparent text-white ${ott.color}` : 'border-slate-700 bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                    >
                      {selectedOtt.includes(ott.id) && <Check size={12} />}
                      {ott.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                    onClick={handleRecommend}
                    disabled={loading || !diary.trim()}
                    className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg hover:shadow-indigo-500/20"
                >
                    {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Send className="w-5 h-5" />}
                    {loading ? '분석 중...' : '추천받기'}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* History Section */}
        {activeTab === 'history' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="text-center space-y-2 mb-8">
                    <h1 className="text-3xl font-bold text-white">내 일기장</h1>
                    <p className="text-slate-400">지나간 감정과 추천받은 영화들을 모아봤어요.</p>
                </div>
                {history.length === 0 ? (
                    <div className="text-center py-20 text-slate-600 bg-slate-900/30 rounded-2xl border border-slate-800/50">
                        <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p>아직 작성된 일기가 없습니다.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {history.map((item) => (
                            <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden p-6 hover:border-indigo-500/30 transition-colors">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <span className="text-xs font-medium text-slate-500 bg-slate-800 px-2 py-1 rounded">{item.date}</span>
                                        <h3 className="text-xl font-bold mt-2 text-indigo-300">{item.emotion}</h3>
                                    </div>
                                    <button onClick={(e) => deleteHistoryItem(item.id, e)} className="text-slate-600 hover:text-red-400 transition-colors">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                                <p className="text-slate-400 text-sm mb-6 bg-slate-950/50 p-3 rounded-lg">"{item.diaryPreview}"</p>
                                
                                <h4 className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">추천 영화</h4>
                                <div className="grid grid-cols-3 gap-4">
                                    {item.movies.map(movie => (
                                        <div key={movie.id} className="group cursor-pointer" onClick={() => openDetail(movie.id)}>
                                            <div className="aspect-[2/3] rounded-lg overflow-hidden bg-slate-800 mb-2">
                                                <img src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`} alt={movie.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                            </div>
                                            <p className="text-xs text-center text-slate-300 truncate group-hover:text-white">{movie.title}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </motion.div>
        )}

        {/* Search Section */}
        {activeTab === 'search' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
             <div className="text-center space-y-2 mb-8">
              <h1 className="text-3xl font-bold text-white">어떤 영화를 찾으세요?</h1>
              <p className="text-slate-400">제목으로 영화를 검색해보세요.</p>
            </div>
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="영화 제목 입력..."
                className="w-full bg-slate-900/50 border border-slate-800 rounded-full py-4 pl-6 pr-14 text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              />
              <button
                type="submit"
                disabled={loading}
                className="absolute right-2 top-2 bottom-2 bg-indigo-600 hover:bg-indigo-500 rounded-full w-10 h-10 flex items-center justify-center text-white transition-all"
              >
                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Search className="w-5 h-5" />}
              </button>
            </form>
          </motion.div>
        )}

        {/* Results Section (Common for Diary Result & Search Result) */}
        <div className="mt-16">
          {result && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              
              {result.emotion && (
                <div className="mb-8 p-6 bg-gradient-to-r from-indigo-900/30 to-purple-900/30 rounded-2xl border border-indigo-500/20 text-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-sm font-semibold mb-3">
                    <Sparkles size={14} /> 감정 분석 결과
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">"{result.emotion}"</h3>
                  <p className="text-slate-300">{result.reason}</p>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {result.movies && result.movies.length > 0 ? (
                  result.movies.map((movie, idx) => (
                    <MovieCard key={movie.id} movie={movie} index={idx} onClick={openDetail} />
                  ))
                ) : (
                   <div className="col-span-full text-center py-20 text-slate-500">
                      조건에 맞는 영화를 찾지 못했습니다. 다시 시도해보세요.
                   </div>
                )}
              </div>
              
               {/* 다시 추천받기 버튼 */}
               {activeTab === 'diary' && result.movies && result.movies.length > 0 && (
                <div className="mt-12 text-center pb-10">
                  <p className="text-slate-400 mb-4 text-sm">결과가 마음에 들지 않나요?</p>
                  <button
                    onClick={handleRecommend}
                    disabled={loading}
                    className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-full font-medium transition-all border border-slate-700 hover:border-indigo-500 flex items-center gap-2 mx-auto"
                  >
                    {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <Sparkles className="w-4 h-4 text-indigo-400" />}
                    다른 영화 다시 추천받기
                  </button>
                </div>
              )}

            </motion.div>
          )}
        </div>
      </main>

      <AnimatePresence>
        {selectedMovie && <Modal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />}
      </AnimatePresence>
    </div>
  );
}

export default App;