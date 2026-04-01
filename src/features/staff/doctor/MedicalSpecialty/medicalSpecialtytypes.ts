export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};


// =========================
//SPECIALY_ID
// Medical
// 화면 기준: 컬럼이 많은 과목 등록 마스터
// (백엔드가 specialtyId/name/code 를 내려주는 경우도 있어서 alias 필드를 같이 둠)
// =========================
export type MedicalResponse = {
  medicalId?: number;
  medicalName?: string;
  medicalCode?: string;
  description?: string;
  rmk?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;

  // legacy / backend alias
  specialtyId?: number;
  specialtyName?: string;
  specialtyCode?: string;
  created_at?: string;
  updated_at?: string;
};

export type MedicalCreateRequest = {
  medicalId: number | string;
  medicalName: string;
  medicalCode: string;
  description: string;
  rmk: string;
  status: string;

  // legacy alias for backend compatibility
  specialtyId?: number;
  specialtyName?: string;
  specialtyCode?: string;
};

export type MedicalUpdateRequest = {
  medicalName: string;
  medicalCode: string;
  description: string;
  rmk: string;
  status: string;

  // legacy alias for backend compatibility
  specialtyName?: string;
  specialtyCode?: string;
};

export type MedicalUpdatePayload = {
  medicalId: number;
  medicalReq: MedicalUpdateRequest;
};

export const initialMedicalCreateForm: MedicalCreateRequest = {
  medicalId: 0,
  medicalName: "",
  medicalCode: "",
  description: "",
  rmk: "",
  status: "ACTIVE",
  specialtyId: 0,
  specialtyName: "",
  specialtyCode: "",
};

export const initialMedicalUpdateForm: MedicalUpdateRequest = {
  medicalName: "",
  medicalCode: "",
  description: "",
  rmk: "",
  status: "ACTIVE",
  specialtyName: "",
  specialtyCode: "",
};

// =========================
// Specialty
// 화면 기준: doctor + medical 이 합쳐진 결과 / 배정 정보
// =========================
export type SpecialtyResponse = {
  specialtyAssignId?: string;
  staffId?: number;
  doctorName?: string;
  name?: string;
  doctorType?: string;
  licenseNo?: string;
  extNo?: string;
  specialtyId?: number;
  specialtyName?: string;
  specialtyCode?: string;
  medicalId?: number;
  medicalName?: string;
  medicalCode?: string;
  assignedAt?: string;
  primaryYn?: string;
  description?: string;
  rmk?: string;
  status?: string;
};

export type SpecialtyCreateRequest = {
  staffId: number | string;
  specialtyId: number;
  assignedAt: string;
  primaryYn: string;
  rmk: string;

  // alias for backend compatibility
  medicalId?: number;
};

export type SpecialtyUpdateRequest = {
  assignedAt: string;
  primaryYn: string;
  rmk: string;
};

export type SpecialtyUpdatePayload = {
  specialtyId: number;
  specialtyReq: SpecialtyUpdateRequest;
};

export const initialSpecialtyCreateForm: SpecialtyCreateRequest = {
  staffId: 0,
  specialtyId: 0,
  assignedAt: "",
  primaryYn: "Y",
  rmk: "",
  medicalId: 0,
};

export const initialSpecialtyUpdateForm: SpecialtyUpdateRequest = {
  assignedAt: "",
  primaryYn: "Y",
  rmk: "",
};
