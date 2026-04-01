export type Props = { params: Promise<{ id: string }> };

//컴포넌트 이동
export type PropsOpen = {
  open: boolean;
  staffId: number | string | null;
  onClose: () => void;
};


export type staffResponse = {
  staffId: number | string;
  deptId: string;
  positionId :string;

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
  receptionType : string;
  

};

export type staffCreateRequest = {
  staffId: number | string;
  deptId: string;
  positionId :string;

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
  staffId: 0,
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
};





export type staffIdNumber = {
  staffId: number | string;
};



export type staffUpdateRequest = {
  staffId: number | string;
  deptId: string;
  positionId :String;

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
};

export type staffIdnNumber = {
  staffId: number | string;
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