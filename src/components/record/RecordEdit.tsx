"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardContent, CircularProgress } from "@mui/material";
import { fetchRecordRequest, updateRecordRequest } from "@/features/Record/recordSlice";
import type { AppDispatch, RootState } from "@/store/store";
import type { RecordForm as RecordFormState } from "@/features/Record/recordTypes";
import RecordForm from "./RecordForm";

const toText = (value: string | number | null | undefined) =>
  value === null || value === undefined ? "" : String(value);

export default function RecordEdit() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { nursingId } = useParams<{ nursingId: string }>();
  const { selected, loading, error } = useSelector((s: RootState) => s.records);

  useEffect(() => {
    if (nursingId) dispatch(fetchRecordRequest({ nursingId }));
  }, [dispatch, nursingId]);

  if (!selected) return <CircularProgress />;

  const initialForm: RecordFormState = {
    visitId: toText(selected.visitId),
    recordedAt: selected.recordedAt ?? "",
    systolicBp: toText(selected.systolicBp),
    diastolicBp: toText(selected.diastolicBp),
    pulse: toText(selected.pulse),
    respiration: toText(selected.respiration),
    temperature: toText(selected.temperature),
    spo2: toText(selected.spo2),
    painScore: toText(selected.painScore),
    consciousnessLevel: selected.consciousnessLevel ?? "",
    observation: selected.observation ?? "",
    initialAssessment: selected.initialAssessment ?? "",
    status: selected.status ?? "ACTIVE",
  };

  return (
    <Card sx={{ borderRadius: 3, border: "1px solid var(--line)" }}>
      <CardContent sx={{ p: 2.5 }}>
        <RecordForm
          key={selected.nursingId}
          title="간호 기록 수정"
          initial={initialForm}
          mode="edit"
          loading={loading}
          error={error}
          onSubmit={(payload) => {
            dispatch(updateRecordRequest({ nursingId, form: payload }));
            router.push("/medical_support/record/list");
          }}
          onCancel={() => router.push("/medical_support/record/list")}
        />
      </CardContent>
    </Card>
  );
}
