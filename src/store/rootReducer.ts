import { combineReducers } from "@reduxjs/toolkit";
import consentReducer from "@/features/consent/consentSlice";
import billingReducer from "@/features/billing/billingSlice";
import emergencyReceptionsReducer from "@/features/EmergencyReception/EmergencyReceptionSlice";
import insuranceReducer from "@/features/insurance/insuranceSlice";
import inpatientReceptionsReducer from "@/features/InpatientReception/InpatientReceptionSlice";
import patientsReducer from "@/features/patients/patientSlice";
import recordsReducer from "@/features/medical_support/record/recordSlice";
import testexecutionsReducer from "@/features/medical_support/testExecution/testExecutionSlice";
import imagingsReducer from "@/features/medical_support/imaging/imagingSlice";
import specimensReducer from "@/features/medical_support/specimen/specimenSlice";
import pathologiesReducer from "@/features/medical_support/pathology/pathologySlice";
import endoscopiesReducer from "@/features/medical_support/endoscopy/endoscopySlice";
import physiologicalsReducer from "@/features/medical_support/physiological/physiologicalSlice";
import receptionsReducer from "@/features/Reception/ReceptionSlice";
import reservationsReducer from "@/features/Reservations/ReservationSlice";
import employeeNurseReducer from "@/features/staff/nurse/nurseSlice";
import employeedoctorReducer from "@/features/staff/doctor/doctorSlice";
import employeeBasiclnfoReducer from "@/features/staff/Basiclnfo/BasiclnfoSlict";
import receptionReducer from "@/features/staff/reception/receptionSlice";

const rootReducer = combineReducers({
  consent: consentReducer,
  billing: billingReducer,
  emergencyReceptions: emergencyReceptionsReducer,
  insurance: insuranceReducer,
  inpatientReceptions: inpatientReceptionsReducer,
  patients: patientsReducer,
  records: recordsReducer,
  testexecutions: testexecutionsReducer,
  imagings: imagingsReducer,
  specimens: specimensReducer,
  pathologies: pathologiesReducer,
  endoscopies: endoscopiesReducer,
  physiologicals: physiologicalsReducer,
  receptions: receptionsReducer,
  reservations: reservationsReducer,
  nurse: employeeNurseReducer,
  doctor: employeedoctorReducer,
  staff: employeeBasiclnfoReducer,
  reception: receptionReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;