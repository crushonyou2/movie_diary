# 🎬 Movie Diary (v2.0)

> **"오늘의 감정을 기록하고, 딱 맞는 영화를 처방받으세요."**
> AI 기반 감정 분석 및 영화 추천 다이어리 서비스

![Project Status](https://img.shields.io/badge/Status-Active-success)
![License](https://img.shields.io/badge/License-MIT-blue)

## 🌟 프로젝트 소개

**Movie Diary**는 사용자가 작성한 일기를 Google Gemini AI가 분석하여, 현재 감정 상태에 가장 잘 어울리는 영화를 추천해주는 서비스입니다. 단순한 추천을 넘어, 일기를 기록하고 지난 감정들을 되돌아볼 수 있는 '나만의 영화 처방전'을 제공합니다.

### 🚀 v2.0 주요 업데이트
* **Modern Tech Stack:** Vite + React + Tailwind CSS로 전면 교체하여 압도적인 성능과 디자인 개선
* **AI 고도화:** 최신 Gemini 2.5 Flash 모델 적용으로 더 섬세한 감정 분석 구현
* **스마트 필터링:** OTT(Netflix, Watcha 등) 구독 정보 필터링 및 인지도 기반 품질 필터링 적용
* **사용자 경험 강화:** 내 일기장(History) 기능 추가 (Local Storage 활용)

---

## 🎨 주요 기능

1.  **AI 감정 일기 분석**
일기를 쓰면 AI가 핵심 감정(기쁨, 슬픔, 분노 등)을 분석하고 위로의 메시지를 건넵니다.
2.  **맞춤형 영화 추천 & OTT 필터**
감정에 맞는 영화를 추천하되, 내가 구독 중인 OTT(넷플릭스, 왓챠 등)에 있는 작품만 골라볼 수 있습니다.
3.  **영화 다시 추천받기**
추천된 영화가 마음에 들지 않다면? 버튼 하나로 새로운 영화 세트를 다시 제안받을 수 있습니다.
4.  **내 일기장 (History)**
작성한 일기와 추천받은 영화 기록이 저장되어, 언제든 다시 꺼내볼 수 있습니다.
5.  **영화 상세 정보**
줄거리, 평점, 캐스팅 정보, 그리고 **지금 바로 볼 수 있는 OTT 링크**까지 제공합니다.

---

## 🛠 기술 스택 (Tech Stack)

### Frontend
* **Core:** React 19, Vite
* **Styling:** Tailwind CSS, Framer Motion (Animation)
* **Icons:** Lucide React

### Backend
* **Core:** Python FastAPI
* **AI Model:** Google Gemini 2.5 Flash (Auto-detect)
* **Data Source:** TMDB API (The Movie Database)
* **Deploy:** Google Cloud Run

---

## 💻 설치 및 실행 방법 (Local Setup)

이 프로젝트를 로컬 환경에서 실행하려면 API 키가 필요합니다.

### 1. 환경 변수 설정 (.env)
`backend` 폴더 안에 `.env` 파일을 생성하고 아래 키를 입력하세요.
```env
GEMINI_API_KEY="YOUR_GOOGLE_AI_STUDIO_KEY"
TMDB_API_KEY="YOUR_TMDB_API_KEY"
```

### 2. 백엔드 실행
cd backend
가상환경 생성 및 실행 (권장))
python -m venv venv
Windows: .\venv\Scripts\activate
Mac/Linux: source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload
서버가 [http://127.0.0.1:8000](http://127.0.0.1:8000) 에서 실행됩니다.

### 3. 프론트엔드 실행
cd frontend
npm install
npm run dev
브라우저에서 http://localhost:5173 접속

---

## 🔒 보안 및 배포 정보

* API Key 보안: 모든 API 키는 백엔드 서버(Cloud Run)의 환경 변수로 안전하게 관리되며, 프론트엔드 코드에는 노출되지 않습니다.

* Frontend 배포: GitHub Actions를 통해 GitHub Pages로 자동 배포됩니다.

* Backend 배포: Google Cloud Run을 통해 Serverless 컨테이너로 운영됩니다.

* 배포된 백엔드 주소: https://movie-backend-866560009438.asia-northeast3.run.app

---

### 📝 License
This project is licensed under the MIT License.