from fastapi.testclient import TestClient
from main import app, EMOTION_GENRE_MAP, EMOTION_REASON_MAP
import os
import pytest

# TestClient를 사용하여 FastAPI 애플리케이션을 테스트합니다.
client = TestClient(app)

# 테스트를 위한 임시 API 키 설정 (실제 API 호출 방지)
# 실제 API 호출을 막기 위해 환경 변수를 임시로 변경합니다.
# pytest fixture를 사용하여 테스트 전후에 환경을 설정/해제할 수 있습니다.
@pytest.fixture(autouse=True)
def mock_api_keys():
    original_gemini_key = os.getenv("GEMINI_API_KEY")
    original_tmdb_key = os.getenv("TMDB_API_KEY")

    os.environ["GEMINI_API_KEY"] = "test_gemini_key"
    os.environ["TMDB_API_KEY"] = "test_tmdb_key"

    yield

    # 테스트 후 원래 환경 변수로 복원
    if original_gemini_key:
        os.environ["GEMINI_API_KEY"] = original_gemini_key
    else:
        del os.environ["GEMINI_API_KEY"]
    
    if original_tmdb_key:
        os.environ["TMDB_API_KEY"] = original_tmdb_key
    else:
        del os.environ["TMDB_API_KEY"]

# --- /api/recommend-movie 엔드포인트 테스트 ---
def test_recommend_movie_success():
    # Mocking requests.get for TMDB API calls
    # 실제 TMDB API 호출을 방지하고 가짜 응답을 반환하도록 설정
    # 여기서는 간단한 더미 데이터를 사용합니다.
    def mock_requests_get(url, *args, **kwargs):
        class MockResponse:
            def __init__(self, json_data, status_code):
                self.json_data = json_data
                self.status_code = status_code
            def json(self):
                return self.json_data
            def raise_for_status(self):
                if self.status_code >= 400:
                    raise Exception(f"HTTP Error: {self.status_code}")
        
        if "discover/movie" in url or "movie/popular" in url:
            return MockResponse({"results": [{"id": 1, "title": "Test Movie 1", "overview": "Overview 1", "poster_path": "/path1.jpg"}]}, 200)
        return MockResponse({}, 404)

    import requests
    requests.get = mock_requests_get

    # Mocking genai.GenerativeModel for Gemini API calls
    # 실제 Gemini API 호출을 방지하고 가짜 응답을 반환하도록 설정
    class MockGenerateContentResponse:
        def __init__(self, text):
            self._text = text
        
        @property
        def text(self):
            return self._text
        
        @text.setter
        def text(self, value):
            self._text = value

    class MockGenerativeModel:
        def __init__(self, model_name):
            pass
        async def generate_content_async(self, prompt):
            # 일기 내용에 따라 특정 감정을 반환하도록 설정
            if "기쁨" in prompt:
                return MockGenerateContentResponse("기쁨")
            elif "슬픔" in prompt:
                return MockGenerateContentResponse("슬픔")
            return MockGenerateContentResponse("행복") # 기본값

    import google.generativeai as genai
    genai.GenerativeModel = MockGenerativeModel

    response = client.post("/api/recommend-movie", json={"diary": "오늘은 정말 기쁜 하루였다!"})
    assert response.status_code == 200
    data = response.json()
    assert "emotion" in data
    assert "movies" in data
    assert "reason" in data
    assert data["emotion"] == "기쁨"
    assert len(data["movies"]) > 0
    assert data["reason"] == EMOTION_REASON_MAP["기쁨"]

def test_recommend_movie_empty_diary():
    response = client.post("/api/recommend-movie", json={"diary": ""})
    assert response.status_code == 400
    assert response.json()["detail"] == "일기 내용이 비어있습니다."

# --- /api/search-movies 엔드포인트 테스트 ---
def test_search_movies_success():
    # Mocking requests.get for TMDB API calls
    def mock_requests_get(url, *args, **kwargs):
        class MockResponse:
            def __init__(self, json_data, status_code):
                self.json_data = json_data
                self.status_code = status_code
            def json(self):
                return self.json_data
            def raise_for_status(self):
                if self.status_code >= 400:
                    raise Exception(f"HTTP Error: {self.status_code}")
        
        if "search/movie" in url:
            return MockResponse({"results": [{"id": 101, "title": "Search Test Movie", "overview": "Search Overview", "poster_path": "/search.jpg", "vote_count": 1000, "vote_average": 7.5}]}, 200)
        return MockResponse({}, 404)

    import requests
    requests.get = mock_requests_get

    response = client.get("/api/search-movies?query=test")
    assert response.status_code == 200
    data = response.json()
    assert "results" in data
    assert len(data["results"]) > 0
    assert data["results"][0]["title"] == "Search Test Movie"

def test_search_movies_empty_query():
    response = client.get("/api/search-movies?query=")
    assert response.status_code == 400
    assert response.json()["detail"] == "검색어가 비어있습니다."

# --- /api/movie-details/{movie_id} 엔드포인트 테스트 ---
def test_get_movie_details_success():
    # Mocking requests.get for TMDB API calls
    def mock_requests_get(url, *args, **kwargs):
        class MockResponse:
            def __init__(self, json_data, status_code):
                self.json_data = json_data
                self.status_code = status_code
            def json(self):
                return self.json_data
            def raise_for_status(self):
                if self.status_code >= 400:
                    raise Exception(f"HTTP Error: {self.status_code}")
        
        if "movie/123" in url:
            return MockResponse({"id": 123, "title": "Detail Test Movie", "overview": "Detail Overview", "release_date": "2023-01-01", "vote_average": 8.0, "vote_count": 2000, "runtime": 120, "genres": [{"id": 1, "name": "Action"}], "credits": {"crew": [{"job": "Director", "name": "Test Director"}], "cast": [{"name": "Actor 1"}, {"name": "Actor 2"}]}}, 200)
        return MockResponse({}, 404)

    import requests
    requests.get = mock_requests_get

    response = client.get("/api/movie-details/123")
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Detail Test Movie"
    assert "credits" in data

def test_get_movie_details_not_found():
    # Mocking requests.get to simulate 404 Not Found from TMDB
    def mock_requests_get(url, *args, **kwargs):
        class MockResponse:
            def __init__(self, json_data, status_code):
                self.json_data = json_data
                self.status_code = status_code
            def json(self):
                return self.json_data
            def raise_for_status(self):
                if self.status_code >= 400:
                    raise requests.exceptions.HTTPError(f"HTTP Error: {self.status_code}")
        
        return MockResponse({"status_code": 34, "status_message": "The resource you requested could not be found."}, 404)

    import requests
    requests.get = mock_requests_get

    response = client.get("/api/movie-details/999999") # 존재하지 않는 영화 ID
    assert response.status_code == 500 # FastAPI가 HTTPException으로 변환
    assert "영화 상세 정보를 가져오는 중 오류가 발생했습니다." in response.json()["detail"]
