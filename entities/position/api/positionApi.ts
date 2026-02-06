"use client";

import axios, { AxiosResponse } from "axios";
import type {
  ApiResponse,
  Position,
  PositionInput,
  SearchCondition,
} from "../model/positionSlice";

const POSITION_API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? "http://192.168.1.67:3001/api/jpa/positions";

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

type BackendPosition = {
  id: number;
  title?: string;
  description?: string;
  domain?: string;
  positionCode?: string;
  isActive?: string;
  sortOrder?: number;
};

function normalizePosition(p: BackendPosition): Position {
  return {
    id: p.id,
    name: p.title ?? "",
    code: p.positionCode,
    description: p.description,
    status: p.isActive,
  };
}

function handleResponse<T>(res: AxiosResponse<ApiResponse<T>>): ApiResponse<T> {
  if (res.data.success) return res.data;
  return { message: res.data.message, success: false };
}

export async function fetchPositionsApi(): Promise<ApiResponse<Position[]>> {
  const key = "positions:list";
  const cached = getCache(key);
  if (cached) return cached as ApiResponse<Position[]>;
  const res = await axios.get<ApiResponse<BackendPosition[]>>(POSITION_API_BASE);
  const raw = handleResponse(res);
  if (raw.success && raw.result) {
    const parsed = { ...raw, result: raw.result.map(normalizePosition) };
    setCache(key, parsed);
    return parsed;
  }
  return raw as unknown as ApiResponse<Position[]>;
}

export async function fetchPositionsByConditionApi(
  data: SearchCondition
): Promise<ApiResponse<Position[]>> {
  const { condition, value } = data;
  const url = `${POSITION_API_BASE}/search`;
  const key = `positions:search:${condition}:${value}`;
  const cached = getCache(key);
  if (cached) return cached as ApiResponse<Position[]>;
  const res = await axios.get<ApiResponse<BackendPosition[]>>(url, {
    params: { condition, value },
  });
  const raw = handleResponse(res);
  if (raw.success && raw.result) {
    const parsed = { ...raw, result: raw.result.map(normalizePosition) };
    setCache(key, parsed);
    return parsed;
  }
  return raw as unknown as ApiResponse<Position[]>;
}

export async function fetchPositionApi(id: number): Promise<ApiResponse<Position>> {
  const res = await axios.get<ApiResponse<BackendPosition>>(`${POSITION_API_BASE}/${id}`);
  const raw = handleResponse(res);
  if (raw.success && raw.result) {
    return { ...raw, result: normalizePosition(raw.result) };
  }
  return raw as unknown as ApiResponse<Position>;
}

export async function createPositionApi(data: PositionInput): Promise<ApiResponse<Position>> {
  guardRateLimit("positions:create");
  cacheStore.clear();
  const payload = {
    title: data.name,
    description: data.description,
    positionCode: data.code,
    sortOrder: data.rankLevel,
    isActive: data.status === "INACTIVE" ? "N" : "Y",
  };

  const res = await axios.post<ApiResponse<BackendPosition>>(POSITION_API_BASE, payload);
  const raw = handleResponse(res);
  if (raw.success && raw.result) {
    return { ...raw, result: normalizePosition(raw.result) };
  }
  return raw as unknown as ApiResponse<Position>;
}

export async function updatePositionApi(id: number, data: PositionInput): Promise<ApiResponse<Position>> {
  guardRateLimit("positions:update");
  cacheStore.clear();
  const payload = {
    title: data.name,
    description: data.description,
    positionCode: data.code,
    sortOrder: data.rankLevel,
    isActive: data.status === "INACTIVE" ? "N" : "Y",
  };

  const res = await axios.put<ApiResponse<BackendPosition>>(`${POSITION_API_BASE}/${id}`, payload);
  const raw = handleResponse(res);
  if (raw.success && raw.result) {
    return { ...raw, result: normalizePosition(raw.result) };
  }
  return raw as unknown as ApiResponse<Position>;
}

export async function deletePositionApi(id: number): Promise<ApiResponse<null>> {
  guardRateLimit("positions:delete");
  cacheStore.clear();
  const res = await axios.delete<ApiResponse<null>>(`${POSITION_API_BASE}/${id}`);
  return handleResponse(res);
}
