"use client";
import { createSlice, PayloadAction, CaseReducer } from "@reduxjs/toolkit";
/* ==============================
 * Types
 * ============================== */
export interface MedicalStaff {
  id: number;
  username?: string;
  status?: string; // legacy
  statusCode?: string;
  domainRole?: string;
  fullName?: string;
  officeLocation?: string;
  bio?: string;
  phone?: string;
  deptId?: number | null;
  positionId?: number | null;

  // denormalized (backend list join)
  departmentName?: string;
  positionName?: string;

  // presigned image url
  photoUrl?: string;
}
export type MedicalStaffInput = Omit<
  MedicalStaff,
  "id" | "departmentName" | "positionName" | "profileImageUrl"
> & {
  profileImageFile?: File | null;
  staffId?: string;
  name?: string;
  gender?: string;
  birthDate?: string;
  hireDate?: string;
  departmentId?: number | null;
  positionId?: number | null;
};
export interface SearchCondition {
  condition: "name" | "department" | "position" | "staff_type" | "staff_id";
  value: string;
}
export type ApiResponse<T> = {
  success: boolean;
  message: string;
  result?: T;
};
interface MedicalStaffState {
  items: MedicalStaff[];
  apiresponse: ApiResponse<MedicalStaff[] | MedicalStaff | void>;
  loading: boolean;
  error: string | undefined;
  detail: MedicalStaff | null;
  detailLoading: boolean;
  detailError?: string;
  imageUploadUrl?: string;
  imageUploading: boolean;
  imageUploadError?: string;
  lastAction?: "create" | "update" | "delete";
  lastActionStatus?: "success" | "error";
  lastActionMessage?: string;
}
const initialState: MedicalStaffState = {
  items: [],
  apiresponse: { success: false, message: "", result: undefined },
  loading: false,
  error: undefined,
  detail: null,
  detailLoading: false,
  detailError: undefined,
  imageUploadUrl: undefined,
  imageUploading: false,
  imageUploadError: undefined,
  lastAction: undefined,
  lastActionStatus: undefined,
  lastActionMessage: undefined,
};
/* ==============================
 * Reducers
 * ============================== */
const fetchMedicalStaffRequestReducer: CaseReducer<MedicalStaffState> = (state) => {
  state.loading = true;
  state.error = undefined;
};
const fetchMedicalStaffSuccessReducer: CaseReducer<
  MedicalStaffState,
  PayloadAction<MedicalStaff[]>
> = (state, action) => {
  state.loading = false;
  state.items = action.payload;
};
const fetchMedicalStaffFailureReducer: CaseReducer<
  MedicalStaffState,
  PayloadAction<string>
> = (state, action) => {
  state.loading = false;
  state.error = action.payload;
};
const fetchMedicalStaffDetailRequestReducer: CaseReducer<
  MedicalStaffState,
  PayloadAction<number>
> = (state) => {
  state.detailLoading = true;
  state.detailError = undefined;
};
const fetchMedicalStaffDetailSuccessReducer: CaseReducer<
  MedicalStaffState,
  PayloadAction<MedicalStaff>
> = (state, action) => {
  state.detailLoading = false;
  state.detail = action.payload;
};
const fetchMedicalStaffDetailFailureReducer: CaseReducer<
  MedicalStaffState,
  PayloadAction<string>
> = (state, action) => {
  state.detailLoading = false;
  state.detailError = action.payload;
};
const createMedicalStaffRequestReducer: CaseReducer<
  MedicalStaffState,
  PayloadAction<FormData>
> = (state) => {
  state.loading = true;
  state.error = undefined;
};
const createMedicalStaffSuccessReducer: CaseReducer<
  MedicalStaffState,
  PayloadAction<MedicalStaff>
> = (state, action) => {
  state.loading = false;
  state.items.push(action.payload);
  state.lastAction = "create";
  state.lastActionStatus = "success";
  state.lastActionMessage = "의료진이 등록되었습니다.";
};
const createMedicalStaffFailureReducer: CaseReducer<
  MedicalStaffState,
  PayloadAction<string>
> = (state, action) => {
  state.loading = false;
  state.error = action.payload;
  state.lastAction = "create";
  state.lastActionStatus = "error";
  state.lastActionMessage = action.payload || "등록에 실패했습니다.";
};
const updateMedicalStaffRequestReducer: CaseReducer<
  MedicalStaffState,
  PayloadAction<{ id: number; formData: FormData }>
> = (state) => {
  state.loading = true;
  state.error = undefined;
};
const updateMedicalStaffSuccessReducer: CaseReducer<MedicalStaffState> = (state) => {
  state.loading = false;
  state.lastAction = "update";
  state.lastActionStatus = "success";
  state.lastActionMessage = "의료진 정보가 수정되었습니다.";
};
const updateMedicalStaffFailureReducer: CaseReducer<
  MedicalStaffState,
  PayloadAction<string>
> = (state, action) => {
  state.loading = false;
  state.error = action.payload;
  state.lastAction = "update";
  state.lastActionStatus = "error";
  state.lastActionMessage = action.payload || "수정에 실패했습니다.";
};
const deleteMedicalStaffRequestReducer: CaseReducer<
  MedicalStaffState,
  PayloadAction<number>
> = (state) => {
  state.loading = true;
  state.error = undefined;
};
const deleteMedicalStaffSuccessReducer: CaseReducer<
  MedicalStaffState,
  PayloadAction<number>
> = (state, action) => {
  state.loading = false;
  state.items = state.items.filter((item) => item.id !== action.payload);
  state.lastAction = "delete";
  state.lastActionStatus = "success";
  state.lastActionMessage = "의료진이 삭제되었습니다.";
};
const deleteMedicalStaffFailureReducer: CaseReducer<
  MedicalStaffState,
  PayloadAction<string>
> = (state, action) => {
  state.loading = false;
  state.error = action.payload;
  state.lastAction = "delete";
  state.lastActionStatus = "error";
  state.lastActionMessage = action.payload || "삭제에 실패했습니다.";
};
const clearMedicalStaffStatusReducer: CaseReducer<MedicalStaffState> = (state) => {
  state.lastAction = undefined;
  state.lastActionStatus = undefined;
  state.lastActionMessage = undefined;
};
const fetchMedicalStaffByConditionRequestReducer: CaseReducer<
  MedicalStaffState,
  PayloadAction<SearchCondition>
> = (state) => {
  state.loading = true;
  state.error = undefined;
};
const fetchMedicalStaffByConditionSuccessReducer: CaseReducer<
  MedicalStaffState,
  PayloadAction<MedicalStaff[]>
> = (state, action) => {
  state.loading = false;
  state.items = action.payload;
};
const fetchMedicalStaffByConditionFailureReducer: CaseReducer<
  MedicalStaffState,
  PayloadAction<string>
> = (state, action) => {
  state.loading = false;
  state.error = action.payload;
};
const medicalStaffSlice = createSlice({
  name: "medicalStaff",
  initialState,
  reducers: {
    fetchMedicalStaffRequest: fetchMedicalStaffRequestReducer,
    fetchMedicalStaffSuccess: fetchMedicalStaffSuccessReducer,
    fetchMedicalStaffFailure: fetchMedicalStaffFailureReducer,
    fetchMedicalStaffDetailRequest: fetchMedicalStaffDetailRequestReducer,
    fetchMedicalStaffDetailSuccess: fetchMedicalStaffDetailSuccessReducer,
    fetchMedicalStaffDetailFailure: fetchMedicalStaffDetailFailureReducer,
    createMedicalStaffRequest: createMedicalStaffRequestReducer,
    createMedicalStaffSuccess: createMedicalStaffSuccessReducer,
    createMedicalStaffFailure: createMedicalStaffFailureReducer,
    updateMedicalStaffRequest: updateMedicalStaffRequestReducer,
    updateMedicalStaffSuccess: updateMedicalStaffSuccessReducer,
    updateMedicalStaffFailure: updateMedicalStaffFailureReducer,
    deleteMedicalStaffRequest: deleteMedicalStaffRequestReducer,
    deleteMedicalStaffSuccess: deleteMedicalStaffSuccessReducer,
    deleteMedicalStaffFailure: deleteMedicalStaffFailureReducer,
    fetchMedicalStaffByConditionRequest: fetchMedicalStaffByConditionRequestReducer,
    fetchMedicalStaffByConditionSuccess: fetchMedicalStaffByConditionSuccessReducer,
    fetchMedicalStaffByConditionFailure: fetchMedicalStaffByConditionFailureReducer,
    clearMedicalStaffStatus: clearMedicalStaffStatusReducer,
  },
});
export const {
  fetchMedicalStaffRequest,
  fetchMedicalStaffSuccess,
  fetchMedicalStaffFailure,
  fetchMedicalStaffDetailRequest,
  fetchMedicalStaffDetailSuccess,
  fetchMedicalStaffDetailFailure,
  createMedicalStaffRequest,
  createMedicalStaffSuccess,
  createMedicalStaffFailure,
  updateMedicalStaffRequest,
  updateMedicalStaffSuccess,
  updateMedicalStaffFailure,
  deleteMedicalStaffRequest,
  deleteMedicalStaffSuccess,
  deleteMedicalStaffFailure,
  fetchMedicalStaffByConditionRequest,
  fetchMedicalStaffByConditionSuccess,
  fetchMedicalStaffByConditionFailure,
  clearMedicalStaffStatus,
} = medicalStaffSlice.actions;
export default medicalStaffSlice.reducer;
