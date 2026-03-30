"use client";

import { CircularProgress } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { ImagingActions } from "@/features/medical_support/imaging/imagingSlice";
import type { RootState } from "@/store/rootReducer";
import type { AppDispatch } from "@/store/store";

type ImagingEditForm = {
  IMAGING_EXAM_ID: string;
  TEST_EXECUTION_ID: string;
  IMAGING_TYPE: string;
  EXAM_STATUS_YN: string;
  EXAM_AT: string;
  CREATED_AT: string;
  UPDATED_AT: string;
};

const toImagingFormData = (item?: Partial<ImagingEditForm>): ImagingEditForm => ({
  IMAGING_EXAM_ID: item?.IMAGING_EXAM_ID ?? "",
  TEST_EXECUTION_ID: item?.TEST_EXECUTION_ID ?? "",
  IMAGING_TYPE: item?.IMAGING_TYPE ?? "",
  EXAM_STATUS_YN: item?.EXAM_STATUS_YN ?? "",
  EXAM_AT: item?.EXAM_AT ?? "",
  CREATED_AT: item?.CREATED_AT ?? "",
  UPDATED_AT: item?.UPDATED_AT ?? "",
});

export default function ImagingEdit() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const imagingExamId = useMemo(() => {
    const value = params?.imagingExamId;
    if (Array.isArray(value)) return value[0];
    return value ?? "";
  }, [params]);

  const [draftForm, setDraftForm] = useState<ImagingEditForm | null>(null);

  const { selected, loading, error, updateSuccess } = useSelector(
    (state: RootState) => state.imagings
  );

  useEffect(() => {
    if (!imagingExamId) return;
    dispatch(ImagingActions.fetchImagingRequest(imagingExamId));
  }, [dispatch, imagingExamId]);

  const form = useMemo(() => {
    if (draftForm) return draftForm;
    if (!selected) return toImagingFormData();
    if (String(selected.IMAGING_EXAM_ID) !== String(imagingExamId)) {
      return toImagingFormData();
    }

    return toImagingFormData({
      IMAGING_EXAM_ID: String(selected.IMAGING_EXAM_ID ?? ""),
      TEST_EXECUTION_ID: String(selected.TEST_EXECUTION_ID ?? ""),
      IMAGING_TYPE: selected.IMAGING_TYPE ?? "",
      EXAM_STATUS_YN: selected.EXAM_STATUS_YN ?? "",
      EXAM_AT: selected.EXAM_AT ?? "",
      CREATED_AT: selected.CREATED_AT ?? "",
      UPDATED_AT: selected.UPDATED_AT ?? "",
    });
  }, [draftForm, selected, imagingExamId]);

  useEffect(() => {
    if (!updateSuccess) return;

    alert("영상 검사가 수정되었습니다.");
    dispatch(ImagingActions.resetUpdateSuccess());
    router.push("/medical_support/imaging/list");
  }, [dispatch, router, updateSuccess]);

  useEffect(() => {
    if (!error) return;
    alert(error);
  }, [error]);

  if (loading && !form.IMAGING_EXAM_ID) {
    return <CircularProgress sx={{ m: 3 }} />;
  }

  return (
    <main style={{ padding: 24 }}>
      여기에 ImagingEditForm 또는 입력 UI가 들어감
    </main>
  );
}