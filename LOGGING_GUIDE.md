# 서버 로그 확인 가이드

## 📋 현재 로그 확인 방법

### 1. 터미널에서 직접 확인 (기본 방법)

서버를 실행하면 터미널에 실시간으로 로그가 출력됩니다:

```bash
node server.js
```

**출력되는 로그:**
- ✅ 서버 시작 메시지
- ✅ DB 연결 성공 메시지
- 📝 SQL 쿼리 (디버깅용)
- ❌ 에러 메시지
- ⚠️ 경고 메시지

### 2. 로그를 파일로 저장하기

터미널 출력을 파일로 저장:

```bash
# 로그를 파일로 저장
node server.js > server.log 2>&1

# 또는 백그라운드로 실행하면서 로그 저장
node server.js > server.log 2>&1 &

# 로그 파일 실시간 확인
tail -f server.log
```

### 3. 로그와 화면 출력 동시에 보기

```bash
# tee 명령어 사용 (Mac/Linux)
node server.js | tee server.log
```

---

## 🔍 현재 로그 종류

### **서버 시작 로그**
```
✅ 서버가 http://localhost:3001 에서 실행 중입니다.
🌐 네트워크 접속: http://<로컬-IP주소>:3001
✅ DB 연결 성공!
```

### **API 요청 로그 (디버깅용)**
```
SQL: SELECT ticket_id, issue_type, created_at, status FROM reports...
Params: [1]
Count SQL: SELECT COUNT(*) as total FROM reports...
Count Params: [1]
```

### **에러 로그**
```
❌ DB 연결 오류 발생!
오류: Access denied for user
원인: .env 파일의 DB_PASSWORD가 틀렸습니다.
```

---

## 📝 로그 파일 위치

현재는 로그 파일이 자동으로 생성되지 않습니다.  
위의 방법으로 수동으로 저장해야 합니다.

---

## 🛠️ 로그 확인 팁

### **실시간 로그 모니터링**
```bash
# 서버 실행 중 다른 터미널에서
tail -f server.log
```

### **특정 에러만 찾기**
```bash
# 에러만 필터링
grep "Error" server.log

# 또는
grep "❌" server.log
```

### **최근 로그만 보기**
```bash
# 마지막 50줄만
tail -50 server.log

# 또는
tail -n 50 server.log
```

---

## 💡 로그 레벨

현재 사용 중인 로그 레벨:
- `console.log()` - 일반 정보
- `console.error()` - 에러
- `console.warn()` - 경고

---

## 🚀 개선 제안

더 나은 로깅을 원한다면:
1. **morgan** - HTTP 요청 로거 추가
2. **winston** - 구조화된 로깅 시스템
3. **파일 로깅** - 자동으로 파일에 저장
4. **로그 레벨** - 개발/프로덕션 환경별 설정

