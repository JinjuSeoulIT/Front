export type ReceptionResponse = {
  staffId: string;
  deptId?: string;
  name?: string;
  status: string;

  jobTypeCd?: string | null;
  deskNo?: string | null;
  shiftType?: string | null;
  startDate?: string | null;
  windowArea?: string | null;
  multiTask?: string | null;
  rmk?: string | null;
  receptionType?: string | null;
  extNo?: string | null;
};

export type ReceptionIdNumber = {
  staffId: string;
};

export type ReceptionCreateRequest = {
  staffId: string;
  jobTypeCd: string;
  deskNo: string;
  shiftType: string;
  startDate: string;
  windowArea: string;
  multiTask: string;
  rmk: string;
  receptionType: string;
  extNo: string;
};

export const initialReceptionCreateForm: ReceptionCreateRequest = {
  staffId: "",
  jobTypeCd: "",
  deskNo: "",
  shiftType: "",
  startDate: "",
  windowArea: "",
  multiTask: "불가",
  rmk: "",
  receptionType: "RECEPTION",
  extNo: "",
};

export type ReceptionUpdateRequest = {
  staffId: string;
  jobTypeCd: string;
  deskNo: string;
  shiftType: string;
  startDate: string;
  windowArea: string;
  multiTask: string;
  rmk: string;
  receptionType: string;
  extNo: string;
};

export const initialReceptionUpdateForm: ReceptionUpdateRequest = {
  staffId: "",
  jobTypeCd: "",
  deskNo: "",
  shiftType: "",
  startDate: "",
  windowArea: "",
  multiTask: "불가",
  rmk: "",
  receptionType: "RECEPTION",
  extNo: "",
};

export type ReceptionUpdateNumber = {
  staffId: string;
  receptionReq: ReceptionUpdateRequest;
};

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type ReceptionSearchType =
  | "all"
  | "name"
  | "staffId"
  | "dept"
  | "jobTypeCd"
  | "deskNo"
  | "shiftType"
  | "receptionType"
  | "extNo";

export type SearchReceptionPayload = {
  search: string;
  searchType: ReceptionSearchType;
};
