"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import PatientForm from "@/components/PatientForm";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/store/store";
import { patientActions } from "@/features/patients/patientSlice";
import type { PatientForm as PatientFormPayload } from "@/features/patients/patientTypes";

export default function PatientEditPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { selected, loading, error } = useSelector((s: RootState) => s.patients);

  const patientId = Number(params.id);
  const current = selected?.patientId === patientId ? selected : null;

  React.useEffect(() => {
    dispatch(patientActions.fetchPatientRequest({ patientId }));
  }, [dispatch, patientId]);

  const onSubmit = (form: PatientFormPayload) => {
    if (!current) return;
    dispatch(patientActions.updatePatientRequest({ patientId, form }));
    router.push(`/patients/${patientId}`);
  };

  const onDelete = () => {
    if (!confirm("환자를 비활성 처리하시겠습니까?")) return;
    dispatch(patientActions.deletePatientRequest(patientId));
    router.push("/patients");
  };

  return (
    <MainLayout>
      <PatientForm
        title="환자 정보 수정"
        submitLabel="저장"
        initial={{
          name: current?.name ?? "",
          email: current?.email ?? "",
          gender: current?.gender ?? "",
          birthDate: current?.birthDate ?? "",
          phone: current?.phone ?? "",
          address: current?.address ?? "",
          addressDetail: current?.addressDetail ?? "",
          guardianName: current?.guardianName ?? "",
          guardianPhone: current?.guardianPhone ?? "",
          guardianRelation: current?.guardianRelation ?? "",
          isForeigner: Boolean(current?.isForeigner),
          contactPriority: current?.contactPriority ?? "PATIENT",
          note: current?.note ?? "",
          photoFile: null,
        }}
        loading={loading}
        error={error}
        onSubmit={onSubmit}
        onCancel={() => router.push(`/patients/${patientId}`)}
        onDelete={current ? onDelete : undefined}
      />
    </MainLayout>
  );
}
