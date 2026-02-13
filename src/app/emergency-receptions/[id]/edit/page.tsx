"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import EmergencyReceptionForm from "@/components/EmergencyReceptionForm";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/store/store";
import { emergencyReceptionActions } from "@/features/EmergencyReceptions/EmergencyReceptionSlice";
import type { EmergencyReceptionForm as EmergencyReceptionFormPayload } from "@/features/EmergencyReceptions/EmergencyReceptionTypes";

export default function EditEmergencyReceptionPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { selected, loading, error } = useSelector((s: RootState) => s.emergencyReceptions);
  const receptionId = params.id;

  React.useEffect(() => {
    dispatch(emergencyReceptionActions.fetchEmergencyReceptionRequest({ receptionId }));
  }, [dispatch, receptionId]);

  const current = selected && String(selected.receptionId) === receptionId ? selected : null;

  const onSubmit = (form: EmergencyReceptionFormPayload) => {
    dispatch(emergencyReceptionActions.updateEmergencyReceptionRequest({ receptionId, form }));
    router.push(`/emergency-receptions/${receptionId}`);
  };

  return (
    <MainLayout>
      <EmergencyReceptionForm
        title="응급 접수 수정"
        submitLabel="저장"
        initial={{
          receptionNo: current?.receptionNo ?? "",
          patientId: current?.patientId ? String(current.patientId) : "",
          departmentId: current?.departmentId ? String(current.departmentId) : "",
          doctorId: current?.doctorId ? String(current.doctorId) : "",
          scheduledAt: current?.scheduledAt ?? "",
          arrivedAt: current?.arrivedAt ?? "",
          status: current?.status ?? "WAITING",
          note: current?.note ?? "",
          triageLevel: current?.triageLevel ? String(current.triageLevel) : "",
          chiefComplaint: current?.chiefComplaint ?? "",
          vitalTemp: current?.vitalTemp != null ? String(current.vitalTemp) : "",
          vitalBpSystolic: current?.vitalBpSystolic != null ? String(current.vitalBpSystolic) : "",
          vitalBpDiastolic: current?.vitalBpDiastolic != null ? String(current.vitalBpDiastolic) : "",
          vitalHr: current?.vitalHr != null ? String(current.vitalHr) : "",
          vitalRr: current?.vitalRr != null ? String(current.vitalRr) : "",
          vitalSpo2: current?.vitalSpo2 != null ? String(current.vitalSpo2) : "",
          arrivalMode: current?.arrivalMode ?? "WALK_IN",
          triageNote: current?.triageNote ?? "",
        }}
        loading={loading}
        error={error}
        onSubmit={onSubmit}
        onCancel={() => router.push(`/emergency-receptions/${receptionId}`)}
      />
    </MainLayout>
  );
}
