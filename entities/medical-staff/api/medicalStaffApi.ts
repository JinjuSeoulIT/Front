"use client";
import axios, { AxiosResponse } from "axios";
import type {
  ApiResponse,
  MedicalStaff,
  SearchCondition,
} from "../model/medicalStaffSlice";
/* =========================
 * API BASE
 * ========================= */
const MEDICAL_STAFF_API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ??
  "http://192.168.1.67:3001/api/jpa/medical-staff";
/* =========================
 * 공통 유틸
 * ========================= */
const CACHE_TTL_MS = 10_000;
const cacheStore = new Map<string, { expiresAt: number; value: ApiResponse<any> }>();
const lastActionAt: Record<string, number> = {};

// Frontend rate limit to prevent rapid duplicate mutations.
function guardRateLimit(key: string, windowMs = 500) {
  const now = Date.now();
  const last = lastActionAt[key] ?? 0;
  if (now - last < windowMs) {
    throw new Error("요청이 너무 빠릅니다. 잠시 후 다시 시도해주세요.");
  }
  lastActionAt[key] = now;
}

function getCache(key: string) {
  const cached = cacheStore.get(key);
  if (!cached) return null;
  if (cached.expiresAt < Date.now()) {
    cacheStore.delete(key);
    return null;
  }
  return cached.value as ApiResponse<any>;
}

function setCache(key: string, value: ApiResponse<any>) {
  cacheStore.set(key, { expiresAt: Date.now() + CACHE_TTL_MS, value });
}

function handleResponse<T>(res: AxiosResponse<ApiResponse<T>>): ApiResponse<T> {
  if (res.data.success) {
    return res.data;
  }
  return {
    message: res.data.message,
    success: false,
  };
}
/* =========================
 * MedicalStaff APIs
 * ========================= */
// 전체 조회
export async function fetchMedicalStaffApi(): Promise<ApiResponse<MedicalStaff[]>> {
  const key = "medicalStaff:list";
  const cached = getCache(key);
  if (cached) return cached as ApiResponse<MedicalStaff[]>;
  const res = await axios.get<ApiResponse<MedicalStaff[]>>(MEDICAL_STAFF_API_BASE);
  const parsed = handleResponse(res);
  if (parsed.success) setCache(key, parsed);
  return parsed;
}
// 조건 조회
export async function fetchMedicalStaffByConditionApi(
  data: SearchCondition
): Promise<ApiResponse<MedicalStaff | MedicalStaff[]>> {
  const { condition, value } = data;
  const url = `${MEDICAL_STAFF_API_BASE}/search`; // 변경: base 포함
  const key = `medicalStaff:search:${condition}:${value}`;
  const cached = getCache(key);
  if (cached) return cached as ApiResponse<MedicalStaff | MedicalStaff[]>;
  const res = await axios.get<ApiResponse<MedicalStaff | MedicalStaff[]>>(url, {
    params: { condition, value },
  });
  const parsed = handleResponse(res);
  if (parsed.success) setCache(key, parsed);
  return parsed;
}
// 단건 조회
export async function fetchMedicalStaffDetailApi(
  id: number
): Promise<ApiResponse<MedicalStaff>> {
  const res = await axios.get<ApiResponse<MedicalStaff>>(
    `${MEDICAL_STAFF_API_BASE}/${id}` // 변경: id 경로
  );
  return handleResponse(res);
}
// 생성 (multipart)
export async function createMedicalStaffApi(formData: FormData) {
  guardRateLimit("medicalStaff:create");
  cacheStore.clear();
  return axios.post(MEDICAL_STAFF_API_BASE, formData, {
    headers: {
      // "Content-Type": "multipart/form-data",
    },
  });
}
// 수정
export async function updateMedicalStaffApi(
  id: number,
  formData: FormData
) {
  guardRateLimit("medicalStaff:update");
  cacheStore.clear();
  return axios.put(`${MEDICAL_STAFF_API_BASE}/${id}`, formData, {
    headers: {
      // "Content-Type": "multipart/form-data",
    },
  });
}
// 삭제
export async function deleteMedicalStaffApi(
  id: number
): Promise<ApiResponse<null>> {
  guardRateLimit("medicalStaff:delete");
  cacheStore.clear();
  const res = await axios.delete<ApiResponse<null>>(
    `${MEDICAL_STAFF_API_BASE}/${id}` // 변경: id 경로
  );
  return handleResponse(res);
}

export async function checkMedicalStaffUsernameApi(
  username: string
): Promise<ApiResponse<boolean>> {
  const res = await axios.get<ApiResponse<boolean>>(
    `${MEDICAL_STAFF_API_BASE}/exists`,
    { params: { username } }
  );
  return handleResponse(res);
}
