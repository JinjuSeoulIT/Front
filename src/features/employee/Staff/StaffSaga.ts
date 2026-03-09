import { all, call, put, takeEvery, takeLatest } from "redux-saga/effects";
import type { PayloadAction } from "@reduxjs/toolkit";
import { ApiResponse,staffResponse } from "./StaffType";
import { createAuthenticationApi } from "./AuthenticationAPI";
import { SagaIterator } from "redux-saga";
import {  DetailStaffFailure, DetailStaffRequest, StafflistFailure, StafflistSuccess } from "./StaffSlict";





// ✅ 리스트
function* StaffListSaga(): SagaIterator {
  try {
    const res: ApiResponse<staffResponse[]> = yield call(StafflistApi);
    if (res.success) {
      yield put(StafflistSuccess(res.data));
    } else {
      yield put(StafflistFailure(res.message));
    }
  } catch (error: unknown) {
    yield put(StafflistFailure("간호사 목록 조회 실패 500"));
  }
}




// ✅ 상세
function* detailStaffSaga(action: PayloadAction<staffResponse>): SagaIterator {
  try {
    const res: ApiResponse<staffResponse> = yield call(DetailNurseApi, action.payload);
    if (res.success) {
      yield put(DetailStaffRequest(res.data));
    } else {
      yield put(DetailStaffFailure(res.message));
    }
  } catch (_e: unknown) {
    yield put(DetailStaffFailure("간호사 조회 실패 500"));
  }
}






/* =======================
생성
======================= */
function* createAuthenticationSaga(action: PayloadAction<number>): SagaIterator {
    try {
    const res: ApiResponse<staffResponse> = yield call(createAuthenticationApi, action.payload);

    if (res.success) {
    yield put(createAuthenticationSuccess(res.data));
    } else {
    yield put(createAuthenticationFail(res.message));
    }
} catch (error: unknown) {
    yield put(createAuthenticationFail("의사 생성 연결실패 500"));
}
}








export function* authenticationRootSaga() {
  yield all([
    takeLatest(createAuthenticationRequest.type, createAuthenticationSaga),
// //     takeEvery(updateAuthenticationRequest.type, updateAuthenticationSaga),
// //     takeEvery(deleteAuthenticationRequest.type, deleteAuthenticationSaga),
  ]);
}




// // ✅ 생성
// function* createNurseSaga(action: PayloadAction<NurseCreateRequest>): SagaIterator {
//   try {
//     const res: ApiResponse<NurseResponse> = yield call(createNurseApi, action.payload);
//     if (res.success) {
//       yield put(createNurseSuccess(res.data));
//     } else {
//       yield put(createNurseFailure(res.message));
//     }
//   } catch (_e: unknown) {
//     yield put(createNurseFailure("간호사 등록 실패 500"));
//   }
// }

// // ✅ 수정
// function* updateNurseSaga(action: PayloadAction<NurseIdnNumber>): SagaIterator {
//   try {
//      const { nurseId, nurseReq } = action.payload;
//     const res: ApiResponse<NurseResponse> = yield call(updateNursedApi, nurseId, nurseReq);
//     if (res.success) {
//       yield put(updateNurseSuccess(res.data));
//     } else {
//       yield put(updateNurseFailure(res.message));
//     }
//   } catch (_e: unknown) {
//     yield put(updateNurseFailure("간호사 수정 실패 500"));
//   }
// }

// // ✅ 삭제 (payload = userId or nurseId - 현재는 number로 통일)
// function* deleteNurseSaga(action: PayloadAction<number>): SagaIterator {
//   try {
//     const res: ApiResponse<void> = yield call(deleteNurseApi, action.payload);
//     if (res.success) {
//       yield put(deleteNurseSuccess());
//     } else {
//       yield put(deleteNurseFailure(res.message));
//     }
//   } catch (_e: unknown) {
//     yield put(deleteNurseFailure("간호사 비활성 처리 실패 500"));
//   }
// }


// export function* watchEmployeeNurseSaga() {
//   yield takeLatest(nurselistRequest.type, nurseListSaga);
//   yield takeLatest(DetailNurseRequest.type, detailNurseSaga);
//   yield takeLatest(createNurseRequest.type, createNurseSaga);
//   yield takeLatest(updateNursedRequest.type, updateNurseSaga);
//   yield takeLatest(deleteNurseRequest.type, deleteNurseSaga);
// }
