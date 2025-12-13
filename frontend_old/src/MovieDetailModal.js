import React, { useEffect } from 'react';

// 영화 상세 정보를 표시할 모달 컴포넌트
const MovieDetailModal = ({ movie, onClose }) => {
  // Esc 키로 모달을 닫는 기능 추가
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // 컴포넌트가 언마운트될 때 이벤트 리스너 제거
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]); // onClose 함수가 변경될 때만 이 효과를 다시 실행

  if (!movie) return null;

  const director = movie.credits?.crew.find(person => person.job === 'Director');
  const topActors = movie.credits?.cast.slice(0, 3).map(actor => actor.name).join(', ');

  // OTT 제공자 정보 파싱
  const watchProviders = movie['watch/providers']?.results?.KR;
  const flatrateProviders = watchProviders?.flatrate || [];
  const buyProviders = watchProviders?.buy || [];
  const rentProviders = watchProviders?.rent || [];

  // OTT 로고 URL 생성 함수
  const getOttLogoUrl = (logoPath) => {
    return logoPath ? `https://image.tmdb.org/t/p/original${logoPath}` : '';
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-button" onClick={onClose}>&times;</button>
        <div className="modal-header-content">
          <img 
            src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
            alt={`${movie.title} 포스터`} 
            onError={(e) => { e.target.onerror = null; e.target.src='https://via.placeholder.com/500x750.png?text=Image+Not+Found'}} 
            className="modal-poster"
            loading="lazy"
          />
          <div className="modal-title-info">
            <h2>{movie.title}</h2>
            <div className="modal-info-group">
              <div className="modal-info-item">
                <span className="icon">📅</span>
                <p><strong>개봉일:</strong> {movie.release_date}</p>
              </div>
              <div className="modal-info-item">
                <span className="icon">⭐</span>
                <p><strong>평점:</strong> {movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'} ({movie.vote_count}표)</p>
              </div>
              {movie.runtime && (
                <div className="modal-info-item">
                  <span className="icon">⏱️</span>
                  <p><strong>러닝타임:</strong> {movie.runtime}분</p>
                </div>
              )}
              {movie.genres && movie.genres.length > 0 && (
                <div className="modal-info-item">
                  <span className="icon">🎭</span>
                  <p><strong>장르:</strong> {movie.genres.map(genre => genre.name).join(', ')}</p>
                </div>
              )}
              {director && (
                <div className="modal-info-item">
                  <span className="icon">🎬</span>
                  <p><strong>감독:</strong> {director.name}</p>
                </div>
              )}
              {topActors && (
                <div className="modal-info-item">
                  <span className="icon">👥</span>
                  <p><strong>주연:</strong> {topActors}</p>
                </div>
              )}
            </div>

            {/* OTT 정보 표시 */}
            {(flatrateProviders.length > 0 || buyProviders.length > 0 || rentProviders.length > 0) && (
              <div className="modal-info-group">
                <div className="modal-info-item">
                  <span className="icon">📺</span>
                  <p><strong>시청 가능:</strong></p>
                </div>
                {flatrateProviders.length > 0 && (
                  <div className="ott-providers">
                    <p>구독:</p>
                    {flatrateProviders.map(provider => (
                      <img
                        key={provider.provider_id}
                        src={getOttLogoUrl(provider.logo_path)}
                        alt={provider.provider_name}
                        title={provider.provider_name}
                        className="ott-logo"
                        loading="lazy"
                      />
                    ))}
                  </div>
                )}
                {buyProviders.length > 0 && (
                  <div className="ott-providers">
                    <p>구매:</p>
                    {buyProviders.map(provider => (
                      <img
                        key={provider.provider_id}
                        src={getOttLogoUrl(provider.logo_path)}
                        alt={provider.provider_name}
                        title={provider.provider_name}
                        className="ott-logo"
                        loading="lazy"
                      />
                    ))}
                  </div>
                )}
                {rentProviders.length > 0 && (
                  <div className="ott-providers">
                    <p>대여:</p>
                    {rentProviders.map(provider => (
                      <img
                        key={provider.provider_id}
                        src={getOttLogoUrl(provider.logo_path)}
                        alt={provider.provider_name}
                        title={provider.provider_name}
                        className="ott-logo"
                        loading="lazy"
                      />
                    ))}
                  </div>
                )}
                {watchProviders?.link && (
                  <div className="modal-info-item">
                    <a href={watchProviders.link} target="_blank" rel="noopener noreferrer" className="ott-link">
                      더 많은 시청 정보
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="modal-overview-section">
          <h3>줄거리</h3>
          <p>{movie.overview || '줄거리 정보가 없습니다.'}</p>
        </div>
      </div>
    </div>
  );
};

export default MovieDetailModal;