import { combineReducers } from "@reduxjs/toolkit";
import consentReducer from "@/features/consent/consentSlice";
import billingReducer from "@/features/billing/billingSlice";
import emergencyReceptionsReducer from "@/features/EmergencyReceptions/EmergencyReceptionSlice";
import insuranceReducer from "@/features/insurance/insuranceSlice";
import inpatientReceptionsReducer from "@/features/InpatientReceptions/InpatientReceptionSlice";
import patientsReducer from "@/features/patients/patientSlice";
import recordsReducer from "@/features/medical_support/record/recordSlice";
import receptionsReducer from "@/features/Receptions/ReceptionSlice";
import reservationsReducer from "@/features/Reservations/ReservationSlice";

const rootReducer = combineReducers({
  consent: consentReducer,
  billing: billingReducer,
  emergencyReceptions: emergencyReceptionsReducer,
  insurance: insuranceReducer,
  inpatientReceptions: inpatientReceptionsReducer,
  patients: patientsReducer,
  records: recordsReducer,
  receptions: receptionsReducer,
  reservations: reservationsReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;

