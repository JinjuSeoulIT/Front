"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/store/store";
import { emergencyReceptionActions } from "@/features/EmergencyReceptions/EmergencyReceptionSlice";
import type { EmergencyReception, ReceptionStatus } from "@/features/EmergencyReceptions/EmergencyReceptionTypes";
import { Box, Button, Card, CardContent, Divider, Stack, Typography } from "@mui/material";

export default function EmergencyReceptionDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { selected, loading, error } = useSelector((s: RootState) => s.emergencyReceptions);

  const receptionId = params.id;

  React.useEffect(() => {
    dispatch(emergencyReceptionActions.fetchEmergencyReceptionRequest({ receptionId }));
  }, [dispatch, receptionId]);

  const p: EmergencyReception | null =
    selected && String(selected.receptionId) === receptionId ? selected : null;

  const statusLabel = (value?: ReceptionStatus | string | null) => {
    switch ((value ?? "").toUpperCase()) {
      case "WAITING":
        return "대기";
      case "CALLED":
        return "호출";
      case "IN_PROGRESS":
        return "진행중";
      case "COMPLETED":
        return "완료";
      case "PAYMENT_WAIT":
        return "수납대기";
      case "ON_HOLD":
        return "보류";
      case "CANCELED":
        return "취소";
      case "INACTIVE":
        return "비활성";
      default:
        return value ?? "-";
    }
  };

  return (
    <MainLayout>
      <Card sx={{ borderRadius: 3, border: "1px solid #dbe5f5" }}>
        <CardContent>
          <Stack spacing={2}>
            <Box>
              <Typography variant="h5" fontWeight={900}>
                응급 접수 상세
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {loading ? "불러오는 중..." : error ?? "정상"}
              </Typography>
            </Box>

            <Divider />

            {p ? (
              <Stack spacing={1}>
                <Row label="접수 ID" value={String(p.receptionId)} />
                <Row label="접수번호" value={p.receptionNo} />
                <Row label="환자 ID" value={String(p.patientId)} />
                <Row label="진료과 ID" value={String(p.departmentId)} />
                <Row label="의사 ID" value={p.doctorId ? String(p.doctorId) : "-"} />
                <Row label="상태" value={statusLabel(p.status)} />
                <Row label="중증도" value={String(p.triageLevel)} />
                <Row label="주호소" value={p.chiefComplaint} />
                <Row label="메모" value={p.note ?? "-"} />
              </Stack>
            ) : (
              <Typography color="text.secondary">선택된 응급 접수가 없습니다.</Typography>
            )}

            <Stack direction="row" spacing={1}>
              <Button variant="outlined" onClick={() => router.push("/emergency-receptions")}>
                뒤로
              </Button>
              <Button
                variant="contained"
                onClick={() => router.push(`/emergency-receptions/${receptionId}/edit`)}
                disabled={!p}
              >
                수정
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </MainLayout>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="row" justifyContent="space-between" spacing={2}>
      <Typography color="text.secondary" fontWeight={800}>
        {label}
      </Typography>
      <Typography fontWeight={800}>{value}</Typography>
    </Stack>
  );
}
