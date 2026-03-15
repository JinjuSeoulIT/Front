import axios from "axios";
import {
  ApiResponse,
  FileUploadResDTO,
  NurseCreateRequest,
  NurseResponse,
  NurseStaffIdParam,
  NurseUpdateRequest,
} from "@/features/employee/nurse/nurseTypes";

const NURSE_API_BASE_URL = "http://192.168.1.58:8022";

const apiNurse = axios.create({
  baseURL: NURSE_API_BASE_URL,
});

export const nurselistApi = async (): Promise<ApiResponse<NurseResponse[]>> => {
  const response = await apiNurse.get<ApiResponse<NurseResponse[]>>(`/api/nurse/list`);
  return response.data;
};

export const DetailNurseApi = async ({ staffId }: NurseStaffIdParam): Promise<ApiResponse<NurseResponse>> => {
  const response = await apiNurse.get<ApiResponse<NurseResponse>>(`/api/nurse/detail/${staffId}`);
  return response.data;
};

export const createNurseApi = async (nurseReq: NurseCreateRequest): Promise<ApiResponse<NurseResponse>> => {
  const response = await apiNurse.post<ApiResponse<NurseResponse>>(`/api/nurse/create`, nurseReq);
  return response.data;
};

export const updateNursedApi = async (staffId: string, nurseReq: NurseUpdateRequest): Promise<ApiResponse<NurseResponse>> => {
  const response = await apiNurse.put<ApiResponse<NurseResponse>>(`/api/nurse/edit/${staffId}`, nurseReq);
  return response.data;
};

export const deleteNurseApi = async (staffId: string): Promise<ApiResponse<void>> => {
  const response = await apiNurse.delete<ApiResponse<void>>(`/api/nurse/delete/${staffId}`);
  return response.data;
};

export async function uploadFileApi(staffId: string, file: File): Promise<ApiResponse<FileUploadResDTO>> {
  const form = new FormData();
  form.append("NurseFile", file);

  const res = await apiNurse.post<ApiResponse<FileUploadResDTO>>(`/api/nurse/profile/upload/${staffId}`, form);
  return res.data;
}
