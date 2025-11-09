# 외부 접속 설정 가이드

## 🌐 문제 상황

현재 서버는 같은 네트워크(Wi-Fi)에 연결된 기기에서만 접속 가능합니다.  
멀리 떨어져 있는 프론트엔드 개발자도 접속할 수 있게 하려면 외부 접속이 필요합니다.

---

## ✅ 해결 방법: ngrok 사용 (추천)

**ngrok**은 로컬 서버를 인터넷에 공개하는 터널링 서비스입니다.

### 장점
- ✅ 빠른 설정 (5분 이내)
- ✅ HTTPS 자동 지원
- ✅ 무료 플랜 제공
- ✅ 별도 서버 불필요

### 단점
- ⚠️ 무료 플랜은 URL이 매번 변경됨
- ⚠️ 유료 플랜은 고정 URL 제공

---

## 🚀 ngrok 설정 방법

### 1단계: ngrok 설치

**Mac (Homebrew 사용):**
```bash
brew install ngrok
```

**또는 직접 다운로드:**
1. https://ngrok.com/download 방문
2. Mac용 다운로드
3. 압축 해제 후 실행 파일을 PATH에 추가

### 2단계: ngrok 계정 생성 (무료)

1. https://ngrok.com/signup 방문
2. 무료 계정 생성
3. 대시보드에서 **authtoken** 복사

### 3단계: ngrok 인증

터미널에서:
```bash
ngrok config add-authtoken YOUR_AUTH_TOKEN
```

### 4단계: 서버 실행

**터미널 1 - 백엔드 서버:**
```bash
cd /Users/dongchankim/Documents/DEV/secure-sbu-backend
node server.js
```

**터미널 2 - ngrok 터널:**
```bash
ngrok http 3001
```

### 5단계: 공개 URL 확인

ngrok이 다음과 같은 정보를 표시합니다:

```
Forwarding    https://abc123.ngrok.io -> http://localhost:3001
```

이제 **`https://abc123.ngrok.io`**가 공개 URL입니다!

---

## 📝 프론트엔드에서 사용

프론트엔드 개발자에게 ngrok URL을 공유하세요:

```javascript
// 프론트엔드 Base URL
const BASE_URL = 'https://abc123.ngrok.io';
```

**예시:**
```javascript
fetch('https://abc123.ngrok.io/api/reports')
  .then(response => response.json())
  .then(data => console.log(data));
```

---

## 🔧 ngrok 고급 설정

### 고정 URL 사용 (유료 플랜)

유료 플랜을 사용하면 고정 URL을 사용할 수 있습니다:

```bash
ngrok http 3001 --domain=your-fixed-domain.ngrok.io
```

### 기본 인증 추가 (보안 강화)

```bash
ngrok http 3001 --basic-auth="username:password"
```

### 특정 IP만 허용

ngrok 대시보드에서 IP 제한 설정 가능

---

## 🛠️ 대안 방법들

### 방법 2: 클라우드 배포

**Heroku (무료 플랜 있음):**
```bash
# Heroku CLI 설치 후
heroku create your-app-name
git push heroku main
```

**Railway:**
- https://railway.app
- GitHub 연동으로 자동 배포

**Render:**
- https://render.com
- 무료 플랜 제공

### 방법 3: AWS/Google Cloud/Azure

- 더 복잡하지만 프로덕션 환경에 적합
- 무료 티어 제공

### 방법 4: VPN 사용

- 회사 VPN에 연결
- 보안은 좋지만 설정 복잡

---

## ⚠️ 주의사항

### 보안
- ngrok 무료 플랜은 URL이 공개되어 누구나 접속 가능
- 프로덕션 데이터는 사용하지 마세요
- 개발/테스트 용도로만 사용

### 성능
- ngrok 무료 플랜은 속도 제한이 있을 수 있음
- 동시 연결 수 제한

### URL 변경
- ngrok 무료 플랜은 서버 재시작 시 URL이 변경됨
- 매번 새 URL을 공유해야 함

---

## 🎯 추천 방법

**개발 단계:**
- ✅ ngrok 사용 (가장 빠르고 간단)

**프로덕션:**
- ✅ 클라우드 배포 (Heroku, Railway, Render 등)

---

## 📚 참고 자료

- ngrok 공식 문서: https://ngrok.com/docs
- ngrok 대시보드: https://dashboard.ngrok.com

