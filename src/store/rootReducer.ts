import { combineReducers } from "@reduxjs/toolkit";
import consentReducer from "@/features/consent/consentSlice";
import emergencyReceptionsReducer from "@/features/EmergencyReceptions/EmergencyReceptionSlice";
import insuranceReducer from "@/features/insurance/insuranceSlice";
import inpatientReceptionsReducer from "@/features/InpatientReceptions/InpatientReceptionSlice";
import patientsReducer from "@/features/patients/patientSlice";
import receptionsReducer from "@/features/Receptions/ReceptionSlice";
import reservationsReducer from "@/features/Reservations/ReservationSlice";

const rootReducer = combineReducers({
  consent: consentReducer,
  emergencyReceptions: emergencyReceptionsReducer,
  insurance: insuranceReducer,
  inpatientReceptions: inpatientReceptionsReducer,
  patients: patientsReducer,
  receptions: receptionsReducer,
  reservations: reservationsReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;

