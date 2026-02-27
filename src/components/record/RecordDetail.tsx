"use client";

import {
  Box,
  Paper,
  Typography,
  Chip,
  Grid,
  CircularProgress,
  Button,
} from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import { RootState } from "@/store/rootReducer";
import Link from "next/link";
import { deleteRecordRequest, fetchRecordRequest } from "@/features/Record/recordSlice";

export default function RecordDetail() {
  const { nursingId } = useParams();
  const dispatch = useDispatch();

  const { selected, loading, error} = useSelector(
    (state: RootState) => state.records
  );

useEffect(() => {
  if (nursingId) {
    dispatch(fetchRecordRequest((nursingId)));
  }
}, [nursingId]);

const router = useRouter();

// useEffect(() => {
//   if (deleteSuccess) {
//     router.push("/record");
//   }
// }, [deleteSuccess, router]);

  if (loading)
    return (
      <Box p={4}>
        <CircularProgress />
      </Box>
    );

  if (error)
    return (
      <Typography p={4} color="error">
        {error}
      </Typography>
    );

  if (!selected)
    return (
      <Typography p={4}>
        데이터를 찾을 수 없습니다.
      </Typography>
    );

  const fields = [
    { label: "간호사 아이디", value: selected.nursingId },
    { label: "진료 ID", value: selected.visitId },
    { label: "기록 시각", value: selected.recordedAt },
    { label: "생성일시", value: selected.createdAt },
    { label: "수정일시", value: selected.updatedAt },
    { label: "수축기 혈압", value: selected.systolicBp },
    { label: "이완기 혈압", value: selected.diastolicBp },
    { label: "맥박", value: selected.pulse },
    { label: "호흡", value: selected.respiration },
    { label: "체온", value: selected.temperature },
    { label: "동맥혈산소포화도", value: selected.spo2 },
    { label: "통증 점수", value: selected.painScore },
    { label: "의식 수준", value: selected.consciousnessLevel },
  ];

//   const onDelete = (nursingId) => {
//     if(!window.confirm("정말 삭제하시겠습니까?")) return;
//  dispatch(deleteRecordRequest(nursingId));
//   }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" fontWeight={700} mb={3}>
        간호 기록 상세
      </Typography>

      <Paper sx={{ p: 4, borderRadius: 3 }}>
        <Grid container spacing={3}>
          {fields.map((field) => (
            <Grid key={field.label} size={6}>
              <Typography fontWeight={600}>
                {field.label}
              </Typography>
              <Typography>{field.value ?? "-"}</Typography>
            </Grid>
          ))}

          <Grid size={12}>
            <Typography fontWeight={600}>관찰 내용</Typography>
            <Typography>{selected.observation}</Typography>
          </Grid>

          <Grid size={12}>
            <Typography fontWeight={600}>초기 평가</Typography>
            <Typography>{selected.initialAssessment}</Typography>
          </Grid>

          <Grid size={12}>
            <Typography fontWeight={600}>상태</Typography>
            <Chip
              label={selected.status}
              color={
                selected.status === "ACTIVE"
                  ? "success"
                  : "default"
              }
            />
          </Grid>
           <Button
                      component={Link}
                      href={`/record/${nursingId}/edit`}
                      variant="outlined"
                      size="small"
                    >
                      수정
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      size="small"
                      // onClick={() => onDelete(nursingId)}
                    >
                      삭제
                    </Button>
        </Grid>
      </Paper>
    </Box>
  );
}