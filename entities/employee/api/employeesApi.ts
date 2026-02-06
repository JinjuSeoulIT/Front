"use client";

import axios, { AxiosResponse } from "axios";
import type {
  ApiResponse,
  Employee,
  EmployeeInput,
  SearchCondition,
} from "../model/employeesSlice";

/* =========================
 * API BASE
 * ========================= */
const EMPLOYEE_API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ??
  "http://localhost:3001/api/jpa/employees";

/* =========================
 * 공통 유틸
 * ========================= */
function handleResponse<T>(res: AxiosResponse<ApiResponse<T>>): ApiResponse<T> {
  console.log("API RESPONSE:", res);

  if (res.data.success) {
    return res.data;
  }

  return {
    message: res.data.message,
    success: false,
  };
}

/* =========================
 * Employee APIs
 * ========================= */

// 전체 조회
export async function fetchEmployeesApi(): Promise<ApiResponse<Employee[]>> {
  const res = await axios.get<ApiResponse<Employee[]>>(EMPLOYEE_API_BASE);
  return handleResponse(res);
}

// 조건 조회
export async function fetchEmployeesByConditionApi(
  data: SearchCondition
): Promise<ApiResponse<Employee | Employee[]>> {
  const { condition, value } = data;
  const url = `${EMPLOYEE_API_BASE}/search`;

  const res = await axios.get<ApiResponse<Employee | Employee[]>>(url, {
    params: { condition, value },
  });

  return handleResponse(res);
}

// 단건 조회
export async function fetchEmployeeApi(
  id: number
): Promise<ApiResponse<Employee>> {
  const res = await axios.get<ApiResponse<Employee>>(
    `${EMPLOYEE_API_BASE}/${id}`
  );
  return handleResponse(res);
}

// 생성
export async function createEmployeeApi(
  formData: FormData
) {
  return axios.post(EMPLOYEE_API_BASE, formData, {
    headers: {
      // "Content-Type": "multipart/form-data",
    },
  });
}

// 수정
export async function updateEmployeeApi(
  id: number,
  data: EmployeeInput
): Promise<ApiResponse<Employee>> {
  const res = await axios.put<ApiResponse<Employee>>(
    `${EMPLOYEE_API_BASE}/${id}`,
    data
  );
  return handleResponse(res);
}

// 삭제
export async function deleteEmployeeApi(
  id: number
): Promise<ApiResponse<null>> {
  const res = await axios.delete<ApiResponse<null>>(
    `${EMPLOYEE_API_BASE}/${id}`
  );
  return handleResponse(res);
}


