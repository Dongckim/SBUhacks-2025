# 기술 스택 (Technology Stack)

## 📋 프로젝트 개요

**프로젝트명**: secure-sbu-backend  
**타입**: RESTful API 백엔드 서버  
**목적**: 보안 리포트 관리 시스템 백엔드

---

## 🛠️ 기술 스택 상세

### **백엔드 런타임 & 프레임워크**

#### 1. **Node.js**
- **버전**: 최신 LTS 버전
- **역할**: JavaScript 런타임 환경
- **사용**: 서버 사이드 애플리케이션 실행

#### 2. **Express.js**
- **버전**: `^5.1.0`
- **역할**: 웹 애플리케이션 프레임워크
- **사용**: RESTful API 엔드포인트 구현
- **주요 기능**:
  - HTTP 요청/응답 처리
  - 미들웨어 지원
  - 라우팅

---

### **데이터베이스**

#### 3. **MySQL**
- **타입**: 관계형 데이터베이스 관리 시스템 (RDBMS)
- **역할**: 데이터 영구 저장
- **데이터베이스명**: `secure_sbu`
- **주요 테이블**:
  - `users`: 사용자 정보
  - `reports`: 보안 리포트 정보

#### 4. **mysql2**
- **버전**: `^3.15.3`
- **역할**: Node.js용 MySQL 클라이언트 라이브러리
- **특징**:
  - Promise 기반 비동기 처리
  - Connection Pool 지원
  - SQL 인젝션 방지 (Prepared Statements)

---

### **미들웨어 & 유틸리티**

#### 5. **CORS (Cross-Origin Resource Sharing)**
- **버전**: `^2.8.5`
- **역할**: 다른 도메인에서의 API 접근 허용
- **사용**: 프론트엔드와의 통신을 위한 CORS 헤더 설정

#### 6. **dotenv**
- **버전**: `^17.2.3`
- **역할**: 환경 변수 관리
- **사용**: 데이터베이스 연결 정보 등 민감한 정보를 `.env` 파일에서 관리
- **보안**: 코드에 하드코딩하지 않고 환경 변수로 분리

---

## 📦 프로젝트 구조

```
secure-sbu-backend/
├── server.js                 # 메인 서버 파일
├── package.json              # 프로젝트 의존성 및 스크립트
├── package-lock.json         # 정확한 의존성 버전 고정
├── .env                      # 환경 변수 (비밀번호 등)
├── seed.js                   # 데이터베이스 시드 스크립트
├── seed_data.sql             # SQL 시드 데이터
├── check_tables.js           # 테이블 구조 확인 스크립트
├── show_db_structure.js      # 데이터베이스 구조 시각화
├── show_db_data.js           # 데이터베이스 데이터 조회
├── get_local_ip.js           # 로컬 IP 주소 확인
├── API_DOCS.md               # API 문서
├── TECH_STACK.md             # 기술 스택 문서 (이 파일)
└── node_modules/             # npm 패키지 설치 폴더
```

---

## 🔧 개발 도구 & 스크립트

### **npm 스크립트**

```json
{
  "start": "node server.js",           // 서버 실행
  "seed": "node seed.js",             // 데이터베이스 시드 데이터 삽입
  "check": "node check_tables.js",     // 테이블 구조 확인
  "ip": "node get_local_ip.js",        // 로컬 IP 주소 확인
  "db-structure": "node show_db_structure.js",  // DB 구조 시각화
  "db-data": "node show_db_data.js"    // DB 데이터 조회
}
```

---

## 🌐 네트워크 & 배포

### **서버 설정**
- **포트**: `3001` (기본값, 환경 변수로 변경 가능)
- **호스트**: `0.0.0.0` (모든 네트워크 인터페이스에서 접근 가능)
- **CORS**: 모든 origin 허용 (개발 환경)

### **데이터베이스 연결**
- **Connection Pool**: 최대 10개 연결
- **비동기 처리**: Promise 기반
- **에러 처리**: 상세한 오류 메시지 제공

---

## 📊 API 아키텍처

### **RESTful API 설계**
- **GET** `/api/reports` - 리포트 목록 조회
- **POST** `/api/reports` - 새 리포트 제출

### **주요 기능**
- 페이지네이션 (Pagination)
- 필터링 (상태, 검색)
- 정렬 (생성일 기준 내림차순)
- 자동 ticket_id 생성

---

## 🔐 보안 기능

1. **SQL 인젝션 방지**
   - Prepared Statements 사용
   - 파라미터 바인딩

2. **환경 변수 분리**
   - `.env` 파일로 민감한 정보 관리
   - 코드에 비밀번호 하드코딩 방지

3. **입력 검증**
   - 필수 필드 검증
   - 데이터 타입 검증
   - 유효성 검사 (issue_type 등)

---

## 📈 데이터베이스 스키마

### **users 테이블**
- `user_id` (PK, AUTO_INCREMENT)
- `username` (UNIQUE)
- `email` (UNIQUE)
- `password_hash`
- `created_at`

### **reports 테이블**
- `report_id` (PK, AUTO_INCREMENT)
- `ticket_id` (UNIQUE)
- `submitted_by_user_id` (FK → users.user_id)
- `issue_type`
- `title`
- `description`
- `location`
- `status` (ENUM: 'Pending Review', 'In Progress', 'Resolved')
- `created_at`
- `updated_at`

---

## 🚀 배포 환경

### **개발 환경**
- **OS**: macOS (darwin)
- **Node.js**: 최신 LTS 버전
- **데이터베이스**: MySQL (로컬)

### **프로덕션 고려사항**
- 환경 변수 관리 강화
- CORS 설정 제한 (특정 도메인만 허용)
- 로깅 시스템 추가
- 에러 모니터링
- HTTPS 적용
- 데이터베이스 백업

---

## 📚 의존성 요약

### **핵심 의존성 (Dependencies)**
```json
{
  "express": "^5.1.0",      // 웹 프레임워크
  "mysql2": "^3.15.3",       // MySQL 클라이언트
  "cors": "^2.8.5",          // CORS 미들웨어
  "dotenv": "^17.2.3"        // 환경 변수 관리
}
```

### **개발 의존성 (DevDependencies)**
- 없음 (현재 프로젝트는 개발 의존성 없음)

---

## 🎯 기술 스택 선택 이유

1. **Node.js + Express**
   - 빠른 개발 속도
   - JavaScript로 풀스택 개발 가능
   - 풍부한 생태계

2. **MySQL**
   - 관계형 데이터 구조에 적합
   - 안정성과 성능
   - 널리 사용되는 기술

3. **mysql2**
   - Promise 기반 비동기 처리
   - Connection Pool 지원
   - 활발한 커뮤니티

4. **dotenv**
   - 보안 강화
   - 환경별 설정 관리 용이

---

## 📝 버전 정보

- **Node.js**: 최신 LTS 버전 권장
- **npm**: Node.js와 함께 설치됨
- **MySQL**: 8.0 이상 권장

---

## 🔗 관련 문서

- [API 문서](./API_DOCS.md)
- [네트워크 문제 해결](./troubleshoot_network.md)

---

**마지막 업데이트**: 2025-11-08

