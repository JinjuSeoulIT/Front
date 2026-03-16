"use client";

import { CircularProgress } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";

import RecordForm from "./RecordForm";

import { AppDispatch } from "@/store/store";
import { RootState } from "@/store/rootReducer";
import { RecActions } from "@/features/record/recordSlice";
import { RecordFormType } from "@/features/record/recordTypes";

const RecordEdit = () => {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const recordId = useMemo(() => {
    const value = params?.recordId;
    if (Array.isArray(value)) return value[0];
    return value ?? "";
  }, [params]);

  const { selected, loading, error, updateSuccess } = useSelector(
    (state: RootState) => state.records
  );

  const [form, setForm] = useState<RecordFormType | null>(null);

  useEffect(() => {
    if (!recordId) return;
    dispatch(RecActions.fetchRecordRequest(recordId));
  }, [dispatch, recordId]);

  useEffect(() => {
    if (!selected.recordId) return;
    if (selected.recordId !== recordId) return;

    setForm({
      recordId: selected.recordId,
      nursingId: selected.nursingId ?? "",
      visitId: selected.visitId ?? "",
      recordedAt: selected.recordedAt ?? "",
      systolicBp: selected.systolicBp ?? "",
      diastolicBp: selected.diastolicBp ?? "",
      pulse: selected.pulse ?? "",
      respiration: selected.respiration ?? "",
      temperature: selected.temperature ?? "",
      spo2: selected.spo2 ?? "",
      observation: selected.observation ?? "",
      painScore: selected.painScore ?? "",
      consciousnessLevel: selected.consciousnessLevel ?? "",
      initialAssessment: selected.initialAssessment ?? "",
      status: selected.status ?? "",
      createdAt: selected.createdAt ?? "",
      updatedAt: selected.updatedAt ?? "",
    });
  }, [selected, recordId]);

useEffect(() => {
  if (!updateSuccess) return;

  alert("간호 기록이 수정되었습니다.");
  dispatch(RecActions.resetUpdateSuccess());
  router.push("/medical_support/record/list");
}, [updateSuccess, dispatch, router]);

  const handleSubmit = () => {
    if (!form || !recordId) return;

    const now = dayjs().format("YYYY-MM-DDTHH:mm:ss");

    dispatch(
      RecActions.updateRecordRequest({
        recordId,
        form: {
          ...form,
          updatedAt: now,
        },
      })
    );
  };

  if (loading && !form) {
    return (
      <main style={{ padding: 24 }}>
        <CircularProgress />
      </main>
    );
  }

  if (error) {
    return (
      <main style={{ padding: 24 }}>
        <p>에러가 발생했습니다: {error}</p>
      </main>
    );
  }

  // if (!form) {
  //   return (
  //     <main style={{ padding: 24 }}>
  //       <p>수정할 기록을 불러오지 못했습니다.</p>
  //     </main>
  //   );
  // }

  return (
    <main style={{ padding: 24 }}>
      <RecordForm
        mode="edit"
        form={form}
        onChange={setForm}
        onSubmit={handleSubmit}
        loading={loading}
      />
    </main>
  );
};

export default RecordEdit;
