import { call, put, takeLatest } from "redux-saga/effects";
import type { PayloadAction } from "@reduxjs/toolkit";
import { SagaIterator } from "redux-saga";

import {
  createNurseFailure,
  createNurseRequest,
  createNurseSuccess,
  deleteNurseFailure,
  deleteNurseRequest,
  deleteNurseSuccess,
  DetailNurseFailure,
  DetailNurseRequest,
  DetailNurseSuccess,
  nurselistFailure,
  nurselistRequest,
  nurselistSuccess,
  updateNursedRequest,
  updateNurseFailure,
  updateNurseSuccess,
} from "@/features/nurse/nurseSlice";

import type {
  ApiResponse,
  NurseCreateRequest,
  
  NurseIdnNumber,
  
  NurseResponse,
 
 
} from "./nurseTypes";

import {
  createNurseApi,
  deleteNurseApi,
  DetailNurseApi,
  nurselistApi,
  updateNursedApi,
} from "@/lib/nurseApi";

// ✅ 리스트
function* nurseListSaga(): SagaIterator {
  try {
    const res: ApiResponse<NurseResponse[]> = yield call(nurselistApi);
    if (res.success) {
      yield put(nurselistSuccess(res.data));
    } else {
      yield put(nurselistFailure(res.message));
    }
  } catch (_e: unknown) {
    yield put(nurselistFailure("간호사 목록 조회 실패 500"));
  }
}

// ✅ 상세
function* detailNurseSaga(action: PayloadAction<number>): SagaIterator {
  try {
    const res: ApiResponse<NurseResponse> = yield call(DetailNurseApi, action.payload);
    if (res.success) {
      yield put(DetailNurseSuccess(res.data));
    } else {
      yield put(DetailNurseFailure(res.message));
    }
  } catch (_e: unknown) {
    yield put(DetailNurseFailure("간호사 조회 실패 500"));
  }
}

// ✅ 생성
function* createNurseSaga(action: PayloadAction<NurseCreateRequest>): SagaIterator {
  try {
    const res: ApiResponse<NurseResponse> = yield call(createNurseApi, action.payload);
    if (res.success) {
      yield put(createNurseSuccess(res.data));
    } else {
      yield put(createNurseFailure(res.message));
    }
  } catch (_e: unknown) {
    yield put(createNurseFailure("간호사 등록 실패 500"));
  }
}

// ✅ 수정
function* updateNurseSaga(action: PayloadAction<NurseIdnNumber>): SagaIterator {
  try {
     const { nurseId, nurseReq } = action.payload;
    const res: ApiResponse<NurseResponse> = yield call(updateNursedApi, nurseId, nurseReq);
    if (res.success) {
      yield put(updateNurseSuccess(res.data));
    } else {
      yield put(updateNurseFailure(res.message));
    }
  } catch (_e: unknown) {
    yield put(updateNurseFailure("간호사 수정 실패 500"));
  }
}

// ✅ 삭제 (payload = userId or nurseId - 현재는 number로 통일)
function* deleteNurseSaga(action: PayloadAction<number>): SagaIterator {
  try {
    const res: ApiResponse<void> = yield call(deleteNurseApi, action.payload);
    if (res.success) {
      yield put(deleteNurseSuccess());
    } else {
      yield put(deleteNurseFailure(res.message));
    }
  } catch (_e: unknown) {
    yield put(deleteNurseFailure("간호사 비활성 처리 실패 500"));
  }
}


export function* watchNurseSaga() {
  yield takeLatest(nurselistRequest.type, nurseListSaga);
  yield takeLatest(DetailNurseRequest.type, detailNurseSaga);
  yield takeLatest(createNurseRequest.type, createNurseSaga);
  yield takeLatest(updateNursedRequest.type, updateNurseSaga);
  yield takeLatest(deleteNurseRequest.type, deleteNurseSaga);
}
