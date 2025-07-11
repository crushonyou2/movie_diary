# Python 3.11 기반의 공식 이미지 사용
FROM python:3.11-slim-buster

# 작업 디렉토리 설정
WORKDIR /app

# requirements.txt 복사 및 의존성 설치
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 애플리케이션 코드 복사
COPY . .



# Uvicorn을 사용하여 애플리케이션 실행
# 0.0.0.0:8080으로 바인딩하여 Cloud Run의 기본 포트(8080)을 사용하도록 합니다.
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]