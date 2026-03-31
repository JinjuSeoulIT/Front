import { all, fork } from "redux-saga/effects";
import billingSaga from "@/features/billing/billingSaga";
import { watchConsentSaga } from "@/features/consent/consentSaga";
import { watchEmergencyReceptionSaga } from "@/features/EmergencyReception/EmergencyReceptionSaga";
import { watchInsuranceSaga } from "@/features/insurance/insuranceSaga";
import { watchInpatientReceptionSaga } from "@/features/InpatientReception/InpatientReceptionSaga";
import { watchPatientSaga } from "@/features/patients/patientSaga";
import { watchRecordSaga } from "@/features/medical_support/record/recordSaga";
<<<<<<< HEAD
// import { watchTestExecutionSaga } from "@/features/medical_support/testexecution/testexecutionSaga";
import { watchReceptionSaga as watchReceptionsSaga } from "@/features/Reception/ReceptionSaga";
import { watchReservationSaga } from "@/features/Reservations/ReservationSaga";
import { watchEmployeeNurseSaga } from "@/features/staff/nurse/nurseSaga";
import { watchEmployeeDoctorSaga } from "@/features/staff/doctor/doctorSaga";
import { watchEmployeeStaffSaga } from "@/features/staff/Basiclnfo/BasiclnfoSaga";
import { watchEmployeeReceptionSaga } from "@/features/staff/reception/receptionSaga";
import watchStaffDepartmentSaga from "@/features/staff/department/departmentSaga";
import watchStaffLocationSaga from "@/features/staff/location/locationSaga";
import watchStaffPositionSaga from "@/features/staff/position/positionSaga";

=======
import { watchTestExecutionSaga } from "@/features/medical_support/testExecution/testExecutionSaga";
import { watchImagingSaga } from "@/features/medical_support/imaging/imagingSaga";
import { watchSpecimenSaga } from "@/features/medical_support/specimen/specimenSaga";
import { watchPathologySaga } from "@/features/medical_support/pathology/pathologySaga";
import { watchEndoscopySaga } from "@/features/medical_support/endoscopy/endoscopySaga";
import { watchPhysiologicalSaga } from "@/features/medical_support/physiological/physiologicalSaga";
import { watchMedicationRecordSaga } from "@/features/medical_support/medicationRecord/medicationRecordSaga";
import { watchTreatmentResultSaga } from "@/features/medical_support/treatmentResult/treatmentResultSaga";
import { watchReceptionSaga as watchReceptionsSaga } from "@/features/Reception/ReceptionSaga";
import { watchReservationSaga } from "@/features/Reservations/ReservationSaga";
import { watchEmployeeNurseSaga } from "@/features/staff/nurse/nurseSaga";
import { watchEmployeedoctorSaga } from "@/features/staff/doctor/doctorSaga";
import { watchEmployeeStaffSaga } from "@/features/staff/Basiclnfo/BasiclnfoSaga";
import { watchEmployeeReceptionSaga } from "@/features/staff/reception/receptionSaga";
>>>>>>> refactor/hyj

export default function* rootSaga() {
  yield all([
    fork(watchEmergencyReceptionSaga),
    fork(watchInpatientReceptionSaga),
    fork(watchPatientSaga),
    fork(watchRecordSaga),
<<<<<<< HEAD
    // fork(watchTestExecutionSaga),
=======
    fork(watchTestExecutionSaga),
    fork(watchImagingSaga),
    fork(watchSpecimenSaga),
    fork(watchPathologySaga),
    fork(watchEndoscopySaga),
    fork(watchPhysiologicalSaga),
    fork(watchMedicationRecordSaga),
    fork(watchTreatmentResultSaga),
>>>>>>> refactor/hyj
    fork(watchInsuranceSaga),
    fork(watchConsentSaga),
    fork(watchReceptionsSaga),
    fork(watchReservationSaga),
    fork(billingSaga),
    fork(watchEmployeeNurseSaga),
<<<<<<< HEAD
    fork(watchEmployeeDoctorSaga),
    fork(watchEmployeeStaffSaga),
    fork(watchEmployeeReceptionSaga),
    fork(watchStaffDepartmentSaga),
    fork(watchStaffLocationSaga),
    fork(watchStaffPositionSaga)
=======
    fork(watchEmployeedoctorSaga),
    fork(watchEmployeeStaffSaga),
    fork(watchEmployeeReceptionSaga),
>>>>>>> refactor/hyj
  ]);
}