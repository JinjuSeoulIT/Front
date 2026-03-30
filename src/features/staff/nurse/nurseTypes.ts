// ✅ 간호사 응답(서버 → 프론트)
export type NurseResponse = {
  staffId: string;
  deptId?: string;
  positionId? :String;
  name?: string;
  status : string;

  licenseNo: string;
  nurseType: string;
  shiftType: string;
  nurseFileUrl: string | null;
  extNo: string;
  education: string;
  careerDetail: string;
};



export type NurseStaffIdParam = {
  staffId: string;
};






//생성
export type NurseIdNumber = {
  staffId: string;
};

export type NurseCreateRequest = {
  staffId: string;
  deptId: string;
  positionId? :String;

  name: string;
  phone: string;
  email: string;
  birthDate: string;
  genderCode: string;
  zipCode: string;
  address1: string;
  address2: string;
  status: string;

  licenseNo: string;
  nurseType?: string | null;
  shiftType: string;
  nurseFileUrl: string | null;
  extNo: string;
  education: string;
  careerDetail: string;
};

export const initialNurseCreateForm: NurseCreateRequest = {
  staffId: "",
  deptId: "",
  positionId :"",
  
  name: "",
  phone: "",
  email: "",
  birthDate: "",
  genderCode: "",
  zipCode: "",
  address1: "",
  address2: "",
  status: "ACTIVE",

  licenseNo: "",
  nurseType: "NURSE",
  shiftType: "",
  nurseFileUrl: "",
  extNo: "",
  education: "",
  careerDetail: "",
};
//생성




///수정
export type NurseUpdateRequest = {
  staffId: string;
  licenseNo: string;
  shiftType: string;
  nurseFileUrl: string | null;
  extNo: string;
  education: string;
  careerDetail: string;
};

export const initialNurseUpdateForm: NurseUpdateRequest = {
  staffId: "",
  licenseNo: "",
  shiftType: "",
  nurseFileUrl: "",
  extNo: "",
  education: "",
  careerDetail: "",
};
export type NurseUpdateNumber = {
  staffId: string;
  nurseReq: NurseUpdateRequest;
};
///수정




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

//컴포넌트 타입
export type Props = { params: Promise<{ id: string }> };


//검색 타입
export type NurseSearchType = "all" | "name" | "staffId" | "dept" | "shiftType" | "extNo";

export type SearchNursePayload = {
  search: string;
  searchType: NurseSearchType;
};
