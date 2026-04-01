// ✅ 의사 응답
export type DoctorResponse = {
  staffId: number;
  deptId?: string;
  positionId? :String;

  name?: string;
  status : string;
 
  licenseNo: string;
  doctorType: string | null;
  specialtyId: number | string;
  doctorFileUrl: string | null;
  extNo: string;
  profileSummary: string;
  education: string;
  careerDetail: string;
};


export type DoctorStaffIdParam = {
  staffId: number;
};






//생성
export type DoctorIdNumber = {
  staffId: number;
};

// ✅ 의사 생성/수정은 의사 상세 테이블 컬럼만 전송
export type DoctorCreateRequest = {
  
  
  staffId: number | string;
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
  specialtyId: number | string;
  doctorType?: string | null;
  doctorFileUrl: string | null;
  extNo: string;
  profileSummary: string;
  education: string;
  careerDetail: string;



}

export const initialDoctorCreateForm: DoctorCreateRequest = {
  
  staffId: 0,
  deptId: "",
  positionId : "",

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
  specialtyId: 0,
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
  staffId: number | string;
  licenseNo: string;
  specialtyId: number | string;
  doctorFileUrl: string | null;
  extNo: string;
  profileSummary: string;
  education: string;
  careerDetail: string;
};

export const initialDoctorUpdateForm: DoctorUpdateRequest = {
  staffId: 0,
  licenseNo: "",
  specialtyId: 0,
  doctorFileUrl: "",
  extNo: "",
  profileSummary: "",
  education: "",
  careerDetail: "",
};

export type DoctorUpdateNumber = {
  staffId: number;
  doctorReq: DoctorUpdateRequest;
};
///수정







export type DoctorFile = {
  staffId: number;
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


