import { all, fork } from "redux-saga/effects";
import billingSaga from "@/features/billing/billingSaga";
import { watchConsentSaga } from "@/features/consent/consentSaga";
import { watchEmergencyReceptionSaga } from "@/features/EmergencyReception/EmergencyReceptionSaga";
import { watchInsuranceSaga } from "@/features/insurance/insuranceSaga";
import { watchInpatientReceptionSaga } from "@/features/InpatientReception/InpatientReceptionSaga";
import { watchPatientSaga } from "@/features/patients/patientSaga";
import { watchRecordSaga } from "@/features/medical_support/record/recordSaga";
import { watchTestExecutionSaga } from "@/features/medical_support/testExecution/testExecutionSaga";
import { watchImagingSaga } from "@/features/medical_support/imaging/imagingSaga";
import { watchSpecimenSaga } from "@/features/medical_support/specimen/specimenSaga";
import { watchPathologySaga } from "@/features/medical_support/pathology/pathologySaga";
import { watchEndoscopySaga } from "@/features/medical_support/endoscopy/endoscopySaga";
import { watchPhysiologicalSaga } from "@/features/medical_support/physiological/physiologicalSaga";
import { watchReceptionSaga as watchReceptionsSaga } from "@/features/Reception/ReceptionSaga";
import { watchReservationSaga } from "@/features/Reservations/ReservationSaga";
import { watchEmployeeNurseSaga } from "@/features/staff/nurse/nurseSaga";
import { watchEmployeedoctorSaga } from "@/features/staff/doctor/doctorSaga";
import { watchEmployeeStaffSaga } from "@/features/staff/Basiclnfo/BasiclnfoSaga";
import { watchEmployeeReceptionSaga } from "@/features/staff/reception/receptionSaga";

export default function* rootSaga() {
  yield all([
    fork(watchEmergencyReceptionSaga),
    fork(watchInpatientReceptionSaga),
    fork(watchPatientSaga),
    fork(watchRecordSaga),
    fork(watchTestExecutionSaga),
    fork(watchImagingSaga),
    fork(watchSpecimenSaga),
    fork(watchPathologySaga),
    fork(watchEndoscopySaga),
    fork(watchPhysiologicalSaga),
    fork(watchInsuranceSaga),
    fork(watchConsentSaga),
    fork(watchReceptionsSaga),
    fork(watchReservationSaga),
    fork(billingSaga),
    fork(watchEmployeeNurseSaga),
    fork(watchEmployeedoctorSaga),
    fork(watchEmployeeStaffSaga),
    fork(watchEmployeeReceptionSaga),
  ]);
}