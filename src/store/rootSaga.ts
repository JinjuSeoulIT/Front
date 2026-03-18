import { all, fork } from "redux-saga/effects";
import billingSaga from "@/features/billing/billingSaga";
import { watchConsentSaga } from "@/features/consent/consentSaga";
import { watchEmergencyReceptionSaga } from "@/features/EmergencyReceptions/EmergencyReceptionSaga";
import { watchInsuranceSaga } from "@/features/insurance/insuranceSaga";
import { watchInpatientReceptionSaga } from "@/features/InpatientReceptions/InpatientReceptionSaga";
import { watchPatientSaga } from "@/features/patients/patientSaga";
import { watchRecordSaga } from "@/features/medical_support/record/recordSaga";
import { watchReceptionSaga as watchReceptionsSaga } from "@/features/Receptions/ReceptionSaga";
import { watchReservationSaga } from "@/features/Reservations/ReservationSaga";

export default function* rootSaga() {
  yield all([
    fork(watchEmergencyReceptionSaga),
    fork(watchInpatientReceptionSaga),
    fork(watchPatientSaga),
    fork(watchRecordSaga),
    fork(watchInsuranceSaga),
    fork(watchConsentSaga),
    fork(watchReceptionsSaga),
    fork(watchReservationSaga),
    fork(billingSaga),
  ]);
}
