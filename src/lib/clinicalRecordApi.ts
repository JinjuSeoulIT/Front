const CLINICAL_API_BASE =
  process.env.NEXT_PUBLIC_CLINICAL_API_BASE_URL ?? "http://192.168.1.70:8090";

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

export async function fetchDoctorNoteApi(clinicalId: number): Promise<DoctorNoteRes | null> {
  const res = await fetch(`${CLINICAL_API_BASE}/api/clinicals/${clinicalId}/doctor-note`, { cache: "no-store" });
  if (!res.ok) return null;
  const data = await parseJson<DoctorNoteRes | null>(res);
  return data ?? null;
}

export async function createDoctorNoteApi(clinicalId: number, payload: DoctorNoteCreatePayload): Promise<DoctorNoteRes> {
  const res = await fetch(`${CLINICAL_API_BASE}/api/clinicals/${clinicalId}/doctor-note`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({})) as { message?: string })?.message ?? "진료기록 생성 실패");
  return parseJson<DoctorNoteRes>(res);
}

export async function updateDoctorNoteApi(clinicalId: number, payload: DoctorNoteUpdatePayload): Promise<DoctorNoteRes> {
  const res = await fetch(`${CLINICAL_API_BASE}/api/clinicals/${clinicalId}/doctor-note`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({})) as { message?: string })?.message ?? "진료기록 수정 실패");
  return parseJson<DoctorNoteRes>(res);
}

export type DiagnosisRes = {
  diagnosisId: number;
  clinicalId: number;
  dxCode?: string | null;
  dxName?: string | null;
  mainYn?: string | null;
};

export async function fetchDiagnosesApi(clinicalId: number): Promise<DiagnosisRes[]> {
  const res = await fetch(`${CLINICAL_API_BASE}/api/clinicals/${clinicalId}/diagnoses`, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await parseJson<DiagnosisRes[]>(res);
  return Array.isArray(data) ? data : [];
}

export async function addDiagnosisApi(clinicalId: number, payload: { dxCode?: string | null; dxName?: string | null; main?: boolean }): Promise<DiagnosisRes> {
  const res = await fetch(`${CLINICAL_API_BASE}/api/clinicals/${clinicalId}/diagnoses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({})) as { message?: string })?.message ?? "진단 등록 실패");
  return parseJson<DiagnosisRes>(res);
}

export async function removeDiagnosisApi(clinicalId: number, diagnosisId: number): Promise<void> {
  const res = await fetch(`${CLINICAL_API_BASE}/api/clinicals/${clinicalId}/diagnoses/${diagnosisId}`, { method: "DELETE" });
  if (!res.ok) throw new Error("진단 삭제 실패");
}

export type PrescriptionRes = {
  prescriptionId: number;
  clinicalId: number;
  medicationName?: string | null;
  dosage?: string | null;
  days?: string | null;
};

export async function fetchPrescriptionsApi(clinicalId: number): Promise<PrescriptionRes[]> {
  const res = await fetch(`${CLINICAL_API_BASE}/api/clinicals/${clinicalId}/prescriptions`, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await parseJson<PrescriptionRes[]>(res);
  return Array.isArray(data) ? data : [];
}

export async function addPrescriptionApi(clinicalId: number, payload: { medicationName?: string | null; dosage?: string | null; days?: string | null }): Promise<PrescriptionRes> {
  const res = await fetch(`${CLINICAL_API_BASE}/api/clinicals/${clinicalId}/prescriptions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({})) as { message?: string })?.message ?? "처방 등록 실패");
  return parseJson<PrescriptionRes>(res);
}

export async function removePrescriptionApi(clinicalId: number, prescriptionId: number): Promise<void> {
  const res = await fetch(`${CLINICAL_API_BASE}/api/clinicals/${clinicalId}/prescriptions/${prescriptionId}`, { method: "DELETE" });
  if (!res.ok) throw new Error("처방 삭제 실패");
}

export async function seedSampleApi(clinicalId: number): Promise<string> {
  const res = await fetch(`${CLINICAL_API_BASE}/api/clinicals/${clinicalId}/seed-sample`, { method: "POST" });
  if (!res.ok) throw new Error((await res.json().catch(() => ({})) as { message?: string })?.message ?? "샘플 데이터 등록 실패");
  const data = await parseJson<{ data?: string } | string>(res);
  return typeof data === "string" ? data : (data as { data?: string })?.data ?? "완료";
}
