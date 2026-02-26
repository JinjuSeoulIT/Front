"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store";
import { emptyRecordForm } from "@/features/Record/recordTypes";
import type { NursingRecordCreatePayload } from "@/lib/recordApi";
import RecordForm from "./RecordForm";
import { createRecordRequest } from "@/features/Record/recordSlice";

export default function RecordCreate() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((s: RootState) => s.records);

  const onSubmit = (payload: NursingRecordCreatePayload) => {
    dispatch(createRecordRequest(payload));
    router.push("/nurse/record");
  };

  return (
    <Card sx={{ borderRadius: 3, border: "1px solid var(--line)" }}>
      <CardContent sx={{ p: 2.5 }}>
        <RecordForm
          title="간호 기록 등록"
          initial={emptyRecordForm}
          loading={loading}
          error={error}
          submitLabel="등록"
          onSubmit={onSubmit}
          onCancel={() => router.push("/nurse/record")}
        />
      </CardContent>
    </Card>
  );
}
