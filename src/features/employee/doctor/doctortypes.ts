// ✅ 의사 응답
export type DoctorResponse = {
  staffId: string;
  deptId?: string;
  name?: string;
  licenseNo: string;
  doctorType: string | null;
  specialtyId: string;
  doctorFileUrl: string | null;
  profileSummary: string;
  education: string;
  careerDetail: string;
};

export type DoctorIdNumber = {
  staffId: string;
};

export type DoctorStaffIdParam = {
  staffId: string;
};

// ✅ 의사 생성/수정은 의사 상세 테이블 컬럼만 전송
export type DoctorCreateRequest = {
  staffId: string;
  licenseNo: string;
  specialtyId: string;
  doctorType?: string | null;
  doctorFileUrl: string | null;
  profileSummary: string;
  education: string;
  careerDetail: string;
};

export const initialDoctorCreateForm: DoctorCreateRequest = {
  staffId: "",
  licenseNo: "",
  specialtyId: "",
  doctorType: "DOCTOR",
  doctorFileUrl: "",
  profileSummary: "",
  education: "",
  careerDetail: "",
};

export type DoctorUpdateRequest = {
  staffId: string;
  licenseNo: string;
  specialtyId: string;
  doctorFileUrl: string | null;
  profileSummary: string;
  education: string;
  careerDetail: string;
};

export const initialDoctorUpdateForm: DoctorUpdateRequest = {
  staffId: "",
  licenseNo: "",
  specialtyId: "",
  doctorFileUrl: "",
  profileSummary: "",
  education: "",
  careerDetail: "",
};

export type DoctorUpdateNumber = {
  staffId: string;
  doctorReq: DoctorUpdateRequest;
};

export type DoctorFile = {
  staffId: string;
  file: File;
};

export type FileUploadResDTO = {
  fileUrl: string;
  objectKey: string;
  contentType: string;
  size: number;
  originalName: string;
};

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};
