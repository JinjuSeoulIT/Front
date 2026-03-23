"use client";

import * as React from "react";
import Link from "next/link";
import MainLayout from "@/components/layout/MainLayout";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
  Button,
  Divider,
} from "@mui/material";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import PersonSearchOutlinedIcon from "@mui/icons-material/PersonSearchOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import MedicalServicesOutlinedIcon from "@mui/icons-material/MedicalServicesOutlined";
import MeetingRoomOutlinedIcon from "@mui/icons-material/MeetingRoomOutlined";

const KPI_ITEMS = [
  { key: "scheduled", label: "오늘 예정", value: 24, icon: EventAvailableOutlinedIcon, color: "var(--brand)" },
  { key: "waiting", label: "대기 중", value: 5, icon: AccessTimeOutlinedIcon, color: "#ed6c02" },
  { key: "completed", label: "진료 완료", value: 12, icon: CheckCircleOutlinedIcon, color: "#2e7d32" },
  { key: "canceled", label: "취소/노쇼", value: 2, icon: CancelOutlinedIcon, color: "var(--muted)" },
];

const TODAY_SCHEDULE = [
  { time: "09:00", name: "김○○", chartNo: "C001", type: "초진", room: "1진료실" },
  { time: "09:15", name: "이○○", chartNo: "C002", type: "재진", room: "1진료실" },
  { time: "09:30", name: "박○○", chartNo: "C003", type: "재진", room: "1진료실" },
  { time: "09:45", name: "최○○", chartNo: "C004", type: "초진", room: "1진료실" },
  { time: "10:00", name: "정○○", chartNo: "C005", type: "재진", room: "1진료실" },
  { time: "10:15", name: "강○○", chartNo: "C006", type: "재진", room: "1진료실" },
  { time: "10:30", name: "-", type: "휴게", room: "-" },
  { time: "10:45", name: "조○○", chartNo: "C007", type: "초진", room: "1진료실" },
];

const WAITING_LIST = [
  { order: 1, name: "이○○", chartNo: "C002", chief: "두통", waitMin: 8 },
  { order: 2, name: "박○○", chartNo: "C003", chief: "요통", waitMin: 5 },
  { order: 3, name: "최○○", chartNo: "C004", chief: "감기 의심", waitMin: 2 },
  { order: 4, name: "정○○", chartNo: "C005", chief: "재진 검사 결과", waitMin: 0 },
  { order: 5, name: "강○○", chartNo: "C006", chief: "피부 발진", waitMin: 0 },
];

const ALERT_PATIENTS = [
  { name: "최○○", chartNo: "C004", alert: "알레르기(페니실린)" },
  { name: "조○○", chartNo: "C007", alert: "주의사항 등록" },
];

const QUICK_LINKS = [
  { label: "진료 워크스페이스", href: "/clinical", icon: MedicalServicesOutlinedIcon },
  { label: "환자 조회", href: "/patients", icon: PersonSearchOutlinedIcon },
  { label: "진료실 현황", href: "/clinical", icon: MeetingRoomOutlinedIcon },
];

function formatToday() {
  const d = new Date();
  const week = ["일", "월", "화", "수", "목", "금", "토"][d.getDay()];
  return `${d.getFullYear()}. ${String(d.getMonth() + 1).padStart(2, "0")}. ${String(d.getDate()).padStart(2, "0")} (${week})`;
}

export default function DoctorDashboardPage() {
  return (
    <MainLayout>
      <Stack spacing={2.5}>
        <Card
          sx={{
            borderRadius: 3,
            border: "1px solid var(--line)",
            boxShadow: "var(--shadow-1)",
            background:
              "linear-gradient(120deg, rgba(24, 90, 158, 0.12) 0%, rgba(24, 90, 158, 0) 55%)",
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="center">
              <Stack spacing={0.5} sx={{ flexGrow: 1 }}>
                <Typography sx={{ fontSize: 22, fontWeight: 900 }}>
                  의사 대시보드
                </Typography>
                <Typography sx={{ color: "var(--muted)" }}>
                  오늘의 진료 일정과 대기 현황을 한눈에 확인하세요.
                </Typography>
                <Typography sx={{ color: "var(--muted)", fontSize: 13, mt: 0.5 }}>
                  {formatToday()}
                </Typography>
              </Stack>
              <Button
                variant="contained"
                component={Link}
                href="/clinical"
                sx={{ bgcolor: "var(--brand)" }}
              >
                진료 워크스페이스
              </Button>
            </Stack>
          </CardContent>
        </Card>

        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" },
          }}
        >
          {KPI_ITEMS.map(({ key, label, value, icon: Icon, color }) => (
            <Card
              key={key}
              sx={{
                borderRadius: 3,
                border: "1px solid var(--line)",
                boxShadow: "var(--shadow-1)",
              }}
            >
              <CardContent sx={{ p: 2 }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      display: "grid",
                      placeItems: "center",
                      bgcolor: `${color}20`,
                      color,
                    }}
                  >
                    <Icon fontSize="small" />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 24, fontWeight: 800 }}>{value}</Typography>
                    <Typography sx={{ color: "var(--muted)", fontSize: 12 }}>{label}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Box>

        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
          }}
        >
          <Card sx={{ borderRadius: 3, border: "1px solid var(--line)" }}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <EventAvailableOutlinedIcon sx={{ color: "var(--brand)" }} />
                <Typography fontWeight={800}>오늘 일정</Typography>
              </Stack>
              <Stack spacing={0.75} sx={{ mt: 2, maxHeight: 320, overflow: "auto" }}>
                {TODAY_SCHEDULE.map((row, i) => (
                  <Box
                    key={i}
                    sx={{
                      py: 1,
                      px: 1.5,
                      borderRadius: 2,
                      border: "1px solid var(--line)",
                      bgcolor: row.type === "휴게" ? "rgba(0,0,0,0.03)" : "rgba(255,255,255,0.8)",
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Typography sx={{ fontWeight: 700, minWidth: 44 }}>{row.time}</Typography>
                      <Typography sx={{ flex: 1, fontWeight: 600 }}>{row.name}</Typography>
                      <Chip label={row.type} size="small" variant="outlined" />
                      <Typography sx={{ color: "var(--muted)", fontSize: 12 }}>{row.room}</Typography>
                    </Stack>
                    {row.chartNo && (
                      <Typography sx={{ pl: 6, fontSize: 12, color: "var(--muted)" }}>
                        차트번호 {row.chartNo}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>

          <Stack spacing={2}>
            <Card sx={{ borderRadius: 3, border: "1px solid var(--line)" }}>
              <CardContent sx={{ p: 2.5 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <AccessTimeOutlinedIcon sx={{ color: "#ed6c02" }} />
                  <Typography fontWeight={800}>대기 환자</Typography>
                  <Chip label={`${WAITING_LIST.length}명`} size="small" color="warning" />
                </Stack>
                <Stack spacing={0.75} sx={{ mt: 2, maxHeight: 220, overflow: "auto" }}>
                  {WAITING_LIST.map((p) => (
                    <Box
                      key={p.chartNo}
                      component={Link}
                      href="/clinical"
                      sx={{
                        py: 1,
                        px: 1.5,
                        borderRadius: 2,
                        border: "1px solid var(--line)",
                        bgcolor: "rgba(255,255,255,0.8)",
                        textDecoration: "none",
                        color: "inherit",
                        "&:hover": { bgcolor: "rgba(11, 91, 143, 0.06)" },
                      }}
                    >
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Typography sx={{ fontWeight: 800, minWidth: 24 }}>{p.order}</Typography>
                        <Typography sx={{ flex: 1, fontWeight: 600 }}>{p.name}</Typography>
                        <Typography sx={{ color: "var(--muted)", fontSize: 12 }}>{p.chief}</Typography>
                        {p.waitMin > 0 && (
                          <Chip label={`대기 ${p.waitMin}분`} size="small" color="warning" />
                        )}
                      </Stack>
                      <Typography sx={{ pl: 5, fontSize: 12, color: "var(--muted)" }}>
                        {p.chartNo}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
                <Button variant="outlined" fullWidth component={Link} href="/clinical" sx={{ mt: 2 }}>
                  진료실에서 보기
                </Button>
              </CardContent>
            </Card>

            <Card sx={{ borderRadius: 3, border: "1px solid var(--line)" }}>
              <CardContent sx={{ p: 2.5 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <WarningAmberOutlinedIcon sx={{ color: "#c62828" }} />
                  <Typography fontWeight={800}>주의 환자</Typography>
                </Stack>
                <Stack spacing={0.75} sx={{ mt: 2 }}>
                  {ALERT_PATIENTS.map((p) => (
                    <Box
                      key={p.chartNo}
                      sx={{
                        py: 1,
                        px: 1.5,
                        borderRadius: 2,
                        border: "1px solid rgba(198,40,40,0.3)",
                        bgcolor: "rgba(198,40,40,0.06)",
                      }}
                    >
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Typography fontWeight={700}>{p.name}</Typography>
                        <Typography sx={{ color: "var(--muted)", fontSize: 12 }}>{p.chartNo}</Typography>
                      </Stack>
                      <Typography sx={{ fontSize: 12, color: "#c62828", fontWeight: 600 }}>
                        {p.alert}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Box>

        <Card sx={{ borderRadius: 3, border: "1px solid var(--line)" }}>
          <CardContent sx={{ p: 2.5 }}>
            <Typography fontWeight={800} sx={{ mb: 2 }}>
              빠른 이동
            </Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
              {QUICK_LINKS.map(({ label, href, icon: Icon }) => (
                <Button
                  key={href + label}
                  component={Link}
                  href={href}
                  variant="outlined"
                  startIcon={<Icon />}
                  sx={{
                    borderColor: "var(--line)",
                    color: "var(--brand-strong)",
                    "&:hover": { borderColor: "var(--brand)", bgcolor: "rgba(11, 91, 143, 0.06)" },
                  }}
                >
                  {label}
                </Button>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </MainLayout>
  );
}
