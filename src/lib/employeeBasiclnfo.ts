import axios from "axios";
import type {
  ApiResponse,
  staffCreateRequest,
  staffResponse,
  staffUpdateRequest,
} from "@/features/employee/Staff/BasiclnfoType";

const STAFF_API_BASE_URL = process.env.NEXT_PUBLIC_PATIENTS_API_BASE_URL ?? "http://192.168.1.58:8022";

const staffApi = axios.create({
  baseURL: STAFF_API_BASE_URL,
});

export const StafflistApi = async (): Promise<ApiResponse<staffResponse[]>> => {
  const response = await staffApi.get<ApiResponse<staffResponse[]>>("/api/staff/list");
  return response.data;
};

export const DetailStaffApi = async (staffId: string): Promise<ApiResponse<staffResponse>> => {
  const response = await staffApi.get<ApiResponse<staffResponse>>(`/api/staff/detail/${staffId}`);
  return response.data;
};

export const createStaffApi = async (
  staffReq: staffCreateRequest
): Promise<ApiResponse<staffResponse>> => {
  const response = await staffApi.post<ApiResponse<staffResponse>>("/api/staff/create", staffReq);
  return response.data;
};

export const updateStaffApi = async (
  staffId: string,
  staffReq: staffUpdateRequest
): Promise<ApiResponse<staffResponse>> => {
  const response = await staffApi.put<ApiResponse<staffResponse>>(`/api/staff/update/${staffId}`, staffReq);
  return response.data;
};



export const deleteStaffApi = async (staffId: string): Promise<ApiResponse<void>> => {
  const response = await staffApi.delete<ApiResponse<void>>(`/api/staff/delete/${staffId}`);
  return response.data;
};
