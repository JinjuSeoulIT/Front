import { call, put, takeLatest } from "redux-saga/effects";
import type { SagaIterator } from "redux-saga";
import type { PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

import type {
  ApiResponse,
  DoctorCreateRequest,
  DoctorFile,
  DoctorResponse,
  DoctorIdNumber,
  DoctorUpdateNumber,
  FileUploadResDTO,
} from "./doctortypes";

import {
  DoctorListRequest,
  DoctorListSuccess,
  DoctorListFailure,
  DetailDoctorRequest,
  DetailDoctorSuccess,
  DetailDoctorFailure,
  createDoctorRequest,
  createDoctorSuccess,
  createDoctorFailure,
  updateDoctorRequest,
  updateDoctorSuccess,
  updateDoctorFailure,
  deleteDoctorRequest,
  deleteDoctorSuccess,
  deleteDoctorFailure,
  uploadDoctorFileRequest,
  uploadDoctorFileSuccess,
  uploadDoctorFileFailure,
} from "./doctorSlice";

import {
  DoctorProfileListApi,
  DoctorProfileDetailApi,
  createDoctorApi,
  updateDoctorApi,
  deleteDoctorApi,
  uploadFileApi,
} from "../../../lib/employeedoctorAPI";

type ApiErrorPayload = { message?: string };

function getErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError<ApiErrorPayload>(error)) {
    const apiMessage = error.response?.data?.message;
    if (apiMessage) return apiMessage;

    const status = error.response?.status;
    if (status) return `${fallback} (HTTP ${status})`;
  }
  return fallback;
}

function* doctorListSaga(): SagaIterator {
  try {
    const response: ApiResponse<DoctorResponse[]> = yield call(DoctorProfileListApi);
    if (response.success) {
      yield put(DoctorListSuccess(response.data));
    } else {
      yield put(DoctorListFailure(response.message));
    }
  } catch (error: unknown) {
    yield put(DoctorListFailure(getErrorMessage(error, "의사 목록 조회 실패")));
  }
}

function* detailDoctorSaga(action: PayloadAction<DoctorIdNumber>): SagaIterator {
  try {
    const response: ApiResponse<DoctorResponse> = yield call(DoctorProfileDetailApi, action.payload);
    if (response.success) {
      yield put(DetailDoctorSuccess(response.data));
    } else {
      yield put(DetailDoctorFailure(response.message));
    }
  } catch (error: unknown) {
    yield put(DetailDoctorFailure(getErrorMessage(error, "의사 상세 조회 실패")));
  }
}

function* createDoctorSaga(action: PayloadAction<DoctorCreateRequest>): SagaIterator {
  try {
    const response: ApiResponse<DoctorResponse> = yield call(createDoctorApi, action.payload);
    if (response.success) {
      yield put(createDoctorSuccess(response.data));
    } else {
      yield put(createDoctorFailure(response.message));
    }
  } catch (error: unknown) {
    yield put(createDoctorFailure(getErrorMessage(error, "의사 등록 실패")));
  }
}

function* updateDoctorSaga(action: PayloadAction<DoctorUpdateNumber>): SagaIterator {
  try {
    const { staffId, doctorReq } = action.payload;
    const response: ApiResponse<DoctorResponse> = yield call(updateDoctorApi, staffId, doctorReq);
    if (response.success) {
      yield put(updateDoctorSuccess(response.data));
    } else {
      yield put(updateDoctorFailure(response.message));
    }
  } catch (error: unknown) {
    yield put(updateDoctorFailure(getErrorMessage(error, "의사 수정 실패")));
  }
}

function* deleteDoctorSaga(action: PayloadAction<DoctorIdNumber>): SagaIterator {
  try {
    const response: ApiResponse<void> = yield call(deleteDoctorApi, action.payload.staffId);
    if (response.success) {
      yield put(deleteDoctorSuccess());
    } else {
      yield put(deleteDoctorFailure(response.message));
    }
  } catch (error: unknown) {
    yield put(deleteDoctorFailure(getErrorMessage(error, "의사 삭제 실패")));
  }
}

function* uploadDoctorFileSaga(action: PayloadAction<DoctorFile>): SagaIterator {
  try {
    const { staffId, file } = action.payload;
    const response: ApiResponse<FileUploadResDTO> = yield call(uploadFileApi, staffId, file);
    if (response.success) {
      yield put(uploadDoctorFileSuccess(response.data));
    } else {
      yield put(uploadDoctorFileFailure(response.message));
    }
  } catch (error: unknown) {
    yield put(uploadDoctorFileFailure(getErrorMessage(error, "파일 업로드 실패")));
  }
}

export function* watchEmployeedoctorSaga(): SagaIterator {
  yield takeLatest(DoctorListRequest.type, doctorListSaga);
  yield takeLatest(DetailDoctorRequest.type, detailDoctorSaga);
  yield takeLatest(createDoctorRequest.type, createDoctorSaga);
  yield takeLatest(updateDoctorRequest.type, updateDoctorSaga);
  yield takeLatest(deleteDoctorRequest.type, deleteDoctorSaga);
  yield takeLatest(uploadDoctorFileRequest.type, uploadDoctorFileSaga);
}
