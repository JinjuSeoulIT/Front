import axios from "axios";

type ApiResponse<T> = {
  success?: boolean;
  message?: string;
  result?: T;
};

export type VisitRes = {
  id: number;
  patientId: number;
  patientNo?: string | null;
  patientName?: string | null;
  patientPhone?: string | null;
  visitType?: string | null;
  deptCode?: string | null;
  doctorId?: string | null;
  status?: string | null;
  priorityYn?: boolean;
  memo?: string | null;
  createdBy?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type CreateVisitReq = {
  patientId: number;
  patientNo?: string | null;
  patientName?: string | null;
  patientPhone?: string | null;
  visitType?: string | null;
  deptCode?: string | null;
  doctorId?: string | null;
  priorityYn?: boolean;
  memo?: string | null;
  createdBy?: string | null;
};

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE ?? "",
});

function unwrap<T>(data: ApiResponse<T> | T): T {
  if (data && typeof data === "object" && "result" in (data as ApiResponse<T>)) {
    return ((data as ApiResponse<T>).result ?? null) as T;
  }
  return data as T;
}

export const fetchVisitsApi = async (): Promise<VisitRes[]> => {
  const res = await api.get<ApiResponse<VisitRes[]> | VisitRes[]>("/api/receptions");
  const value = unwrap<VisitRes[]>(res.data);
  return Array.isArray(value) ? value : [];
};

export const createVisitApi = async (payload: CreateVisitReq): Promise<VisitRes> => {
  const res = await api.post<ApiResponse<VisitRes> | VisitRes>("/api/receptions", payload);
  const value = unwrap<VisitRes>(res.data);
  if (!value || typeof value !== "object") {
    throw new Error("접수 생성 응답이 비어 있습니다.");
  }
  return value;
};