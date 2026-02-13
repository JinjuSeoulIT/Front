# Front (HIS Frontend Draft)

병원 외래/진료 업무를 위한 프론트엔드 초안 프로젝트입니다.  
환자 도메인 중심으로 시작된 화면을 유지하면서, DBML 기반으로 나머지 도메인(공통/조직/진료/오더/처방/수납/보험) 초안 페이지를 확장했습니다.

---

## 기술 스택

- Next.js (App Router)
- TypeScript
- MUI (Material UI)
- Redux Toolkit + redux-saga
- axios

---

## 프로젝트 목적

- 백엔드/DB 연동 전, 도메인별 화면 구조를 먼저 검증
- 역할 기반 병원 업무 흐름을 공통 레이아웃(상단 Navbar + 좌측 Sidebar)에서 확인
- DBML에 맞는 화면/테이블/섹션 초안을 빠르게 공유

---

## 이번 반영 핵심

### 1) 공통 레이아웃 통합
- `src/app/layout.tsx`에서 앱 전체를 공통 `MainLayout`으로 감싸도록 변경
- 모든 페이지에서 Sidebar/Navbar를 공유하도록 정리
- 중첩 렌더링 방지를 위해 `MainLayout` nested-safe 처리

### 2) Sidebar 메뉴 로딩 상태 개선
- 메뉴 API 호출 중: `메뉴를 호출합니다.`
- 호출 실패/빈 데이터: `메뉴를 호출하는데 실패했습니다.`
- **주의:** `menuApi` 주소/설정값은 변경하지 않음

### 3) 상단 공통 액션 정리
- 공통 Navbar에서 `환자 등록` 버튼 제거  
  (환자 전용 기능은 환자 도메인 내부에서 처리)

### 4) DBML 기반 초안 페이지 추가 (mock 데이터)
환자 외 주요 영역 페이지 추가:

- `/admin/common` : 공통 코드/메뉴/채번
- `/staff/organization` : 사용자/조직/의료진
- `/reception/care-flow` : 예약/접수/진료 흐름
- `/reception/billing` : 청구/수납/결제
- `/doctor/clinical-records` : 문진/활력/진단/진료기록
- `/doctor/orders-results` : 오더/결과
- `/doctor/prescriptions` : 처방/조제
- `/insurances/management` : 보험/보험이력

### 5) 정리
- `/admin/common/external-apis` 페이지는 제거됨

---

## 실행 방법

```bash
yarn install
yarn dev
