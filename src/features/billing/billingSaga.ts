import { call, put, takeLatest } from "redux-saga/effects";
import {
  fetchBillsByPatientApi,
  fetchBillDetailApi,
  createPaymentApi,
  cancelPaymentApi,
  fetchBillingStatsApi,
  fetchPaymentsByBillApi,
  refundPaymentApi,
  fetchBillsApi,
  type BillSummary,
  type BillDetail,
  type Payment,
  type BillingStats,
} from "@/lib/billingApi";
import {
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
  setPayments,
  setBillingStats,
} from "./billingSlice";

function* fetchBillsByPatientSaga(action: ReturnType<typeof fetchBillsByPatientRequest>) {
  try {
    yield put(setLoading(true));
    const result: BillSummary[] = yield call(
      fetchBillsByPatientApi,
      action.payload.patientId,
      action.payload.status
    );
    yield put(setBillingList(result));
  } catch (error: any) {
    console.error(error?.message || "청구 목록 조회 실패");
    yield put(setError(error?.message ?? "청구 목록 조회 실패"));
  } finally {
    yield put(setLoading(false));
  }
}

function* fetchBillsSaga(action: ReturnType<typeof fetchBillsRequest>) {
  try {
    yield put(setLoading(true));
    const result: BillSummary[] = yield call(fetchBillsApi, action.payload);
    yield put(setBillingList(result));
  } catch (error: any) {
    console.error(error?.message || "청구 목록 조회 실패");
    yield put(setError(error?.message ?? "청구 목록 조회 실패"));
  } finally {
    yield put(setLoading(false));
  }
}

function* fetchBillDetailSaga(action: ReturnType<typeof fetchBillingDetailRequest>) {
  try {
    yield put(setLoading(true));
    const result: BillDetail = yield call(fetchBillDetailApi, action.payload);
    yield put(setBillingDetail(result));
  } catch (error: any) {
    console.error(error?.message || "청구 상세 조회 실패");
    yield put(setError(error?.message ?? "청구 상세 조회 실패"));
  } finally {
    yield put(setLoading(false));
  }
}

function* fetchPaymentsByBillSaga(action: ReturnType<typeof fetchPaymentsByBillRequest>) {
  try {
    yield put(setLoading(true));
    const result: Payment[] = yield call(fetchPaymentsByBillApi, action.payload);
    yield put(setPayments(result));
  } catch (error: any) {
    console.error(error?.message || "결제 내역 조회 실패");
    yield put(setError(error?.message ?? "결제 내역 조회 실패"));
  } finally {
    yield put(setLoading(false));
  }
}

function* createPaymentSaga(action: ReturnType<typeof createPaymentRequest>) {
  try {
    yield put(setLoading(true));
    yield call(createPaymentApi, action.payload.billId, action.payload.amount);
    console.info("수납이 완료되었습니다.");
    yield put(fetchBillingDetailRequest(action.payload.billId));
    yield put(fetchPaymentsByBillRequest(action.payload.billId));
    yield put(fetchBillsByPatientRequest({ patientId: action.payload.patientId }));
    yield put(fetchBillingStatsRequest());
  } catch (error: any) {
    console.error(error?.message || "수납 처리 중 오류가 발생했습니다.");
    yield put(setError(error?.message ?? "수납 처리 중 오류"));
  } finally {
    yield put(setLoading(false));
  }
}

function* cancelPaymentSaga(action: ReturnType<typeof cancelPaymentRequest>) {
  try {
    yield put(setLoading(true));
    yield call(cancelPaymentApi, action.payload.paymentId);
    console.info("수납이 취소되었습니다.");
    yield put(fetchBillingDetailRequest(action.payload.billId));
    yield put(fetchPaymentsByBillRequest(action.payload.billId));
    yield put(fetchBillsByPatientRequest({ patientId: action.payload.patientId }));
    yield put(fetchBillingStatsRequest());
  } catch (error: any) {
    console.error(error?.message || "수납 취소 중 오류가 발생했습니다.");
    yield put(setError(error?.message ?? "수납 취소 중 오류"));
  } finally {
    yield put(setLoading(false));
  }
}

function* refundPaymentSaga(action: ReturnType<typeof refundPaymentRequest>) {
  try {
    yield put(setLoading(true));
    yield call(refundPaymentApi, action.payload.paymentId, action.payload.amount);
    console.info("환불이 완료되었습니다.");
    yield put(fetchBillingDetailRequest(action.payload.billId));
    yield put(fetchPaymentsByBillRequest(action.payload.billId));
    yield put(fetchBillsByPatientRequest({ patientId: action.payload.patientId }));
    yield put(fetchBillingStatsRequest());
  } catch (error: any) {
    console.error(error?.message || "환불 처리 중 오류가 발생했습니다.");
    yield put(setError(error?.message ?? "환불 처리 중 오류"));
  } finally {
    yield put(setLoading(false));
  }
}

function* fetchBillingStatsSaga() {
  try {
    yield put(setLoading(true));
    const result: BillingStats = yield call(fetchBillingStatsApi);
    yield put(setBillingStats(result));
  } catch (error: any) {
    console.error(error?.message || "수납 통계 조회 실패");
    yield put(setError(error?.message ?? "수납 통계 조회 실패"));
  } finally {
    yield put(setLoading(false));
  }
}

export default function* billingSaga() {
  yield takeLatest(fetchBillsByPatientRequest.type, fetchBillsByPatientSaga);
  yield takeLatest(fetchBillsRequest.type, fetchBillsSaga);
  yield takeLatest(fetchBillingDetailRequest.type, fetchBillDetailSaga);
  yield takeLatest(fetchPaymentsByBillRequest.type, fetchPaymentsByBillSaga);
  yield takeLatest(createPaymentRequest.type, createPaymentSaga);
  yield takeLatest(cancelPaymentRequest.type, cancelPaymentSaga);
  yield takeLatest(refundPaymentRequest.type, refundPaymentSaga);
  yield takeLatest(fetchBillingStatsRequest.type, fetchBillingStatsSaga);
}
