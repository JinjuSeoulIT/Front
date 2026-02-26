"use client"

import { Card, CardContent, Stack, Typography } from "@mui/material";
// import type { RecordItem } from "@/features/Record/recordTypes";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/store/store";
import { RootState } from "@/store/rootReducer";
import { useEffect } from "react";
import { fetchRecordRequest } from "@/features/Record/recordSlice";

type Props = {
  selectedId: string | null;
};




export default function RecordDetail({selectedId}:Props) {
   const {selected, loading, error} = useSelector((s: RootState) => s.records);

 const dispatch = useDispatch<AppDispatch>();

   useEffect(
    ()=>{
    if(selectedId == null)
    { return;}

    dispatch(fetchRecordRequest({nursingId:selectedId}))}
  ,[dispatch, selectedId]);

 const {
  nursingId,
  visitId,
  recordedAt,
  systolicBp,
  diastolicBp,
  pulse,
  respiration,
  temperature,
  spo2,
  painScore,
  consciousnessLevel,
  observation,
  initialAssessment,
  status,
} = selected ?? {};
  return (

    <Card sx={{ borderRadius: 3, border: "1px solid var(--line)" }}>
      <CardContent>
        <Typography fontWeight={800} sx={{ mb: 1 }}>
          상세 조회
        </Typography>
        {loading &&  <Typography>로딩 중...</Typography>}
        {error &&  <Typography>{error}</Typography> }
        {!selected ? (
          <Typography color="text.secondary">목록에서 상세를 선택하세요.</Typography>
        ) : (
          <Stack spacing={0.75}>
            <Typography>기록 ID:{nursingId}</Typography>
            <Typography>방문 ID:{visitId}</Typography>
            <Typography>기록 시각:{recordedAt} </Typography>
            <Typography>
            수축기/이완기 : {systolicBp}/{diastolicBp}
            </Typography>
            <Typography>
              혈압: {pulse}
            </Typography>
            <Typography>
              맥박 / 호흡: {pulse}/{respiration}
            </Typography>
            <Typography>
            체온 / SpO2: {temperature}/{spo2}
            <Typography>
            통증 점수:{painScore}
            </Typography>
            <Typography>
              의식 수준:{consciousnessLevel}
            </Typography>
            <Typography>
            초기문진요약: {initialAssessment}
            </Typography>
            </Typography>
            <Typography>관찰 내용: {observation} </Typography>
            <Typography>
              상태:{status}
            </Typography>
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}
