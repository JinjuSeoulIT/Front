"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import InpatientReceptionForm from "@/components/InpatientReceptionForm";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/store/store";
import { inpatientReceptionActions } from "@/features/InpatientReceptions/InpatientReceptionSlice";
import type { InpatientReceptionForm as InpatientReceptionFormPayload } from "@/features/InpatientReceptions/InpatientReceptionTypes";

export default function NewInpatientReceptionPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((s: RootState) => s.inpatientReceptions);

  const onSubmit = (form: InpatientReceptionFormPayload) => {
    dispatch(inpatientReceptionActions.createInpatientReceptionRequest(form));
    router.push("/inpatient-receptions");
  };

  return (
    <MainLayout>
      <InpatientReceptionForm
        title="입원 접수 등록"
        submitLabel="등록"
        initial={{
          receptionNo: "",
          patientId: "",
          departmentId: "",
          doctorId: "",
          scheduledAt: "",
          arrivedAt: "",
          status: "WAITING",
          note: "",
          admissionPlanAt: "",
          wardId: "",
          roomId: "",
        }}
        loading={loading}
        error={error}
        onSubmit={onSubmit}
        onCancel={() => router.push("/inpatient-receptions")}
      />
    </MainLayout>
  );
}
