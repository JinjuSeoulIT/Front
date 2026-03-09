 
import consentReducer from "@/features/consent/consentSlice";
import emergencyReceptionsReducer from "@/features/EmergencyReceptions/EmergencyReceptionSlice";
import insuranceReducer from "@/features/insurance/insuranceSlice";
import inpatientReceptionsReducer from "@/features/InpatientReceptions/InpatientReceptionSlice";
import patientsReducer from "@/features/patients/patientSlice";
import recordReducer from "@/features/Record/recordSlice";
import receptionsReducer from "@/features/Receptions/ReceptionSlice";
import reservationsReducer from "@/features/Reservations/ReservationSlice";
import employeeNurseReducer from "@/features/employee/nurse/nurseSlice"
import employeedoctorReducer from "@/features/employee/doctor/doctorSlice"
import employeeAuthenticationReducer from "@/features/employee/Staff/StaffSlict"

import { combineReducers } from "redux";

const rootReducer = combineReducers({
  consent: consentReducer,
  emergencyReceptions: emergencyReceptionsReducer,
  insurance: insuranceReducer,
  inpatientReceptions: inpatientReceptionsReducer,
  patients: patientsReducer,
  
  records: recordReducer,
  receptions: receptionsReducer,
  reservations: reservationsReducer,

  nurse: employeeNurseReducer,
  // doctor :employeedoctorReducer,
  // authentication : employeeAuthenticationReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;

