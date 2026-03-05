const CLINICAL_API_BASE =
  process.env.NEXT_PUBLIC_CLINICAL_API_BASE_URL ?? "http://localhost:8090";

export type LabOrderType = "BLOOD" | "IMAGING" | "PROCEDURE";

export type ClinicalOrder = {
  id: number;
  clinicalId: number;
  orderType: LabOrderType;
  orderCode?: string | null;
  orderName: string;
  status?: string | null;
  createdAt?: string | null;
};

export type ClinicalOrderCreatePayload = {
  orderType: LabOrderType;
  orderCode?: string | null;
  orderName: string;
};

type ApiEnvelope<T> = {
  success?: boolean;
  message?: string | null;
  data?: T;
  result?: T;
};

async function parseJson<T>(res: Response): Promise<T> {
  const body = (await res.json()) as ApiEnvelope<T> | T;
  if (Array.isArray(body)) return body as T;
  if (body && typeof body === "object" && ("data" in body || "result" in body)) {
    const v = (body as ApiEnvelope<T>).data ?? (body as ApiEnvelope<T>).result;
    return v as T;
  }
  return body as T;
}

export async function fetchClinicalOrdersApi(
  clinicalId: number
): Promise<ClinicalOrder[]> {
  const res = await fetch(
    `${CLINICAL_API_BASE}/api/clinicals/${clinicalId}/orders`,
    { cache: "no-store" }
  );
  if (!res.ok) {
    if (res.status === 404) return [];
    throw new Error(`검사 오더 조회 실패 (${res.status})`);
  }
  const value = await parseJson<ClinicalOrder[]>(res);
  return Array.isArray(value) ? value : [];
}

export async function createClinicalOrderApi(
  clinicalId: number,
  payload: ClinicalOrderCreatePayload
): Promise<ClinicalOrder> {
  const res = await fetch(
    `${CLINICAL_API_BASE}/api/clinicals/${clinicalId}/orders`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { message?: string };
    throw new Error(body?.message ?? `검사 오더 등록 실패 (${res.status})`);
  }
  const value = await parseJson<ClinicalOrder>(res);
  return value as ClinicalOrder;
}
