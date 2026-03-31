import type { LabOrderType } from "@/lib/clinicalOrderApi";
import type { VitalSignsRes, AssessmentRes } from "@/lib/clinicalVitalsApi";
import type { PastHistoryItem, PastHistoryType } from "@/lib/clinicalPastHistoryApi";
import type { ClinicalRes } from "./types";

export const ORDER_TYPE_LABELS: Record<LabOrderType, string> = {
  BLOOD: "혈액검사",
  IMAGING: "영상검사",
  PATHOLOGY: "병리검사",
  SPECIMEN: "검체검사",
  ENDOSCOPY: "내시경검사",
  PHYSIOLOGY: "생리기능검사",
  PROCEDURE: "처치",
  MEDICATION: "투약",
};

export function formatDateTime(iso?: string | null) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function calcAge(dateStr?: string | null) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "-";
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age -= 1;
  return `${age}세`;
}

export function sexLabel(g?: string | null) {
  if (g === "M") return "남";
  if (g === "F") return "여";
  return "-";
}

export function formatBirth(dateStr?: string | null) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "-";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

export function formatClinicalDate(iso?: string | null) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

export function formatPastVisitDateDash(iso?: string | null) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function parseNurseInterviewPhx(a: AssessmentRes | null) {
  if (!a) return null;
  const ph = (a.pastHistory ?? "").trim();
  const parts = ph.includes("\n")
    ? ph.split("\n")
    : ph
        .split(/[,，]/)
        .map((s) => s.trim())
        .filter(Boolean);
  const diseases: string[] = [];
  const surgeries: string[] = [];
  for (const line of parts) {
    const t = line.trim();
    if (!t) continue;
    if (/^(수술|수술력)[\s:：\]］]/i.test(t) || /^\[수술\]/i.test(t)) {
      surgeries.push(
        t
          .replace(/^(수술|수술력)[\s:：\]］]*/i, "")
          .replace(/^\[수술\]\s*/i, "")
          .trim()
      );
    } else {
      diseases.push(t.replace(/^질병[\s:：\]］]*/i, "").replace(/^[-•*]\s*/, "").trim());
    }
  }
  return {
    diseases,
    surgeries,
    allergy: (a.allergy ?? "").trim(),
    medication: (a.currentMedication ?? "").trim(),
    family: (a.familyHistory ?? "").trim(),
    chief: (a.chiefComplaint ?? "").trim(),
    hpi: (a.historyPresentIllness ?? "").trim(),
  };
}

export function formatVitalsSummaryLine(v: VitalSignsRes | null): string {
  if (!v) return "";
  const parts: string[] = [];
  if (v.temperature != null) parts.push(`체온 ${v.temperature}℃`);
  if (v.pulse != null) parts.push(`맥박 ${v.pulse}/min`);
  if (v.bpSystolic != null && v.bpDiastolic != null) parts.push(`BP ${v.bpSystolic}/${v.bpDiastolic}`);
  else if (v.bpSystolic != null) parts.push(`수축기 ${v.bpSystolic}`);
  else if (v.bpDiastolic != null) parts.push(`이완기 ${v.bpDiastolic}`);
  if (v.respiratoryRate != null) parts.push(`호흡 ${v.respiratoryRate}/min`);
  return parts.join(" · ");
}

export const CLINICAL_SUPPORT_PAST_HISTORY_SYNC =
  typeof process !== "undefined" && process.env.NEXT_PUBLIC_CLINICAL_SUPPORT_SYNC === "true";

export function clinicalStatusView(status?: string | null) {
  switch (status) {
    case "WAITING":
    case "READY":
      return { label: "대기", color: "warning" as const };
    case "CALLED":
      return { label: "호출", color: "info" as const };
    case "IN_PROGRESS":
      return { label: "진료중", color: "success" as const };
    case "DONE":
    case "COMPLETED":
      return { label: "완료", color: "default" as const };
    case "CANCELLED":
      return { label: "취소", color: "error" as const };
    default:
      return { label: "미분류", color: "default" as const };
  }
}

export function resolveClinicalStatus(v?: ClinicalRes | null) {
  return v?.status ?? v?.clinicalStatus ?? null;
}

const ORDER_STATUS_LABELS: Record<string, string> = {
  REQUESTED: "요청",
  REQUEST: "요청",
  IN_PROGRESS: "진행",
  COMPLETED: "완료",
  CANCELLED: "취소",
};

export function orderStatusLabel(status?: string | null) {
  if (!status) return "미분류";
  return ORDER_STATUS_LABELS[status] ?? status;
}

export const PAST_HISTORY_TYPE_LABEL: Record<PastHistoryType, string> = {
  DISEASE: "질병력",
  SURGERY: "수술력",
  ALLERGY: "알러지",
  MEDICATION: "복용약",
};

const PAST_HISTORY_TYPE_ORDER: PastHistoryType[] = ["DISEASE", "SURGERY", "ALLERGY", "MEDICATION"];

export function sortPastHistoryRows(list: PastHistoryItem[]): PastHistoryItem[] {
  const order = (t: PastHistoryType) => PAST_HISTORY_TYPE_ORDER.indexOf(t);
  return [...list].sort((a, b) => {
    const d = order(a.historyType) - order(b.historyType);
    if (d !== 0) return d;
    return (a.id ?? 0) - (b.id ?? 0);
  });
}

export const MEDICATION_OPTIONS: { code: string; name: string }[] = [
  { code: "B00012345", name: "타이레놀정" },
  { code: "B00012346", name: "타이레놀에스정" },
  { code: "B00012347", name: "베타히스틴메실산염정 6mg" },
  { code: "B00012348", name: "이가탄정" },
  { code: "B00012349", name: "로키소펜정 400mg" },
  { code: "B00012350", name: "어린이타이레놀현탁액" },
  { code: "B00012351", name: "우루사캡슐 100mg" },
  { code: "B00012352", name: "가스디알정" },
  { code: "B00012353", name: "모드콜캡슐" },
  { code: "B00012354", name: "락트엘정" },
  { code: "B00012355", name: "메가마그정" },
  { code: "B00012356", name: "센시아민정" },
  { code: "B00012357", name: "베나코티연고 0.1%" },
  { code: "B00012358", name: "레보플록사신정 500mg" },
  { code: "B00012359", name: "아로나민골드캡슐" },
  { code: "B00012360", name: "게보린정" },
  { code: "B00012361", name: "쎄레콕스캡슐 200mg" },
  { code: "B00012362", name: "뉴론틴캡슐 300mg" },
  { code: "B00012363", name: "타베길정" },
  { code: "B00012364", name: "콘서타서방정 18mg" },
];
