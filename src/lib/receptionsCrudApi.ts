import axios from "axios";
import type {
  Reception,
  ReceptionForm,
  ReceptionSearchPayload,
  ApiResponse,
} from "../features/Receptions/ReceptionTypes";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE ?? "",
});

// List
export const fetchReceptionsApi = async (): Promise<Reception[]> => {
  const res = await api.get<ApiResponse<Reception[]>>("/api/receptions");
  if (!res.data.success) {
    throw new Error(res.data.message || "Fetch failed");
  }
  return res.data.result;
};

// Detail
export const fetchReceptionApi = async (receptionId: string): Promise<Reception> => {
  const res = await api.get<ApiResponse<Reception>>(`/api/receptions/${receptionId}`);
  if (!res.data.success) {
    throw new Error(res.data.message || "Fetch failed");
  }
  return res.data.result;
};

// Create (multipart)
export const createReceptionApi = async (form: ReceptionForm): Promise<void> => {
  const res = await api.post<ApiResponse<void>>("/api/receptions", form);
  if (!res.data.success) {
    throw new Error(res.data.message || "Create failed");
  }
};

// Update
export const updateReceptionApi = async (
  receptionId: string,
  form: ReceptionForm
): Promise<void> => {
  const res = await api.put<ApiResponse<void>>(
    `/api/receptions/${receptionId}`,
    form
  );
  if (!res.data.success) {
    throw new Error(res.data.message || "Update failed");
  }
};

// Cancel
export const cancelReceptionApi = async (
  receptionId: string,
  reasonText?: string
): Promise<Reception> => {
  const res = await api.patch<ApiResponse<Reception>>(
    `/api/receptions/${receptionId}/status`,
    {
      status: "CANCELED",
      reasonText: reasonText?.trim() || undefined,
    }
  );
  if (!res.data.success) {
    throw new Error(res.data.message || "Cancel failed");
  }
  return res.data.result;
};

// Search
export const searchReceptionsApi = async (
  type: ReceptionSearchPayload["type"],
  keyword: string
): Promise<Reception[]> => {
  const res = await api.get<ApiResponse<Reception[]>>("/api/receptions", {
    params: { searchType: type, searchValue: keyword },
  });

  if (!res.data.success) {
    return [];
  }
  return res.data.result;
};


