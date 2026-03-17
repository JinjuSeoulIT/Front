"use client";

import MainLayout from "@/components/layout/MainLayout";
import { getSessionUser } from "@/lib/session";
import {
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
  Button,
} from "@mui/material";
import * as React from "react";

export default function AdminPage() {
  const [now, setNow] = React.useState(() => new Date());
  const [displayName, setDisplayName] = React.useState("선생님");

  React.useEffect(() => {
    const user = getSessionUser();
    if (user?.fullName?.trim()) {
      setDisplayName(user.fullName.trim());
    }
  }, []);

  React.useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30000);
    return () => {
      window.clearInterval(timer);
    };
  }, []);

  const dateText = React.useMemo(
    () =>
      new Intl.DateTimeFormat("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "long",
      }).format(now),
    [now]
  );

  const timeText = React.useMemo(
    () =>
      new Intl.DateTimeFormat("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(now),
    [now]
  );

  const hour = now.getHours() % 12;
  const minute = now.getMinutes();
  const hourDeg = hour * 30 + minute * 0.5;
  const minuteDeg = minute * 6;

  return (
    <MainLayout>
      <Stack spacing={3}>
        <Card
          sx={{
            borderRadius: 3,
            border: "1px solid var(--line)",
            boxShadow: "var(--shadow-1)",
            background:
              "linear-gradient(120deg, rgba(75, 85, 99, 0.2) 0%, rgba(75, 85, 99, 0) 55%)",
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="center">
              <Stack spacing={0.5} sx={{ flexGrow: 1 }}>
                <Typography sx={{ fontSize: 22, fontWeight: 900 }}>
                  관리자 대시보드
                </Typography>
                <Typography sx={{ color: "var(--muted)" }}>
                  운영 KPI와 보안/감사 상태를 한눈에 확인합니다.
                </Typography>
                <Box
                  sx={{
                    mt: 1.5,
                    display: "grid",
                    gap: 0.5,
                    gridTemplateColumns: { xs: "1fr", md: "auto 1fr" },
                    alignItems: "center",
                  }}
                >
                  <Box
                    sx={{
                      width: 72,
                      height: 72,
                      borderRadius: "50%",
                      border: "2px solid rgba(75,85,99,0.35)",
                      position: "relative",
                      bgcolor: "rgba(255,255,255,0.65)",
                    }}
                  >
                    <Box
                      sx={{
                        position: "absolute",
                        left: "50%",
                        top: "50%",
                        width: 2,
                        height: 20,
                        bgcolor: "#4b5563",
                        transform: `translate(-50%, -100%) rotate(${hourDeg}deg)`,
                        transformOrigin: "50% 100%",
                        borderRadius: 999,
                      }}
                    />
                    <Box
                      sx={{
                        position: "absolute",
                        left: "50%",
                        top: "50%",
                        width: 2,
                        height: 28,
                        bgcolor: "#0b5b8f",
                        transform: `translate(-50%, -100%) rotate(${minuteDeg}deg)`,
                        transformOrigin: "50% 100%",
                        borderRadius: 999,
                      }}
                    />
                    <Box
                      sx={{
                        position: "absolute",
                        left: "50%",
                        top: "50%",
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        bgcolor: "#0b5b8f",
                        transform: "translate(-50%, -50%)",
                      }}
                    />
                  </Box>
                  <Stack spacing={0.25}>
                    <Typography sx={{ fontSize: 13, color: "var(--muted)" }}>{dateText}</Typography>
                    <Typography sx={{ fontSize: 30, fontWeight: 900, letterSpacing: -0.6 }}>{timeText}</Typography>
                    <Typography sx={{ fontSize: 14, color: "var(--muted)" }}>
                      {displayName} 선생님
                    </Typography>
                    <Typography sx={{ fontSize: 14, fontWeight: 700 }}>
                      오늘 하루도 화이팅하세요!
                    </Typography>
                  </Stack>
                </Box>
              </Stack>
              <Button variant="contained" sx={{ bgcolor: "#4b5563" }}>
                리포트 내보내기
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </MainLayout>
  );
}
