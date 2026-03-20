import axios from "axios";
import { applyAuthInterceptors } from "@/lib/auth/apiInterceptors";

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  result: T;
}

<<<<<<< HEAD
const api = axios.create({
  baseURL: "",
=======
/**
 결제 수단 타입 정의
 */
export type PaymentMethod = "CASH" | "CARD" | "TRANSFER";

const baseURL =
  typeof window !== "undefined" &&
  window.location.hostname !== "localhost"
    ? `http://${window.location.hostname}:8081`
    : "http://localhost:8081";

const api = axios.create({
  baseURL,
>>>>>>> feature/billing
});

applyAuthInterceptors(api);

export interface BillSummary {
  billId: number;
  patientId: number;
  treatmentDate: string;
  totalAmount: number;
  status: string;
}

export interface BillDetail {
  billId: number;
  patientId: number;
  treatmentDate: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: string;
}

export interface Payment {
  paymentId: number;
  billId: number;
  paymentAmount: number;
  status: string;
  method: string;
  paidAt: string;
}

export interface BillingStats {
  readyCount: number;
  confirmedCount: number;
  paidCount: number;
  todayCompletedAmount: number;
  todayRefundedAmount: number;
  totalCompletedAmount: number;
  totalRefundedAmount: number;
  todayNetAmount: number;
  totalNetAmount: number;
}

export const fetchBillsByPatientApi = async (
  patientId: number,
  status?: string
): Promise<BillSummary[]> => {
  const res = await api.get<ApiResponse<BillSummary[]>>(
    `/api/billing/patients/${patientId}/bills`,
    { params: { status } }
  );

  if (!res.data.success) {
    throw new Error(res.data.message || "청구 목록 조회 실패");
  }
  return res.data.result;
};

export const fetchBillsApi = async (status: string | null): Promise<BillSummary[]> => {
  const res = await api.get<ApiResponse<BillSummary[]>>(`/api/billing/bills`, {
    params: { status },
  });

  if (!res.data.success) {
    throw new Error(res.data.message || "전체 청구 목록 조회 실패");
  }
  return res.data.result;
};

export const fetchBillDetailApi = async (billId: number): Promise<BillDetail> => {
  const res = await api.get<ApiResponse<BillDetail>>(`/api/billing/bills/${billId}`);

  if (!res.data.success) {
    throw new Error(res.data.message || "청구 상세 조회 실패");
  }
  return res.data.result;
};

export const fetchPaymentsByBillApi = async (billId: number): Promise<Payment[]> => {
  const res = await api.get<ApiResponse<Payment[]>>(`/api/billing/payments/bill/${billId}`);

  if (!res.data.success) {
    throw new Error(res.data.message || "결제 내역 조회 실패");
  }
  return res.data.result;
};

export const createPaymentApi = async (
  billId: number,
  amount: number
): Promise<Payment> => {
  const res = await api.post<ApiResponse<Payment>>(`/api/billing/payments`, null, {
    params: { billId, amount },
  });

  if (!res.data.success) {
    throw new Error(res.data.message || "수납 실패");
  }
  return res.data.result;
};

export const cancelPaymentApi = async (paymentId: number): Promise<void> => {
  const res = await api.patch<ApiResponse<null>>(`/api/billing/payments/${paymentId}/cancel`);

  if (!res.data.success) {
    throw new Error(res.data.message || "수납 취소 실패");
  }
};

export const refundPaymentApi = async (
  paymentId: number,
  amount: number
): Promise<Payment> => {
  const res = await api.patch<ApiResponse<Payment>>(
    `/api/billing/payments/${paymentId}/refund`,
    null,
    { params: { amount } }
  );

  if (!res.data.success) {
    throw new Error(res.data.message || "환불 실패");
  }
  return res.data.result;
};

export const fetchBillingStatsApi = async (): Promise<BillingStats> => {
  const res = await api.get<ApiResponse<BillingStats>>(`/api/billing/stats`);

  if (!res.data.success) {
    throw new Error(res.data.message || "수납 통계 조회 실패");
  }
  return res.data.result;
};
