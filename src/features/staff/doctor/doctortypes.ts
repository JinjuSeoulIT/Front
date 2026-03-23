// ✅ 의사 응답
export type DoctorResponse = {
  staffId: string;
  deptId?: string;
  name?: string;
  status : string;
 
  licenseNo: string;
  doctorType: string | null;
  specialtyId: string;
  doctorFileUrl: string | null;
  extNo: string;
  profileSummary: string;
  education: string;
  careerDetail: string;
};


export type DoctorStaffIdParam = {
  staffId: string;
};






//생성
export type DoctorIdNumber = {
  staffId: string;
};

// ✅ 의사 생성/수정은 의사 상세 테이블 컬럼만 전송
export type DoctorCreateRequest = {
  staffId: string;
  licenseNo: string;
  specialtyId: string;
  doctorType?: string | null;
  doctorFileUrl: string | null;
  extNo: string;
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
  extNo: "",
  profileSummary: "",
  education: "",
  careerDetail: "",
};
//생성



///수정
export type DoctorUpdateRequest = {
  staffId: string;
  licenseNo: string;
  specialtyId: string;
  doctorFileUrl: string | null;
  extNo: string;
  profileSummary: string;
  education: string;
  careerDetail: string;
};

export const initialDoctorUpdateForm: DoctorUpdateRequest = {
  staffId: "",
  licenseNo: "",
  specialtyId: "",
  doctorFileUrl: "",
  extNo: "",
  profileSummary: "",
  education: "",
  careerDetail: "",
};

export type DoctorUpdateNumber = {
  staffId: string;
  doctorReq: DoctorUpdateRequest;
};
///수정







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



//컴포넌트 타입
export type Props = { params: Promise<{ id: string }> };



//검색 타입
export type DoctorSearchType = "all" | "name" | "specialty" | "staffId" | "dept" | "extNo";

export type SearchDoctorPayload = {
  search: string;
  searchType: DoctorSearchType;
  // onSearch: (search: string, searchType: DoctorSearchType) => void;  //부모에게 넘겨주는형식
};


