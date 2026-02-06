"use client";

import { createSlice, PayloadAction, CaseReducer } from "@reduxjs/toolkit";

export interface Employee {
  id: number;
  employeeId: string;
  name: string;
  emailLocal?: string;
  emailDomain?: string;
  email?: string;
  department?: string;
  gender?: string;
  birthDate?: string;
  phonePrefix?: string;
  phoneMiddle?: string;
  phoneLast?: string;
  phone?: string;
  zipCode?: string;
  address1?: string;
  address2?: string;
  position?: string;
  profileImageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}



// 사용자 입력을 받기위해, id , 생성일, 수정일을 제외한 하나의 데이터 타입을 만듦.
export type EmployeeInput = Omit<Employee, "id" | "createdAt" | "updatedAt">;

// 직원 검색 조건을 위한 인터페이스
export interface SearchCondition {
  condition: keyof Employee; // 검색할 필드 (예: 'name', 'employeeId')
  value: string; // 검색할 값
}

export type ApiResponse<T> =
{
  success : boolean,
  message : string, // 백엔드에서부터 전달받은 오류 메시지
  result? : T
}

interface EmployeesState {
  items: Employee[]
  apiresponse:  ApiResponse<Employee[]> | ApiResponse<Employee> | ApiResponse<void>
  loading: boolean,
  error: string | undefined; // UI를 부를때 생기는 오류 메시지
  imageUploadUrl?: string;
  imageUploading: boolean;
  imageUploadError?: string;
}

const initialState: EmployeesState = {
  items: [],
  apiresponse:  {success : false,  message : "",  result : undefined,},
  loading: false,
  error: undefined,
  imageUploadUrl: undefined,
  imageUploading: false,
  imageUploadError: undefined,
};

/* ==============================
      Reducers (타입 명시)
============================== */

// 직원 목록 요청 CaseReducer
// Action.type(case)에 대한 reducer을 의미하기 때문에
// CaseReducer라는 말이 붙었음.
const fetchEmployeesRequestReducer: CaseReducer<EmployeesState> = (state) => {
  console.log("2. REDUCER: 전체 목록 조회 요청.");
  state.loading = true;
  state.error = undefined;
};

// 직원 목록 요청 Reducer
// 아래는 Reducer로 처리했을 때 사용하는 기법. 같은 효과임.
// 얘는 무조건 return 해야함.
// 원래 상태들을 ...state로 좍 나열하고
// loading, error를 새로 정의하니까 덮어써지는 것.
// const fetchEmployeesRequestReducer: Reducer<EmployeesState> = (state) => {
//   return {
//     ...state,
//     loading: true,
//     error: undefined,
//   };
// };

// 직원 목록 성공
const fetchEmployeesSuccessReducer: CaseReducer<EmployeesState, PayloadAction<Employee[]>> = (state, action) => {
  console.log("5. REDUCER: 전체 목록 조회 성공.",action);
  state.loading = false;
  state.items = action.payload;
  
};

// 직원 목록 실패
const fetchEmployeesFailureReducer: CaseReducer<
  EmployeesState,
  PayloadAction<string>
> = (state, action) => {
  console.log("5. REDUCER: 전체 목록 조회 실패.",action);
  state.loading = false;
  state.error = action.payload;
};

const fetchEmployeeRequestReducer: CaseReducer<
  EmployeesState,
  PayloadAction<number>
> = (state) => {
  console.log("2. REDUCER: 1명 상세 조회 요청.");

  state.loading = true;
  state.error = undefined;
};


const fetchEmployeeSuccessReducer: CaseReducer<EmployeesState, PayloadAction<Employee>> = (state, action) => {
  console.log("5. REDUCER: 1명 상세 조회 성공.",action);
  
  state.loading = false;
  state.items = [action.payload];
  
};

// 직원 목록 실패
const fetchEmployeeFailureReducer: CaseReducer<
  EmployeesState,
  PayloadAction<string>
> = (state, action) => {
  console.log("5. REDUCER: 1명 상세 조회 실패.",action);

  state.loading = false;
  state.error = action.payload;
};

// 직원 생성 요청
const createEmployeeRequestReducer: CaseReducer<
  EmployeesState,
  PayloadAction<FormData>
> = (state) => {
  console.log("2. REDUCER: 1명 생성 요청.");

  state.loading = true;
  state.error = undefined;
};

// 직원 생성 성공
const createEmployeeSuccessReducer: CaseReducer<
  EmployeesState,
  PayloadAction<Employee>
> = (state, action) => {
  console.log("5. REDUCER: 1명 생성 성공.",action);

  state.loading = false;
  state.items.push(action.payload);
};

// 직원 생성 실패
const createEmployeeFailureReducer: CaseReducer<
  EmployeesState,
  PayloadAction<string>
> = (state, action) => {
  console.log("5. REDUCER: 1명 생성 실패.",action);

  state.loading = false;
  state.error = action.payload;
};

// 직원 수정 요청
const updateEmployeeRequestReducer: CaseReducer<
  EmployeesState,
  PayloadAction<{ id: number; data: EmployeeInput }>
> = (state) => {
  console.log("2. REDUCER: 1명 수정 요청.");

  state.loading = true;
  state.error = undefined;
};

// 직원 수정 성공
const updateEmployeeSuccessReducer: CaseReducer<
  EmployeesState,
  PayloadAction<Employee>
> = (state, action) => {
  console.log("5. REDUCER: 1명 수정 성공.",action);

  state.loading = false;
  state.items = state.items.map((emp) =>
    emp.id === action.payload.id ? action.payload : emp
  );
};

// 직원 수정 실패
const updateEmployeeFailureReducer: CaseReducer<
  EmployeesState,
  PayloadAction<string>
> = (state, action) => {
  console.log("5. REDUCER: 1명 수정 실패.",action);

  state.loading = false;
  state.error = action.payload;
};

// 직원 삭제 요청
const deleteEmployeeRequestReducer: CaseReducer<
  EmployeesState,
  PayloadAction<number>
> = (state) => {
  console.log("2. REDUCER: 1명 삭제 요청.");

  state.loading = true;
  state.error = undefined;
};

// 직원 삭제 성공
const deleteEmployeeSuccessReducer: CaseReducer<
  EmployeesState,
  PayloadAction<number>
> = (state, action) => {
  console.log("5. REDUCER: 1명 삭제 성공.");

  state.loading = false;
  state.items = state.items.filter((emp) => emp.id !== action.payload);
};

// 직원 삭제 실패
const deleteEmployeeFailureReducer: CaseReducer<
  EmployeesState,
  PayloadAction<string>
> = (state, action) => {
  console.log("5. REDUCER: 1명 삭제 실패.");

  state.loading = false;
  state.error = action.payload;
};

// 프로필 이미지 업로드
const uploadEmployeeImageRequestReducer: CaseReducer<
  EmployeesState,
  PayloadAction<File>
> = (state) => {
  state.imageUploading = true;
  state.imageUploadError = undefined;
  state.imageUploadUrl = undefined;
};

const uploadEmployeeImageSuccessReducer: CaseReducer<
  EmployeesState,
  PayloadAction<string>
> = (state, action) => {
  state.imageUploading = false;
  state.imageUploadUrl = action.payload;
};

const uploadEmployeeImageFailureReducer: CaseReducer<
  EmployeesState,
  PayloadAction<string>
> = (state, action) => {
  state.imageUploading = false;
  state.imageUploadError = action.payload;
};

const resetEmployeeImageUploadReducer: CaseReducer<EmployeesState> = (state) => {
  state.imageUploading = false;
  state.imageUploadUrl = undefined;
  state.imageUploadError = undefined;
};

/* ==============================
      조건부 직원 목록 조회 Reducers
============================== */

// 조건부 직원 목록 요청
const fetchEmployeesByConditionRequestReducer: CaseReducer<
  EmployeesState,
  PayloadAction<SearchCondition> // 검색 조건과 값을 payload로 받음
> = (state) => {
    console.log("2. REDUCER: 부분 목록 조회 요청.");
  state.loading = true;
  state.error = undefined;
};

// 조건부 직원 목록 성공
const fetchEmployeesByConditionSuccessReducer: CaseReducer<
  EmployeesState,
  PayloadAction<Employee[]>
> = (state, action) => {
  console.log("5. REDUCER: 부분 목록 조회 성공.");
  state.loading = false;
  state.items = action.payload;
};

// 조건부 직원 목록 실패
const fetchEmployeesByConditionFailureReducer: CaseReducer<
  EmployeesState,
  PayloadAction<string>
> = (state, action) => {
  console.log("5. REDUCER: 부분 목록 조회 실패.");
  state.loading = false;
  state.error = action.payload;
};

const employeesSlice = createSlice({
  name: "employees",
  initialState,
  reducers: {
    fetchEmployeesRequest: fetchEmployeesRequestReducer,
    fetchEmployeesSuccess: fetchEmployeesSuccessReducer,
    fetchEmployeesFailure: fetchEmployeesFailureReducer,

    fetchEmployeeRequest: fetchEmployeeRequestReducer,
    fetchEmployeeSuccess: fetchEmployeeSuccessReducer,
    fetchEmployeeFailure: fetchEmployeeFailureReducer,

    createEmployeeRequest: createEmployeeRequestReducer,
    createEmployeeSuccess: createEmployeeSuccessReducer,
    createEmployeeFailure: createEmployeeFailureReducer,

    updateEmployeeRequest: updateEmployeeRequestReducer,
    updateEmployeeSuccess: updateEmployeeSuccessReducer,
    updateEmployeeFailure: updateEmployeeFailureReducer,

    deleteEmployeeRequest: deleteEmployeeRequestReducer,
    deleteEmployeeSuccess: deleteEmployeeSuccessReducer,
    deleteEmployeeFailure: deleteEmployeeFailureReducer,

    uploadEmployeeImageRequest: uploadEmployeeImageRequestReducer,
    uploadEmployeeImageSuccess: uploadEmployeeImageSuccessReducer,
    uploadEmployeeImageFailure: uploadEmployeeImageFailureReducer,
    resetEmployeeImageUpload: resetEmployeeImageUploadReducer,

    fetchEmployeesByConditionRequest: fetchEmployeesByConditionRequestReducer,
    fetchEmployeesByConditionSuccess: fetchEmployeesByConditionSuccessReducer,
    fetchEmployeesByConditionFailure: fetchEmployeesByConditionFailureReducer,
  },
});

export const {
  fetchEmployeesRequest,
  fetchEmployeesSuccess,
  fetchEmployeesFailure,

  fetchEmployeeRequest,
  fetchEmployeeSuccess,
  fetchEmployeeFailure,

  createEmployeeRequest,
  createEmployeeSuccess,
  createEmployeeFailure,

  updateEmployeeRequest,
  updateEmployeeSuccess,
  updateEmployeeFailure,

  deleteEmployeeRequest,
  deleteEmployeeSuccess,
  deleteEmployeeFailure,
  
  uploadEmployeeImageRequest,
  uploadEmployeeImageSuccess,
  uploadEmployeeImageFailure,
  resetEmployeeImageUpload,
  
  fetchEmployeesByConditionRequest,
  fetchEmployeesByConditionSuccess,
  fetchEmployeesByConditionFailure,
} = employeesSlice.actions;

export default employeesSlice.reducer; // 이게 밖에서는 employeesReducer
