"use client";

import * as React from "react";
import MainLayout from "@/components/layout/MainLayout";
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "";

type ScheduleItem = {
  scheduleId: number;
  scheduleDate: string;
  timeLabel: string;
  title: string;
  sortOrder?: number | null;
};

type ChecklistItem = {
  checklistId: number;
  checkDate: string;
  label: string;
  done: boolean;
  sortOrder?: number | null;
};

export default function ReceptionDashboardManagePage() {
  const [date, setDate] = React.useState(() => new Date().toISOString().slice(0, 10));
  const [schedules, setSchedules] = React.useState<ScheduleItem[]>([]);
  const [checklist, setChecklist] = React.useState<ChecklistItem[]>([]);

  const fetchAll = React.useCallback(async () => {
    const [scheduleRes, checklistRes] = await Promise.all([
      fetch(`${API_BASE}/api/receptions/dashboard/schedules?date=${date}`),
      fetch(`${API_BASE}/api/receptions/dashboard/checklist?date=${date}`),
    ]);
    const scheduleJson = await scheduleRes.json();
    const checklistJson = await checklistRes.json();
    setSchedules(scheduleJson?.result ?? []);
    setChecklist(checklistJson?.result ?? []);
  }, [date]);

  React.useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const deleteSchedule = async (id: number) => {
    await fetch(`${API_BASE}/api/receptions/dashboard/schedules/${id}`, { method: "DELETE" });
    fetchAll();
  };

  const deleteChecklist = async (id: number) => {
    await fetch(`${API_BASE}/api/receptions/dashboard/checklist/${id}`, { method: "DELETE" });
    fetchAll();
  };

  return (
    <MainLayout>
      <Box sx={{ display: "grid", gap: 2 }}>
        <Card>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography fontWeight={800}>접수 대시보드 관리</Typography>
              <TextField
                type="date"
                size="small"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchAll}>
                새로고침
              </Button>
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography fontWeight={700}>오늘 일정</Typography>
            <Divider sx={{ my: 2 }} />
            <Stack spacing={1}>
              {schedules.map((item) => (
                <Stack key={item.scheduleId} direction="row" spacing={1} alignItems="center">
                  <Typography sx={{ minWidth: 80 }}>{item.timeLabel}</Typography>
                  <Typography sx={{ flexGrow: 1 }}>{item.title}</Typography>
                  <IconButton size="small" onClick={() => deleteSchedule(item.scheduleId)}>
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Stack>
              ))}
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography fontWeight={700}>체크리스트</Typography>
            <Divider sx={{ my: 2 }} />
            <Stack spacing={1}>
              {checklist.map((item) => (
                <Stack key={item.checklistId} direction="row" spacing={1} alignItems="center">
                  <Typography sx={{ flexGrow: 1 }}>{item.label}</Typography>
                  <Typography sx={{ minWidth: 64 }}>{item.done ? "완료" : "대기"}</Typography>
                  <IconButton size="small" onClick={() => deleteChecklist(item.checklistId)}>
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Stack>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </MainLayout>
  );
}
