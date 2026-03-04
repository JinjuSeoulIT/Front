"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import ReceptionForm from "@/components/ReceptionForm";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/store/store";
import { receptionActions } from "@/features/Receptions/ReceptionSlice";
import type { ReceptionForm as ReceptionFormPayload } from "@/features/Receptions/ReceptionTypes";

export default function NewReceptionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((s: RootState) => s.receptions);
  const patientName = (searchParams.get("patientName") ?? "").trim();
  const patientIdParam = (searchParams.get("patientId") ?? "").trim();
  const parsedPatientId = patientIdParam ? Number(patientIdParam) : NaN;
  const patientId = Number.isFinite(parsedPatientId) ? parsedPatientId : null;

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
          patientId,
          patientName,
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
        mode="create"
        showScheduledAt={false}
        onSubmit={onSubmit}
        onCancel={() => router.push("/receptions")}
      />
    </MainLayout>
  );
}
