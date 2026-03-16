// ✅ 간호사 응답(서버 → 프론트)
export type NurseResponse = {
  staffId: string;
  deptId?: string;
  name?: string;

  licenseNo: string;
  nurseType: string;
  shiftType: string;

  nurseFileUrl: string | null;
  education: string;
  careerDetail: string;
};




export type NurseIdNumber = {
  staffId: string;
};
export type NurseCreateRequest = {
  staffId: string;
  licenseNo: string;
  nurseType?: string | null;
  shiftType: string;

  nurseFileUrl: string | null;
  education: string;
  careerDetail: string;
};

export const initialNurseCreateForm: NurseCreateRequest = {
  staffId: "",
  licenseNo: "",
  nurseType: "NURSE",
  shiftType: "",
  nurseFileUrl: "",
  education: "",
  careerDetail: "",
};





export type NurseUpdateNumber = {
  staffId: string;
  nurseReq: NurseUpdateRequest;
};

export type NurseUpdateRequest = {
  staffId: string;
  licenseNo: string;
  shiftType: string;
  nurseFileUrl: string | null;
  education: string;
  careerDetail: string;
};

export const initialNurseUpdateForm: NurseUpdateRequest = {
  staffId: "",
  licenseNo: "",
  shiftType: "",
  nurseFileUrl: "",
  education: "",
  careerDetail: "",
};









export type NurseFile = {
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
