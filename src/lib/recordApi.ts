import axios from "axios";
import type { ApiResponse } from "@/features/patients/patientTypes";

export type NursingRecord = {
  nursingId: string;
  visitId?: number | null;
  recordedAt?: string | null;
  systolicBp?: number | null;
  diastolicBp?: number | null;
  pulse?: number | null;
  respiration?: number | null;
  temperature?: number | null;
  spo2?: number | null;
  observation?: string | null;
  painScore?: number | null;
  consciousnessLevel?: string | null;
  initialAssessment?: string | null;
  status?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type NursingRecordCreatePayload = {
  visitId?: number | null;
  recordedAt?: string | null;
  systolicBp?: number | null;
  diastolicBp?: number | null;
  pulse?: number | null;
  respiration?: number | null;
  temperature?: number | null;
  spo2?: number | null;
  observation?: string | null;
  painScore?: number | null;
  consciousnessLevel?: string | null;
  initialAssessment?: string | null;
  status?: string | null;
};

export type NursingRecordUpdatePayload = NursingRecordCreatePayload;

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_NURSING_API_BASE_URL ?? "http://192.168.1.66:8181",
});

export const fetchRecordsApi = async (): Promise<NursingRecord[]> => {
  const res = await api.get<ApiResponse<NursingRecord[]>>("/api/record");
  if (!res.data.success) {
    throw new Error(res.data.message || "Fetch failed");
  }
  return res.data.result;
};

export const fetchRecordApi = async (
  id: string | number
): Promise<NursingRecord> => {
  const res = await api.get<ApiResponse<NursingRecord>>(`/api/record/${id}`);
  if (!res.data.success) {
    throw new Error(res.data.message || "Fetch failed");
  }
  return res.data.result;
};

export const createRecordApi = async (
  payload: NursingRecordCreatePayload
): Promise<NursingRecord> => {
  const res = await api.post<ApiResponse<NursingRecord>>("/api/record", payload);
  if (!res.data.success) {
    throw new Error(res.data.message || "Create failed");
  }
  return res.data.result;
};

export const updateRecordApi = async (
  id: string | number,
  payload: NursingRecordUpdatePayload
): Promise<NursingRecord> => {
  const res = await api.put<ApiResponse<NursingRecord>>(`/api/record/${id}`, payload);
  if (!res.data.success) {
    throw new Error(res.data.message || "Update failed");
  }
  return res.data.result;
};



export const deleteRecordApi = async (id: string | number): Promise<void> => {
  const res = await api.delete<ApiResponse<void>>(`/api/record/${id}`);
  if (!res.data.success) {
    throw new Error(res.data.message || "Delete failed");
  }
};
