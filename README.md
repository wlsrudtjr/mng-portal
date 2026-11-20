# 프로젝트 컨텍스트: 순수 HTML/JS 기반 모듈형 관리 웹 시스템

우리는 빌드 도구 없는 순수 HTML/CSS/JS 기반의 관리자 웹페이지를 GitHub Pages와 Firebase Firestore로 운영 중입니다.

## 1. 프로젝트 아키텍처 및 원칙
- **환경**: No-Build, Vanilla JS, CSS3, HTML5 (GitHub Pages 호스팅)
- **DB/백엔드**: Firebase Firestore Compat CDN 연동 (`window.db` 전역 객체 사용)
- **인증 상태**: `sessionStorage.getItem('loginUser')` (구조: `{ userId, name }`)
- **모듈화 방식 (`window.AppPages` 패턴)**:
  - 각 화면은 `pages/파일명.js`로 분리되어 있음.
  - 파일 규격:
    ```javascript
    if (!window.AppPages) window.AppPages = {};
    window.AppPages['페이지키'] = {
      render: function() { return `HTML문자열`; },
      init: async function() { /* 이벤트 바인딩 및 window.db 호출 */ }
    };
    ```
  - `index.html`에서 `<script src="pages/파일명.js">`로 로드하고, 메뉴 클릭 시 `loadPage('페이지키', this)`로 우측 본문에 동적 렌더링.

## 2. 현재 구현된 화면 및 DB 구조
- `index.html`: 레이아웃, 로그인/회원가입, 세션 체크, 라우팅 함수(`loadPage`)
- `pages/dashboard.js`: 통계 요약 (가입자 수, 승인대기 수, 공지 수)
- `pages/user-approval.js`: Firestore `users` 컬렉션 기반 승인/반려 처리
- `pages/notice-manage.js`: Firestore `notices` 컬렉션 기반 공지 등록/목록/삭제
- **Firestore 컬렉션**:
  - `users`: `{ userId, password, name, status('PENDING'|'APPROVED'|'REJECTED'), createdAt }` (문서 ID = userId)
  - `notices`: `{ title, content, author, date, createdAt }`

---

## 3. 이번 작업 요청사항
[여기에 원하는 작업 내용을 적으세요. 예: "공지사항 목록에서 제목을 클릭하면 본문 내용을 볼 수 있는 상세 모달 기능을 notice-manage.js에 추가해줘" 또는 "사용자 목록을 조회하고 권한을 변경할 수 있는 pages/user-role.js를 새로 만들어줘"]
