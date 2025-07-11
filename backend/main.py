import os
import random
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import google.generativeai as genai
import requests
from pydantic import BaseModel

# .env 파일에서 환경 변수 로드
load_dotenv()

app = FastAPI()

# CORS 설정
origins = [
    "http://localhost:3000",  # React 앱의 주소
    "https://incredible-travesseiro-af4280.netlify.app", # Netlify 앱의 주소
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- API 키 설정 ---
gemini_api_key = os.getenv("GEMINI_API_KEY")
tmdb_api_key = os.getenv("TMDB_API_KEY")

if not gemini_api_key:
    raise ValueError("GEMINI_API_KEY가 .env 파일에 설정되지 않았습니다.")
genai.configure(api_key=gemini_api_key)

if not tmdb_api_key:
    raise ValueError("TMDB_API_KEY가 .env 파일에 설정되지 않았습니다.")

# --- Pydantic 모델 --- (요청 본문 타입 검증)
class DiaryRequest(BaseModel):
    diary: str

# --- 감정-장르 매핑 ---
EMOTION_GENRE_MAP = {
    "기쁨": [35, 10751],  # 코미디, 가족
    "행복": [35, 10751, 10749], # 코미디, 가족, 로맨스
    "슬픔": [18, 10749, 10751],  # 드라마, 로맨스, 가족 (위로와 공감에 집중)
    "분노": [28, 53, 80],  # 액션, 스릴러, 범죄
    "놀람": [9648, 878, 14], # 미스터리, SF, 판타지
    "평온": [10749, 16, 99], # 로맨스, 애니메이션, 다큐멘터리
    "사랑": [10749, 10751, 18], # 로맨스, 가족, 드라마
    "지루함": [12, 878, 28], # 모험, SF, 액션 (흥미와 자극에 집중)
}

# --- 감정별 추천 이유 매핑 ---
EMOTION_REASON_MAP = {
    "기쁨": "오늘의 기쁨을 두 배로 만들어 줄 유쾌하고 즐거운 영화들을 추천합니다!",
    "행복": "행복한 당신의 하루에 웃음꽃을 피워줄 따뜻한 영화들을 추천합니다!",
    "슬픔": "슬픔을 위로하고 마음을 따뜻하게 해줄 감동적인 영화들을 추천합니다.",
    "분노": "쌓인 스트레스를 시원하게 날려버릴 통쾌한 액션과 모험 영화들을 추천합니다!",
    "놀람": "예측 불가능한 반전과 흥미진진한 스토리가 가득한 영화들을 추천합니다.",
    "평온": "잔잔한 감동과 편안함을 선사할 영화들을 추천합니다. 오늘 하루의 마무리를 함께하세요.",
    "사랑": "사랑스러운 당신의 마음에 설렘을 더해줄 로맨틱한 영화들을 추천합니다.",
    "지루함": "지루함을 날려버릴 흥미로운 다큐멘터리나 새로운 시각을 제공하는 영화들을 추천합니다.",
}

from google.api_core import exceptions as google_exceptions

# --- 핵심 로직 함수 ---
async def analyze_emotion_with_gemini(diary: str) -> str | None:
    """Gemini API를 호출하여 감정을 분석합니다. 할당량 초과 시 None을 반환합니다."""
    model = genai.GenerativeModel('gemini-2.5-flash')
    prompt = f"다음 일기 내용의 핵심 감정을 다음 단어 중 하나로 요약해줘: {list(EMOTION_GENRE_MAP.keys())}. 오직 단어 하나만 응답해야 해.\n\n일기: {diary}"
    try:
        response = await model.generate_content_async(prompt)
        emotion = response.text.strip()
        if emotion not in EMOTION_GENRE_MAP:
            print(f"Gemini가 예상치 못한 답변을 반환했습니다: {emotion}. 임의의 감정으로 대체합니다.")
            return random.choice(list(EMOTION_GENRE_MAP.keys()))
        return emotion
    except google_exceptions.ResourceExhausted as e:
        print(f"Gemini API 할당량 초과: {e}. 임의의 감정으로 영화를 추천합니다.")
        return None  # 할당량 초과 시 None 반환
    except Exception as e:
        print(f"Gemini API 처리 중 예상치 못한 오류 발생: {e}")
        raise HTTPException(status_code=500, detail="감정 분석 중 오류가 발생했습니다.")

async def get_movie_recommendation(genre_ids: list[int], num_movies: int = 3):
    all_movies = []
    min_vote_count = 100 
    min_vote_average = 6.0 # 최소 평점 6.0점으로 조정

    # TMDB 정렬 기준 목록
    sort_options = [
        "popularity.desc",
        "vote_average.desc",
        "release_date.desc",
    ]
    # 무작위로 정렬 기준 선택
    selected_sort_by = random.choice(sort_options)

    # 각 장르 ID에 대해 순차적으로 영화를 가져옴
    for genre_id in genre_ids:
        # 이미 충분한 영화를 가져왔으면 중단
        if len(all_movies) >= num_movies * 3: # 필요한 영화 수의 3배 정도 확보
            break

        # 최대 10페이지까지 영화를 가져와서 선택지를 확보
        for page in range(1, 11): 
            url = f"https://api.themoviedb.org/3/discover/movie?api_key={tmdb_api_key}&with_genres={genre_id}&language=ko-KR&sort_by={selected_sort_by}&vote_count.gte={min_vote_count}&vote_average.gte={min_vote_average}&page={page}"
            try:
                response = requests.get(url)
                response.raise_for_status()
                movies_data = response.json()
                if movies_data.get('results'):
                    all_movies.extend(movies_data['results'])
                else:
                    break # 더 이상 결과가 없으면 중단
            except requests.RequestException as e:
                print(f"TMDB API 오류 (장르 {genre_id}, 페이지 {page}): {e}")
                break # 오류 발생 시 현재 장르 중단

    # 중복 제거
    unique_movies = []
    seen_ids = set()
    for movie in all_movies:
        if movie['id'] not in seen_ids:
            unique_movies.append(movie)
            seen_ids.add(movie['id'])

    # 최후의 보루: 만약 필터링 후에도 영화가 부족하면, 가장 인기 있는 영화 목록에서 가져옴
    if len(unique_movies) < num_movies:
        print("필터링 후 영화가 부족하여 인기 영화 목록에서 추가로 가져옵니다.")
        fallback_movies = []
        for page in range(1, 3): # 인기 영화 2페이지까지
            url = f"https://api.themoviedb.org/3/movie/popular?api_key={tmdb_api_key}&language=ko-KR&page={page}"
            try:
                response = requests.get(url)
                response.raise_for_status()
                data = response.json()
                if data.get('results'):
                    fallback_movies.extend(data['results'])
                else:
                    break
            except requests.RequestException as e:
                print(f"TMDB 인기 영화 API 오류 (페이지 {page}): {e}")
                break
        
        # 기존 영화와 합치고 중복 제거
        for movie in fallback_movies:
            if movie['id'] not in seen_ids:
                unique_movies.append(movie)
                seen_ids.add(movie['id'])

    if not unique_movies:
        return [] # 영화가 없으면 빈 리스트 반환
    
    # 가져온 모든 고유 영화 중에서 요청한 개수만큼 무작위로 선택
    return random.sample(unique_movies, min(num_movies, len(unique_movies)))

# --- API 엔드포인트 ---
@app.post("/api/recommend-movie")
async def recommend_movie_endpoint(request: DiaryRequest):
    if not request.diary.strip():
        raise HTTPException(status_code=400, detail="일기 내용이 비어있습니다.")

    # 1. 감정 분석 (할당량 초과 시 None이 반환됨)
    emotion = await analyze_emotion_with_gemini(request.diary)

    # 2. 감정이 없으면(할당량 초과) 임의의 감정 선택
    if emotion is None:
        emotion = random.choice(list(EMOTION_GENRE_MAP.keys()))
        final_emotion_for_display = f"{emotion} (API 할당량 초과로 임의 선택됨)"
    else:
        final_emotion_for_display = emotion

    # 3. 감정에 맞는 장르 ID 가져오기
    genre_ids = EMOTION_GENRE_MAP.get(emotion, [18])

    # 4. 영화 추천 받기 (여러 개 요청)
    movies = await get_movie_recommendation(genre_ids, num_movies=3)

    if not movies:
        raise HTTPException(status_code=404, detail="추천할 영화를 찾지 못했습니다.")

    # 5. 추천 이유 가져오기
    recommendation_reason = EMOTION_REASON_MAP.get(emotion, "오늘 당신의 하루에 어울리는 영화들을 추천합니다!")

    return {"emotion": final_emotion_for_display, "movies": movies, "reason": recommendation_reason}

@app.get("/api/search-movies")
async def search_movies(query: str):
    if not query.strip():
        raise HTTPException(status_code=400, detail="검색어가 비어있습니다.")

    min_vote_count = 50 # 검색 결과는 추천보다 기준을 약간 낮춤
    min_vote_average = 6.0

    url = f"https://api.themoviedb.org/3/search/movie?api_key={tmdb_api_key}&query={query}&language=ko-KR&page=1&vote_count.gte={min_vote_count}&vote_average.gte={min_vote_average}"
    try:
        response = requests.get(url)
        response.raise_for_status()
        search_results = response.json()['results']
        
        # 검색 결과도 품질 필터링
        filtered_results = [movie for movie in search_results if movie.get('vote_count', 0) >= min_vote_count and movie.get('vote_average', 0) >= min_vote_average]

        return {"results": filtered_results}
    except requests.RequestException as e:
        print(f"TMDB 영화 검색 API 오류: {e}")
        raise HTTPException(status_code=500, detail="영화 검색 중 오류가 발생했습니다.")

@app.get("/api/movie-details/{movie_id}")
async def get_movie_details(movie_id: int):
    url = f"https://api.themoviedb.org/3/movie/{movie_id}?api_key={tmdb_api_key}&language=ko-KR&append_to_response=credits,watch/providers"
    try:
        response = requests.get(url)
        response.raise_for_status() # 오류 발생 시 예외 처리
        details = response.json()
        return details
    except requests.RequestException as e:
        print(f"TMDB 상세 정보 API 오류: {e}")
        raise HTTPException(status_code=500, detail="영화 상세 정보를 가져오는 중 오류가 발생했습니다.")

@app.get("/")
def read_root():
    return {"Hello": "World"}
