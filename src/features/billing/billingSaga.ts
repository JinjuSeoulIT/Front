import { call, put, takeLatest } from "redux-saga/effects";
import toast from "react-hot-toast";

import {
  fetchBillsByPatientApi,
  fetchBillDetailApi,
  createPaymentApi,
  confirmBillApi,
  cancelPaymentApi,
  fetchBillingStatsApi,
  fetchPaymentsByBillApi,
  refundPaymentApi,

  fetchBillsApi,

  BillSummary,
  BillDetail,
  Payment,
  BillingStats,
  fetchOutstandingBillsApi,
} from "@/lib/billing/billingApi";

import {
  fetchBillsByPatientRequest,
  fetchBillingDetailRequest,
  createPaymentRequest,
  confirmBillRequest,
  cancelPaymentRequest,
  refundPaymentRequest,
  fetchBillingStatsRequest,
  fetchPaymentsByBillRequest,
  fetchBillsRequest,
  fetchOutstandingBillsRequest,
  setLoading,
  setError,
  setBillingList,
  setBillingDetail,
  setPayments,
  setBillingStats,
} from "./billingSlice";


// 환자 기준 청구 목록 조회
function* fetchBillsByPatientSaga(
  action: ReturnType<typeof fetchBillsByPatientRequest>
) {
  try {
    yield put(setLoading(true));

    const result: BillSummary[] = yield call(
      fetchBillsByPatientApi,
      action.payload.patientId,
      action.payload.status
    );

    yield put(setBillingList(result));
  } catch (error: any) {
    toast.error(error.message || "청구 목록 조회 실패");
    yield put(setError(error.message));
  } finally {
    yield put(setLoading(false));
  }
}


//전체 청구 목록 조회 Saga 
function* fetchBillsSaga(
  action: ReturnType<typeof fetchBillsRequest>
) {
  try {

    yield put(setLoading(true));

    const result: BillSummary[] = yield call(
      fetchBillsApi,
      action.payload
    );

    yield put(setBillingList(result));

  } catch (error: any) {

    toast.error(error.message || "청구 목록 조회 실패");
    yield put(setError(error.message));

  } finally {

    yield put(setLoading(false));

  }
}


// 청구 상세 조회
function* fetchBillDetailSaga(
  action: ReturnType<typeof fetchBillingDetailRequest>
) {
  try {
    yield put(setLoading(true));

    const result: BillDetail = yield call(
      fetchBillDetailApi,
      action.payload
    );

    yield put(setBillingDetail(result));
  } catch (error: any) {
    toast.error(error.message || "청구 상세 조회 실패");
    yield put(setError(error.message));
  } finally {
    yield put(setLoading(false));
  }
}


// 청구 기준 결제 내역 조회
function* fetchPaymentsByBillSaga(
  action: ReturnType<typeof fetchPaymentsByBillRequest>
) {
  try {
    yield put(setLoading(true));

    const result: Payment[] = yield call(
      fetchPaymentsByBillApi,
      action.payload
    );

    yield put(setPayments(result));
  } catch (error: any) {
    toast.error(error.message || "결제 내역 조회 실패");
    yield put(setError(error.message));
  } finally {
    yield put(setLoading(false));
  }
}

//미수금 
function* fetchOutstandingBillsSaga() {
  try {
    yield put(setLoading(true));
    const data: BillSummary[] = yield call(fetchOutstandingBillsApi);
    yield put(setBillingList(data));
  } catch (error: any) {
    toast.error(error.message || "미수금 조회 실패");
    yield put(setError(error.message));
  } finally {
    yield put(setLoading(false)); 

  }
}

// 결제 생성
function* createPaymentSaga(
  action: ReturnType<typeof createPaymentRequest>
) {
  try {
    yield put(setLoading(true));

    yield call(
      createPaymentApi,
      action.payload.billId,
      action.payload.amount,
      action.payload.method
    );

    toast.success("수납이 완료되었습니다.");

    yield put(fetchBillingDetailRequest(action.payload.billId));
    yield put(fetchPaymentsByBillRequest(action.payload.billId));

    yield put(fetchBillsByPatientRequest({
       patientId: action.payload.patientId }));

    yield put(fetchBillingStatsRequest());

  } catch (error: any) {
    toast.error(error.message || "수납 처리 중 오류가 발생했습니다.");
    yield put(setError(error.message));
  } finally {
    yield put(setLoading(false));
  }
}


// 수납 취소
function* cancelPaymentSaga(
  action: ReturnType<typeof cancelPaymentRequest>
) {
  try {
    yield put(setLoading(true));

    yield call(
      cancelPaymentApi,
      action.payload.paymentId
    );

    toast.success("수납이 취소되었습니다.");

    yield put(fetchBillingDetailRequest(action.payload.billId));
    yield put(fetchPaymentsByBillRequest(action.payload.billId));

    yield put(fetchBillsByPatientRequest({ patientId: action.payload.patientId }));

    yield put(fetchBillingStatsRequest());

  } catch (error: any) {
    toast.error(error.message || "수납 취소 중 오류가 발생했습니다.");
    yield put(setError(error.message));
  } finally {
    yield put(setLoading(false));
  }
}


// 부분 환불
function* refundPaymentSaga(
  action: ReturnType<typeof refundPaymentRequest>
) {
  try {
    yield put(setLoading(true));

    yield call(
      refundPaymentApi,
      action.payload.paymentId,
      action.payload.amount
    );

    toast.success("환불이 완료되었습니다.");

    yield put(fetchBillingDetailRequest(action.payload.billId));
    yield put(fetchPaymentsByBillRequest(action.payload.billId));

    yield put(fetchBillsByPatientRequest({ patientId: action.payload.patientId }));

    yield put(fetchBillingStatsRequest());

  } catch (error: any) {
    toast.error(error.message || "환불 처리 중 오류가 발생했습니다.");
    yield put(setError(error.message));
  } finally {
    yield put(setLoading(false));
  }
}


function* confirmBillSaga(
  action: ReturnType<typeof confirmBillRequest>
) {
  try {
    yield put(setLoading(true));

    yield call(confirmBillApi, action.payload);

    toast.success("청구가 확정되었습니다.");

    yield put(fetchBillingDetailRequest(action.payload));

  } catch (error: any) {
    toast.error(error.message || "청구 확정 실패");
    yield put(setError(error.message));
  } finally {
    yield put(setLoading(false));
  }
}


// 수납 통계 조회
function* fetchBillingStatsSaga() {
  try {
    yield put(setLoading(true));

    const result: BillingStats = yield call(
      fetchBillingStatsApi
    );

    yield put(setBillingStats(result));

  } catch (error: any) {
    toast.error(error.message || "수납 통계 조회 실패");
    yield put(setError(error.message));
  } finally {
    yield put(setLoading(false));
  }
}


// Watcher
export default function* billingSaga() {

  yield takeLatest(
    fetchBillsByPatientRequest.type,
    fetchBillsByPatientSaga
  );

  yield takeLatest(
    fetchBillsRequest.type,
    fetchBillsSaga
  );

  yield takeLatest(
    fetchBillingDetailRequest.type,
    fetchBillDetailSaga
  );

  yield takeLatest(
    fetchPaymentsByBillRequest.type,
    fetchPaymentsByBillSaga
  );

  yield takeLatest(
  fetchOutstandingBillsRequest.type,
    fetchOutstandingBillsSaga
  );

  yield takeLatest(
    createPaymentRequest.type,
    createPaymentSaga
  );

  yield takeLatest(
    cancelPaymentRequest.type,
    cancelPaymentSaga
  );

  yield takeLatest(
    refundPaymentRequest.type,
    refundPaymentSaga
  );

  yield takeLatest(
    fetchBillingStatsRequest.type,
    fetchBillingStatsSaga
  );

  yield takeLatest(
  confirmBillRequest.type,
  confirmBillSaga
);
}

