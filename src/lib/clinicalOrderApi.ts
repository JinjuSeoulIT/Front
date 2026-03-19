const CLINICAL_API_BASE =
  process.env.NEXT_PUBLIC_CLINICAL_API_BASE_URL ?? "http://192.168.1.70:8090";

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

export const ORDER_STATUSES = ["REQUESTED", "REQUEST", "IN_PROGRESS", "COMPLETED", "CANCELLED"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

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

type OrderItemRaw = { itemName?: string | null; itemCode?: string | null };
type OrderRaw = {
  orderId: number;
  visitId: number;
  clinicalId?: number;
  orderType?: string | null;
  orderStatus?: string | null;
  items?: OrderItemRaw[] | null;
};

function mapOrderToClinical(o: OrderRaw): ClinicalOrder {
  const vid = o.visitId ?? o.clinicalId ?? 0;
  const orderType = (o.orderType ?? "BLOOD") as string;
  const orderName = o.items?.[0]?.itemName ?? o.items?.[0]?.itemCode ?? orderType;
  const t =
    orderType === "BLOOD" || orderType === "IMAGING" || orderType === "PROCEDURE" ? orderType : "BLOOD";
  return {
    id: o.orderId,
    clinicalId: vid,
    orderType: t as LabOrderType,
    orderName: orderName || t,
    status: o.orderStatus ?? null,
  };
}

export async function fetchClinicalOrdersApi(visitId: number): Promise<ClinicalOrder[]> {
  const res = await fetch(`${CLINICAL_API_BASE}/api/visits/${visitId}/orders`, { cache: "no-store" });
  if (!res.ok) {
    if (res.status === 404) return [];
    throw new Error(`검사 오더 조회 실패 (${res.status})`);
  }
  const value = await parseJson<OrderRaw[]>(res);
  const list = Array.isArray(value) ? value : [];
  return list.map(mapOrderToClinical);
}

export async function createClinicalOrderApi(
  visitId: number,
  payload: ClinicalOrderCreatePayload
): Promise<ClinicalOrder> {
  const body = {
    orderType: payload.orderType,
    items: [{ itemCode: payload.orderCode ?? payload.orderType, itemName: payload.orderName }],
  };
  const res = await fetch(`${CLINICAL_API_BASE}/api/visits/${visitId}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(err?.message ?? `검사 오더 등록 실패 (${res.status})`);
  }
  const value = await parseJson<OrderRaw>(res);
  return mapOrderToClinical(value as OrderRaw);
}

export async function updateClinicalOrderStatusApi(
  visitId: number,
  orderId: number,
  status: OrderStatus
): Promise<ClinicalOrder> {
  const res = await fetch(`${CLINICAL_API_BASE}/api/visits/${visitId}/orders/${orderId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderStatus: status }),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(err?.message ?? `검사 상태 변경 실패 (${res.status})`);
  }
  const value = await parseJson<OrderRaw>(res);
  return mapOrderToClinical(value as OrderRaw);
}
