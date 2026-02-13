"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import ReceptionForm from "@/components/ReceptionForm";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/store/store";
import { receptionActions } from "@/features/Receptions/ReceptionSlice";
import type { ReceptionForm as ReceptionFormPayload } from "@/features/Receptions/ReceptionTypes";

export default function NewReceptionPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((s: RootState) => s.receptions);

  const onSubmit = (form: ReceptionFormPayload) => {
    dispatch(receptionActions.createReceptionRequest(form));
    router.push("/receptions");
  };

  return (
    <MainLayout>
      <ReceptionForm
        title="신규 접수 등록"
        submitLabel="등록"
        initial={{
          receptionNo: "",
          patientName: "",
          departmentName: "",
          doctorName: "",
          visitType: "OUTPATIENT",
          scheduledAt: "",
          arrivedAt: "",
          status: "WAITING",
          note: "",
        }}
        loading={loading}
        error={error}
        onSubmit={onSubmit}
        onCancel={() => router.push("/receptions")}
      />
    </MainLayout>
  );
}
