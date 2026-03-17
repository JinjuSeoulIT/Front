import { all, call, put, takeLatest } from "redux-saga/effects";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { SagaIterator } from "redux-saga";
import axios from "axios";
import type {
  ApiResponse,
  SearchStaffPayload,
  staffCreateRequest,
  staffIdnNumber,
  staffIdNumber,
  staffResponse,
} from "./BasiclnfoType";
import {
  createStaffApi,
  deleteStaffApi,
  DetailStaffApi,
  searchStaffListApi,
  StafflistApi,
  updateStaffApi,
} from "@/lib/employeeBasiclnfoAPI";
import {
  createStaffFail,
  createStaffRequest,
  createStaffSuccess,
  deleteStaffFailure,
  deleteStaffRequest,
  deleteStaffSuccess,
  DetailStaffFailure,
  DetailStaffRequest,
  DetailStaffSuccess,
  searchStaffListFailure,
  searchStaffListRequest,
  searchStaffListSuccess,
  StafflistFailure,
  StafflistRequest,
  StafflistSuccess,
  updateStaffFailure,
  updateStaffRequest,
  updateStaffSuccess,
} from "./BasiclnfoSlict";




function* searchStaffListSaga(action: PayloadAction<SearchStaffPayload>): SagaIterator {
  try {
    const { search, searchType } = action.payload;

    const response: ApiResponse<staffResponse[]> = yield call(searchStaffListApi, search, searchType);
    if(response.success){
    yield put(searchStaffListSuccess(response.data));
    }else{
    yield put(searchStaffListFailure(response.message));
    }
    } catch (error: unknown) {
    yield put(searchStaffListFailure( "공통조회 검색 실패 500"));
    }
    }



function* StaffListSaga(): SagaIterator {
  try {
    const res: ApiResponse<staffResponse[]> = yield call(StafflistApi);
    if (res.success) {
      yield put(StafflistSuccess(res.data));
    } else {
      yield put(StafflistFailure(res.message));
    }
  } catch (error: unknown) {
    yield put(StafflistFailure( "직원 목록 조회 실패"));
  }
}

function* detailStaffSaga(action: PayloadAction<string>): SagaIterator {
  try {
    const res: ApiResponse<staffResponse> = yield call(DetailStaffApi, action.payload);
    if (res.success) {
      yield put(DetailStaffSuccess(res.data));
    } else {
      yield put(DetailStaffFailure(res.message));
    }
  } catch (error: unknown) {
    yield put(DetailStaffFailure( "직원 상세 조회 실패"));
  }
}

function* createStaffSaga(action: PayloadAction<staffCreateRequest>): SagaIterator {
  try {
    const res: ApiResponse<staffResponse> = yield call(createStaffApi, action.payload);
    if (res.success) {
      yield put(createStaffSuccess(res.data));
    } else {
      yield put(createStaffFail(res.message));
    }
  } catch (error: unknown) {
    yield put(createStaffFail( "직원 생성 실패"));
  }
}

function* updateStaffSaga(action: PayloadAction<staffIdnNumber>): SagaIterator {
  try {
    const { staffId, staffReq } = action.payload;
    const res: ApiResponse<staffResponse> = yield call(updateStaffApi, staffId, staffReq);
    if (res.success) {
      yield put(updateStaffSuccess(res.data));
    } else {
      yield put(updateStaffFailure(res.message));
    }
  } catch (error: unknown) {
    yield put(updateStaffFailure( "직원 수정 실패"));
  }
}

//삭제
function* deleteStaffSaga(action: PayloadAction<staffIdNumber>): SagaIterator {
  try {
    const res: ApiResponse<void> = yield call(deleteStaffApi, action.payload.staffId);
    console.log(res);
    if (res.success) {
      yield put(deleteStaffSuccess());
    } else {
      yield put(deleteStaffFailure(res.message));
    }
  } catch (error: unknown) {
    yield put(deleteStaffFailure( "직원 삭제 실패"));
  }
}

export function* watchEmployeeStaffSaga() {
  yield all([
    takeLatest(searchStaffListRequest.type, searchStaffListSaga),
    takeLatest(StafflistRequest.type, StaffListSaga),
    takeLatest(DetailStaffRequest.type, detailStaffSaga),
    takeLatest(createStaffRequest.type, createStaffSaga),
    takeLatest(updateStaffRequest.type, updateStaffSaga),
    takeLatest(deleteStaffRequest.type, deleteStaffSaga),
  ]);
}
