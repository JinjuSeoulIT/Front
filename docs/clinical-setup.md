# 진료(Clinical) 모듈 프로젝트 준비 문서

진료 기능을 개발·운영할 때 준비할 문서·환경·데이터를 정리한 문서입니다.

---

## 1. 실행 환경

| 구분 | 내용 |
|------|------|
| **백엔드** | `hospital-clinical` (Spring Boot, 기본 포트 **8090**) |
| **프론트** | Next.js (예: `npm run dev` → 포트 3001 등) |
| **진료 API Base URL** | 프론트 환경변수 `NEXT_PUBLIC_CLINICAL_API_BASE_URL` (미설정 시 `http://192.168.1.70:8090`) |

로컬에서 백엔드는 H2 메모리 DB, `SERVER_PORT=8090`(또는 `application.yml` 설정)으로 실행합니다.

---

## 2. API 엔드포인트 정리

Base: `{CLINICAL_API_BASE}/api/clinicals`

| 메서드 | 경로 | 용도 |
|--------|------|------|
| POST | `/api/clinicals` | 진료 생성 (환자 기준) |
| GET | `/api/clinicals` | 진료 목록 (선택: `?receptionId=`) |
| GET | `/api/clinicals/{clinicalId}` | 진료 단건 조회 |
| PATCH | `/api/clinicals/{clinicalId}/status` | 진료 상태 변경 |
| POST | `/api/clinicals/{clinicalId}/seed-sample` | 해당 진료에 샘플 데이터 일괄 등록 |

| 메서드 | 경로 | 용도 |
|--------|------|------|
| GET | `/{clinicalId}/orders` | 검사/처치 오더 목록 |
| POST | `/{clinicalId}/orders` | 오더 생성 |
| PATCH | `/{clinicalId}/orders/{orderId}/status` | 오더 상태 변경 |

| 메서드 | 경로 | 용도 |
|--------|------|------|
| GET | `/{clinicalId}/vitals` | 활력징후 조회 |
| POST | `/{clinicalId}/vitals` | 활력징후 저장 |
| GET | `/{clinicalId}/assessment` | 문진/사정 조회 |
| POST | `/{clinicalId}/assessment` | 문진/사정 저장 |

| 메서드 | 경로 | 용도 |
|--------|------|------|
| GET | `/{clinicalId}/doctor-note` | 의사 소견 조회 |
| POST | `/{clinicalId}/doctor-note` | 의사 소견 생성 |
| PUT | `/{clinicalId}/doctor-note` | 의사 소견 수정 |
| GET | `/{clinicalId}/diagnoses` | 진단 목록 |
| POST | `/{clinicalId}/diagnoses` | 진단 추가 |
| DELETE | `/{clinicalId}/diagnoses/{diagnosisId}` | 진단 삭제 |
| GET | `/{clinicalId}/prescriptions` | 처방 목록 |
| POST | `/{clinicalId}/prescriptions` | 처방 추가 |
| DELETE | `/{clinicalId}/prescriptions/{prescriptionId}` | 처방 삭제 |

---

## 3. 요청/응답 데이터 구조 (준비 시 참고)

### 3.1 진료 생성

- **POST `/api/clinicals`**
- Body: `ClinicalCreateRequest`
  - `patientId` (Long) — 프론트에서 전달
  - `receptionId` (Long, 선택)
  - `clinicalType` (String, 예: "OUT")
  - `clinicalStatus`, `clinicalAt`, `doctorId` (선택)

백엔드 응답: `ApiResponse<ClinicalResponse>` → `data` 안에 `clinicalId`, `receptionId`, `clinicalType`, `clinicalStatus`, `clinicalAt`, `createdAt` 등.

### 3.2 진료 상태 변경

- **PATCH `/api/clinicals/{clinicalId}/status`**
- Body: `{ "clinicalStatus": "상태값" }`

### 3.3 오더

- **POST `/{clinicalId}/orders`**
  - `orderType`: "BLOOD" | "IMAGING" | "PROCEDURE"
  - `orderCode`, `orderName` (검사명 등)
- **PATCH `/{clinicalId}/orders/{orderId}/status`**
  - `status`: "REQUESTED" | "REQUEST" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" 등

### 3.4 활력징후 (Vitals)

- **POST `/{clinicalId}/vitals`**
  - `temperature`, `pulse`, `bpSystolic`, `bpDiastolic`, `respiratoryRate`, `measuredAt`

### 3.5 문진/사정 (Assessment)

- **POST `/{clinicalId}/assessment`**
  - `chiefComplaint`, `visitReason`, `historyPresentIllness`, `pastHistory`, `familyHistory`, `allergy`, `currentMedication`, `assessedAt`

### 3.6 의사 소견 (Doctor Note)

- **POST/PUT `/{clinicalId}/doctor-note`**
  - `chiefComplaint`, `presentIllness`, `assessment`, `clinicalMemo`, `mainDxCode`, `mainDxName`, (POST 시 `doctorId`)

### 3.7 진단 (Diagnosis)

- **POST `/{clinicalId}/diagnoses`**
  - `dxCode`, `dxName`, `main` (boolean)

### 3.8 처방 (Prescription)

- **POST `/{clinicalId}/prescriptions`**
  - `medicationName`, `dosage`, `days`

---

## 4. 프론트엔드에서 사용하는 라이브러리/API

- **진료 목록/생성**: `Clinical.tsx` 내부 `fetchClinicalApi`, `createClinicalApi` (Base URL: `NEXT_PUBLIC_CLINICAL_API_BASE_URL`)
- **환자 목록**: `@/lib/patientApi` — `fetchPatientsApi`
- **오더**: `@/lib/clinicalOrderApi` — `fetchClinicalOrdersApi`, `createClinicalOrderApi`, `updateClinicalOrderStatusApi`
- **활력/문진**: `@/lib/clinicalVitalsApi` — `fetchVitalsApi`, `saveVitalsApi`, `fetchAssessmentApi`, `saveAssessmentApi`
- **의사소견/진단/처방**: `@/lib/clinicalRecordApi` — `fetchDoctorNoteApi`, `createDoctorNoteApi`, `updateDoctorNoteApi`, `fetchDiagnosesApi`, `addDiagnosisApi`, `removeDiagnosisApi`, `fetchPrescriptionsApi`, `addPrescriptionApi`, `removePrescriptionApi`

프론트는 응답에서 `data` 또는 `result`를 한 번 풀어서 사용합니다. 백엔드는 `ApiResponse<T>`로 `success`, `message`, `data`를 반환합니다.

---

## 4.1 과거력(PHx) · 이번 방 참고 · 과거 진료기록

- **PHx**: 만성·배경 과거력(질병/수술/알러지/상시 복용). 이번 방 SOAP 바이탈·문진과 개념 분리. 화면에서 「구조화 과거력」으로 의사 확정.
- **이번 방문 참고**: 같은 방문 차트 안 한눈용(간호·진료지원 활력·문진 연동 예정). PHx로 자동 이관되지 않음.
- **과거 진료기록**: 종료·확정된 이전 내원 목록. 실시간 바이탈 미러 아님.
- **미리보기**: `NEXT_PUBLIC_CLINICAL_SUPPORT_SYNC=true` 이면 vitals·assessment를 「이번 방 참고」표에 임시 표시.

---

## 5. 준비 시 체크리스트

- [ ] **환경변수**: 프론트에 `NEXT_PUBLIC_CLINICAL_API_BASE_URL` 설정 (또는 기본 8090 서버 주소 확인)
- [ ] **백엔드 실행**: hospital-clinical 서버 기동 (로컬이면 H2, 운영이면 Oracle 등 DB 및 프로필 설정)
- [ ] **CORS**: 백엔드 `ClinicalController` 등에서 프론트 출처(`http://localhost:3001`, `http://127.0.0.1:3001`) 허용 여부 확인
- [ ] **환자 데이터**: 진료 생성 시 사용할 `patientId`가 환자 API에서 조회 가능한지 확인
- [ ] **테스트 데이터**: 필요 시 `POST /api/clinicals/{clinicalId}/seed-sample` 로 샘플 활력/문진/진단/처방/의사소견 일괄 등록

---

## 6. 참고 파일 위치

| 구분 | 경로 |
|------|------|
| 진료 화면 | `frontend/src/components/clinical/Clinical.tsx` |
| 진료 페이지 | `frontend/src/app/clinical/page.tsx` |
| 진료 API (프론트) | `frontend/src/lib/clinicalOrderApi.ts`, `clinicalVitalsApi.ts`, `clinicalRecordApi.ts` |
| 백엔드 컨트롤러 | `hospital-clinical/.../visit/controller/*`, `order/controller/OrderController.java` |
| 백엔드 설정 | `hospital-clinical/src/main/resources/application.yml` |

이 문서만 준비해 두면, 진료 모듈을 처음 맡은 사람도 실행 환경·API·데이터 구조·체크리스트를 한 번에 확인할 수 있습니다.
