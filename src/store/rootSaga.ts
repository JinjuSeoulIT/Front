import { all, fork } from "redux-saga/effects";
import { watchConsentSaga } from "@/features/consent/consentSaga";
import { watchEmergencyReceptionSaga } from "@/features/EmergencyReceptions/EmergencyReceptionSaga";
import { watchInsuranceSaga } from "@/features/insurance/insuranceSaga";
import { watchInpatientReceptionSaga } from "@/features/InpatientReceptions/InpatientReceptionSaga";
import { watchPatientSaga } from "@/features/patients/patientSaga";
import { watchReceptionSaga as watchReceptionsSaga } from "@/features/Receptions/ReceptionSaga";
import { watchReservationSaga } from "@/features/Reservations/ReservationSaga";
import { watchRecordSaga } from "@/features/Record/recordSaga";
import { watchNurseSaga } from "@/features/nurse/nurseSaga";

export default function* rootSaga() {
  yield all([
    fork(watchEmergencyReceptionSaga),
    fork(watchInpatientReceptionSaga),
    fork(watchPatientSaga),
    fork(watchInsuranceSaga),
    fork(watchConsentSaga),
    fork(watchRecordSaga),
    fork(watchReceptionsSaga),
    fork(watchReservationSaga),
    fork(watchNurseSaga),
  ]);
}
