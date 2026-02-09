import { all, fork } from "redux-saga/effects";
import { watchConsentSaga } from "@/features/consent/consentSaga";
import { watchInsuranceSaga } from "@/features/insurance/insuranceSaga";
import { watchPatientSaga } from "@/features/patients/patientSaga";
import { watchReceptionSaga } from "@/features/reception/receptionSaga";

export default function* rootSaga() {
  yield all([
    fork(watchPatientSaga),
    fork(watchInsuranceSaga),
    fork(watchConsentSaga),
    fork(watchReceptionSaga),
  ]);
}

