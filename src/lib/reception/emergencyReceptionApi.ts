import axios from "axios";
import type {
  ApiResponse,
  EmergencyReception,
  EmergencyReceptionForm,
  EmergencyReceptionSearchPayload,
} from "@/features/EmergencyReception/EmergencyReceptionTypes";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_RECEPTION_API_BASE_URL ?? "http://192.168.1.55:8283",
});

function toApiErrorMessage(err: unknown, fallback: string) {
  if (axios.isAxiosError(err)) {
    const message =
      (err.response?.data as { message?: string } | undefined)?.message ?? err.message;
    return message || fallback;
  }
  if (err instanceof Error) return err.message || fallback;
  return fallback;
}

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
  try {
    const res = await api.post<ApiResponse<void>>("/api/emergency-receptions", form);
    if (!res.data.success) {
      throw new Error(res.data.message || "Create failed");
    }
  } catch (err) {
    throw new Error(toApiErrorMessage(err, "Create failed"));
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


