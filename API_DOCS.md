# API 문서

## 기본 정보

- **Base URL (로컬)**: `http://localhost:3001`
- **Base URL (네트워크)**: `http://<로컬-IP주소>:3001` (같은 네트워크의 다른 기기에서 접속)
- **Content-Type**: `application/json`
- **CORS**: 활성화됨 (모든 origin 허용)

### 로컬 IP 주소 찾기

다른 컴퓨터에서 접속하려면 백엔드 서버가 실행 중인 컴퓨터의 로컬 IP 주소가 필요합니다.

**방법 1: 스크립트 사용 (추천)**
```bash
npm run ip
```
또는
```bash
node get_local_ip.js
```

**방법 2: 수동 확인 (Mac)**
1. 시스템 설정 > Wi-Fi 또는 네트워크
2. 현재 연결된 Wi-Fi 옆의 "세부사항..." 클릭
3. "IP 주소" 항목 확인 (예: `192.168.1.15`)

**방법 3: 터미널 명령어**
```bash
# Mac/Linux
ifconfig | grep "inet " | grep -v 127.0.0.1

# 또는
ipconfig getifaddr en0
```

### 네트워크 접속 설정

서버는 이미 `0.0.0.0`으로 설정되어 있어 같은 네트워크의 다른 기기에서 접속 가능합니다.

프론트엔드에서 사용할 Base URL:
- **같은 컴퓨터**: `http://localhost:3001`
- **다른 컴퓨터**: `http://<로컬-IP주소>:3001` (예: `http://192.168.1.15:3001`)

---

## API 엔드포인트

### 1. 리포트 목록 조회

**GET** `/api/reports`

현재 사용자의 리포트 목록을 조회합니다.

#### 쿼리 파라미터

| 파라미터 | 타입 | 필수 | 기본값 | 설명 |
|---------|------|------|-------|------|
| `page` | number | ❌ | 1 | 페이지 번호 |
| `limit` | number | ❌ | 10 | 한 페이지당 항목 수 |
| `status` | string | ❌ | - | 상태 필터 (`Pending Review`, `In Progress`, `Resolved`) |
| `search` | string | ❌ | - | 검색어 (ticket_id, issue_type, title에서 검색) |

#### 예시 요청

```javascript
// 기본 조회 (10개)
fetch('http://localhost:3001/api/reports')

// 페이지네이션
fetch('http://localhost:3001/api/reports?page=1&limit=4')

// 상태 필터
fetch('http://localhost:3001/api/reports?status=Resolved')

// 검색
fetch('http://localhost:3001/api/reports?search=SBU-84391')

// 조합
fetch('http://localhost:3001/api/reports?status=In Progress&search=door&page=1&limit=5')
```

#### 응답 형식

**성공 (200 OK)**

```json
{
  "reports": [
    {
      "ticket_id": "SBU-84391",
      "issue_type": "Suspicious Individual",
      "created_at": "2023-10-26T18:00:00.000Z",
      "status": "Resolved"
    },
    {
      "ticket_id": "SBU-84390",
      "issue_type": "Unsecured Access Point",
      "created_at": "2023-10-25T22:30:00.000Z",
      "status": "In Progress"
    }
  ],
  "pagination": {
    "totalResults": 8,
    "totalPages": 2,
    "currentPage": 1
  }
}
```

**에러 (500 Internal Server Error)**

```json
{
  "error": "Server error",
  "details": "Error message here"
}
```

---

### 2. 새 리포트 제출

**POST** `/api/reports`

새로운 보안 리포트를 제출합니다.

#### 요청 본문 (JSON)

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `issue_type` | string | ✅ | 리포트 유형 (`Suspicious Individual`, `Unsecured Access Point`, `Lost ID Badge`, `IT Security Concern`) |
| `title` | string | ✅ | 리포트 제목 |
| `description` | string | ✅ | 리포트 상세 설명 |

#### 예시 요청

```javascript
fetch('http://localhost:3001/api/reports', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    issue_type: 'Suspicious Individual',
    title: 'Suspicious person near library entrance',
    description: 'Observed an individual acting suspiciously near the main library entrance around 2 PM.'
  })
})
```

#### 응답 형식

**성공 (201 Created)**

```json
{
  "message": "Report submitted successfully",
  "report": {
    "ticket_id": "SBU-84393",
    "issue_type": "Suspicious Individual",
    "title": "Suspicious person near library entrance",
    "description": "Observed an individual acting suspiciously near the main library entrance around 2 PM.",
    "status": "Pending Review",
    "created_at": "2023-10-27 14:30:00"
  }
}
```

**에러 (400 Bad Request)**

```json
{
  "error": "Missing required fields",
  "message": "issue_type, title, and description are required"
}
```

또는

```json
{
  "error": "Invalid issue_type",
  "message": "issue_type must be one of: Suspicious Individual, Unsecured Access Point, Lost ID Badge, IT Security Concern"
}
```

**에러 (500 Internal Server Error)**

```json
{
  "error": "Server error",
  "details": "Error message here"
}
```

---

## 프론트엔드 연동 예시

### React 예시

```javascript
// API 호출 함수
const fetchReports = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const url = `http://localhost:3001/api/reports${queryString ? `?${queryString}` : ''}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching reports:', error);
    throw error;
  }
};

// 사용 예시
const ReportsList = () => {
  const [reports, setReports] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReports = async () => {
      try {
        const data = await fetchReports({ page: 1, limit: 10 });
        setReports(data.reports);
        setPagination(data.pagination);
      } catch (error) {
        console.error('Failed to load reports:', error);
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Reports ({pagination?.totalResults || 0})</h2>
      {reports.map(report => (
        <div key={report.ticket_id}>
          <h3>{report.ticket_id}</h3>
          <p>Type: {report.issue_type}</p>
          <p>Status: {report.status}</p>
          <p>Created: {new Date(report.created_at).toLocaleDateString()}</p>
        </div>
      ))}
    </div>
  );
};
```

### Axios 예시

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 리포트 목록 조회
export const getReports = async (params = {}) => {
  try {
    const response = await api.get('/api/reports', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching reports:', error);
    throw error;
  }
};

// 새 리포트 제출
export const submitReport = async (reportData) => {
  try {
    const response = await api.post('/api/reports', reportData);
    return response.data;
  } catch (error) {
    console.error('Error submitting report:', error);
    throw error;
  }
};

// 사용 예시
const loadReports = async () => {
  try {
    const data = await getReports({ 
      page: 1, 
      limit: 10, 
      status: 'Resolved' 
    });
    console.log('Reports:', data.reports);
    console.log('Pagination:', data.pagination);
  } catch (error) {
    console.error('Failed to load reports:', error);
  }
};

// 리포트 제출 예시
const submitNewReport = async () => {
  try {
    const result = await submitReport({
      issue_type: 'Suspicious Individual',
      title: 'Suspicious person near library entrance',
      description: 'Observed an individual acting suspiciously...'
    });
    console.log('Report submitted:', result.report);
    console.log('Ticket ID:', result.report.ticket_id);
  } catch (error) {
    console.error('Failed to submit report:', error);
  }
};
```

### React 컴포넌트 예시 (제출 폼)

```javascript
import { useState } from 'react';

const ReportSubmitForm = () => {
  const [formData, setFormData] = useState({
    issue_type: '',
    title: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('http://localhost:3001/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`✅ 리포트가 제출되었습니다! Ticket ID: ${data.report.ticket_id}`);
        setFormData({ issue_type: '', title: '', description: '' });
      } else {
        setMessage(`❌ 오류: ${data.message || data.error}`);
      }
    } catch (error) {
      setMessage(`❌ 네트워크 오류: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Issue Type:</label>
        <select
          value={formData.issue_type}
          onChange={(e) => setFormData({ ...formData, issue_type: e.target.value })}
          required
        >
          <option value="">선택하세요</option>
          <option value="Suspicious Individual">Suspicious Individual</option>
          <option value="Unsecured Access Point">Unsecured Access Point</option>
          <option value="Lost ID Badge">Lost ID Badge</option>
          <option value="IT Security Concern">IT Security Concern</option>
        </select>
      </div>

      <div>
        <label>Title:</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>

      <div>
        <label>Description:</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? '제출 중...' : '제출'}
      </button>

      {message && <p>{message}</p>}
    </form>
  );
};
```

---

## 주의사항

1. **인증**: 현재는 임시로 `user_id = 1`로 고정되어 있습니다. 실제 인증 구현 시 수정이 필요합니다.

2. **CORS**: 개발 환경에서는 모든 origin을 허용하지만, 프로덕션에서는 특정 도메인만 허용하도록 설정해야 합니다.

3. **에러 처리**: 모든 API 호출에 적절한 에러 처리를 추가하세요.

4. **서버 실행**: API를 사용하기 전에 백엔드 서버가 실행 중인지 확인하세요:
   ```bash
   node server.js
   ```

