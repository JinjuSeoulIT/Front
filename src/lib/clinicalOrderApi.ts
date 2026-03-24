import { CLINICAL_API_BASE } from "./clinicalApiBase";

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
};

type OrderItemRaw = { itemName?: string | null; itemCode?: string | null };
type OrderRaw = {
  orderId: number;
  clinicalId: number;
  orderType?: string | null;
  orderStatus?: string | null;
  items?: OrderItemRaw[] | null;
};

function mapOrderToClinical(o: OrderRaw): ClinicalOrder {
  const orderType = (o.orderType ?? "BLOOD") as LabOrderType;
  const orderName = o.items?.[0]?.itemName ?? o.items?.[0]?.itemCode ?? orderType;
  return {
    id: o.orderId,
    clinicalId: o.clinicalId,
    orderType: orderType === "BLOOD" || orderType === "IMAGING" || orderType === "PROCEDURE" ? orderType : "BLOOD",
    orderName: orderName || orderType,
    status: o.orderStatus ?? null,
  };
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
  const value = await parseJson<OrderRaw[]>(res);
  const list = Array.isArray(value) ? value : [];
  return list.map(mapOrderToClinical);
}

export async function createClinicalOrderApi(
  clinicalId: number,
  payload: ClinicalOrderCreatePayload
): Promise<ClinicalOrder> {
  const body = {
    orderType: payload.orderType,
    items: [{ itemCode: payload.orderCode ?? payload.orderType, itemName: payload.orderName }],
  };
  const res = await fetch(
    `${CLINICAL_API_BASE}/api/clinicals/${clinicalId}/orders`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { message?: string };
    throw new Error(body?.message ?? `검사 오더 등록 실패 (${res.status})`);
  }
  const value = await parseJson<OrderRaw>(res);
  return mapOrderToClinical(value as OrderRaw);
}
export async function updateClinicalOrderStatusApi(
  clinicalId: number,
  orderId: number,
  status: OrderStatus
): Promise<ClinicalOrder> {
  const res = await fetch(
    `${CLINICAL_API_BASE}/api/clinicals/${clinicalId}/orders/${orderId}/status`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    }
  );
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { message?: string };
    throw new Error(body?.message ?? `검사 상태 변경 실패 (${res.status})`);
  }
  const value = await parseJson<OrderRaw>(res);
  return mapOrderToClinical(value as OrderRaw);
}
