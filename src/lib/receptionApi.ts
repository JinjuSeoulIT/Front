import axios from "axios";

type ApiResponse<T> = {
  success?: boolean;
  message?: string;
  result?: T;
};

export type VisitRes = {
  id: number;
  visitNo?: string | null;
  patientId: number;
  patientNo?: string | null;
  patientName?: string | null;
  patientPhone?: string | null;
  visitType?: string | null;
  status?: string | null;
  deptCode?: string | null;
  doctorId?: string | null;
  priorityYn?: boolean | null;
  queueNo?: number | null;
  calledAt?: string | null;
  startedAt?: string | null;
  finishedAt?: string | null;
  memo?: string | null;
  cancelledAt?: string | null;
  cancelReasonCode?: string | null;
  cancelMemo?: string | null;
  reservationId?: string | null;
  scheduledAt?: string | null;
  arrivalAt?: string | null;
  reservationNote?: string | null;
  createdBy?: string | null;
  updatedBy?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type VisitCreatePayload = {
  visitNo?: string | null;
  patientId: number;
  patientNo?: string | null;
  patientName?: string | null;
  patientPhone?: string | null;
  visitType?: string | null;
  deptCode?: string | null;
  doctorId?: string | null;
  priorityYn?: boolean | null;
  queueNo?: number | null;
  memo?: string | null;
  createdBy?: string | null;
  reservationId?: string | null;
  scheduledAt?: string | null;
  arrivalAt?: string | null;
  reservationNote?: string | null;
};

export type VisitUpdatePayload = {
  visitType?: string | null;
  status?: string | null;
  deptCode?: string | null;
  doctorId?: string | null;
  priorityYn?: boolean | null;
  queueNo?: number | null;
  calledAt?: string | null;
  startedAt?: string | null;
  finishedAt?: string | null;
  memo?: string | null;
  cancelledAt?: string | null;
  cancelReasonCode?: string | null;
  cancelMemo?: string | null;
  updatedBy?: string | null;
  reservationId?: string | null;
  scheduledAt?: string | null;
  arrivalAt?: string | null;
  reservationNote?: string | null;
};

export type CreateVisitReq = VisitCreatePayload;

const api = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_RECEPTION_API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_BASE ??
    "http://192.168.1.55:8283",
});

function unwrap<T>(data: ApiResponse<T> | T): T {
  if (data && typeof data === "object" && "result" in (data as ApiResponse<T>)) {
    return ((data as ApiResponse<T>).result ?? null) as T;
  }
  return data as T;
}

function isWrappedResponse<T>(data: ApiResponse<T> | T): data is ApiResponse<T> {
  return !!data && typeof data === "object" && "success" in (data as ApiResponse<T>);
}

export const fetchVisitsApi = async (): Promise<VisitRes[]> => {
  const res = await api.get<ApiResponse<VisitRes[]> | VisitRes[]>("/api/receptions");
  if (isWrappedResponse<VisitRes[]>(res.data)) {
    if (res.data.success === false) {
      throw new Error(res.data.message || "Failed to fetch receptions.");
    }
    return Array.isArray(res.data.result) ? res.data.result : [];
  }

  const value = unwrap<VisitRes[]>(res.data);
  return Array.isArray(value) ? value : [];
};

export const createVisitApi = async (
  payload: VisitCreatePayload
): Promise<VisitRes> => {
  const res = await api.post<ApiResponse<VisitRes> | VisitRes>("/api/receptions", payload);
  if (isWrappedResponse<VisitRes>(res.data) && res.data.success === false) {
    throw new Error(res.data.message || "Failed to create reception.");
  }

  const value = unwrap<VisitRes>(res.data);
  if (!value || typeof value !== "object") {
    throw new Error("Create reception response is empty.");
  }
  return value;
};

export const updateVisitApi = async (
  id: number,
  payload: VisitUpdatePayload
): Promise<VisitRes> => {
  const res = await api.put<ApiResponse<VisitRes> | VisitRes>(
    `/api/receptions/${id}`,
    payload
  );
  if (isWrappedResponse<VisitRes>(res.data) && res.data.success === false) {
    throw new Error(res.data.message || "Failed to update reception.");
  }

  const value = unwrap<VisitRes>(res.data);
  if (!value || typeof value !== "object") {
    throw new Error("Update reception response is empty.");
  }
  return value;
};

export const deleteVisitApi = async (id: number): Promise<void> => {
  const res = await api.delete<ApiResponse<void> | void>(`/api/receptions/${id}`);
  if (isWrappedResponse<void>(res.data) && res.data.success === false) {
    throw new Error(res.data.message || "Failed to cancel reception.");
  }
};
