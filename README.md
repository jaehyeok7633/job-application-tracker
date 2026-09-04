# Job Application Tracker

취업 지원 현황을 기록하고 관리하기 위해 만든 개인 프로젝트입니다.  
처음에는 HTML, CSS, JavaScript 화면과 메모리 배열로 시작하여, 점진적으로 **Node.js, Express, MySQL**을 연결해 프론트엔드부터 데이터베이스까지 이어지는 구조로 직접 구현해봤습니다.

---

## 1. 프로젝트 목적

* **웹 서비스 데이터 흐름 직접 구현 및 이해**  
  기존 SW 솔루션 기술지원 업무를 하면서 접했던 웹 서비스 구조를 직접 구현해보기 위해, 브라우저 화면에서 입력한 데이터가 백엔드 API를 거쳐 MySQL 데이터베이스에 저장되고 다시 불려오는 과정을 만들어봤습니다.
* **서비스 구조 이해를 통한 문제 원인 파악**  
  서비스 운영, QA, SW 기술지원 업무에서 마주칠 수 있는 이슈들이 화면(UI), 네트워크(API), 서버 로직, DB 데이터 중 어느 단계에서 발생하는지 그 구조를 더 명확히 이해하는 데 중점을 두었습니다.

---

## 2. 주요 기능

* **지원 내역 CRUD (등록 / 조회 / 수정 / 삭제)**
  * **등록**: 회사명, 지원 직무, 공고 URL, 지원일, 진행 상태, 메모를 입력받아 DB에 저장
  * **조회**: DB에 저장된 전체 지원 내역을 지원일 기준 최신순으로 테이블에 출력
  * **수정**: 기존 등록 데이터를 입력 폼으로 불러와 수정 및 반영
  * **삭제**: 삭제 확인 절차를 거친 후 DB에서 해당 레코드 영구 삭제
* **실시간 검색 기능**
  * 검색창 입력 시 회사명 또는 지원 직무에 검색어가 포함된 항목만 실시간 필터링
* **진행 상태별 필터링**
  * 드롭다운을 통해 전체 / 지원예정 / 지원완료 / 서류합격 / 면접 / 불합격 / 최종합격 상태별로 분류 조회
  * 검색 조건과 상태 필터 조건의 동시 적용(AND 조건) 지원
* **실시간 항목 카운트 표시**
  * 전체 등록 건수 및 필터링 결과에 따른 항목 개수 실시간 갱신
* **데이터 영속성 보장**
  * MySQL 데이터베이스에 데이터가 저장되므로 브라우저 새로고침이나 서버 재시작 후에도 데이터 유지

---

## 3. 기술 스택

| 구분 | 기술 / 라이브러리 | 사용 목적 |
|---|---|---|
| **Frontend** | HTML5, CSS3, JavaScript (Vanilla ES6+) | 시맨틱 웹 마크업, 반응형 대시보드 UI, DOM 제어 및 이벤트 처리 |
| | Fetch API | 백엔드 REST API와의 비동기 HTTP 통신 |
| **Backend** | Node.js | 서버 런타임 환경 |
| | Express | HTTP 웹 서버 및 RESTful API 라우팅 구현 |
| **Database** | MySQL 8.0 | 관계형 데이터베이스 (지원 내역 데이터 저장 및 영속화) |
| | mysql2 | Promise 기반의 비동기 MySQL 커넥션 풀 관리 |
| **Environment & Tools** | dotenv | DB 접속 정보 및 포트 등 환경변수 분리 관리 |
| | cors | 클라이언트-서버 간 교차 출처 리소스 공유 허용 |
| | Git & GitHub | 소스코드 형상 관리 및 버전 제어 |

---

## 4. 시스템 동작 구조

```
[ 브라우저 (사용자 인터페이스) ]
              │
              ▼ (이벤트 발생: 등록/수정/삭제/조회)
[ app.js (클라이언트 컨트롤러) ]
              │
              ▼ fetch('/api/applications', { method: GET | POST | PUT | DELETE })
[ server.js (Node.js & Express REST API) ]
              │
              ▼ SQL 쿼리 매핑 및 실행 (SELECT / INSERT / UPDATE / DELETE)
[ db.js (mysql2 커넥션 풀) ]
              │
              ▼ TCP 연결 (Port 3306)
[ MySQL Database (job_tracker.job_applications) ]
```

---

## 5. REST API 명세

| Method | Endpoint | 설명 | 요청 본문 (Request Body) | 응답 코드 |
|---|---|---|---|---|
| **GET** | `/api/applications` | 전체 지원 내역 목록 조회 | 없음 | `200 OK` |
| **POST** | `/api/applications` | 신규 지원 내역 등록 | JSON (`company`, `position`, `job_url`, `applied_date`, `status`, `memo`) | `201 Created` |
| **PUT** | `/api/applications/:id` | 기존 지원 내역 수정 | JSON (`company`, `position`, `job_url`, `applied_date`, `status`, `memo`) | `200 OK` / `404 Not Found` |
| **DELETE** | `/api/applications/:id` | 지원 내역 삭제 | 없음 | `200 OK` / `404 Not Found` |

---

## 6. 프로젝트 디렉터리 구조

```
job-application-tracker/
├── .env.example          # 환경변수 설정 템플릿 (보안 정보 제외)
├── .gitignore             # Git 추적 제외 설정 (node_modules, .env)
├── app.js                 # 프론트엔드 비동기 통신 및 UI/필터 렌더링 로직
├── db.js                  # MySQL 커넥션 풀(mysql2/promise) 모듈
├── index.html             # 메인 화면 구조 (입력 폼, 검색/필터 툴바, 테이블)
├── package.json           # 프로젝트 메타데이터 및 백엔드 의존성 목록
├── README.md              # 프로젝트 문서
├── schema.sql             # MySQL 데이터베이스 및 테이블 생성 스크립트
├── server.js              # Express 웹 서버 및 REST API 엔드포인트 정의
└── style.css              # 대시보드 및 상태 뱃지, 반응형 그리드 스타일링
```

---

## 7. 데이터베이스 및 환경변수 설정

### 1) MySQL 스키마 생성
MySQL Workbench 또는 MySQL CLI에 접속하여 프로젝트 루트의 `schema.sql` 스크립트를 실행합니다.

```sql
-- 데이터베이스 생성
CREATE DATABASE IF NOT EXISTS job_tracker
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE job_tracker;

-- 테이블 생성
CREATE TABLE IF NOT EXISTS job_applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company VARCHAR(100) NOT NULL,
  position VARCHAR(100) NOT NULL,
  job_url VARCHAR(500) NULL,
  applied_date DATE NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT '지원완료',
  memo TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 2) 환경변수 파일(`.env`) 설정
저장소에 포함된 `.env.example` 파일을 복사하여 `.env` 파일을 생성하고, 본인 로컬 MySQL 환경에 맞게 값을 설정합니다.

```env
# .env.example 기준 예시
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_actual_mysql_password
DB_NAME=job_tracker
```
> **참고**: `.env` 파일은 데이터베이스 비밀번호 등 민감 정보를 포함하므로 `.gitignore`를 통해 Git 추적에서 제외되어 있습니다.

---

## 8. 설치 및 실행 방법

### 1) 의존성 패키지 설치
터미널에서 프로젝트 디렉터리로 이동 후 필요한 npm 패키지를 설치합니다:
```bash
npm install
```

### 2) 서버 실행
```bash
npm start
```
정상 실행 시 터미널에 아래 메시지가 출력됩니다:
```
Job Application Tracker 서버가 http://localhost:3000 에서 실행 중입니다.
```

### 3) 서비스 접속
웹 브라우저를 열고 다음 주소로 접속합니다:
```
http://localhost:3000
```

---

## 9. 구현 과정에서의 주요 학습 내용

* **REST API와 CRUD 구현**  
  HTTP Method(`GET`, `POST`, `PUT`, `DELETE`)를 활용해 데이터 등록, 조회, 수정, 삭제 API를 직접 구현해봤습니다. 요청이 정상 처리되었을 때와 필수 값이 누락되었을 때 각각 상황에 맞는 HTTP 상태 코드(`200`, `201`, `400`, `404`, `500`)를 반환하도록 작성했습니다.
* **Fetch API를 통한 프론트엔드/백엔드 통신**  
  브라우저 새로고침 없이 `fetch`와 `async/await`로 백엔드와 데이터를 주고받고, 서버 응답 결과에 따라 테이블 화면을 다시 렌더링하는 비동기 흐름을 이해하는 데 중점을 두었습니다.
* **MySQL 데이터베이스 연동과 커넥션 풀 사용**  
  `mysql2/promise`의 커넥션 풀(Connection Pool)을 사용해 Node.js 서버와 MySQL을 연결해봤습니다. 또한 `dateStrings: true` 옵션을 설정하여 날짜 데이터를 다룰 때 타임존 차이로 생기는 오차를 방지할 수 있음을 확인했습니다.
* **환경변수를 이용한 민감 정보 분리**  
  DB 접속 계정과 비밀번호 같은 중요한 정보를 코드에 직접 작성하지 않고 `.env` 파일로 분리해 관리해봤습니다. `.gitignore`에 등록하여 GitHub 저장소에 민감 정보가 올라가지 않도록 설정했습니다.
* **Git/GitHub를 통한 버전 관리**  
  로컬 Git 저장소를 초기화하고 프로젝트 파일을 커밋한 뒤, GitHub 원격 저장소를 연결하여 Push하는 과정을 실습했습니다. 또한 `.gitignore`를 통해 환경변수와 의존성 폴더를 버전 관리 대상에서 제외했습니다.
