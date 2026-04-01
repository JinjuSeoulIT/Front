import axios from "axios";
import type { ApiResponse } from "@/features/patients/patientTypes";

export type Specimen = {
  specimenId: string;
  // 진행상태: COLLECTED(채취 완료) / RECEIVED(검사실 접수 완료) / REJECTED(반려)
  specimenStatus?: string | null;
  specimenType?: string | null;
  testExecutionID?: string | null;
  testExecutionId?: string | null;
  collectedAt?: string | null;
  collectedById?: string | null;
  status?: string | null;
};

export type SpecimenCreatePayload = {
  specimenId?: string | null;
  // 진행상태: COLLECTED(채취 완료) / RECEIVED(검사실 접수 완료) / REJECTED(반려)
  specimenStatus?: string | null;
  specimenType?: string | null;
  testExecutionID?: string | null;
  collectedAt?: string | null;
  collectedById?: string | null;
  status?: string | null;
};

export type SpecimenUpdatePayload = SpecimenCreatePayload;

const api = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_NURSING_API_BASE_URL ?? "http://192.168.1.66:8181",
});

export const fetchSpecimensApi = async (): Promise<Specimen[]> => {
  const res = await api.get<ApiResponse<Specimen[]>>("/api/specimen");
  if (!res.data.success) {
    throw new Error(res.data.message || "Fetch failed");
  }
  return res.data.result;
};

export const fetchSpecimenApi = async (id: string): Promise<Specimen> => {
  const res = await api.get<ApiResponse<Specimen>>(`/api/specimen/${id}`);
  if (!res.data.success) {
    throw new Error(res.data.message || "Fetch failed");
  }
  return res.data.result;
};

export const createSpecimenApi = async (
  payload: SpecimenCreatePayload
): Promise<Specimen> => {
  const res = await api.post<ApiResponse<Specimen>>("/api/specimen", payload);
  if (!res.data.success) {
    throw new Error(res.data.message || "Create failed");
  }
  return res.data.result;
};

export const updateSpecimenApi = async (
  id: string,
  payload: SpecimenUpdatePayload
): Promise<Specimen> => {
  const res = await api.put<ApiResponse<Specimen>>(`/api/specimen/${id}`, payload);
  if (!res.data.success) {
    throw new Error(res.data.message || "Update failed");
  }
  return res.data.result;
};

export const deleteSpecimenApi = async (id: string): Promise<void> => {
  const res = await api.delete<ApiResponse<void>>(`/api/specimen/${id}`);
  if (!res.data.success) {
    throw new Error(res.data.message || "Delete failed");
  }
};
