"use client";

import { configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import employeesReducer from "@/entities/employee/model/employeesSlice";
import rootSaga from "./rootSaga";
import medicalStaffReducer from "@/entities/medical-staff/model/medicalStaffSlice";
import departmentReducer from "@/entities/department/model/departmentSlice";
import  positionReducer  from '@/entities/position/model/positionSlice';

const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
  reducer: {
    employees: employeesReducer,
    medicalStaff: medicalStaffReducer,
    department:departmentReducer,
    position:positionReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: false,
      serializableCheck: false,
    }).concat(sagaMiddleware),
});

sagaMiddleware.run(rootSaga);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
