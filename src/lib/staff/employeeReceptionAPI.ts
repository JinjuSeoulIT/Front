import axios, { type AxiosResponse } from "axios";
import type {
  ApiResponse,
  ReceptionCreateRequest,
  ReceptionIdNumber,
  ReceptionResponse,
  ReceptionSearchType,
  ReceptionUpdateRequest,
} from "@/features/staff/reception/receptionTypes";

const RECEPTION_API_BASE_URL = process.env.NEXT_PUBLIC_PATIENTS_API_BASE_URL ?? "http://192.168.1.58:8022";

const receptionApi = axios.create({
  baseURL: RECEPTION_API_BASE_URL,
});

async function tryGet<T>(paths: string[], params?: Record<string, string>): Promise<AxiosResponse<T>> {
  let lastError: unknown;
  for (const path of paths) {
    try {
      return await receptionApi.get<T>(path, params ? { params } : undefined);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

async function tryPost<T>(paths: string[], body: unknown): Promise<AxiosResponse<T>> {
  let lastError: unknown;
  for (const path of paths) {
    try {
      return await receptionApi.post<T>(path, body);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

async function tryWrite<T>(method: "put" | "patch" | "delete", paths: string[], body?: unknown): Promise<AxiosResponse<T>> {
  let lastError: unknown;
  for (const path of paths) {
    try {
      if (method === "delete") {
        return await receptionApi.delete<T>(path);
      }
      if (method === "put") {
        return await receptionApi.put<T>(path, body);
      }
      return await receptionApi.patch<T>(path, body);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

export async function searchReceptionListApi(
  search: string,
  searchType: ReceptionSearchType,
): Promise<ApiResponse<ReceptionResponse[]>> {
  const response = await tryGet<ApiResponse<ReceptionResponse[]>>(
    ["/api/reception/search", "/api/reception/list/search"],
    { search, searchType },
  );
  return response.data;
}

export const receptionListApi = async (): Promise<ApiResponse<ReceptionResponse[]>> => {
  const response = await tryGet<ApiResponse<ReceptionResponse[]>>([
    "/api/reception/list",
    "/api/reception",
  ]);
  return response.data;
};

export const detailReceptionApi = async ({ staffId }: ReceptionIdNumber): Promise<ApiResponse<ReceptionResponse>> => {
  const response = await tryGet<ApiResponse<ReceptionResponse>>([
    `/api/reception/detail/${staffId}`,
    `/api/reception/${staffId}`,
  ]);
  return response.data;
};

export const createReceptionApi = async (
  receptionReq: ReceptionCreateRequest,
): Promise<ApiResponse<ReceptionResponse>> => {
  const response = await tryPost<ApiResponse<ReceptionResponse>>([
    "/api/reception/create",
    "/api/reception",
  ], receptionReq);
  return response.data;
};

export const updateReceptionApi = async (
  staffId: string,
  receptionReq: ReceptionUpdateRequest,
): Promise<ApiResponse<ReceptionResponse>> => {
  const response = await tryWrite<ApiResponse<ReceptionResponse>>(
    "put",
    [`/api/reception/edit/${staffId}`, `/api/reception/update/${staffId}`],
    receptionReq,
  );
  return response.data;
};

export const deleteReceptionApi = async (staffId: string): Promise<ApiResponse<void>> => {
  const response = await tryWrite<ApiResponse<void>>(
    "delete",
    [`/api/reception/delete/${staffId}`, `/api/reception/${staffId}`],
  );
  return response.data;
};
