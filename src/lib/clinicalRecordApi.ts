const CLINICAL_API_BASE =
  process.env.NEXT_PUBLIC_CLINICAL_API_BASE_URL ?? "http://192.168.1.70:8090";

type ApiEnvelope<T> = { success?: boolean; message?: string | null; data?: T; result?: T };

async function parseJson<T>(res: Response): Promise<T> {
  const body = (await res.json()) as ApiEnvelope<T> | T;
  if (body && typeof body === "object" && ("data" in body || "result" in body))
    return ((body as ApiEnvelope<T>).data ?? (body as ApiEnvelope<T>).result) as T;
  return body as T;
}

type NoteRaw = {
  noteId: number;
  visitId: number;
  chiefComplaint?: string | null;
  presentIllness?: string | null;
  assessment?: string | null;
  plan?: string | null;
  memo?: string | null;
  status?: string | null;
};

async function getNoteByVisit(visitId: number): Promise<NoteRaw | null> {
  const res = await fetch(`${CLINICAL_API_BASE}/api/visits/${visitId}/notes`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`진료기록 조회 실패 (${res.status})`);
  return parseJson<NoteRaw>(res);
}

async function ensureNote(visitId: number): Promise<NoteRaw> {
  let n = await getNoteByVisit(visitId);
  if (n) return n;
  const res = await fetch(`${CLINICAL_API_BASE}/api/visits/${visitId}/notes`, { method: "POST" });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(err?.message ?? `진료기록 생성 실패 (${res.status})`);
  }
  return parseJson<NoteRaw>(res);
}

function mapNoteToDoctor(n: NoteRaw): DoctorNoteRes {
  return {
    doctorNoteId: n.noteId,
    clinicalId: n.visitId,
    chiefComplaint: n.chiefComplaint,
    presentIllness: n.presentIllness,
    assessment: n.assessment,
    clinicalMemo: n.memo,
    status: n.status,
  };
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

export async function fetchDoctorNoteApi(visitId: number): Promise<DoctorNoteRes | null> {
  const n = await getNoteByVisit(visitId);
  return n ? mapNoteToDoctor(n) : null;
}

export async function createDoctorNoteApi(visitId: number, payload: DoctorNoteCreatePayload): Promise<DoctorNoteRes> {
  await ensureNote(visitId);
  return updateDoctorNoteApi(visitId, payload);
}

export async function updateDoctorNoteApi(visitId: number, payload: DoctorNoteUpdatePayload): Promise<DoctorNoteRes> {
  const n = await ensureNote(visitId);
  const body: Record<string, string> = {};
  if (payload.chiefComplaint !== undefined) body.chiefComplaint = payload.chiefComplaint ?? "";
  if (payload.presentIllness !== undefined) body.presentIllness = payload.presentIllness ?? "";
  if (payload.assessment !== undefined) body.assessment = payload.assessment ?? "";
  if (payload.clinicalMemo !== undefined) body.memo = payload.clinicalMemo ?? "";
  const res = await fetch(`${CLINICAL_API_BASE}/api/visits/${visitId}/notes/${n.noteId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(err?.message ?? "진료기록 수정 실패");
  }
  const updated = await parseJson<NoteRaw>(res);
  return mapNoteToDoctor(updated);
}

export type DiagnosisRes = {
  diagnosisId: number;
  clinicalId: number;
  dxCode?: string | null;
  dxName?: string | null;
  mainYn?: string | null;
};

type DiagnosisRaw = {
  diagnosisId: number;
  noteId: number;
  diagnosisCode?: string | null;
  description?: string | null;
};

export async function fetchDiagnosesApi(visitId: number): Promise<DiagnosisRes[]> {
  const n = await getNoteByVisit(visitId);
  if (!n) return [];
  const res = await fetch(`${CLINICAL_API_BASE}/api/notes/${n.noteId}/diagnosis`, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await parseJson<DiagnosisRaw[]>(res);
  const list = Array.isArray(data) ? data : [];
  return list.map((d) => ({
    diagnosisId: d.diagnosisId,
    clinicalId: visitId,
    dxCode: d.diagnosisCode,
    dxName: d.description,
  }));
}

export async function addDiagnosisApi(
  visitId: number,
  payload: { dxCode?: string | null; dxName?: string | null; main?: boolean }
): Promise<DiagnosisRes> {
  const n = await ensureNote(visitId);
  const res = await fetch(`${CLINICAL_API_BASE}/api/notes/${n.noteId}/diagnosis`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      diagnosisCode: payload.dxCode ?? "",
      description: payload.dxName ?? "",
    }),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(err?.message ?? "진단 등록 실패");
  }
  const d = await parseJson<DiagnosisRaw>(res);
  return {
    diagnosisId: d.diagnosisId,
    clinicalId: visitId,
    dxCode: d.diagnosisCode,
    dxName: d.description,
  };
}

export async function removeDiagnosisApi(_visitId: number, _diagnosisId: number): Promise<void> {
  throw new Error("진단 삭제는 서버 API가 없습니다.");
}

export type PrescriptionRes = {
  prescriptionId: number;
  clinicalId: number;
  medicationName?: string | null;
  dosage?: string | null;
  days?: string | null;
};

export async function fetchPrescriptionsApi(_visitId: number): Promise<PrescriptionRes[]> {
  return [];
}

export async function addPrescriptionApi(_visitId: number, _payload: unknown): Promise<PrescriptionRes> {
  throw new Error("처방 API가 서버에 없습니다.");
}

export async function removePrescriptionApi(_visitId: number, _prescriptionId: number): Promise<void> {
  throw new Error("처방 삭제 API가 서버에 없습니다.");
}

export async function seedSampleApi(_visitId: number): Promise<string> {
  throw new Error("샘플 데이터 API가 없습니다.");
}
