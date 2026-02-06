"use client";
import { createSlice, PayloadAction, CaseReducer } from "@reduxjs/toolkit";
export interface Department {
  id: number;
  name: string;
  buildingNo?: string;
  floorNo?: string;
  roomNo?: string;
  headMedicalStaffId?: number | null;
  extension?: string;
  status?: string;
  staffCount?: number;
}
export type DepartmentInput = Omit<Department, "id">;

export interface SearchCondition {
  condition: "name" | "buildingNo" | "floorNo" | "roomNo" | "extension";
  value: string;
}
export type ApiResponse<T> = {
  success: boolean;
  message: string;
  result?: T;
};
interface DepartmentState {
  items: Department[];
  apiresponse: ApiResponse<Department[] | Department | void>;
  loading: boolean;
  error?: string;
  lastAction?: "create" | "update" | "delete";
  lastActionStatus?: "success" | "error";
  lastActionMessage?: string;
}
const initialState: DepartmentState = {
  items: [],
  apiresponse: { success: false, message: "", result: undefined },
  loading: false,
  error: undefined,
  lastAction: undefined,
  lastActionStatus: undefined,
  lastActionMessage: undefined,
};
const fetchDepartmentsRequestReducer: CaseReducer<DepartmentState> = (state) => {
  state.loading = true;
  state.error = undefined;
};
const fetchDepartmentsSuccessReducer: CaseReducer<
  DepartmentState,
  PayloadAction<Department[]>
> = (state, action) => {
  state.loading = false;
  state.items = action.payload;
};
const fetchDepartmentsFailureReducer: CaseReducer<
  DepartmentState,
  PayloadAction<string>
> = (state, action) => {
  state.loading = false;
  state.error = action.payload;
};

const fetchDepartmentsByConditionRequestReducer: CaseReducer<
  DepartmentState,
  PayloadAction<SearchCondition>
> = (state) => {
  state.loading = true;
  state.error = undefined;
};

const fetchDepartmentsByConditionSuccessReducer: CaseReducer<
  DepartmentState,
  PayloadAction<Department[]>
> = (state, action) => {
  state.loading = false;
  state.items = action.payload;
};

const fetchDepartmentsByConditionFailureReducer: CaseReducer<
  DepartmentState,
  PayloadAction<string>
> = (state, action) => {
  state.loading = false;
  state.error = action.payload;
};
const createDepartmentRequestReducer: CaseReducer<
  DepartmentState,
  PayloadAction<DepartmentInput>
> = (state) => {
  state.loading = true;
  state.error = undefined;
};
const createDepartmentSuccessReducer: CaseReducer<
  DepartmentState,
  PayloadAction<Department>
> = (state, action) => {
  state.loading = false;
  state.items.push(action.payload);
  state.lastAction = "create";
  state.lastActionStatus = "success";
  state.lastActionMessage = "부서가 등록되었습니다.";
};
const createDepartmentFailureReducer: CaseReducer<
  DepartmentState,
  PayloadAction<string>
> = (state, action) => {
  state.loading = false;
  state.error = action.payload;
  state.lastAction = "create";
  state.lastActionStatus = "error";
  state.lastActionMessage = action.payload || "부서 등록에 실패했습니다.";
};
const updateDepartmentRequestReducer: CaseReducer<
  DepartmentState,
  PayloadAction<{ id: number; data: DepartmentInput }>
> = (state) => {
  state.loading = true;
  state.error = undefined;
};
const updateDepartmentSuccessReducer: CaseReducer<
  DepartmentState,
  PayloadAction<Department>
> = (state, action) => {
  state.loading = false;
  state.items = state.items.map((item) =>
    item.id === action.payload.id ? action.payload : item
  );
  state.lastAction = "update";
  state.lastActionStatus = "success";
  state.lastActionMessage = "부서 정보가 수정되었습니다.";
};
const updateDepartmentFailureReducer: CaseReducer<
  DepartmentState,
  PayloadAction<string>
> = (state, action) => {
  state.loading = false;
  state.error = action.payload;
  state.lastAction = "update";
  state.lastActionStatus = "error";
  state.lastActionMessage = action.payload || "부서 수정에 실패했습니다.";
};
const deleteDepartmentRequestReducer: CaseReducer<
  DepartmentState,
  PayloadAction<number>
> = (state) => {
  state.loading = true;
  state.error = undefined;
};
const deleteDepartmentSuccessReducer: CaseReducer<
  DepartmentState,
  PayloadAction<number>
> = (state, action) => {
  state.loading = false;
  state.items = state.items.filter((item) => item.id !== action.payload);
  state.lastAction = "delete";
  state.lastActionStatus = "success";
  state.lastActionMessage = "부서가 삭제되었습니다.";
};
const deleteDepartmentFailureReducer: CaseReducer<
  DepartmentState,
  PayloadAction<string>
> = (state, action) => {
  state.loading = false;
  state.error = action.payload;
  state.lastAction = "delete";
  state.lastActionStatus = "error";
  state.lastActionMessage = action.payload || "부서 삭제에 실패했습니다.";
};
const clearDepartmentStatusReducer: CaseReducer<DepartmentState> = (state) => {
  state.lastAction = undefined;
  state.lastActionStatus = undefined;
  state.lastActionMessage = undefined;
};
const departmentSlice = createSlice({
  name: "department",
  initialState,
  reducers: {
    fetchDepartmentsRequest: fetchDepartmentsRequestReducer,
    fetchDepartmentsSuccess: fetchDepartmentsSuccessReducer,
    fetchDepartmentsFailure: fetchDepartmentsFailureReducer,
    fetchDepartmentsByConditionRequest: fetchDepartmentsByConditionRequestReducer,
    fetchDepartmentsByConditionSuccess: fetchDepartmentsByConditionSuccessReducer,
    fetchDepartmentsByConditionFailure: fetchDepartmentsByConditionFailureReducer,
    createDepartmentRequest: createDepartmentRequestReducer,
    createDepartmentSuccess: createDepartmentSuccessReducer,
    createDepartmentFailure: createDepartmentFailureReducer,
    updateDepartmentRequest: updateDepartmentRequestReducer,
    updateDepartmentSuccess: updateDepartmentSuccessReducer,
    updateDepartmentFailure: updateDepartmentFailureReducer,
    deleteDepartmentRequest: deleteDepartmentRequestReducer,
    deleteDepartmentSuccess: deleteDepartmentSuccessReducer,
    deleteDepartmentFailure: deleteDepartmentFailureReducer,
    clearDepartmentStatus: clearDepartmentStatusReducer,
  },
});
export const {
  fetchDepartmentsRequest,
  fetchDepartmentsSuccess,
  fetchDepartmentsFailure,
  fetchDepartmentsByConditionRequest,
  fetchDepartmentsByConditionSuccess,
  fetchDepartmentsByConditionFailure,
  createDepartmentRequest,
  createDepartmentSuccess,
  createDepartmentFailure,
  updateDepartmentRequest,
  updateDepartmentSuccess,
  updateDepartmentFailure,
  deleteDepartmentRequest,
  deleteDepartmentSuccess,
  deleteDepartmentFailure,
  clearDepartmentStatus,
} = departmentSlice.actions;
export default departmentSlice.reducer;
