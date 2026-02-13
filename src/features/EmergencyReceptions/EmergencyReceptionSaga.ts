import { call, put, takeLatest } from "redux-saga/effects";
import type { PayloadAction } from "@reduxjs/toolkit";
import { emergencyReceptionActions as actions } from "./EmergencyReceptionSlice";
import type {
  EmergencyReception,
  EmergencyReceptionForm,
  EmergencyReceptionSearchPayload,
} from "./EmergencyReceptionTypes";
import * as api from "../../lib/emergencyReceptionApi";

function* fetchEmergencyReceptionsSaga() {
  try {
    const list: EmergencyReception[] = yield call(api.fetchEmergencyReceptionsApi);
    yield put(actions.fetchEmergencyReceptionsSuccess(list));
  } catch (err: any) {
    yield put(actions.fetchEmergencyReceptionsFailure(err.message ?? "응급 접수 목록 조회 실패"));
  }
}

function* fetchEmergencyReceptionSaga(action: PayloadAction<{ receptionId: string }>) {
  try {
    const p: EmergencyReception = yield call(
      api.fetchEmergencyReceptionApi,
      action.payload.receptionId
    );
    yield put(actions.fetchEmergencyReceptionSuccess(p));
  } catch (err: any) {
    yield put(actions.fetchEmergencyReceptionFailure(err.message ?? "응급 접수 조회 실패"));
  }
}

function* createEmergencyReceptionSaga(action: PayloadAction<EmergencyReceptionForm>) {
  try {
    yield call(api.createEmergencyReceptionApi, action.payload);
    yield put(actions.createEmergencyReceptionSuccess());
    yield put(actions.fetchEmergencyReceptionsRequest());
  } catch (err: any) {
    yield put(actions.createEmergencyReceptionFailure(err.message ?? "응급 접수 등록 실패"));
  }
}

function* updateEmergencyReceptionSaga(
  action: PayloadAction<{ receptionId: string; form: EmergencyReceptionForm }>
) {
  try {
    yield call(
      api.updateEmergencyReceptionApi,
      action.payload.receptionId,
      action.payload.form
    );
    yield put(actions.updateEmergencyReceptionSuccess());
    yield put(actions.fetchEmergencyReceptionsRequest());
  } catch (err: any) {
    yield put(actions.updateEmergencyReceptionFailure(err.message ?? "응급 접수 수정 실패"));
  }
}

function* searchEmergencyReceptionsSaga(
  action: PayloadAction<EmergencyReceptionSearchPayload>
) {
  try {
    const { type, keyword } = action.payload;
    const list: EmergencyReception[] = yield call(
      api.searchEmergencyReceptionsApi,
      type,
      keyword
    );
    yield put(actions.fetchEmergencyReceptionsSuccess(list));
  } catch (err: any) {
    alert(err.message ?? "응급 접수 검색 실패");
    yield put(actions.fetchEmergencyReceptionsFailure(err.message ?? "응급 접수 검색 실패"));
  }
}

export function* watchEmergencyReceptionSaga() {
  yield takeLatest(actions.fetchEmergencyReceptionsRequest.type, fetchEmergencyReceptionsSaga);
  yield takeLatest(actions.fetchEmergencyReceptionRequest.type, fetchEmergencyReceptionSaga);
  yield takeLatest(actions.createEmergencyReceptionRequest.type, createEmergencyReceptionSaga);
  yield takeLatest(actions.updateEmergencyReceptionRequest.type, updateEmergencyReceptionSaga);
  yield takeLatest(actions.searchEmergencyReceptionsRequest.type, searchEmergencyReceptionsSaga);
}
