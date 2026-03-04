"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import PatientForm from "@/components/PatientForm";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/store/store";
import type { PatientForm as PatientFormPayload } from "@/features/patients/patientTypes";
import { createPatientApi } from "@/lib/patientApi";
import { patientActions } from "@/features/patients/patientSlice";

function resolveErrorMessage(err: unknown, fallback: string) {
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

export default function NewPatientPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const onSubmit = async (form: PatientFormPayload) => {
    try {
      setSubmitting(true);
      setError(null);
      await createPatientApi(form);
      dispatch(patientActions.fetchPatientsRequest());
      router.push("/patients");
    } catch (err: unknown) {
      setError(resolveErrorMessage(err, "환자 등록 실패"));
    } finally {
      setSubmitting(false);
    }
  };

  const onSubmitAndReception = async (form: PatientFormPayload) => {
    try {
      setSubmitting(true);
      setError(null);

      const created = await createPatientApi(form);
      dispatch(patientActions.fetchPatientsRequest());
      const patientName = (created.name ?? form.name ?? "").trim();
      router.push(
        `/receptions/new?patientName=${encodeURIComponent(patientName)}&patientId=${created.patientId}`
      );
    } catch (err: unknown) {
      setError(resolveErrorMessage(err, "등록 후 접수 처리 실패"));
    } finally {
      setSubmitting(false);
    }
  };

  const onSubmitAndReservation = async (form: PatientFormPayload) => {
    try {
      setSubmitting(true);
      setError(null);

      const created = await createPatientApi(form);
      dispatch(patientActions.fetchPatientsRequest());
      const patientName = (created.name ?? form.name ?? "").trim();
      router.push(
        `/reservations/new?patientName=${encodeURIComponent(patientName)}&patientId=${created.patientId}`
      );
    } catch (err: unknown) {
      setError(resolveErrorMessage(err, "등록 후 예약접수 이동 실패"));
    } finally {
      setSubmitting(false);
    }
  };

  const onSubmitAndEmergency = async (form: PatientFormPayload) => {
    try {
      setSubmitting(true);
      setError(null);

      const created = await createPatientApi(form);
      dispatch(patientActions.fetchPatientsRequest());
      const patientName = (created.name ?? form.name ?? "").trim();
      router.push(
        `/emergency-receptions/new?patientName=${encodeURIComponent(patientName)}&patientId=${created.patientId}`
      );
    } catch (err: unknown) {
      setError(resolveErrorMessage(err, "등록 후 응급접수 이동 실패"));
    } finally {
      setSubmitting(false);
    }
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
        loading={submitting}
        error={error}
        onSubmit={onSubmit}
        postSubmitOptions={[
          { label: "외래접수", onSubmit: onSubmitAndReception },
          { label: "예약접수", onSubmit: onSubmitAndReservation },
          { label: "응급접수", onSubmit: onSubmitAndEmergency },
        ]}
        onCancel={() => router.push("/patients")}
      />
    </MainLayout>
  );
}
