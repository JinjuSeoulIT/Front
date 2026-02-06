"use client";

import axios, { AxiosResponse } from "axios";
import type {
  ApiResponse,
  Department,
  DepartmentInput,
  SearchCondition,
} from "../model/departmentSlice";

const DEPARTMENT_API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? "http://192.168.1.67:3001/api/jpa/departments";

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

type BackendDepartment = {
  id: number;
  name?: string;
  description?: string;
  location?: string;
  buildingNo?: string;
  floorNo?: string;
  roomNo?: string;
  extension?: string;
  headStaffId?: number;
  deptCode?: string;
  isActive?: string; // Y/N
  sortOrder?: number;
  staffCount?: number;
};

function handleResponse<T>(res: AxiosResponse<ApiResponse<T>>): ApiResponse<T> {
  if (res.data.success) return res.data;
  return { message: res.data.message, success: false };
}

function parseLocation(location?: string): { buildingNo?: string; floorNo?: string } {
  const loc = (location ?? "").trim();
  if (!loc) return {};

  // Examples: "본관 2층", "별관 1층", "응급동", "본관 지하"
  const tokens = loc.split(/\s+/).filter(Boolean);
  const building = tokens[0];

  const m = loc.match(/(\d+)\s*층/);
  if (m) return { buildingNo: building, floorNo: m[1] };

  if (loc.includes("지하")) return { buildingNo: building, floorNo: "B" };

  return { buildingNo: building, floorNo: undefined };
}

function toLocation(buildingNo?: string, floorNo?: string): string | undefined {
  const b = (buildingNo ?? "").trim();
  const f = (floorNo ?? "").trim();
  if (!b && !f) return undefined;
  if (b && f) {
    const floorLabel = f.toUpperCase() == "B" ? "지하" : `${f}층`;
    return `${b} ${floorLabel}`;
  }
  return b || f;
}

function normalizeDepartment(d: BackendDepartment): Department {
  const parsed = parseLocation(d.location);

  return {
    id: d.id,
    name: d.name ?? "",
    buildingNo: d.buildingNo ?? parsed.buildingNo,
    floorNo: d.floorNo ?? parsed.floorNo,
    roomNo: d.roomNo,
    extension: d.extension,
    headMedicalStaffId: d.headStaffId ?? null,
    status: d.isActive == "N" ? "INACTIVE" : "ACTIVE",
    staffCount: d.staffCount ?? 0,
  };
}

export async function fetchDepartmentsApi(): Promise<ApiResponse<Department[]>> {
  const key = "departments:list";
  const cached = getCache(key);
  if (cached) return cached as ApiResponse<Department[]>;
  const res = await axios.get<ApiResponse<BackendDepartment[]>>(DEPARTMENT_API_BASE);
  const raw = handleResponse(res);
  if (raw.success && raw.result) {
    const normalized = raw.result.map(normalizeDepartment);
    const parsed = { ...raw, result: normalized.filter((d) => d.status === "ACTIVE") };
    setCache(key, parsed);
    return parsed;
  }
  return raw as unknown as ApiResponse<Department[]>;
}

export async function fetchDepartmentsByConditionApi(
  data: SearchCondition
): Promise<ApiResponse<Department[]>> {
  const { condition, value } = data;
  const url = `${DEPARTMENT_API_BASE}/search`;
  const key = `departments:search:${condition}:${value}`;
  const cached = getCache(key);
  if (cached) return cached as ApiResponse<Department[]>;
  const res = await axios.get<ApiResponse<BackendDepartment[]>>(url, {
    params: { condition, value },
  });
  const raw = handleResponse(res);
  if (raw.success && raw.result) {
    const normalized = raw.result.map(normalizeDepartment);
    const parsed = { ...raw, result: normalized.filter((d) => d.status === "ACTIVE") };
    setCache(key, parsed);
    return parsed;
  }
  return raw as unknown as ApiResponse<Department[]>;
}

export async function fetchDepartmentApi(id: number): Promise<ApiResponse<Department>> {
  const res = await axios.get<ApiResponse<BackendDepartment>>(`${DEPARTMENT_API_BASE}/${id}`);
  const raw = handleResponse(res);
  if (raw.success && raw.result) {
    return { ...raw, result: normalizeDepartment(raw.result) };
  }
  return raw as unknown as ApiResponse<Department>;
}

export async function createDepartmentApi(data: DepartmentInput): Promise<ApiResponse<Department>> {
  guardRateLimit("departments:create");
  cacheStore.clear();
  const payload = {
    name: data.name,
    location: toLocation(data.buildingNo, data.floorNo),
    buildingNo: data.buildingNo,
    floorNo: data.floorNo,
    roomNo: data.roomNo,
    extension: data.extension,
    headStaffId: data.headMedicalStaffId ?? null,
    isActive: data.status === "INACTIVE" ? "N" : "Y",
  };

  const res = await axios.post<ApiResponse<BackendDepartment>>(DEPARTMENT_API_BASE, payload);
  const raw = handleResponse(res);
  if (raw.success && raw.result) {
    return { ...raw, result: normalizeDepartment(raw.result) };
  }
  return raw as unknown as ApiResponse<Department>;
}

export async function updateDepartmentApi(id: number, data: DepartmentInput): Promise<ApiResponse<Department>> {
  guardRateLimit("departments:update");
  cacheStore.clear();
  const payload = {
    name: data.name,
    location: toLocation(data.buildingNo, data.floorNo),
    buildingNo: data.buildingNo,
    floorNo: data.floorNo,
    roomNo: data.roomNo,
    extension: data.extension,
    headStaffId: data.headMedicalStaffId ?? null,
    isActive: data.status === "INACTIVE" ? "N" : "Y",
  };

  const res = await axios.put<ApiResponse<BackendDepartment>>(`${DEPARTMENT_API_BASE}/${id}`, payload);
  const raw = handleResponse(res);
  if (raw.success && raw.result) {
    return { ...raw, result: normalizeDepartment(raw.result) };
  }
  return raw as unknown as ApiResponse<Department>;
}

export async function deleteDepartmentApi(id: number): Promise<ApiResponse<null>> {
  guardRateLimit("departments:delete");
  cacheStore.clear();
  const res = await axios.delete<ApiResponse<null>>(`${DEPARTMENT_API_BASE}/${id}`);
  return handleResponse(res);
}
