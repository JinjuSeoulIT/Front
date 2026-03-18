export type Props = { params: Promise<{ id: string }> };

//컴포넌트 이동
export type PropsOpen = {
  open: boolean;
  staffId: string | null;
  onClose: () => void;
};


export type staffResponse = {
  staffId: string;
  deptId: string;
  name: string;
  phone: string;
  email: string;
  birthDate: string;
  genderCode: string;
  zipCode: string;
  address1: string;
  address2: string;
  status: string;

  
  doctorType : string;
  nurseType  : string;
};

export type staffCreateRequest = {
  staffId: string;
  deptId: string;
  name: string;
  phone: string;
  email: string;
  birthDate: string;
  genderCode: string;
  zipCode: string;
  address1: string;
  address2: string;
  status: string;
};






export const initialstaffCreateForm: staffCreateRequest = {
  staffId: "",
  deptId: "",
  name: "",
  phone: "",
  email: "",
  birthDate: "",
  genderCode: "",
  zipCode: "",
  address1: "",
  address2: "",
  status: "ACTIVE",
};





export type staffIdNumber = {
  staffId: string;
};



export type staffUpdateRequest = {
  deptId: string;
  name: string;
  phone: string;
  email: string;
  birthDate: string;
  genderCode: string;
  zipCode: string;
  address1: string;
  address2: string;
  status: string;
};



export const initialstaffUpdateForm: staffUpdateRequest = {
  deptId: "",
  name: "",
  phone: "",
  email: "",
  birthDate: "",
  genderCode: "",
  zipCode: "",
  address1: "",
  address2: "",
  status: "ACTIVE",
};

export type staffIdnNumber = {
  staffId: string;
  staffReq: staffUpdateRequest;
};




export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};


//서치바 검색
export type staffSearchType = "all" | "name" | "staffId" | "dept" | "doctorType"| "nurseType";

export type SearchStaffPayload = {
  search: string;
  searchType: staffSearchType;
};