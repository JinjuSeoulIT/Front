import { CLINICAL_API_BASE } from "../clinicalApiBase";

type ApiEnvelope<T> = { success?: boolean; message?: string | null; data?: T; result?: T };

async function parseJson<T>(res: Response): Promise<T> {
  const body = (await res.json()) as ApiEnvelope<T> | T;
  if (body && typeof body === "object" && ("data" in body || "result" in body))
    return ((body as ApiEnvelope<T>).data ?? (body as ApiEnvelope<T>).result) as T;
  return body as T;
}

export type DoctorNoteRes = {
  doctorNoteId: number;
  clinicalId: number;
  chiefComplaint?: string | null;
  presentIllness?: string | null;
  assessment?: string | null;
  clinicalMemo?: string | null;
  mainDxCode?: string | null;
  mainDxName?: string | null;
  writenAt?: string | null;
  status?: string | null;
};

export type DoctorNoteUpdatePayload = {
  chiefComplaint?: string | null;
  presentIllness?: string | null;
  assessment?: string | null;
  clinicalMemo?: string | null;
  mainDxCode?: string | null;
  mainDxName?: string | null;
};

export type DoctorNoteCreatePayload = DoctorNoteUpdatePayload & { doctorId?: number | null };

function noteBaseUrl(visitId: number): string {
  return `${CLINICAL_API_BASE}/api/visits/${visitId}/notes`;
}

function toNotePatchBody(payload: DoctorNoteUpdatePayload): Record<string, string | null | undefined> {
  return {
    chiefComplaint: payload.chiefComplaint,
    presentIllness: payload.presentIllness,
    assessment: payload.assessment,
    memo: payload.clinicalMemo,
  };
}

function mapDoctorNote(raw: Partial<DoctorNoteRes> & { noteId?: number; visitId?: number; memo?: string | null }): DoctorNoteRes {
  return {
    doctorNoteId: Number(raw.doctorNoteId ?? raw.noteId ?? 0),
    clinicalId: Number(raw.clinicalId ?? raw.visitId ?? 0),
    chiefComplaint: raw.chiefComplaint ?? null,
    presentIllness: raw.presentIllness ?? null,
    assessment: raw.assessment ?? null,
    clinicalMemo: raw.clinicalMemo ?? raw.memo ?? null,
    mainDxCode: raw.mainDxCode ?? null,
    mainDxName: raw.mainDxName ?? null,
    writenAt: raw.writenAt ?? null,
    status: raw.status ?? null,
  };
}

async function patchDoctorNoteApi(visitId: number, noteId: number, payload: DoctorNoteUpdatePayload): Promise<DoctorNoteRes> {
  const res = await fetch(`${noteBaseUrl(visitId)}/${noteId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(toNotePatchBody(payload)),
  });
  if (!res.ok)
    throw new Error(
      ((await res.json().catch(() => ({}))) as { message?: string })?.message ?? "진료기록 수정 실패"
    );
  const data = await parseJson<Partial<DoctorNoteRes> & { noteId?: number; visitId?: number; memo?: string | null }>(res);
  return mapDoctorNote(data);
}

export async function fetchDoctorNoteApi(visitId: number): Promise<DoctorNoteRes | null> {
  const res = await fetch(noteBaseUrl(visitId), { cache: "no-store" });
  if (!res.ok) return null;
  const data = await parseJson<(Partial<DoctorNoteRes> & { noteId?: number; visitId?: number; memo?: string | null }) | null>(res);
  return data ? mapDoctorNote(data) : null;
}

export async function createDoctorNoteApi(visitId: number, payload: DoctorNoteCreatePayload): Promise<DoctorNoteRes> {
  const res = await fetch(noteBaseUrl(visitId), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok)
    throw new Error(
      ((await res.json().catch(() => ({}))) as { message?: string })?.message ?? "진료기록 생성 실패"
    );
  const created = await parseJson<Partial<DoctorNoteRes> & { noteId?: number; visitId?: number; memo?: string | null }>(res);
  const noteId = Number(created?.noteId ?? created?.doctorNoteId);
  if (!Number.isFinite(noteId) || noteId <= 0) return mapDoctorNote(created);
  if (Object.keys(toNotePatchBody(payload)).length === 0) return mapDoctorNote(created);
  return patchDoctorNoteApi(visitId, noteId, payload);
}

export async function updateDoctorNoteApi(visitId: number, payload: DoctorNoteUpdatePayload): Promise<DoctorNoteRes> {
  const existing = await fetchDoctorNoteApi(visitId);
  if (!existing?.doctorNoteId) return createDoctorNoteApi(visitId, payload);
  return patchDoctorNoteApi(visitId, existing.doctorNoteId, payload);
}

export type DiagnosisDxSource = "PUBLIC_MASTER" | "MANUAL";

export type DiagnosisRes = {
  diagnosisId: number;
  clinicalId: number;
  dxCode?: string | null;
  dxName?: string | null;
  dxSource?: DiagnosisDxSource | string | null;
  mainYn?: string | null;
  sortOrder?: number | null;
};

export async function fetchDiagnosesApi(clinicalId: number): Promise<DiagnosisRes[]> {
  const res = await fetch(`${CLINICAL_API_BASE}/api/visits/${clinicalId}/diagnoses`, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await parseJson<DiagnosisRes[]>(res);
  return Array.isArray(data) ? data : [];
}

export async function addDiagnosisApi(
  clinicalId: number,
  payload: {
    dxCode?: string | null;
    dxName?: string | null;
    dxSource?: DiagnosisDxSource | null;
    main?: boolean;
  }
): Promise<DiagnosisRes> {
  const res = await fetch(`${CLINICAL_API_BASE}/api/visits/${clinicalId}/diagnoses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({})) as { message?: string })?.message ?? "진단 등록 실패");
  return parseJson<DiagnosisRes>(res);
}

export async function removeDiagnosisApi(clinicalId: number, diagnosisId: number): Promise<void> {
  const res = await fetch(`${CLINICAL_API_BASE}/api/visits/${clinicalId}/diagnoses/${diagnosisId}`, { method: "DELETE" });
  if (!res.ok) throw new Error("진단 삭제 실패");
}

export async function setDiagnosisMainApi(clinicalId: number, diagnosisId: number): Promise<DiagnosisRes> {
  const res = await fetch(
    `${CLINICAL_API_BASE}/api/visits/${clinicalId}/diagnoses/${diagnosisId}/main`,
    { method: "PATCH" }
  );
  if (!res.ok) throw new Error((await res.json().catch(() => ({})) as { message?: string })?.message ?? "주진단 변경 실패");
  return parseJson<DiagnosisRes>(res);
}

export async function reorderDiagnosesApi(clinicalId: number, diagnosisIds: number[]): Promise<void> {
  const res = await fetch(`${CLINICAL_API_BASE}/api/visits/${clinicalId}/diagnoses/order`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ diagnosisIds }),
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({})) as { message?: string })?.message ?? "순서 변경 실패");
}

export type PrescriptionRes = {
  prescriptionId: number;
  clinicalId: number;
  medicationName?: string | null;
  dosage?: string | null;
  days?: string | null;
};

export async function fetchPrescriptionsApi(clinicalId: number): Promise<PrescriptionRes[]> {
  const res = await fetch(`${CLINICAL_API_BASE}/api/visits/${clinicalId}/prescriptions`, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await parseJson<PrescriptionRes[]>(res);
  return Array.isArray(data) ? data : [];
}

export async function addPrescriptionApi(clinicalId: number, payload: { medicationName?: string | null; dosage?: string | null; days?: string | null }): Promise<PrescriptionRes> {
  const res = await fetch(`${CLINICAL_API_BASE}/api/visits/${clinicalId}/prescriptions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({})) as { message?: string })?.message ?? "처방 등록 실패");
  return parseJson<PrescriptionRes>(res);
}

export async function removePrescriptionApi(clinicalId: number, prescriptionId: number): Promise<void> {
  const res = await fetch(`${CLINICAL_API_BASE}/api/visits/${clinicalId}/prescriptions/${prescriptionId}`, { method: "DELETE" });
  if (!res.ok) throw new Error("처방 삭제 실패");
}

export async function seedSampleApi(clinicalId: number): Promise<string> {
  const res = await fetch(`${CLINICAL_API_BASE}/api/visits/${clinicalId}/seed-sample`, { method: "POST" });
  if (!res.ok) throw new Error((await res.json().catch(() => ({})) as { message?: string })?.message ?? "샘플 데이터 등록 실패");
  const data = await parseJson<{ data?: string } | string>(res);
  return typeof data === "string" ? data : (data as { data?: string })?.data ?? "완료";
}
