import { call, put, takeLatest } from "redux-saga/effects";
import type { PayloadAction } from "@reduxjs/toolkit";
import {
  createRecordApi,
  deleteRecordApi,
  fetchRecordApi,
  fetchRecordsApi,
  searchRecordApi,
  type NursingRecordCreatePayload,
  type NursingRecordUpdatePayload,
  updateRecordApi,
} from "@/lib/medical-support/recordApi";
import {
  createRecordFailure,
  createRecordRequest,
  createRecordSuccess,
  deleteRecordFailure,
  deleteRecordRequest,
  deleteRecordSuccess,
  fetchRecordFailure,
  fetchRecordRequest,
  fetchRecordsFailure,
  fetchRecordsRequest,
  fetchRecordsSuccess,
  fetchRecordSuccess,
  searchRecordFailure,
  searchRecordRequest,
  searchRecordSuccess,
  updateRecordFailure,
  updateRecordRequest,
  updateRecordSuccess,
} from "./recordSlice";
import type { RecordItem } from "./recordTypes";

const errorMessage = (err: unknown, fallback: string) => {
  if (err instanceof Error && err.message) return err.message;
  return fallback;
};

function* fetchRecordsSaga() {
  try {
    const list: RecordItem[] = yield call(fetchRecordsApi);
    yield put(fetchRecordsSuccess(list));
  } catch (err: unknown) {
    yield put(fetchRecordsFailure(errorMessage(err, "간호 기록 목록 조회 실패")));
  }
}

function* fetchRecordSaga(action: PayloadAction<{ nursingId: string }>) {
  try {
    const item: RecordItem = yield call(fetchRecordApi, action.payload.nursingId);
    yield put(fetchRecordSuccess(item));
  } catch (err: unknown) {
    yield put(fetchRecordFailure(errorMessage(err, "간호 기록 조회 실패")));
  }
}

function* createRecordSaga(action: PayloadAction<NursingRecordCreatePayload>) {
  try {
    yield call(createRecordApi, action.payload);
    yield put(createRecordSuccess());
    yield put(fetchRecordsRequest());
  } catch (err: unknown) {
    yield put(createRecordFailure(errorMessage(err, "간호 기록 등록 실패")));
  }
}

function* updateRecordSaga(
  action: PayloadAction<{ nursingId: string; form: NursingRecordUpdatePayload }>
) {
  try {
    yield call(updateRecordApi, action.payload.nursingId, action.payload.form);
    yield put(updateRecordSuccess());
    yield put(fetchRecordsRequest());
  } catch (err: unknown) {
    yield put(updateRecordFailure(errorMessage(err, "간호 기록 수정 실패")));
  }
}

function* deleteRecordSaga(action: PayloadAction<string>) {
  try {
    yield call(deleteRecordApi, action.payload);
    yield put(deleteRecordSuccess(action.payload));
  } catch (err: unknown) {
    yield put(deleteRecordFailure(errorMessage(err, "간호 기록 삭제 실패")));
  }
}

function* searchRecordSaga(
  action: PayloadAction<{
    searchType: string;
    searchValue?: string;
    startDate?: string;
    endDate?: string;
  }>
) {
  try {
    const list: RecordItem[] = yield call(searchRecordApi, action.payload);
    yield put(searchRecordSuccess(list));
  } catch (err: unknown) {
    yield put(searchRecordFailure(errorMessage(err, "간호 기록 검색 실패")));
  }
}

export function* watchRecordSaga() {
  yield takeLatest(fetchRecordsRequest.type, fetchRecordsSaga);
  yield takeLatest(fetchRecordRequest.type, fetchRecordSaga);
  yield takeLatest(createRecordRequest.type, createRecordSaga);
  yield takeLatest(updateRecordRequest.type, updateRecordSaga);
  yield takeLatest(deleteRecordRequest.type, deleteRecordSaga);
  yield takeLatest(searchRecordRequest.type, searchRecordSaga);
}
