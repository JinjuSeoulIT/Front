"use client";

import { all, fork } from "redux-saga/effects";
import { employeesSaga } from "@/entities/employee/model/employeesSaga";
import { medicalStaffSaga } from "@/entities/medical-staff/model/medicalStaffSaga";
import { departmentSaga } from "@/entities/department/model/departmentSaga";
import { positionSaga } from "@/entities/position/model/positionSaga";

export default function* rootSaga() {
  yield all([
    fork(employeesSaga),
    fork(medicalStaffSaga),
    fork(departmentSaga),
    fork(positionSaga),
  ]);
}
