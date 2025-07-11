import React, { useState, Suspense, lazy } from 'react';
import './App.css';

const MovieDetailModal = lazy(() => import('./MovieDetailModal'));

function App() {
  const [diary, setDiary] = useState('');
  const [movies, setMovies] = useState([]);
  const [emotion, setEmotion] = useState('');
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState(''); // 오류 메시지 상태
  const [hasRecommended, setHasRecommended] = useState(false); // 추천 버튼 클릭 여부

  const [searchQuery, setSearchQuery] = useState(''); // 검색어 상태
  const [searchResults, setSearchResults] = useState([]); // 검색 결과 상태
  const [isSearching, setIsSearching] = useState(false); // 검색 로딩 상태
  const [hasSearched, setHasSearched] = useState(false); // 검색 버튼 클릭 여부

  const handleRecommend = async () => {
    if (!diary.trim()) {
      setErrorMessage('일기를 작성해주세요.');
      return;
    }

    setIsLoading(true);
    setMovies([]);
    setEmotion('');
    setReason('');
    setSelectedMovie(null);
    setShowModal(false);
    setSearchResults([]); // 추천 시 검색 결과 초기화
    setErrorMessage(''); // 새로운 요청 시 오류 메시지 초기화
    setHasRecommended(true); // 추천 버튼이 눌렸음을 표시
    setHasSearched(false); // 추천 시 검색 상태 초기화

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
    setMovies([]); // 검색 시 추천 결과 초기화
    setEmotion('');
    setReason('');
    setSearchResults([]);
    setErrorMessage(''); // 새로운 요청 시 오류 메시지 초기화
    setHasSearched(true); // 검색 버튼이 눌렸음을 표시
    setHasRecommended(false); // 검색 시 추천 상태 초기화

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
    setErrorMessage(''); // 새로운 요청 시 오류 메시지 초기화
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
        <div className="search-section">
          <input
            type="text"
            className="search-input"
            placeholder="영화 제목으로 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => { if (e.key === 'Enter') handleSearch(); }}
          />
          <button className="search-button" onClick={handleSearch} disabled={isSearching}>
            {isSearching ? '검색 중...' : '검색'}
          </button>
        </div>
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

        {isSearching && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-message">영화 검색 중입니다...</p>
          </div>
        )}

        {!isSearching && hasSearched && searchResults.length === 0 && searchQuery.trim() !== '' && (
          <p className="no-results-message">검색 결과가 없습니다.</p>
        )}

        {searchResults.length > 0 && !isSearching && (
          <div className="movie-results-container">
            <h2>검색 결과</h2>
            <div className="movie-list">
              {searchResults.map((movie) => (
                <div key={movie.id} className="movie-card" onClick={() => handleCardClick(movie.id)}>
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

        {!isLoading && hasRecommended && movies.length === 0 && diary.trim() !== '' && !errorMessage && (
          <p className="no-results-message">추천할 영화를 찾지 못했습니다. 다른 일기를 작성해보세요.</p>
        )}

        {movies.length > 0 && !isLoading && (
          <div className="movie-results-container">
            <h2>오늘 당신의 하루는 <span className="highlight-emotion">{emotion}</span>!</h2>
            <p className="recommendation-reason">{reason}</p>
            <h3>오늘 당신의 하루엔 이 영화들을 추천합니다!</h3>
            <div className="movie-list">
              {movies.map((movie) => (
                <div key={movie.id} className="movie-card" onClick={() => handleCardClick(movie.id)}>
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
            <button className="recommend-button refresh-button" onClick={handleRecommend} disabled={isLoading}>
              {isLoading ? '새로운 영화 찾는 중...' : '다른 영화 추천받기'}
            </button>
          </div>
        )}
      </header>
      {showModal && (
        <Suspense fallback={<div>모달 로딩 중...</div>}>
          <MovieDetailModal movie={selectedMovie} onClose={closeModal} />
        </Suspense>
      )}
    </div>
  );
}

export default App;

