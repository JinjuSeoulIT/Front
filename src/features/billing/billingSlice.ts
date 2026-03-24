import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { BillSummary, BillDetail, Payment, BillingStats } from "@/lib/billing/billingApi";

interface FetchBillsByPatientPayload {
  patientId: number;
  status?: string;
}

interface BillingState {
  billingList: BillSummary[];
  billingDetail: BillDetail | null;
  payments: Payment[];
  billingStats: BillingStats | null;
  loading: boolean;
  error: string | null;
}

const initialState: BillingState = {
  billingList: [],
  billingDetail: null,
  payments: [],
  billingStats: null,
  loading: false,
  error: null,
};

const billingSlice = createSlice({
  name: "billing",
  initialState,
  reducers: {
    fetchBillsByPatientRequest(state, _action: PayloadAction<FetchBillsByPatientPayload>) {
      state.loading = true;
      state.error = null;
    },
    fetchBillingDetailRequest(state, _action: PayloadAction<number>) {
      state.loading = true;
      state.error = null;
    },
    createPaymentRequest(
      state,
      _action: PayloadAction<{ billId: number; amount: number; patientId: number }>
    ) {
      state.loading = true;
      state.error = null;
    },
    cancelPaymentRequest(
      state,
      _action: PayloadAction<{ paymentId: number; billId: number; patientId: number }>
    ) {
      state.loading = true;
      state.error = null;
    },
    refundPaymentRequest(
      state,
      _action: PayloadAction<{ paymentId: number; amount: number; billId: number; patientId: number }>
    ) {
      state.loading = true;
      state.error = null;
    },
    fetchBillingStatsRequest(state) {
      state.loading = true;
      state.error = null;
    },
    fetchPaymentsByBillRequest(state, _action: PayloadAction<number>) {
      state.loading = true;
      state.error = null;
    },
    fetchBillsRequest(state, _action: PayloadAction<string | null>) {
      state.loading = true;
      state.error = null;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    setBillingList(state, action: PayloadAction<BillSummary[]>) {
      state.billingList = action.payload;
    },
    setBillingDetail(state, action: PayloadAction<BillDetail | null>) {
      state.billingDetail = action.payload;
    },
    setBillingStats(state, action: PayloadAction<BillingStats | null>) {
      state.billingStats = action.payload;
    },
    setPayments(state, action: PayloadAction<Payment[]>) {
      state.payments = action.payload;
    },
  },
});

export const {
  fetchBillsByPatientRequest,
  fetchBillingDetailRequest,
  createPaymentRequest,
  cancelPaymentRequest,
  refundPaymentRequest,
  fetchBillingStatsRequest,
  fetchPaymentsByBillRequest,
  fetchBillsRequest,
  setLoading,
  setError,
  setBillingList,
  setBillingDetail,
  setBillingStats,
  setPayments,
} = billingSlice.actions;

export default billingSlice.reducer;
