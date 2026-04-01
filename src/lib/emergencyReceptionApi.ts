import axios from "axios";
import type {
  ApiResponse,
  EmergencyReception,
  EmergencyReceptionForm,
  EmergencyReceptionSearchPayload,
} from "@/features/EmergencyReceptions/EmergencyReceptionTypes";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE ?? "",
});

export const fetchEmergencyReceptionsApi = async (): Promise<EmergencyReception[]> => {
  const res = await api.get<ApiResponse<EmergencyReception[]>>("/api/emergency-receptions");
  if (!res.data.success) {
    throw new Error(res.data.message || "Fetch failed");
  }
  return res.data.result;
};

export const fetchEmergencyReceptionApi = async (
  receptionId: string
): Promise<EmergencyReception> => {
  const res = await api.get<ApiResponse<EmergencyReception>>(
    `/api/emergency-receptions/${receptionId}`
  );
  if (!res.data.success) {
    throw new Error(res.data.message || "Fetch failed");
  }
  return res.data.result;
};

export const createEmergencyReceptionApi = async (
  form: EmergencyReceptionForm
): Promise<void> => {
  const res = await api.post<ApiResponse<void>>("/api/emergency-receptions", form);
  if (!res.data.success) {
    throw new Error(res.data.message || "Create failed");
  }
};

export const updateEmergencyReceptionApi = async (
  receptionId: string,
  form: EmergencyReceptionForm
): Promise<void> => {
  const res = await api.put<ApiResponse<void>>(
    `/api/emergency-receptions/${receptionId}`,
    form
  );
  if (!res.data.success) {
    throw new Error(res.data.message || "Update failed");
  }
};

export const searchEmergencyReceptionsApi = async (
  type: EmergencyReceptionSearchPayload["type"],
  keyword: string
): Promise<EmergencyReception[]> => {
  const res = await api.get<ApiResponse<EmergencyReception[]>>("/api/emergency-receptions", {
    params: { searchType: type, searchValue: keyword },
  });

  if (!res.data.success) {
    return [];
  }
  return res.data.result;
};



