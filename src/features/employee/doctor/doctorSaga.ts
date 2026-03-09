import { call, put, takeLatest } from "redux-saga/effects";
import type { SagaIterator } from "redux-saga";
import type { PayloadAction } from "@reduxjs/toolkit";

import type {
  ApiResponse,
  DoctorCreateRequest,
  DoctorDeleteRequest,
  DoctorDetailResView,
  DoctorListView,
  DoctorResponse,
  DoctorUpdateRequest,
  FileUploadResDTO,
} from "./doctortypes";

import {
  //  DoctorByIdRequest,
  // DoctorSuccess,
  // DoctorFail,

  createDoctorRequest,
  createDoctorSuccess,
  createDoctorFail,

  updateDoctorRequest,
  updateDoctorSuccess,
  updateDoctorFail,

  deleteDoctorRequest,
  deleteDoctorSuccess,
  deleteDoctorFail,
  DoctorProfileListRequest,
  DoctorProfileListFailure,
  DoctorProfileListSuccess,
  uploadFileRequest,
  uploadFileSuccess,
  uploadFileFailure,
  DoctorProfileSuccess,
  DoctorProfileFail,
  DoctorProfileByIdRequest,

} from "./doctorSlice";

import {
  DoctorDetailApi,
  createDoctorApi,
  updateDoctorApi,
  deleteDoctorApi,
  DoctorProfileListApi,
  uploadFileApi,
  DoctorProfileDetailApi,
} from "./employeedoctorAPI";




/* =======================
의사리스트
======================= */
function* DoctorProfileListSaga() {
  try {
    const res: ApiResponse<DoctorListView[]> = yield call(DoctorProfileListApi);

    if (res.success) {
      yield put(DoctorProfileListSuccess(res.data));
    }else{
      yield put(DoctorProfileListFailure(res.message));
    }
  } catch (error: unknown) {
    yield put(
      DoctorProfileListFailure("의사 프로필 리스트 연결실패 500")
    );
  }
}
/* =======================
의사상세
======================= */
function* DoctorProfileSaga(action: PayloadAction<number>): SagaIterator {
  try {
    const res: ApiResponse<DoctorDetailResView> = yield call(DoctorProfileDetailApi, action.payload);

    if (res.success) {
      yield put(DoctorProfileSuccess(res.data));
    } else {
      yield put(DoctorProfileFail(res.message));
    }
  } catch (error: unknown) {
    yield put(DoctorProfileFail("의사 상세 연결실패 500"));
  }
}
















// /* =======================
// 상세
// ======================= */
// function* fetchDoctorSaga(action: PayloadAction<number>): SagaIterator {
//   try {
//     const res: ApiResponse<DoctorResponse> = yield call(DoctorDetailApi, action.payload);

//     if (res.success) {
//       yield put(DoctorSuccess(res.data));
//     } else {
//       yield put(DoctorFail(res.message));
//     }
//   } catch (error: unknown) {
//     yield put(DoctorFail("의사 상세 연결실패 500"));
//   }
// }



/* =======================
의사생성
======================= */
function* createDoctorSaga(action: PayloadAction<DoctorCreateRequest>): SagaIterator {
  try {
    const res: ApiResponse<DoctorResponse> = yield call(createDoctorApi, action.payload);

    if (res.success) {
      yield put(createDoctorSuccess(res.data));
    } else {
      yield put(createDoctorFail(res.message));
    }
  } catch (error: unknown) {
    yield put(createDoctorFail("의사 생성 연결실패 500"));
  }
}

/* =======================
  ✅ 대표 이미지 업로드(첨부 업로드: postId 필요)
  - 성공 시: fileUrl 리턴(보장)
======================= */
function* uploadFileWorker(
  action: ReturnType<typeof uploadFileRequest>): SagaIterator {
  try {
  
    const {  file } = action.payload; //🔑식별아이디 PK
    const res: ApiResponse<FileUploadResDTO> = yield call(uploadFileApi,file); //🔑식별아이디 PK

    //업로드 결과(파일 자체 정보) (2)
    if (res.success) {
      yield put(uploadFileSuccess(res.data));
    } else {
      yield put(uploadFileFailure(res.message));
    }
  } catch ( error: unknown) {
    yield put(uploadFileFailure("파일 업로드 연결실패"));
  }
}











/* =======================
의사수정
- authenticationId로 상세 조회해서 doctorId 얻고 수정
======================= */
function* updateDoctorSaga(action: PayloadAction<DoctorUpdateRequest>): SagaIterator {
  try {
    const detail: ApiResponse<DoctorResponse> = yield call(
      DoctorDetailApi,
      action.payload.authenticationId
    );
    if (detail.success) {
    const doctorId = detail.data?.doctorId;

    if (doctorId) {
    const res: ApiResponse<DoctorResponse> = yield call(updateDoctorApi,doctorId,action.payload.req);

    if (res.success) {
    yield put(updateDoctorSuccess(res.data));
    } else {
    yield put(updateDoctorFail(res.message));
    }
    } else {
    yield put(updateDoctorFail("의사 정보 연결실패 500"));
    }
    } else {
    yield put(updateDoctorFail(detail.message));
    }
    } catch (error: unknown) {
    yield put(updateDoctorFail("의사 수정 연결실패 500"));
    }
    }




/* =======================
의사삭제
- authenticationId로 상세 조회해서 doctorId 얻고 삭제
======================= */
function* deleteDoctorSaga(action: PayloadAction<DoctorDeleteRequest>): SagaIterator {
  try {
    const detail: ApiResponse<DoctorResponse> = yield call(DoctorDetailApi,action.payload.authenticationId);

    if (detail.success) {const doctorId = detail.data?.doctorId;

    if (doctorId) {
    const res: ApiResponse<void> = yield call(deleteDoctorApi, doctorId);

    if (res.success) {
    yield put(deleteDoctorSuccess());
    } else {
    yield put(deleteDoctorFail(res.message));
    }
    } else {
    yield put(deleteDoctorFail("의사 상세 연결실패.500"));
    }
    } else {
      yield put(deleteDoctorFail(detail.message));
    }
    } catch (error: unknown) {
    yield put(deleteDoctorFail("의사 삭제 연결실패 500"));
    }
    }




/* =======================
의사 루트사가
======================= */
export function* doctorSaga(): SagaIterator {
  yield takeLatest(DoctorProfileListRequest.type,DoctorProfileListSaga);
  yield takeLatest(DoctorProfileByIdRequest.type, DoctorProfileSaga); //의사상세 


  // yield takeLatest(DoctorByIdRequest.type, fetchDoctorSaga);
  yield takeLatest(createDoctorRequest.type, createDoctorSaga);
  yield takeLatest(uploadFileRequest.type, uploadFileWorker);

  yield takeLatest(updateDoctorRequest.type, updateDoctorSaga);
  yield takeLatest(deleteDoctorRequest.type, deleteDoctorSaga);
}