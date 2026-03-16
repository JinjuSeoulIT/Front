"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import type { AppDispatch } from "../../store/store";

import { RootState } from "@/store/rootReducer";

import RecordForm from "./RecordForm";
import { RecActions } from "@/features/record/recordSlice";
import { RecordFormType } from "@/features/record/recordTypes";


const emptyForm: RecordFormType = {
  recordId: "",
  visitId: "",
  nursingId: "",
  recordedAt: "",
  createdAt: "",
  updatedAt: "",
  systolicBp: "",
  diastolicBp: "",
  pulse: "",
  respiration: "",
  temperature: "",
  spo2: "",
  observation: "",
  painScore: "",
  consciousnessLevel: "",
  initialAssessment: "",
  status: "",
};

const RecordCreate = () => {
  const [form, setForm] = useState<RecordFormType>(emptyForm);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const { loading, error, createSuccess } = useSelector(
  (state: RootState) => state.records
);

useEffect(() => {
  if (!createSuccess) return;

  alert("간호 기록이 저장되었습니다.");
  dispatch(RecActions.resetCreateSuccess());
  
  router.push("/medical_support/record/list");
}, [createSuccess, dispatch, router]);


  const handleSubmit = () => {
    
    const now = dayjs().format("YYYY-MM-DDTHH:mm:ss");

    const payload = {
      ...form,
      recordId: undefined,
      createdAt: now,
      updatedAt: now,
      status: form.status || "ACTIVE",
    };

    dispatch(RecActions.createRecordRequest(payload as RecordFormType));
  };

      const errorMessage =
  error === "Request failed with status code 500"
    ? "간호 기록 저장에 실패했습니다. 입력값을 확인한 뒤 다시 시도해주세요."
    : error;

return (
  <main style={{ padding: 24 }}>
    {errorMessage && <p>{errorMessage}</p>}

    <RecordForm
      mode="create"
      form={form}
      onChange={setForm}
      onSubmit={handleSubmit}
      loading={loading}
    />
  </main>
);
};

export default RecordCreate;