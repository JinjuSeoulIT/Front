import axios from "axios";
import type { ApiResponse } from "@/features/patients/patientTypes";
import type { TestExecution } from "@/features/medical_support/testexecution/testexecutionType";

const api = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_NURSING_API_BASE_URL ?? "http://192.168.1.66:8181",
});

export const fetchTestExecutionsApi = async (): Promise<TestExecution[]> => {
  const res = await api.get<ApiResponse<TestExecution[]>>("/api/testExecution");

  if (!res.data.success) {
    throw new Error(res.data.message || "검사수행 목록 조회에 실패했습니다.");
  }

  return res.data.result;
};