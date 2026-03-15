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
