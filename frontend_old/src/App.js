import React, { useState, Suspense, lazy } from 'react';
import './App.css';

const MovieDetailModal = lazy(() => import('./MovieDetailModal'));

// --- Welcome Message Component ---
const WelcomeMessage = ({ onStart }) => (
  <div className="welcome-container">
    <h2>오늘 당신의 하루는 어땠나요?</h2>
    <p>당신의 이야기에 귀 기울여, 지금 당신에게 꼭 필요한 영화를 찾아드릴게요.</p>
    <button className="recommend-button start-button" onClick={onStart}>
      일기 쓰러가기
    </button>
  </div>
);

// --- Diary Input and Recommendation Section ---
const DiarySection = ({ 
  diary, setDiary, movies, setMovies, emotion, setEmotion, reason, setReason,
  isLoading, setIsLoading, errorMessage, setErrorMessage, hasRecommended, setHasRecommended,
  handleRecommend, handleCardClick, selectedMovie, showModal, closeModal
}) => {
  return (
    <div className="diary-section fade-in">
      <textarea
        className="diary-input"
        rows="10"
        placeholder="오늘 하루는 어땠나요? 당신의 이야기를 들려주세요."
        value={diary}
        onChange={(e) => setDiary(e.target.value)}
      />
      <button className="recommend-button" onClick={handleRecommend} disabled={isLoading}>
        {isLoading ? '분석 중...' : '영화 추천받기'}
      </button>

      {errorMessage && <p className="error-message">{errorMessage}</p>}

      {isLoading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-message">영화 추천을 준비 중입니다...</p>
        </div>
      )}

      {!isLoading && hasRecommended && movies.length === 0 && diary.trim() !== '' && !errorMessage && (
        <p className="no-results-message">😔 추천할 영화를 찾지 못했습니다. 다른 일기를 작성해보세요.</p>
      )}

      {movies.length > 0 && !isLoading && (
        <div className="movie-results-container">
          <h2>오늘 당신의 하루는 <span className="highlight-emotion">{emotion}</span>!</h2>
          <p className="recommendation-reason">{reason}</p>
          <h3>오늘 당신의 하루엔 이 영화들을 추천합니다!</h3>
          <div className="movie-list">
            {movies.map((movie, index) => (
              <div 
                key={movie.id} 
                className="movie-card animate"
                onClick={() => handleCardClick(movie.id)}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <img 
                  src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                  alt={`${movie.title} 포스터`} 
                  onError={(e) => { e.target.onerror = null; e.target.src='https://via.placeholder.com/500x750.png?text=Image+Not+Found'}} 
                  loading="lazy"
                />
                <h4>{movie.title}</h4>
                <p className="movie-overview">{movie.overview}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {movies.length > 0 && !isLoading && (
        <button className="recommend-button refresh-button" onClick={handleRecommend} disabled={isLoading}>
          {isLoading ? '새로운 영화 찾는 중...' : '다른 영화 추천받기'}
        </button>
      )}
      {showModal && (
        <Suspense fallback={<div>모달 로딩 중...</div>}>
          <MovieDetailModal movie={selectedMovie} onClose={closeModal} />
        </Suspense>
      )}
    </div>
  );
};

// --- Search Section ---
const SearchSection = ({
  searchQuery, setSearchQuery, searchResults, setSearchResults, isSearching, setIsSearching,
  errorMessage, setErrorMessage, hasSearched, setHasSearched,
  handleSearch, handleCardClick, selectedMovie, showModal, closeModal
}) => {
  return (
    <div className="search-container">
       <div className="search-section">
          <input
            type="text"
            className="search-input"
            placeholder="또는, 영화 제목으로 직접 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => { if (e.key === 'Enter') handleSearch(); }}
          />
          <button className="search-button" onClick={handleSearch} disabled={isSearching}>
            {isSearching ? '검색 중...' : '검색'}
          </button>
        </div>

        {errorMessage && <p className="error-message">{errorMessage}</p>}

        {isSearching && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-message">영화를 검색 중입니다...</p>
          </div>
        )}

        {!isSearching && hasSearched && searchResults.length === 0 && searchQuery.trim() !== '' && (
          <p className="no-results-message">🎬 검색 결과가 없습니다. 다른 키워드로 검색해볼까요?</p>
        )}

        {searchResults.length > 0 && !isSearching && (
          <div className="movie-results-container">
            <h2>검색 결과</h2>
            <div className="movie-list">
              {searchResults.map((movie, index) => (
                <div 
                  key={movie.id} 
                  className="movie-card animate"
                  onClick={() => handleCardClick(movie.id)}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <img 
                    src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                    alt={`${movie.title} 포스터`} 
                    onError={(e) => { e.target.onerror = null; e.target.src='https://via.placeholder.com/500x750.png?text=Image+Not+Found'}} 
                    loading="lazy"
                  />
                  <h4>{movie.title}</h4>
                  <p className="movie-overview">{movie.overview}</p>
                </div>
              ))}
            </div>
          </div>
        )}
         {showModal && (
          <Suspense fallback={<div>모달 로딩 중...</div>}>
            <MovieDetailModal movie={selectedMovie} onClose={closeModal} />
          </Suspense>
        )}
    </div>
  )
}


function App() {
  // Common states for both sections
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Diary Section states
  const [diary, setDiary] = useState('');
  const [movies, setMovies] = useState([]);
  const [emotion, setEmotion] = useState('');
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasRecommended, setHasRecommended] = useState(false);

  // Search Section states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const [viewMode, setViewMode] = useState('welcome'); // welcome, diary

  const handleRecommend = async () => {
    if (!diary.trim()) {
      setErrorMessage('일기를 작성해주세요.');
      return;
    }

    setIsLoading(true);
    setMovies([]);
    setEmotion('');
    setReason('');
    setErrorMessage('');
    setHasRecommended(true);
    
    // Clear search results when recommending
    setSearchResults([]);
    setSearchQuery('');
    setHasSearched(false);

    try {
      const response = await fetch('https://movie-backend-866560009438.asia-northeast3.run.app/api/recommend-movie', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ diary: diary }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || '서버에서 응답을 받지 못했습니다.');
      }

      const data = await response.json();
      setMovies(data.movies);
      setEmotion(data.emotion);
      setReason(data.reason);
    } catch (error) {
      console.error('Error fetching recommendation:', error);
      setErrorMessage(`영화 추천 중 오류 발생: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setErrorMessage('검색어를 입력해주세요.');
      return;
    }

    setIsSearching(true);
    setSearchResults([]);
    setErrorMessage('');
    setHasSearched(true);

    // Clear recommendation results when searching
    setMovies([]);
    setEmotion('');
    setReason('');
    setDiary('');
    setHasRecommended(false);

    try {
      const response = await fetch(`https://movie-backend-866560009438.asia-northeast3.run.app/api/search-movies?query=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || '영화 검색에 실패했습니다.');
      }
      const data = await response.json();
      setSearchResults(data.results);
    } catch (error) {
      console.error('Error searching movies:', error);
      setErrorMessage(`영화 검색 중 오류 발생: ${error.message}`);
    } finally {
      setIsSearching(false);
    }
  };

  const handleCardClick = async (movieId) => {
    setErrorMessage('');
    try {
      const response = await fetch(`https://movie-backend-866560009438.asia-northeast3.run.app/api/movie-details/${movieId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || '영화 상세 정보를 가져오지 못했습니다.');
      }
      const details = await response.json();
      setSelectedMovie(details);
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching movie details:', error);
      setErrorMessage(`영화 상세 정보를 불러오는 중 오류 발생: ${error.message}`);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedMovie(null);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>오늘의 일기, 오늘의 영화</h1>
        
        {viewMode === 'welcome' ? (
          <WelcomeMessage onStart={() => setViewMode('diary')} />
        ) : (
          <DiarySection 
            diary={diary} setDiary={setDiary}
            movies={movies} setMovies={setMovies}
            emotion={emotion} setEmotion={setEmotion}
            reason={reason} setReason={setReason}
            isLoading={isLoading} setIsLoading={setIsLoading}
            errorMessage={errorMessage} setErrorMessage={setErrorMessage}
            hasRecommended={hasRecommended} setHasRecommended={setHasRecommended}
            handleRecommend={handleRecommend}
            handleCardClick={handleCardClick}
            selectedMovie={selectedMovie}
            showModal={showModal}
            closeModal={closeModal}
          />
        )}

        <div className="divider"></div>

        <SearchSection 
          searchQuery={searchQuery} setSearchQuery={setSearchQuery}
          searchResults={searchResults} setSearchResults={setSearchResults}
          isSearching={isSearching} setIsSearching={setIsSearching}
          errorMessage={errorMessage} setErrorMessage={setErrorMessage}
          hasSearched={hasSearched} setHasSearched={setHasSearched}
          handleSearch={handleSearch}
          handleCardClick={handleCardClick}
          selectedMovie={selectedMovie}
          showModal={showModal}
          closeModal={closeModal}
        />

      </header>
    </div>
  );
}

export default App;
