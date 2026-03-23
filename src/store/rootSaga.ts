import { all, fork } from "redux-saga/effects";
import billingSaga from "@/features/billing/billingSaga";
import { watchConsentSaga } from "@/features/consent/consentSaga";
import { watchEmergencyReceptionSaga } from "@/features/EmergencyReception/EmergencyReceptionSaga";
import { watchInsuranceSaga } from "@/features/insurance/insuranceSaga";
import { watchInpatientReceptionSaga } from "@/features/InpatientReception/InpatientReceptionSaga";
import { watchPatientSaga } from "@/features/patients/patientSaga";
import { watchRecordSaga } from "@/features/Record/recordSaga";
import { watchReceptionSaga as watchReceptionsSaga } from "@/features/Reception/ReceptionSaga";
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
