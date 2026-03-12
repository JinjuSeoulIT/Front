import { call, put, takeLatest } from "redux-saga/effects";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { SagaIterator } from "redux-saga";
import axios from "axios";

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
  uploadNurseFileFailure,
  uploadNurseFileRequest,
  uploadNurseFileSuccess,
} from "@/features/employee/nurse/nurseSlice";

import type {
  ApiResponse,
  FileUploadResDTO,
  NurseCreateRequest,
  NurseFile,
  NurseIdnNumber,
  NurseResponse,
  NurseUpdateNumber,
} from "./nurseTypes";

import {
  createNurseApi,
  deleteNurseApi,
  DetailNurseApi,
  nurselistApi,
  updateNursedApi,
  uploadFileApi,
} from "@/lib/employeeNurseApi";

type ApiErrorPayload = {
  message?: string;
};

function getErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError<ApiErrorPayload>(error)) {
    const apiMessage = error.response?.data?.message;
    if (apiMessage) return apiMessage;

    const status = error.response?.status;
    if (status) return `${fallback} (HTTP ${status})`;
  }
  return fallback;
}

function* nurseListSaga(): SagaIterator {
  try {
    const response: ApiResponse<NurseResponse[]> = yield call(nurselistApi);
    if (response.success) {
      yield put(nurselistSuccess(response.data));
    } else {
      yield put(nurselistFailure(response.message));
    }
  } catch (error: unknown) {
    yield put(nurselistFailure(getErrorMessage(error, "간호사 목록 조회 실패")));
  }
}

function* detailNurseSaga(action: PayloadAction<NurseIdnNumber>): SagaIterator {
  try {
    const response: ApiResponse<NurseResponse> = yield call(DetailNurseApi, action.payload);
    if (response.success) {
      yield put(DetailNurseSuccess(response.data));
    } else {
      yield put(DetailNurseFailure(response.message));
    }
  } catch (error: unknown) {
    yield put(DetailNurseFailure(getErrorMessage(error, "간호사 상세 조회 실패")));
  }
}

function* createNurseSaga(action: PayloadAction<NurseCreateRequest>): SagaIterator {
  try {
    const response: ApiResponse<NurseResponse> = yield call(createNurseApi, action.payload);
    if (response.success) {
      yield put(createNurseSuccess(response.data));
    } else {
      yield put(createNurseFailure(response.message));
    }
  } catch (error: unknown) {
    yield put(createNurseFailure(getErrorMessage(error, "간호사 등록 실패")));
  }
}

function* updateNurseSaga(action: PayloadAction<NurseUpdateNumber>): SagaIterator {
  try {
    const { nurseId, nurseReq } = action.payload;
    const response: ApiResponse<NurseResponse> = yield call(updateNursedApi, nurseId, nurseReq);
    if (response.success) {
      yield put(updateNurseSuccess(response.data));
    } else {
      yield put(updateNurseFailure(response.message));
    }
  } catch (error: unknown) {
    yield put(updateNurseFailure(getErrorMessage(error, "간호사 수정 실패")));
  }
}

function* deleteNurseSaga(action: PayloadAction<NurseIdnNumber>): SagaIterator {
  try {
    const response: ApiResponse<void> = yield call(deleteNurseApi, action.payload.nurseId);
    if (response.success) {
      yield put(deleteNurseSuccess());
    } else {
      yield put(deleteNurseFailure(response.message));
    }
  } catch (error: unknown) {
    yield put(deleteNurseFailure(getErrorMessage(error, "간호사 삭제 실패")));
  }
}


//업로드`
function* uploadNurseFileSaga(action: PayloadAction<NurseFile>): SagaIterator { // =>API
  try {
    const { nurseId, file } = action.payload;  //메타데이터
    const response: ApiResponse<FileUploadResDTO> = yield call(uploadFileApi,nurseId, file);

    if (response.success) {
      yield put(uploadNurseFileSuccess(response.data));
    } else {
      yield put(uploadNurseFileFailure(response.message));
    }
  } catch (error: unknown) {
    yield put(uploadNurseFileFailure("파일 업로드 연결실패 500"));
  }
}






export function* watchEmployeeNurseSaga() {
  yield takeLatest(nurselistRequest.type, nurseListSaga);
  yield takeLatest(DetailNurseRequest.type, detailNurseSaga);
  yield takeLatest(createNurseRequest.type, createNurseSaga);
  yield takeLatest(updateNursedRequest.type, updateNurseSaga);
  yield takeLatest(deleteNurseRequest.type, deleteNurseSaga);
  yield takeLatest(uploadNurseFileRequest.type, uploadNurseFileSaga);
}
