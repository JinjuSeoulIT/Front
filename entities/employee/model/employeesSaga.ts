"use client";

import { PayloadAction } from "@reduxjs/toolkit";
import { call, put, takeLatest } from "redux-saga/effects";
import {
  createEmployeeApi,
  deleteEmployeeApi,
  fetchEmployeesApi,
  fetchEmployeeApi,
  updateEmployeeApi,
  fetchEmployeesByConditionApi,
  
} from "../api/employeesApi";

import {
  fetchEmployeesRequest,
  fetchEmployeesSuccess,
  fetchEmployeesFailure,

  createEmployeeRequest,
  createEmployeeSuccess,
  createEmployeeFailure,

  fetchEmployeeRequest,
  fetchEmployeeSuccess,
  fetchEmployeeFailure,

  updateEmployeeRequest,
  updateEmployeeSuccess,
  updateEmployeeFailure,

  deleteEmployeeRequest,
  deleteEmployeeSuccess,
  deleteEmployeeFailure,

  fetchEmployeesByConditionRequest, 
  fetchEmployeesByConditionSuccess,
  fetchEmployeesByConditionFailure,

  

  type ApiResponse,
  type Employee,
  type EmployeeInput,
  type SearchCondition,
} from "./employeesSlice";

// 에러 메시지 받는 함수.
const getErrorMessage = (err: unknown):string =>
{
  if (err instanceof Error) 
    return err.message
  
  return "Unknown error"
}


function* fetchEmployeesWorker() {
  try 
  {
    console.log("★전체 목록 호출을 위한 API 실행★")

    const ApiResponse: ApiResponse<Employee[]> = yield call(fetchEmployeesApi);

    console.log("4. SAGA: API를 호출해서 가지고온 ApiResponse 객체", ApiResponse)

    if(ApiResponse.success && ApiResponse.result)
    {
      console.log("4-1. SAGA: API를 호출해서 가지고온 ApiResponse 성공 객체", ApiResponse)
      yield put(fetchEmployeesSuccess(ApiResponse.result));
    }
    else
      {
      console.log("4-2. SAGA: API를 호출해서 가지고온 ApiResponse 실패 객체", ApiResponse)
      yield put(fetchEmployeesFailure(ApiResponse.message));
      }
  } 
  catch 
  (err: unknown)
   {
    console.error("4-3. SAGA: API를 호출에서 가지고 오는 도중에 실패한 경우", err);
    yield put(fetchEmployeesFailure(getErrorMessage(err)));
  }
}

function* fetchEmployeeWorker(action: PayloadAction<number>) {
  try 
  {
    console.log("★단일 목록 호출을 위한 API 실행★")

    const ApiResponse: ApiResponse<Employee> = yield call(fetchEmployeeApi, action.payload);

    console.log("4. SAGA: 직원 상세 정보 API 응답 수신", ApiResponse);

    if(ApiResponse.success && ApiResponse.result)
    {
      console.log("5. SAGA: 성공 액션 호출 (fetchEmployeeSuccess)");
      yield put(fetchEmployeeSuccess(ApiResponse.result));
    }
    else
    {
      console.log("5. SAGA: 실패 액션 호출 (fetchEmployeeFailure - API 실패)", ApiResponse.message);
      yield put(fetchEmployeeFailure(ApiResponse.message));
    }
  } 
  catch 
  (err: unknown)
   {
    console.error("5. SAGA: 실패 액션 호출 (fetchEmployeeFailure - 예외 발생)", err);
    yield put(fetchEmployeeFailure(getErrorMessage(err)));
  }
}

function* createEmployeeWorker(action: PayloadAction<FormData>) {
  try 
  {
    console.log("★직원 생성을 위한 API 실행★")

    const ApiResponse: ApiResponse<Employee> = yield call(createEmployeeApi, action.payload); // 백엔드 안돌아가면 여기서 터짐.

    console.log("4. SAGA: 직원 생성 API 응답 수신", ApiResponse);
    
    if(ApiResponse.success && ApiResponse.result)    {
      console.log("5. SAGA: 성공 액션 호출 (createEmployeeSuccess)");
      yield put(createEmployeeSuccess(ApiResponse.result));
    } 
    else
    {
      console.log("5. SAGA: 실패 액션 호출 (createEmployeeFailure - API 실패)", ApiResponse.message);
      yield put(createEmployeeFailure(ApiResponse.message));
    }
  }
  
  catch (err: unknown) 
  {
    console.error("5. SAGA: 실패 액션 호출 (createEmployeeFailure - 예외 발생)", err);
    yield put(
      createEmployeeFailure(
        getErrorMessage(err)
      )
    );
  }
}

function* updateEmployeeWorker(action: PayloadAction<{ id: number, data:EmployeeInput }>) {
  try {
    console.log("★직원 수정을 위한 API 실행★")
    const ApiResponse: ApiResponse<Employee> = yield call( updateEmployeeApi ,action.payload.id,action.payload.data);
    console.log("4. SAGA: 직원 수정 API 응답 수신", ApiResponse);

    if(ApiResponse.success && ApiResponse.result) {
      console.log("5. SAGA: 성공 액션 호출 (updateEmployeeSuccess)");
      yield put(updateEmployeeSuccess(ApiResponse.result));
    } else {
      console.log("5. SAGA: 실패 액션 호출 (updateEmployeeFailure - API 실패)", ApiResponse.message);
      yield put(updateEmployeeFailure(ApiResponse.message));
    }
  } catch (err: unknown) {
    console.error("5. SAGA: 실패 액션 호출 (updateEmployeeFailure - 예외 발생)", err);
    yield put(
      updateEmployeeFailure(
        getErrorMessage(err)
      )
    );
  }
}

function* deleteEmployeeWorker(action: PayloadAction<number>) {
  try {
    console.log("★직원 삭제를 위한 API 실행★")
    const ApiResponse:ApiResponse<void> =yield call(deleteEmployeeApi, action.payload);
    console.log("4. SAGA: 직원 삭제 API 응답 수신", ApiResponse);
  
    if(ApiResponse.success) {
      console.log("5. SAGA: 성공 액션 호출 (deleteEmployeeSuccess)");
      yield put(deleteEmployeeSuccess(action.payload));
    } else {
      console.log("5. SAGA: 실패 액션 호출 (deleteEmployeeFailure - API 실패)", ApiResponse.message);
      yield put(deleteEmployeeFailure(ApiResponse.message));
    }
  } catch (err: unknown) {
    console.error("5. SAGA: 실패 액션 호출 (deleteEmployeeFailure - 예외 발생)", err);
    yield put(
      deleteEmployeeFailure(
        getErrorMessage(err)
      )
    );
  }
}

function* fetchEmployeesByConditionWorker(action: PayloadAction<SearchCondition>) {
  try {
    console.log("★조건에 맞는 직원 목록 호출을 위한 API 실행★")

    const ApiResponse: ApiResponse<Employee[]> = yield call(fetchEmployeesByConditionApi, action.payload);
    
    console.log("4. SAGA: 조건부 직원 검색 API 응답 수신", ApiResponse);
    
    if(ApiResponse.success && ApiResponse.result) {
      console.log("4. SAGA: 성공 액션 호출 (fetchEmployeesByConditionSuccess)");
      yield put(fetchEmployeesByConditionSuccess(ApiResponse.result));
    } else {
      console.log("4. SAGA: 실패 액션 호출 (fetchEmployeesByConditionFailure - API 실패)", ApiResponse.message);
      yield put(fetchEmployeesByConditionFailure(ApiResponse.message));
    }
  } catch (err: unknown) {
    console.error("4. SAGA: 실패 액션 호출 (fetchEmployeesByConditionFailure - 예외 발생)", err);
    yield put( fetchEmployeesByConditionFailure( getErrorMessage(err) ));
  }
}



export function* employeesSaga() {
  yield takeLatest(fetchEmployeesRequest.type, fetchEmployeesWorker);
  yield takeLatest(fetchEmployeeRequest.type, fetchEmployeeWorker);
  yield takeLatest(createEmployeeRequest.type, createEmployeeWorker);
  yield takeLatest(updateEmployeeRequest.type, updateEmployeeWorker);
  yield takeLatest(deleteEmployeeRequest.type, deleteEmployeeWorker);

  yield takeLatest(fetchEmployeesByConditionRequest.type, fetchEmployeesByConditionWorker);
  
  
}
