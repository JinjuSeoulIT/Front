"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import ReservationForm from "@/components/ReservationForm";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/store/store";
import { reservationActions } from "@/features/Reservations/ReservationSlice";
import type { ReservationForm as ReservationFormPayload } from "@/features/Reservations/ReservationTypes";

export default function NewReservationPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((s: RootState) => s.reservations);

  const onSubmit = (form: ReservationFormPayload) => {
    dispatch(reservationActions.createReservationRequest(form));
    router.push("/reservations");
  };

  return (
    <MainLayout>
      <ReservationForm
        title="신규 예약 등록"
        submitLabel="등록"
        initial={{
          reservationNo: "",
          patientId: "",
          patientName: "",
          departmentId: "",
          departmentName: "",
          doctorId: "",
          doctorName: "",
          reservedAt: "",
          status: "RESERVED",
          note: "",
        }}
        loading={loading}
        error={error}
        onSubmit={onSubmit}
        onCancel={() => router.push("/reservations")}
      />
    </MainLayout>
  );
}
