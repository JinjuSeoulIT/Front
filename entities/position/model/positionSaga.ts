"use client";
import { PayloadAction } from "@reduxjs/toolkit";
import { call, put, takeLatest } from "redux-saga/effects";
import {
  fetchPositionsApi,
  fetchPositionsByConditionApi,
  createPositionApi,
  updatePositionApi,
  deletePositionApi,
} from "../api/positionApi";
import {
  fetchPositionsRequest,
  fetchPositionsSuccess,
  fetchPositionsFailure,
  fetchPositionsByConditionRequest,
  fetchPositionsByConditionSuccess,
  fetchPositionsByConditionFailure,
  createPositionRequest,
  createPositionSuccess,
  createPositionFailure,
  updatePositionRequest,
  updatePositionSuccess,
  updatePositionFailure,
  deletePositionRequest,
  deletePositionSuccess,
  deletePositionFailure,
  type ApiResponse,
  type Position,
  type PositionInput,
  type SearchCondition,
} from "./positionSlice";
const getErrorMessage = (err: unknown): string =>
  err instanceof Error ? err.message : "Unknown error";
function* fetchPositionsWorker() {
  try {
    const ApiResponse: ApiResponse<Position[]> = yield call(fetchPositionsApi);
    if (ApiResponse.success && ApiResponse.result) {
      yield put(fetchPositionsSuccess(ApiResponse.result));
    } else {
      yield put(fetchPositionsFailure(ApiResponse.message));
    }
  } catch (err: unknown) {
    yield put(fetchPositionsFailure(getErrorMessage(err)));
  }
}

function* fetchPositionsByConditionWorker(action: PayloadAction<SearchCondition>) {
  try {
    const ApiResponse: ApiResponse<Position[]> = yield call(
      fetchPositionsByConditionApi,
      action.payload
    );
    if (ApiResponse.success && ApiResponse.result) {
      yield put(fetchPositionsByConditionSuccess(ApiResponse.result));
    } else {
      yield put(fetchPositionsByConditionFailure(ApiResponse.message));
    }
  } catch (err: unknown) {
    yield put(fetchPositionsByConditionFailure(getErrorMessage(err)));
  }
}
function* createPositionWorker(action: PayloadAction<PositionInput>) {
  try {
    const ApiResponse: ApiResponse<Position> = yield call(
      createPositionApi,
      action.payload
    );
    if (ApiResponse.success && ApiResponse.result) {
      yield put(createPositionSuccess(ApiResponse.result));
    } else {
      yield put(createPositionFailure(ApiResponse.message));
    }
  } catch (err: unknown) {
    yield put(createPositionFailure(getErrorMessage(err)));
  }
}
function* updatePositionWorker(
  action: PayloadAction<{ id: number; data: PositionInput }>
) {
  try {
    const ApiResponse: ApiResponse<Position> = yield call(
      updatePositionApi,
      action.payload.id,
      action.payload.data
    );
    if (ApiResponse.success && ApiResponse.result) {
      yield put(updatePositionSuccess(ApiResponse.result));
    } else {
      yield put(updatePositionFailure(ApiResponse.message));
    }
  } catch (err: unknown) {
    yield put(updatePositionFailure(getErrorMessage(err)));
  }
}
function* deletePositionWorker(action: PayloadAction<number>) {
  try {
    const ApiResponse: ApiResponse<void> = yield call(
      deletePositionApi,
      action.payload
    );
    if (ApiResponse.success) {
      yield put(deletePositionSuccess(action.payload));
    } else {
      yield put(deletePositionFailure(ApiResponse.message));
    }
  } catch (err: unknown) {
    yield put(deletePositionFailure(getErrorMessage(err)));
  }
}
export function* positionSaga() {
  yield takeLatest(fetchPositionsRequest.type, fetchPositionsWorker);
  yield takeLatest(fetchPositionsByConditionRequest.type, fetchPositionsByConditionWorker);
  yield takeLatest(createPositionRequest.type, createPositionWorker);
  yield takeLatest(updatePositionRequest.type, updatePositionWorker);
  yield takeLatest(deletePositionRequest.type, deletePositionWorker);
}
