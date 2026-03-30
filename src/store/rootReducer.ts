import { combineReducers } from "@reduxjs/toolkit";
import consentReducer from "@/features/consent/consentSlice";
import billingReducer from "@/features/billing/billingSlice";
import emergencyReceptionsReducer from "@/features/EmergencyReception/EmergencyReceptionSlice";
import insuranceReducer from "@/features/insurance/insuranceSlice";
import inpatientReceptionsReducer from "@/features/InpatientReception/InpatientReceptionSlice";
import patientsReducer from "@/features/patients/patientSlice";
import recordsReducer from "@/features/medical_support/record/recordSlice";
import testexecutionsReducer from "@/features/medical_support/testExecution/testExecutionSlice";
import receptionsReducer from "@/features/Reception/ReceptionSlice";
import reservationsReducer from "@/features/Reservations/ReservationSlice";
import employeeNurseReducer from "@/features/staff/nurse/nurseSlice"
import employeeDoctorReducer from "@/features/staff/doctor/doctorSlice"
import employeeBasiclnfoReducer from "@/features/staff/Basiclnfo/BasiclnfoSlict"
import employeeReceptionReducer from "@/features/staff/reception/receptionSlice"
import StaffdepartmentReducer from "@/features/staff/department/departmentSlisct"
import StafflocationReducer from "@/features/staff/location/locationSlice"
import StaffpositionReducer from "@/features/staff/position/positionSlice"


const rootReducer = combineReducers({
  consent: consentReducer,
  billing: billingReducer,
  emergencyReceptions: emergencyReceptionsReducer,
  insurance: insuranceReducer,
  inpatientReceptions: inpatientReceptionsReducer,
  patients: patientsReducer,
  records: recordsReducer,
  testexecutions: testexecutionsReducer,
  receptions: receptionsReducer,
  reservations: reservationsReducer,
  nurse: employeeNurseReducer,
  doctor :employeeDoctorReducer,
  staff: employeeBasiclnfoReducer,
  reception: employeeReceptionReducer,
  department: StaffdepartmentReducer,
  location: StafflocationReducer,
  position: StaffpositionReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;

