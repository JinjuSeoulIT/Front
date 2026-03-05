"use client";

import * as React from "react";
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
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Avatar,
} from "@mui/material";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import LocalHospitalOutlinedIcon from "@mui/icons-material/LocalHospitalOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import PhotoLibraryOutlinedIcon from "@mui/icons-material/PhotoLibraryOutlined";
import ChecklistOutlinedIcon from "@mui/icons-material/ChecklistOutlined";
import ChatOutlinedIcon from "@mui/icons-material/ChatOutlined";
import { fetchPatientsApi } from "@/lib/patientApi";
import { fetchVisitsApi, type VisitRes } from "@/lib/receptionApi";
import type { Patient } from "@/features/patients/patientTypes";


const DUMMY_ORDERS = [
  { label: "혈액검사", count: 6 },
  { label: "영상검사", count: 3 },
  { label: "처치", count: 2 },
];

const DUMMY_MESSAGES = [
  { time: "09:54", text: "검사실: 알러지 검사 결과 확인 요청" },
  { time: "10:21", text: "원무: 재진 예약 변경 문의" },
  { time: "11:05", text: "간호: 처치 보조 필요" },
];

const DUMMY_RESULTS = [
  "L209 아토피 피부염",
  "알레르기 검사 10",
  "비타민 D 25-(OH)",
  "IgE 특이 항체 검사",
];

const DUMMY_SOAP = {
  s: "3일 전부터 팔 부위 발진 심화",
  o: "홍반성 구진, 건조 소견",
  a: "아토피 피부염 악화",
  p: "스테로이드 연고 + 보습제",
};

function calcAge(dateStr?: string | null) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "-";
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age -= 1;
  return `${age}세`;
}

function sexLabel(g?: string | null) {
  if (g === "M") return "남";
  if (g === "F") return "여";
  return "-";
}

export default function DoctorPage() {
  const [patients, setPatients] = React.useState<Patient[]>([]);
  const [visits, setVisits] = React.useState<VisitRes[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [tab, setTab] = React.useState<"WAIT" | "RESERVATION" | "ALL">("WAIT");
  const [selectedPatientId, setSelectedPatientId] = React.useState<number | null>(null);

  React.useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const [p, v] = await Promise.all([
          fetchPatientsApi().catch(() => [] as Patient[]),
          fetchVisitsApi().catch(() => [] as VisitRes[]),
        ]);
        if (!mounted) return;
        setPatients(p);
        setVisits(v);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const queue = React.useMemo(() => {
    if (!visits.length) return [];
    return visits.filter((v) => {
      if (tab === "WAIT") return v.status === "WAITING" || v.status === "CALLED";
      if (tab === "RESERVATION") return v.visitType === "RESERVATION";
      return true;
    });
  }, [visits, tab]);

  const patientMap = React.useMemo(() => {
    const m = new Map<number, Patient>();
    for (const p of patients) m.set(p.patientId, p);
    return m;
  }, [patients]);

  const listForLeft = React.useMemo(() => {
    const k = query.trim().toLowerCase();
    const base = queue.length
      ? (queue.map((v) => patientMap.get(v.patientId)).filter(Boolean) as Patient[])
      : patients;
    const filtered = k
      ? base.filter((p) =>
          [p.name, p.patientNo, p.phone].some((v) => (v ?? "").toLowerCase().includes(k))
        )
      : base;
    const unique = new Map<number, Patient>();
    for (const p of filtered) {
      unique.set(p.patientId, p);
    }
    return Array.from(unique.values());
  }, [queue, patients, patientMap, query]);

  const selectedPatient = React.useMemo(() => {
    if (selectedPatientId) return patientMap.get(selectedPatientId) ?? null;
    if (listForLeft.length) return listForLeft[0];
    return patients[0] ?? null;
  }, [selectedPatientId, listForLeft, patients, patientMap]);

  const vitals = selectedPatient ? "체온 37.5 · 맥박 90 · 혈압 118/76" : "-";

  return (
    <MainLayout showSidebar={false}>
      <Stack spacing={2}>
        <Card
          sx={{
            borderRadius: 3,
            border: "1px solid var(--line)",
            boxShadow: "var(--shadow-1)",
            background:
              "linear-gradient(120deg, rgba(11, 91, 143, 0.2) 0%, rgba(11, 91, 143, 0) 55%)",
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="center">
              <Stack spacing={0.5} sx={{ flexGrow: 1 }}>
                <Typography sx={{ fontSize: 22, fontWeight: 900 }}>
                  진료 워크스테이션
                </Typography>
                <Typography sx={{ color: "var(--muted)" }}>
                  오늘 예약/대기 환자 중심으로 빠른 차트 작성과 오더를 지원합니다.
                </Typography>
              </Stack>
              <TextField
                size="small"
                placeholder="환자 검색"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchOutlinedIcon sx={{ color: "var(--muted)" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ bgcolor: "rgba(255,255,255,0.85)", borderRadius: 2, minWidth: 220 }}
              />
              <Button variant="contained" sx={{ bgcolor: "var(--brand)" }}>
                신규 진료 시작
              </Button>
            </Stack>
          </CardContent>
        </Card>

        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: { xs: "1fr", lg: "1.2fr 2.4fr 1.2fr" },
            alignItems: "stretch",
          }}
        >
          <Card sx={{ borderRadius: 3, border: "1px solid var(--line)" }}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                <Stack direction="row" spacing={1} alignItems="center">
                  <LocalHospitalOutlinedIcon sx={{ color: "var(--brand)" }} />
                  <Typography fontWeight={800}>환자 리스트</Typography>
                </Stack>
                <Chip label={loading ? "로딩" : `${listForLeft.length}명`} size="small" />
              </Stack>
              <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mt: 1 }}>
                <Tab label="대기" value="WAIT" />
                <Tab label="예약" value="RESERVATION" />
                <Tab label="전체" value="ALL" />
              </Tabs>
              <Stack spacing={1.25} sx={{ mt: 2 }}>
                {listForLeft.map((p) => (
                  <Box
                    key={`${p.patientId}-${p.patientNo ?? ""}`}
                    onClick={() => setSelectedPatientId(p.patientId)}
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      border: "1px solid var(--line)",
                      bgcolor:
                        selectedPatient?.patientId === p.patientId
                          ? "rgba(11, 91, 143, 0.12)"
                          : "rgba(255,255,255,0.7)",
                      cursor: "pointer",
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between">
                      <Typography fontWeight={700}>{p.name}</Typography>
                      <Chip label={sexLabel(p.gender)} size="small" />
                    </Stack>
                    <Typography sx={{ color: "var(--muted)", fontSize: 12 }}>
                      {p.patientNo ?? p.patientId} · {calcAge(p.birthDate)} · {p.phone ?? "-"}
                    </Typography>
                  </Box>
                ))}
                {!listForLeft.length && (
                  <Typography color="text.secondary">대기 환자가 없습니다.</Typography>
                )}
              </Stack>
            </CardContent>
          </Card>

          <Stack spacing={2}>
            <Card sx={{ borderRadius: 3, border: "1px solid var(--line)" }}>
              <CardContent sx={{ p: 2.5 }}>
                <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar sx={{ bgcolor: "var(--brand)" }}>
                      {selectedPatient?.name?.slice(0, 1) ?? "-"}
                    </Avatar>
                    <Stack>
                      <Typography fontWeight={900}>
                        {selectedPatient?.name ?? "환자 미선택"}
                      </Typography>
                      <Typography sx={{ color: "var(--muted)", fontSize: 12 }}>
                        {selectedPatient?.patientNo ?? "-"} · {sexLabel(selectedPatient?.gender)} · {calcAge(selectedPatient?.birthDate)}
                      </Typography>
                    </Stack>
                  </Stack>
                  <Stack direction="row" spacing={1}>
                    <Chip label="건강보험" size="small" />
                    <Chip label={vitals} size="small" />
                  </Stack>
                </Stack>
              </CardContent>
            </Card>

            <Card sx={{ borderRadius: 3, border: "1px solid var(--line)" }}>
              <CardContent sx={{ p: 2.5 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <AssignmentOutlinedIcon sx={{ color: "var(--brand-strong)" }} />
                  <Typography fontWeight={800}>진료 기록</Typography>
                </Stack>
                <Box sx={{ mt: 2, p: 2, borderRadius: 2, bgcolor: "rgba(255,255,255,0.7)" }}>
                  <Typography fontWeight={700}>주호소</Typography>
                  <Typography sx={{ color: "var(--muted)", mt: 0.5 }}>
                    알레르기, 가려움 · 진료(외래)
                  </Typography>
                  <Divider sx={{ my: 1.5 }} />
                  <Typography sx={{ fontWeight: 700 }}>SOAP</Typography>
                  <Typography sx={{ color: "var(--muted)", mt: 0.5 }}>S: {DUMMY_SOAP.s}</Typography>
                  <Typography sx={{ color: "var(--muted)", mt: 0.5 }}>O: {DUMMY_SOAP.o}</Typography>
                  <Typography sx={{ color: "var(--muted)", mt: 0.5 }}>A: {DUMMY_SOAP.a}</Typography>
                  <Typography sx={{ color: "var(--muted)", mt: 0.5 }}>P: {DUMMY_SOAP.p}</Typography>
                  <Divider sx={{ my: 1.5 }} />
                  <Stack direction="row" spacing={1} alignItems="center">
                    <PhotoLibraryOutlinedIcon sx={{ color: "var(--muted)" }} />
                    <Typography color="text.secondary">이미지 1/30</Typography>
                  </Stack>
                </Box>
                <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                  <Button variant="contained" sx={{ bgcolor: "var(--brand)" }}>
                    처방 저장
                  </Button>
                  <Button variant="outlined">진료 종료</Button>
                </Stack>
              </CardContent>
            </Card>

            <Card sx={{ borderRadius: 3, border: "1px solid var(--line)" }}>
              <CardContent sx={{ p: 2.5 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <ChecklistOutlinedIcon sx={{ color: "var(--brand)" }} />
                  <Typography fontWeight={800}>진단 및 처방</Typography>
                </Stack>
                <Stack spacing={1} sx={{ mt: 2 }}>
                  {[
                    "상세불명의 아토피성 피부염",
                    "피부건조증",
                    "비타민 D 검사",
                  ].map((item) => (
                    <Box
                      key={item}
                      sx={{
                        p: 1.25,
                        borderRadius: 2,
                        border: "1px solid var(--line)",
                        bgcolor: "rgba(255,255,255,0.7)",
                      }}
                    >
                      <Typography>{item}</Typography>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Stack>

          <Stack spacing={2}>
            <Card sx={{ borderRadius: 3, border: "1px solid var(--line)" }}>
              <CardContent sx={{ p: 2.5 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <ScienceOutlinedIcon sx={{ color: "var(--accent)" }} />
                  <Typography fontWeight={800}>오더세트 / 검사</Typography>
                </Stack>
                <Stack spacing={1} sx={{ mt: 2 }}>
                  {DUMMY_ORDERS.map((o) => (
                    <Box
                      key={o.label}
                      sx={{
                        p: 1.25,
                        borderRadius: 2,
                        border: "1px solid var(--line)",
                        display: "flex",
                        justifyContent: "space-between",
                        bgcolor: "rgba(255,255,255,0.7)",
                      }}
                    >
                      <Typography>{o.label}</Typography>
                      <Typography fontWeight={800}>{o.count}</Typography>
                    </Box>
                  ))}
                </Stack>
                <Divider sx={{ my: 2 }} />
                <Typography fontWeight={700}>검사 결과</Typography>
                <Stack spacing={1} sx={{ mt: 1 }}>
                  {DUMMY_RESULTS.map((r) => (
                    <Box
                      key={r}
                      sx={{ p: 1.25, borderRadius: 2, bgcolor: "rgba(11, 91, 143, 0.08)" }}
                    >
                      <Typography>{r}</Typography>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>

            <Card sx={{ borderRadius: 3, border: "1px solid var(--line)" }}>
              <CardContent sx={{ p: 2.5 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <ChatOutlinedIcon sx={{ color: "var(--brand)" }} />
                  <Typography fontWeight={800}>환자기록 / 메시지</Typography>
                </Stack>
                <Stack spacing={1} sx={{ mt: 2 }}>
                  {DUMMY_MESSAGES.map((m) => (
                    <Box
                      key={m.time}
                      sx={{
                        p: 1.25,
                        borderRadius: 2,
                        border: "1px solid var(--line)",
                        bgcolor: "rgba(255,255,255,0.7)",
                      }}
                    >
                      <Typography sx={{ fontSize: 12, color: "var(--muted)" }}>
                        {m.time}
                      </Typography>
                      <Typography>{m.text}</Typography>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Box>
      </Stack>
    </MainLayout>
  );
}
