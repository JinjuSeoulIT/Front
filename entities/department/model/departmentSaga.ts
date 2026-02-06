"use client";
import { PayloadAction } from "@reduxjs/toolkit";
import { call, put, takeLatest } from "redux-saga/effects";
import {
  fetchDepartmentsApi,
  fetchDepartmentsByConditionApi,
  createDepartmentApi,
  updateDepartmentApi,
  deleteDepartmentApi,
} from "../api/departmentApi";
import {
  fetchDepartmentsRequest,
  fetchDepartmentsSuccess,
  fetchDepartmentsFailure,
  fetchDepartmentsByConditionRequest,
  fetchDepartmentsByConditionSuccess,
  fetchDepartmentsByConditionFailure,
  createDepartmentRequest,
  createDepartmentSuccess,
  createDepartmentFailure,
  updateDepartmentRequest,
  updateDepartmentSuccess,
  updateDepartmentFailure,
  deleteDepartmentRequest,
  deleteDepartmentSuccess,
  deleteDepartmentFailure,
  type ApiResponse,
  type Department,
  type DepartmentInput,
  type SearchCondition,
} from "./departmentSlice";
const getErrorMessage = (err: unknown): string =>
  err instanceof Error ? err.message : "Unknown error";
function* fetchDepartmentsWorker() {
  try {
    const ApiResponse: ApiResponse<Department[]> = yield call(fetchDepartmentsApi);
    if (ApiResponse.success && ApiResponse.result) {
      yield put(fetchDepartmentsSuccess(ApiResponse.result));
    } else {
      yield put(fetchDepartmentsFailure(ApiResponse.message));
    }
  } catch (err: unknown) {
    yield put(fetchDepartmentsFailure(getErrorMessage(err)));
  }
}

function* fetchDepartmentsByConditionWorker(action: PayloadAction<SearchCondition>) {
  try {
    const ApiResponse: ApiResponse<Department[]> = yield call(
      fetchDepartmentsByConditionApi,
      action.payload
    );
    if (ApiResponse.success && ApiResponse.result) {
      yield put(fetchDepartmentsByConditionSuccess(ApiResponse.result));
    } else {
      yield put(fetchDepartmentsByConditionFailure(ApiResponse.message));
    }
  } catch (err: unknown) {
    yield put(fetchDepartmentsByConditionFailure(getErrorMessage(err)));
  }
}
function* createDepartmentWorker(action: PayloadAction<DepartmentInput>) {
  try {
    const ApiResponse: ApiResponse<Department> = yield call(
      createDepartmentApi,
      action.payload
    );
    if (ApiResponse.success && ApiResponse.result) {
      yield put(createDepartmentSuccess(ApiResponse.result));
    } else {
      yield put(createDepartmentFailure(ApiResponse.message));
    }
  } catch (err: unknown) {
    yield put(createDepartmentFailure(getErrorMessage(err)));
  }
}
function* updateDepartmentWorker(
  action: PayloadAction<{ id: number; data: DepartmentInput }>
) {
  try {
    const ApiResponse: ApiResponse<Department> = yield call(
      updateDepartmentApi,
      action.payload.id,
      action.payload.data
    );
    if (ApiResponse.success && ApiResponse.result) {
      yield put(updateDepartmentSuccess(ApiResponse.result));
    } else {
      yield put(updateDepartmentFailure(ApiResponse.message));
    }
  } catch (err: unknown) {
    yield put(updateDepartmentFailure(getErrorMessage(err)));
  }
}
function* deleteDepartmentWorker(action: PayloadAction<number>) {
  try {
    const ApiResponse: ApiResponse<void> = yield call(
      deleteDepartmentApi,
      action.payload
    );
    if (ApiResponse.success) {
      yield put(deleteDepartmentSuccess(action.payload));
    } else {
      yield put(deleteDepartmentFailure(ApiResponse.message));
    }
  } catch (err: unknown) {
    yield put(deleteDepartmentFailure(getErrorMessage(err)));
  }
}
export function* departmentSaga() {
  yield takeLatest(fetchDepartmentsRequest.type, fetchDepartmentsWorker);
  yield takeLatest(fetchDepartmentsByConditionRequest.type, fetchDepartmentsByConditionWorker);
  yield takeLatest(createDepartmentRequest.type, createDepartmentWorker);
  yield takeLatest(updateDepartmentRequest.type, updateDepartmentWorker);
  yield takeLatest(deleteDepartmentRequest.type, deleteDepartmentWorker);
}
