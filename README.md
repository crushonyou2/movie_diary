# 오늘의 일기, 오늘의 영화

## 프로젝트 소개
'오늘의 일기, 오늘의 영화'는 사용자가 작성한 일기 내용을 분석하여 사용자의 감정을 파악하고, 그 감정에 가장 잘 어울리는 영화를 추천해주는 서비스입니다. 감성적인 연결을 통해 사용자에게 새로운 영화 발견 경험을 제공합니다.

## 주요 기능
- **일기 기반 감정 분석:** 사용자가 작성한 일기 내용을 바탕으로 핵심 감정을 추출합니다.
- **맞춤형 영화 추천:** 분석된 감정에 따라 사용자에게 최적화된 영화 목록을 추천합니다.
- **영화 검색:** 특정 영화 제목으로 영화를 검색하고 상세 정보를 확인할 수 있습니다.
- **영화 상세 정보 모달:** 추천 또는 검색된 영화의 포스터, 줄거리, 개봉일, 평점, 러닝타임, 장르, 감독, 주연 배우 등 상세 정보를 **반응형으로** 모달 형태로 제공합니다.
- **OTT 제공자 정보 표시:** 영화 상세 정보 모달에서 해당 영화를 시청할 수 있는 OTT 서비스(구독, 구매, 대여) 정보를 표시합니다.
- **사용자 피드백 개선:** 사용자 친화적인 오류 메시지 및 검색/추천 결과 없음 피드백을 제공하여 사용성을 높였습니다.
- **성능 최적화:** 이미지 로딩 최적화 및 모달 컴포넌트의 지연 로딩을 통해 초기 로딩 성능을 향상시켰습니다.

## 기술 스택
- **백엔드:**
    - Python
    - FastAPI (웹 프레임워크)
    - Google Generative AI (감정 분석 및 추천 로직)
    - TMDB API (영화 정보 연동)
    - **Python `logging` 모듈 (백엔드 로깅)**
- **프론트엔드:**
    - React (JavaScript 라이브러리)
    - CSS (스타일링)

## 배포된 버전
이 프로젝트의 배포된 버전을 다음 링크에서 직접 확인하실 수 있습니다:
- **프론트엔드 (Netlify):** https://incredible-travesseiro-af4280.netlify.app/
- **백엔드 (Google Cloud Run API):** https://movie-backend-866560009438.asia-northeast3.run.app/

## 로컬 개발 환경 설정

### 1. 프로젝트 클론
먼저, 이 저장소를 로컬 환경으로 클론합니다.
```bash
git clone https://github.com/crushonyou2/movie_diary
cd movie
```

### 2. 백엔드 설정 및 실행

`backend` 디렉토리로 이동합니다.
```bash
cd backend
```

가상 환경을 생성하고 활성화합니다.
```bash
python -m venv venv
# Windows
.\venv\Scripts\activate
# macOS/Linux
source venv/bin/activate
```

필요한 Python 패키지를 설치합니다.
```bash
pip install -r requirements.txt # requirements.txt 파일이 있다면
# 또는 필요한 패키지를 개별적으로 설치 (예: fastapi, uvicorn, python-dotenv, google-generativeai, requests)
pip install fastapi uvicorn python-dotenv google-generativeai requests
```

`.env` 파일을 생성하고 Google Generative AI API 키와 TMDB API 키를 추가합니다.
```
GOOGLE_API_KEY="YOUR_GOOGLE_API_KEY"
TMDB_API_KEY="YOUR_TMDB_API_KEY"
```
`YOUR_GOOGLE_API_KEY`와 `YOUR_TMDB_API_KEY`를 실제 API 키로 교체하세요.

백엔드 서버를 실행합니다.
```bash
uvicorn main:app --reload
```
서버는 기본적으로 `http://localhost:8000`에서 실행됩니다.

### 3. 프론트엔드 설정 및 실행

새로운 터미널을 열고 `frontend` 디렉토리로 이동합니다.
```bash
cd ../frontend
```

Node.js 의존성을 설치합니다.
```bash
npm install
```

프론트엔드 애플리케이션을 실행합니다.
```bash
npm start
```
애플리케이션은 기본적으로 `http://localhost:3000`에서 실행되며, 자동으로 웹 브라우저가 열립니다.

## 사용 방법
1.  프론트엔드 애플리케이션(`http://localhost:3000`)에 접속합니다.
2.  "오늘 하루는 어땠나요? 당신의 이야기를 들려주세요." 텍스트 영역에 일기를 작성합니다.
3.  "영화 추천받기" 버튼을 클릭하면, 작성된 일기를 바탕으로 감정이 분석되고 해당 감정에 맞는 영화 목록이 추천됩니다.
4.  "영화 제목으로 검색..." 입력창에 영화 제목을 입력하고 "검색" 버튼을 클릭하면, 해당 영화를 검색하고 결과를 확인할 수 있습니다.
5.  영화 카드(추천 또는 검색 결과)를 클릭하면 해당 영화의 상세 정보를 모달 창으로 볼 수 있습니다.
