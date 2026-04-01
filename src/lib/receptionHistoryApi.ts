import axios from "axios";

export type ReceptionStatusHistory = {
  statusHistoryId: number;
  receptionId: number;
  fromStatus?: string | null;
  toStatus: string;
  changedBy?: number | null;
  changedAt: string;
  reasonCode?: string | null;
  reasonText?: string | null;
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  result: T;
};

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE ?? "",
});

export const fetchReceptionStatusHistoryApi = async (
  receptionId: string
): Promise<ReceptionStatusHistory[]> => {
  const res = await api.get<ApiResponse<ReceptionStatusHistory[]>>(
    `/api/receptions/${receptionId}/status-history`
  );
  if (!res.data.success) {
    throw new Error(res.data.message || "Fetch failed");
  }
  return res.data.result;
};



