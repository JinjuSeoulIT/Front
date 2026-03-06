"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";

import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/store/store";
import { receptionActions } from "@/features/Receptions/ReceptionSlice";
import type { ReceptionForm as ReceptionFormPayload } from "@/features/Receptions/ReceptionTypes";
import { Button, Stack } from "@mui/material";
import ReceptionForm from "@/components/reception/ReceptionForm";

export default function ReceptionEditPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { selected, loading, error } = useSelector((s: RootState) => s.receptions);

  const receptionId = params.id;
  const current = selected && String(selected.receptionId) === receptionId ? selected : null;

  React.useEffect(() => {
    dispatch(receptionActions.fetchReceptionRequest({ receptionId }));
  }, [dispatch, receptionId]);

  const onSubmit = (form: ReceptionFormPayload) => {
    if (!current) return;
    dispatch(receptionActions.updateReceptionRequest({ receptionId, form }));
    router.push(`/reception/outpatient/detail/${receptionId}`);
  };

  const onDelete = () => {
    if (!confirm("접수를 취소 처리하시겠습니까?")) return;
    dispatch(receptionActions.cancelReceptionRequest({ receptionId }));
    router.push("/reception/outpatient/list");
  };

  return (
    <MainLayout>
      <ReceptionForm
        title="접수 정보 수정"
        submitLabel="저장"
        initial={{
          receptionNo: current?.receptionNo ?? "",
          patientName: current?.patientName ?? "",
          departmentName: current?.departmentName ?? "",
          doctorName: current?.doctorName ?? "",
          visitType: current?.visitType ?? "OUTPATIENT",
          scheduledAt: current?.scheduledAt ?? "",
          arrivedAt: current?.arrivedAt ?? "",
          status: current?.status ?? "WAITING",
          note: current?.note ?? "",
        }}
        loading={loading}
        error={error}
        mode="edit"
        showScheduledAt={false}
        onSubmit={onSubmit}
        onCancel={() => router.push(`/reception/outpatient/detail/${receptionId}`)}
      />
      {current && (
        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          <Button variant="outlined" color="warning" onClick={onDelete}>
            취소
          </Button>
        </Stack>
      )}
    </MainLayout>
  );
}
