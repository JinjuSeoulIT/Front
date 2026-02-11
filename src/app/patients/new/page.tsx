"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import PatientForm from "@/components/PatientForm";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/store/store";
import { patientActions } from "@/features/patients/patientSlice";
import type { PatientForm as PatientFormPayload } from "@/features/patients/patientTypes";

export default function NewPatientPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((s: RootState) => s.patients);

  const onSubmit = (form: PatientFormPayload) => {
     console.log("[patient] onSubmit", form);
    dispatch(patientActions.createPatientRequest(form));
    router.push("/patients");
  };

  return (
    <MainLayout>
      <PatientForm
        title="신규 환자 등록"
        submitLabel="등록"
        initial={{
          name: "",
          email: "",
          gender: "",
          birthDate: "",
          phone: "",
          address: "",
          addressDetail: "",
          guardianName: "",
          guardianPhone: "",
          guardianRelation: "",
          isForeigner: false,
          contactPriority: "PATIENT",
          note: "",
          photoFile: null,
        }}
        showPhotoField
        enableDuplicateCheck
        loading={loading}
        error={error}
        onSubmit={onSubmit}
        onCancel={() => router.push("/patients")}
      />
    </MainLayout>
  );
}
