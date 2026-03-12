import { call, put, takeLatest } from "redux-saga/effects";
import type { SagaIterator } from "redux-saga";
import type { PayloadAction } from "@reduxjs/toolkit";

import type {
  ApiResponse,
  DoctorCreateRequest,
  DoctorFile,
  DoctorIdNumber,
  DoctorResponse,
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

//목록
function* doctorListSaga(): SagaIterator {
  try {
    const response: ApiResponse<DoctorResponse[]> = yield call(DoctorProfileListApi);

    if (response.success) {
      yield put(DoctorListSuccess(response.data));
    } else {
      yield put(DoctorListFailure(response.message));
    }
  } catch (error: unknown) {
    yield put(DoctorListFailure("의사 목록 연결실패 500"));
  }
}

//상세
function* detailDoctorSaga(action: PayloadAction<DoctorIdNumber>): SagaIterator { // =>API
  try {
    const response: ApiResponse<DoctorResponse> = yield call(DoctorProfileDetailApi,action.payload);

    if (response.success) {
      yield put(DetailDoctorSuccess(response.data));
    } else {
      yield put(DetailDoctorFailure(response.message));
    }
  } catch (error: unknown) {
    yield put(DetailDoctorFailure("의사 상세 연결실패 500"));
  }
}

//생성
function* createDoctorSaga(action: PayloadAction<DoctorCreateRequest>): SagaIterator {  // =>API
  try {
    const response: ApiResponse<DoctorResponse> = yield call(createDoctorApi,action.payload);

    if (response.success) {
      yield put(createDoctorSuccess(response.data));
    } else {
      yield put(createDoctorFailure(response.message));
    }
  } catch (error: unknown) {
    yield put(createDoctorFailure("의사 생성 연결실패 500"));
  }
}



//수정
function* updateDoctorSaga(action: PayloadAction<DoctorUpdateNumber>): SagaIterator {  // =>API
  
  try {
    const { doctorId, doctorReq } = action.payload;
    const response: ApiResponse<DoctorResponse> = yield call(updateDoctorApi, doctorId,doctorReq);

    if (response.success) {
      yield put(updateDoctorSuccess(response.data));
    } else {
      yield put(updateDoctorFailure(response.message));
    }
  } catch (error: unknown) {
    yield put(updateDoctorFailure("의사 수정 연결실패 500"));
  }
}



//삭제
function* deleteDoctorSaga(action: PayloadAction<DoctorIdNumber>): SagaIterator {  // =>API
  try {
    const response: ApiResponse<void> = yield call(deleteDoctorApi,action.payload.doctorId);

    if (response.success) {
      yield put(deleteDoctorSuccess());
    } else {
      yield put(deleteDoctorFailure(response.message));
    }
  } catch (error: unknown) {
    yield put(deleteDoctorFailure("의사 삭제 연결실패 500"));
  }
}


//업로드`
function* uploadDoctorFileSaga(action: PayloadAction<DoctorFile>): SagaIterator { // =>API
  try {
    const { doctorId, file } = action.payload;  //메타데이터
    const response: ApiResponse<FileUploadResDTO> = yield call(uploadFileApi,doctorId, file);

    if (response.success) {
      yield put(uploadDoctorFileSuccess(response.data));
    } else {
      yield put(uploadDoctorFileFailure(response.message));
    }
  } catch (error: unknown) {
    yield put(uploadDoctorFileFailure("파일 업로드 연결실패 500"));
  }
}


//의사 루트
export function* watchdoctorSaga(): SagaIterator {
  yield takeLatest(DoctorListRequest.type, doctorListSaga);
  yield takeLatest(DetailDoctorRequest.type, detailDoctorSaga);
  yield takeLatest(createDoctorRequest.type, createDoctorSaga);
  yield takeLatest(updateDoctorRequest.type, updateDoctorSaga);
  yield takeLatest(deleteDoctorRequest.type, deleteDoctorSaga);

  yield takeLatest(uploadDoctorFileRequest.type, uploadDoctorFileSaga);
}