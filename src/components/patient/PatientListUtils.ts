import type { Patient } from "@/features/patients/patientTypes";

const API_BASE =
  process.env.NEXT_PUBLIC_PATIENTS_API_BASE_URL ?? "http://192.168.1.60:8181";

export function resolvePhotoUrl(url?: string | null): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${API_BASE}${url.startsWith("/") ? "" : "/"}${url}`;
}

export function sexLabel(g?: Patient["gender"]): string {
  if (g === "M") return "남";
  if (g === "F") return "여";
  return "-";
}

export function safe(v?: string | null): string {
  return v && String(v).trim() ? v : "-";
}

export function statusChipLabel(statusCode?: string | null): string {
  if (!statusCode) return "ACTIVE";
  return statusCode;
}

export function formatAddress(p?: Patient | null): string {
  if (!p) return "-";
  const a = p.address?.trim();
  const d = p.addressDetail?.trim();
  if (!a && !d) return "-";
  if (a && d) return `${a} ${d}`;
  return a || d || "-";
}
