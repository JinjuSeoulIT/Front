"use client";

import * as React from "react";
import { Box, Divider, Stack, Typography, Chip } from "@mui/material";
import { fetchVisitsApi, type VisitRes } from "@/lib/receptionApi";

const REFRESH_MS = 5000;

type Room = {
  id: string;
  title: string;
  deptCode: string;
  doctorName: string;
};

const rooms: Room[] = [
  { id: "R1", title: "진료실 1", deptCode: "내과", doctorName: "김진료" },
  { id: "R2", title: "진료실 2", deptCode: "정형외과", doctorName: "박정형" },
  { id: "R3", title: "진료실 3", deptCode: "피부과", doctorName: "이피부" },
];

function nowClock() {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

function formatName(v: VisitRes) {
  return v.patientName ?? "-";
}

export default function ReceptionMonitorPage() {
  const [visits, setVisits] = React.useState<VisitRes[]>([]);
  const [clock, setClock] = React.useState("--:--:--");
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const data = await fetchVisitsApi();
        if (alive) setVisits(data);
      } catch {
        if (alive) setVisits([]);
      }
    };
    load();
    const timer = setInterval(load, REFRESH_MS);
    setMounted(true);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, []);

  React.useEffect(() => {
    const t = setInterval(() => setClock(nowClock()), 1000);
    return () => clearInterval(t);
  }, []);

  const byRoom = (room: Room) =>
    visits.filter((v) => v.deptCode === room.deptCode);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#0f172a",
        color: "white",
        px: { xs: 2, md: 4 },
        py: { xs: 2, md: 3 },
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Typography variant="h4" fontWeight={900}>
          진료실 현황
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <Chip
            label="대기/호출 모니터"
            sx={{ bgcolor: "#1f2937", color: "white" }}
          />
          <Typography fontWeight={800} suppressHydrationWarning>
            {mounted ? clock : "--:--:--"}
          </Typography>
        </Stack>
      </Stack>

      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
        }}
      >
        {rooms.map((room) => {
          const list = byRoom(room);
          const inProgress = list.find((v) => v.status === "IN_PROGRESS");
          const called = list.filter((v) => v.status === "CALLED");
          const waiting = list.filter((v) => v.status === "WAITING");

          return (
            <Box
              key={room.id}
              sx={{
                borderRadius: 2,
                border: "1px solid #334155",
                bgcolor: "#111827",
                p: 2,
                minHeight: 360,
              }}
            >
              <Stack spacing={1}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="h6" fontWeight={900}>
                    {room.title}
                  </Typography>
                  <Chip
                    label={room.deptCode}
                    sx={{ bgcolor: "#1f2937", color: "white" }}
                  />
                </Stack>
                <Typography color="#cbd5f5" fontWeight={700}>
                  {room.doctorName}
                </Typography>

                <Divider sx={{ borderColor: "#334155", my: 1 }} />

                <Typography color="#facc15" fontWeight={900}>
                  진료중
                </Typography>
                <Typography variant="h6" fontWeight={900}>
                  {inProgress ? formatName(inProgress) : "-"}
                </Typography>

                <Divider sx={{ borderColor: "#334155", my: 1 }} />

                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography color="#60a5fa" fontWeight={900}>
                    호출
                  </Typography>
                  <Chip
                    label={`${called.length}명`}
                    size="small"
                    sx={{ bgcolor: "#1f2937", color: "white" }}
                  />
                </Stack>
                <Stack spacing={0.5}>
                  {called.length === 0 ? (
                    <Typography color="#94a3b8">-</Typography>
                  ) : (
                    called.map((v, idx) => (
                      <Typography key={v.id} fontWeight={700}>
                        {idx + 1}. {formatName(v)}
                      </Typography>
                    ))
                  )}
                </Stack>

                <Divider sx={{ borderColor: "#334155", my: 1 }} />

                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography color="#22c55e" fontWeight={900}>
                    대기
                  </Typography>
                  <Chip
                    label={`${waiting.length}명`}
                    size="small"
                    sx={{ bgcolor: "#1f2937", color: "white" }}
                  />
                </Stack>
                <Stack spacing={0.5}>
                  {waiting.length === 0 ? (
                    <Typography color="#94a3b8">-</Typography>
                  ) : (
                    waiting.map((v, idx) => (
                      <Typography key={v.id} fontWeight={700}>
                        {idx + 1}. {formatName(v)}
                      </Typography>
                    ))
                  )}
                </Stack>
              </Stack>
            </Box>
          );
        })}
      </Box>

      <Box
        sx={{
          mt: 2,
          p: 1.5,
          borderRadius: 1.5,
          bgcolor: "#1f2937",
          textAlign: "center",
        }}
      >
        <Typography fontWeight={800}>
          안내: 호출된 환자분은 해당 진료실 앞에서 잠시 대기해 주세요.
        </Typography>
      </Box>
    </Box>
  );
}
