"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import EmergencyReceptionForm from "@/components/EmergencyReceptionForm";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/store/store";
import { emergencyReceptionActions } from "@/features/EmergencyReceptions/EmergencyReceptionSlice";
import type { EmergencyReceptionForm as EmergencyReceptionFormPayload } from "@/features/EmergencyReceptions/EmergencyReceptionTypes";

export default function NewEmergencyReceptionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((s: RootState) => s.emergencyReceptions);
  const [submitted, setSubmitted] = React.useState(false);
  const patientIdParam = (searchParams.get("patientId") ?? "").trim();

  const onSubmit = (form: EmergencyReceptionFormPayload) => {
    dispatch(emergencyReceptionActions.createEmergencyReceptionRequest(form));
    setSubmitted(true);
  };

  React.useEffect(() => {
    if (!submitted || loading) return;
    if (!error) {
      router.push("/emergency-receptions");
      return;
    }
    setSubmitted(false);
  }, [submitted, loading, error, router]);

  return (
    <MainLayout>
      <EmergencyReceptionForm
        title="응급 접수 등록"
        submitLabel="등록"
        initial={{
          receptionNo: "",
          patientId: patientIdParam,
          departmentId: "",
          doctorId: "",
          scheduledAt: "",
          arrivedAt: "",
          status: "WAITING",
          note: "",
          triageLevel: "",
          chiefComplaint: "",
          vitalTemp: "",
          vitalBpSystolic: "",
          vitalBpDiastolic: "",
          vitalHr: "",
          vitalRr: "",
          vitalSpo2: "",
          arrivalMode: "WALK_IN",
          triageNote: "",
        }}
        loading={loading}
        error={error}
        mode="create"
        onSubmit={onSubmit}
        onCancel={() => router.push("/emergency-receptions")}
      />
    </MainLayout>
  );
}
