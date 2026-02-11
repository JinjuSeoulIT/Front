import { all, call, put, takeLatest } from "redux-saga/effects";
import { receptionActions as actions } from "./receptionSlice";
import { fetchVisitsApi, type VisitRes } from "@/lib/receptionApi";
import {
  fetchVisitReservationApi,
  saveVisitReservationApi,
  deleteVisitReservationApi,
  type VisitReservation,
  type VisitReservationPayload,
} from "@/lib/reservationApi";
import {
  fetchVisitEmergencyApi,
  saveVisitEmergencyApi,
  deleteVisitEmergencyApi,
  type VisitEmergency,
  type VisitEmergencyPayload,
} from "@/lib/emergencyApi";
import {
  fetchVisitInpatientApi,
  saveVisitInpatientApi,
  deleteVisitInpatientApi,
  type VisitInpatient,
  type VisitInpatientPayload,
} from "@/lib/inpatientApi";

function* fetchVisitsSaga() {
  try {
    const list: VisitRes[] = yield call(fetchVisitsApi);
    yield put(actions.fetchVisitsSuccess(list));
  } catch (err: any) {
    yield put(actions.fetchVisitsFailure(err.message ?? "접수 목록 조회 실패"));
  }
}

function* fetchReservationSaga(action: {
  payload: { visitId: number };
  type: string;
}) {
  try {
    const data: VisitReservation | null = yield call(
      fetchVisitReservationApi,
      action.payload.visitId
    );
    yield put(actions.fetchReservationSuccess({ visitId: action.payload.visitId, data }));
  } catch (err: any) {
    yield put(
      actions.fetchReservationFailure({
        visitId: action.payload.visitId,
        error: err.message ?? "예약 정보 조회 실패",
      })
    );
  }
}

function* saveReservationSaga(action: {
  payload: { visitId: number; payload: VisitReservationPayload };
  type: string;
}) {
  try {
    const data: VisitReservation = yield call(
      saveVisitReservationApi,
      action.payload.visitId,
      action.payload.payload
    );
    yield put(actions.saveReservationSuccess({ visitId: action.payload.visitId, data }));
  } catch (err: any) {
    yield put(
      actions.saveReservationFailure({
        visitId: action.payload.visitId,
        error: err.message ?? "예약 저장 실패",
      })
    );
  }
}

function* deleteReservationSaga(action: {
  payload: { visitId: number };
  type: string;
}) {
  try {
    yield call(deleteVisitReservationApi, action.payload.visitId);
    yield put(actions.deleteReservationSuccess({ visitId: action.payload.visitId }));
  } catch (err: any) {
    yield put(
      actions.deleteReservationFailure({
        visitId: action.payload.visitId,
        error: err.message ?? "예약 삭제 실패",
      })
    );
  }
}

function* fetchEmergencySaga(action: {
  payload: { visitId: number };
  type: string;
}) {
  try {
    const data: VisitEmergency | null = yield call(
      fetchVisitEmergencyApi,
      action.payload.visitId
    );
    yield put(actions.fetchEmergencySuccess({ visitId: action.payload.visitId, data }));
  } catch (err: any) {
    yield put(
      actions.fetchEmergencyFailure({
        visitId: action.payload.visitId,
        error: err.message ?? "응급 정보 조회 실패",
      })
    );
  }
}

function* saveEmergencySaga(action: {
  payload: { visitId: number; payload: VisitEmergencyPayload };
  type: string;
}) {
  try {
    const data: VisitEmergency = yield call(
      saveVisitEmergencyApi,
      action.payload.visitId,
      action.payload.payload
    );
    yield put(actions.saveEmergencySuccess({ visitId: action.payload.visitId, data }));
  } catch (err: any) {
    yield put(
      actions.saveEmergencyFailure({
        visitId: action.payload.visitId,
        error: err.message ?? "응급 저장 실패",
      })
    );
  }
}

function* deleteEmergencySaga(action: {
  payload: { visitId: number };
  type: string;
}) {
  try {
    yield call(deleteVisitEmergencyApi, action.payload.visitId);
    yield put(actions.deleteEmergencySuccess({ visitId: action.payload.visitId }));
  } catch (err: any) {
    yield put(
      actions.deleteEmergencyFailure({
        visitId: action.payload.visitId,
        error: err.message ?? "응급 삭제 실패",
      })
    );
  }
}

function* fetchInpatientSaga(action: {
  payload: { visitId: number };
  type: string;
}) {
  try {
    const data: VisitInpatient | null = yield call(
      fetchVisitInpatientApi,
      action.payload.visitId
    );
    yield put(actions.fetchInpatientSuccess({ visitId: action.payload.visitId, data }));
  } catch (err: any) {
    yield put(
      actions.fetchInpatientFailure({
        visitId: action.payload.visitId,
        error: err.message ?? "입원 정보 조회 실패",
      })
    );
  }
}

function* saveInpatientSaga(action: {
  payload: { visitId: number; payload: VisitInpatientPayload };
  type: string;
}) {
  try {
    const data: VisitInpatient = yield call(
      saveVisitInpatientApi,
      action.payload.visitId,
      action.payload.payload
    );
    yield put(actions.saveInpatientSuccess({ visitId: action.payload.visitId, data }));
  } catch (err: any) {
    yield put(
      actions.saveInpatientFailure({
        visitId: action.payload.visitId,
        error: err.message ?? "입원 저장 실패",
      })
    );
  }
}

function* deleteInpatientSaga(action: {
  payload: { visitId: number };
  type: string;
}) {
  try {
    yield call(deleteVisitInpatientApi, action.payload.visitId);
    yield put(actions.deleteInpatientSuccess({ visitId: action.payload.visitId }));
  } catch (err: any) {
    yield put(
      actions.deleteInpatientFailure({
        visitId: action.payload.visitId,
        error: err.message ?? "입원 삭제 실패",
      })
    );
  }
}

export function* watchReceptionSaga() {
  yield all([
    takeLatest(actions.fetchVisitsRequest.type, fetchVisitsSaga),
    takeLatest(actions.fetchReservationRequest.type, fetchReservationSaga),
    takeLatest(actions.saveReservationRequest.type, saveReservationSaga),
    takeLatest(actions.deleteReservationRequest.type, deleteReservationSaga),
    takeLatest(actions.fetchEmergencyRequest.type, fetchEmergencySaga),
    takeLatest(actions.saveEmergencyRequest.type, saveEmergencySaga),
    takeLatest(actions.deleteEmergencyRequest.type, deleteEmergencySaga),
    takeLatest(actions.fetchInpatientRequest.type, fetchInpatientSaga),
    takeLatest(actions.saveInpatientRequest.type, saveInpatientSaga),
    takeLatest(actions.deleteInpatientRequest.type, deleteInpatientSaga),
  ]);
}
