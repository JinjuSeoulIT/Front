import axios from "axios";
import type { ApiResponse } from "@/features/patients/patientTypes";

export type ImagingExam = {
  imagingExamId: string;
  visitId?: string | null;
  imagingType?: string | null;
  examStatusYn?: string | null;
  examAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type ImagingExamCreatePayload = {
  visitId?: string | null;
  imagingType?: string | null;
  examStatusYn?: string | null;
  examAt?: string | null;
};

export type ImagingExamUpdatePayload = {
  visitId?: string | null;
  imagingType?: string | null;
  examStatusYn?: string | null;
  examAt?: string | null;
};

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_NURSING_API_BASE_URL ?? "http://localhost:8181",
});

export const fetchImagingExamsApi = async (): Promise<ImagingExam[]> => {
  const res = await api.get<ApiResponse<ImagingExam[]>>("/api/imaging-exam");
  if (!res.data.success) {
    throw new Error(res.data.message || "Fetch failed");
  }
  return res.data.result;
};

export const fetchImagingExamApi = async (
  id: string | number
): Promise<ImagingExam> => {
  const res = await api.get<ApiResponse<ImagingExam>>(`/api/imaging-exam/${id}`);
  if (!res.data.success) {
    throw new Error(res.data.message || "Fetch failed");
  }
  return res.data.result;
};

export const searchImagingExamsApi = async (
  searchBy: "visitId" | "imagingType",
  keyword: string
): Promise<ImagingExam[]> => {
  const res = await api.get<ApiResponse<ImagingExam[]>>("/api/imaging-exam/search", {
    params: {
      searchBy,
      keyword,
    },
  });
  if (!res.data.success) {
    throw new Error(res.data.message || "Search failed");
  }
  return res.data.result;
};

export const createImagingExamApi = async (
  payload: ImagingExamCreatePayload
): Promise<ImagingExam> => {
  const res = await api.post<ApiResponse<ImagingExam>>("/api/imaging-exam", payload);
  if (!res.data.success) {
    throw new Error(res.data.message || "Create failed");
  }
  return res.data.result;
};

export const updateImagingExamApi = async (
  id: string | number,
  payload: ImagingExamUpdatePayload
): Promise<ImagingExam> => {
  const res = await api.put<ApiResponse<ImagingExam>>(`/api/imaging-exam/${id}`, payload);
  if (!res.data.success) {
    throw new Error(res.data.message || "Update failed");
  }
  return res.data.result;
};

export const deleteImagingExamApi = async (
  id: string | number
): Promise<void> => {
  const res = await api.delete<ApiResponse<void>>(`/api/imaging-exam/${id}`);
  if (!res.data.success) {
    throw new Error(res.data.message || "Delete failed");
  }
};

