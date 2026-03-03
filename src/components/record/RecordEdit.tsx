"use client";

import { useParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store";
import type { NursingRecordCreatePayload } from "@/lib/recordApi";
import RecordForm from "./RecordForm";
import { fetchRecordRequest, updateRecordRequest } from "@/features/Record/recordSlice";
import { useEffect } from "react";



export default function RecordEdit() {

  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const { selected, loading, error } = useSelector((s: RootState) => s.records);

  const  {id } = useParams<{id :string}>();
  const nursingId = id;


  useEffect(() => {
    dispatch(fetchRecordRequest({nursingId}));
  }, [dispatch, nursingId]);




  const onSubmit = (payload: NursingRecordCreatePayload) => {
    dispatch(updateRecordRequest({ nursingId, form: payload }));
    router.push("/nurse/record");
  };

  return (
    <Card sx={{ borderRadius: 3, border: "1px solid var(--line)" }}>
      <CardContent sx={{ p: 2.5 }}>
        <RecordForm
          title="간호 기록 수정"
          initial={selected}
          loading={loading}
          error={error}
          submitLabel="저장"
          onSubmit={onSubmit}
          onCancel={() => router.push("/nurse/record")}
        />
      </CardContent>
    </Card>
  );
}
