import { combineReducers } from "@reduxjs/toolkit";
import consentReducer from "@/features/consent/consentSlice";
import insuranceReducer from "@/features/insurance/insuranceSlice";
import patientsReducer from "@/features/patients/patientSlice";
import receptionReducer from "@/features/reception/receptionSlice";

const rootReducer = combineReducers({
  consent: consentReducer,
  insurance: insuranceReducer,
  patients: patientsReducer,
  reception: receptionReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;

