"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store";
import { fetchRecordsRequest } from "@/features/Record/recordSlice";
import RecordDetail from "./RecordDetail";


export default function RecordList() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { list, loading, error } = useSelector((s: RootState) => s.records);

  const [selectedId, setSelectedId] = useState<string | null>();


  useEffect(() => {
    dispatch(fetchRecordsRequest());
  }, [dispatch]);

  const handleNew = () => {
    router.push("/nurse/record/create");
  };

  const handleEdit = () => {
    if (!selectedId) return;
    router.push(`/nurse/record/edit/${selectedId}`);
  };

  return (
    <Stack spacing={2}>
      <Card sx={{ borderRadius: 3, border: "1px solid var(--line)" }}>
        <CardContent sx={{ p: 2.5 }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={1.5}
            alignItems={{ xs: "flex-start", md: "center" }}
          >
            <Box sx={{ flexGrow: 1 }}>
              <Typography sx={{ fontSize: 20, fontWeight: 900 }}>간호 기록</Typography>
              <Typography sx={{ color: "var(--muted)", fontSize: 13 }}>
                목록에서 선택한 기록의 상세 정보를 확인할 수 있습니다.
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={() => dispatch(fetchRecordsRequest())}
                disabled={loading}
              >
                새로고침
              </Button>
              <Button
                variant="contained"
                size="small"
                color="secondary"
                startIcon={<AddIcon />}
                onClick={handleNew}
              >
                신규
              </Button>
              <Button onClick={handleEdit} disabled={!selectedId}>
                수정
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Stack direction="row" spacing={1}>
        <Chip label={`전체 ${list.length}`} size="small" />
        {loading && <Chip label="로딩 중" size="small" />}
        {error && <Chip label={`오류: ${error}`} color="error" size="small" />}
      </Stack>

      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: { xs: "1fr", lg: "360px minmax(0,1fr)" },
        }}
      >
        <Card sx={{ borderRadius: 3, border: "1px solid var(--line)" }}>
          <CardContent>
              <Tab label="활성" value="ACTIVE" />
              <Tab label="비활성" value="INACTIVE" />
              <Tab label="전체" value="ALL" />
            
            <Stack spacing={1} sx={{ mt: 1 }}>
              {list.map((record) => (
                <Box
                  key={record.nursingId}
                 
                  sx={{
                    p: 1.25,
                    border: "1px solid var(--line)",
                    borderRadius: 2,
                    cursor: "pointer",
                  }}
                >
                  <Typography fontWeight={700}>{record.nursingId}</Typography>
                  <Typography sx={{ fontSize: 12, color: "var(--muted)" }}>
                    방문 ID {record.visitId ?? "-"} · 기록 시각 {record.recordedAt ?? "-"}
                  </Typography>
                  <button
                   onClick={() => setSelectedId(record.nursingId)}
                  >상세</button>
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>

        <RecordDetail selectedId={selectedId} />
      </Box>
    </Stack>
  );
}
