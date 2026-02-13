import { call, put, takeLatest } from "redux-saga/effects";
import type { PayloadAction } from "@reduxjs/toolkit";
import { receptionActions as actions } from "./ReceptionSlice";
import type { Reception, ReceptionForm, ReceptionSearchPayload } from "./ReceptionTypes";
import * as api from "../../lib/receptionsCrudApi";

function* fetchReceptionsSaga() {
  try {
    const list: Reception[] = yield call(api.fetchReceptionsApi);
    yield put(actions.fetchReceptionsSuccess(list));
  } catch (err: any) {
    yield put(actions.fetchReceptionsFailure(err.message ?? "접수 목록 조회 실패"));
  }
}

function* fetchReceptionSaga(action: PayloadAction<{ receptionId: string }>) {
  try {
    const p: Reception = yield call(api.fetchReceptionApi, action.payload.receptionId);
    yield put(actions.fetchReceptionSuccess(p));
  } catch (err: any) {
    yield put(actions.fetchReceptionFailure(err.message ?? "접수 조회 실패"));
  }
}

function* createReceptionSaga(action: PayloadAction<ReceptionForm>) {
  try {
    yield call(api.createReceptionApi, action.payload);
    yield put(actions.createReceptionSuccess());
    yield put(actions.fetchReceptionsRequest());
  } catch (err: any) {
    yield put(actions.createReceptionFailure(err.message ?? "접수 등록 실패"));
  }
}

function* updateReceptionSaga(
  action: PayloadAction<{ receptionId: string; form: ReceptionForm }>
) {
  try {
    yield call(
      api.updateReceptionApi,
      action.payload.receptionId,
      action.payload.form
    );
    yield put(actions.updateReceptionSuccess());
    yield put(actions.fetchReceptionsRequest());
  } catch (err: any) {
    yield put(actions.updateReceptionFailure(err.message ?? "접수 수정 실패"));
  }
}

function* deleteReceptionSaga(action: PayloadAction<string>) {
  try {
    yield call(api.cancelReceptionApi, action.payload);
    yield put(actions.deleteReceptionSuccess(action.payload));
  } catch (err: any) {
    yield put(actions.deleteReceptionFailure(err.message ?? "접수 취소 처리 실패"));
  }
}

function* cancelReceptionSaga(action: PayloadAction<{ receptionId: string; reasonText?: string }>) {
  try {
    const updated: Reception = yield call(
      api.cancelReceptionApi,
      action.payload.receptionId,
      action.payload.reasonText
    );
    yield put(actions.cancelReceptionSuccess(updated));
  } catch (err: any) {
    yield put(actions.cancelReceptionFailure(err.message ?? "접수 취소 처리 실패"));
  }
}

function* searchReceptionsSaga(action: PayloadAction<ReceptionSearchPayload>) {
  try {
    const { type, keyword } = action.payload;
    const list: Reception[] = yield call(api.searchReceptionsApi, type, keyword);
    yield put(actions.fetchReceptionsSuccess(list));
  } catch (err: any) {
    alert(err.message ?? "접수 검색 실패");
    yield put(actions.fetchReceptionsFailure(err.message ?? "접수 검색 실패"));
  }
}

export function* watchReceptionSaga() {
  yield takeLatest(actions.fetchReceptionsRequest.type, fetchReceptionsSaga);
  yield takeLatest(actions.fetchReceptionRequest.type, fetchReceptionSaga);
  yield takeLatest(actions.createReceptionRequest.type, createReceptionSaga);
  yield takeLatest(actions.updateReceptionRequest.type, updateReceptionSaga);
  yield takeLatest(actions.deleteReceptionRequest.type, deleteReceptionSaga);
  yield takeLatest(actions.cancelReceptionRequest.type, cancelReceptionSaga);
  yield takeLatest(actions.searchReceptionsRequest.type, searchReceptionsSaga);
}

