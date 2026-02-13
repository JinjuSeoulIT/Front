import axios from "axios";
import type {
  ApiResponse,
  InpatientReception,
  InpatientReceptionForm,
  InpatientReceptionSearchPayload,
} from "@/features/InpatientReceptions/InpatientReceptionTypes";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE ?? "",
});

export const fetchInpatientReceptionsApi = async (): Promise<InpatientReception[]> => {
  const res = await api.get<ApiResponse<InpatientReception[]>>("/api/inpatient-receptions");
  if (!res.data.success) {
    throw new Error(res.data.message || "Fetch failed");
  }
  return res.data.result;
};

export const fetchInpatientReceptionApi = async (
  receptionId: string
): Promise<InpatientReception> => {
  const res = await api.get<ApiResponse<InpatientReception>>(
    `/api/inpatient-receptions/${receptionId}`
  );
  if (!res.data.success) {
    throw new Error(res.data.message || "Fetch failed");
  }
  return res.data.result;
};

export const createInpatientReceptionApi = async (
  form: InpatientReceptionForm
): Promise<void> => {
  const res = await api.post<ApiResponse<void>>("/api/inpatient-receptions", form);
  if (!res.data.success) {
    throw new Error(res.data.message || "Create failed");
  }
};

export const updateInpatientReceptionApi = async (
  receptionId: string,
  form: InpatientReceptionForm
): Promise<void> => {
  const res = await api.put<ApiResponse<void>>(
    `/api/inpatient-receptions/${receptionId}`,
    form
  );
  if (!res.data.success) {
    throw new Error(res.data.message || "Update failed");
  }
};

export const searchInpatientReceptionsApi = async (
  type: InpatientReceptionSearchPayload["type"],
  keyword: string
): Promise<InpatientReception[]> => {
  const res = await api.get<ApiResponse<InpatientReception[]>>(
    "/api/inpatient-receptions",
    {
      params: { searchType: type, searchValue: keyword },
    }
  );

  if (!res.data.success) {
    return [];
  }
  return res.data.result;
};



