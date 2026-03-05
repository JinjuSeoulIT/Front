"use client";

import * as React from "react";
import MainLayout from "@/components/layout/MainLayout";
import {
  Alert,
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
  Pagination,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import LocalHospitalOutlinedIcon from "@mui/icons-material/LocalHospitalOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import PhotoLibraryOutlinedIcon from "@mui/icons-material/PhotoLibraryOutlined";
import ChecklistOutlinedIcon from "@mui/icons-material/ChecklistOutlined";
import ChatOutlinedIcon from "@mui/icons-material/ChatOutlined";
import { fetchPatientsApi } from "@/lib/patientApi";
import type { Patient } from "@/features/patients/patientTypes";
import {
  fetchClinicalOrdersApi,
  createClinicalOrderApi,
  updateClinicalOrderStatusApi,
  type ClinicalOrder,
  type LabOrderType,
  type OrderStatus,
} from "@/lib/clinicalOrderApi";

type ClinicalRes = {
  id?: number;
  clinicalId?: number;
  patientId?: number;
  receptionId?: number;
  clinicalType?: string | null;
  status?: string | null;
  clinicalStatus?: string | null;
  priorityYn?: boolean;
};

type ApiEnvelope<T> = {
  success?: boolean;
  message?: string | null;
  data?: T;
  result?: T;
};

const CLINICAL_API_BASE =
  process.env.NEXT_PUBLIC_CLINICAL_API_BASE_URL ?? "http://localhost:8090";

function isNetworkError(e: unknown): boolean {
  if (e instanceof TypeError && (e.message === "Failed to fetch" || e.message.includes("fetch"))) return true;
  if (e instanceof Error && e.message.includes("ERR_CONNECTION_REFUSED")) return true;
  return false;
}

function clinicalConnectionMessage(): string {
  const base = process.env.NEXT_PUBLIC_CLINICAL_API_BASE_URL ?? "http://localhost:8090";
  return `진료 서버에 연결할 수 없습니다. hospital-clinical 백엔드(${base})가 실행 중인지 확인해 주세요.`;
}

async function fetchClinicalApi(): Promise<ClinicalRes[]> {
  let res: Response;
  try {
    res = await fetch(`${CLINICAL_API_BASE}/api/clinicals`, { cache: "no-store" });
  } catch (e) {
    if (isNetworkError(e)) throw new Error(clinicalConnectionMessage());
    throw e;
  }
  if (!res.ok) throw new Error(`진료 조회 실패 (${res.status})`);
  const body = (await res.json()) as ApiEnvelope<ClinicalRes[]> | ClinicalRes[];
  const raw = Array.isArray(body) ? body : (body?.data ?? body?.result ?? []) as ClinicalRes[];
  return raw.map((c) => ({
    ...c,
    patientId: c.patientId ?? c.receptionId,
  }));
}

async function createClinicalApi(patientId: number): Promise<void> {
  let res: Response;
  try {
    res = await fetch(`${CLINICAL_API_BASE}/api/clinicals`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ patientId, clinicalType: "OUT" }),
    });
  } catch (e) {
    if (isNetworkError(e)) throw new Error(clinicalConnectionMessage());
    throw e;
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { message?: string };
    const msg = body?.message ?? `신규 진료 생성 실패 (${res.status})`;
    throw new Error(msg);
  }
}


const ORDER_TYPE_LABELS: Record<LabOrderType, string> = {
  BLOOD: "혈액검사",
  IMAGING: "영상검사",
  PROCEDURE: "처치",
};

const ORDER_STATUS_LABELS: Record<string, string> = {
  REQUESTED: "요청",
  REQUEST: "요청",
  IN_PROGRESS: "진행",
  COMPLETED: "완료",
  CANCELLED: "취소",
};

function orderStatusLabel(status?: string | null) {
  if (!status) return "미분류";
  return ORDER_STATUS_LABELS[status] ?? status;
}

const DUMMY_MESSAGES = [
  { time: "09:54", text: "검사실: 알러지 검사 결과 확인 요청" },
  { time: "10:21", text: "원무: 재진 예약 변경 문의" },
  { time: "11:05", text: "간호: 처치 보조 필요" },
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

function formatBirth(dateStr?: string | null) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "-";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

function clinicalStatusView(status?: string | null) {
  switch (status) {
    case "WAITING":
    case "READY":
      return { label: "대기", color: "warning" as const };
    case "CALLED":
      return { label: "호출", color: "info" as const };
    case "IN_PROGRESS":
      return { label: "진료중", color: "success" as const };
    case "DONE":
    case "COMPLETED":
      return { label: "완료", color: "default" as const };
    case "CANCELLED":
      return { label: "취소", color: "error" as const };
    default:
      return { label: "미분류", color: "default" as const };
  }
}

function resolveClinicalStatus(v?: ClinicalRes | null) {
  return v?.status ?? v?.clinicalStatus ?? null;
}

export default function ClinicalPage() {
  const LEFT_LIST_PAGE_SIZE = 5;
  const theme = useTheme();
  const isCompact = useMediaQuery(theme.breakpoints.down("xl"));
  const [patients, setPatients] = React.useState<Patient[]>([]);
  const [clinicals, setClinicals] = React.useState<ClinicalRes[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [tab, setTab] = React.useState<"WAIT" | "RESERVATION" | "ALL">("WAIT");
  const [leftPage, setLeftPage] = React.useState(1);
  const [selectedPatientId, setSelectedPatientId] = React.useState<number | null>(null);
  const [safetyChecked, setSafetyChecked] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [creatingClinical, setCreatingClinical] = React.useState(false);
  const creatingClinicalRef = React.useRef(false);
  const [orders, setOrders] = React.useState<ClinicalOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = React.useState(false);
  const [orderDialogOpen, setOrderDialogOpen] = React.useState(false);
  const [newOrderType, setNewOrderType] = React.useState<LabOrderType>("BLOOD");
  const [newOrderName, setNewOrderName] = React.useState("");
  const [creatingOrder, setCreatingOrder] = React.useState(false);
  const [updatingOrderId, setUpdatingOrderId] = React.useState<number | null>(null);

  const loadOrders = React.useCallback(async (clinicalId: number) => {
    setOrdersLoading(true);
    try {
      const list = await fetchClinicalOrdersApi(clinicalId);
      setOrders(list);
    } catch {
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  const loadData = React.useCallback(async () => {
    try {
      setErrorMessage(null);
      setLoading(true);
      const [patientsResult, clinicalsResult] = await Promise.allSettled([
        fetchPatientsApi(),
        fetchClinicalApi(),
      ]);

      if (patientsResult.status === "fulfilled") {
        setPatients(patientsResult.value);
      } else {
        setPatients([]);
        setErrorMessage("환자 목록을 불러오지 못했습니다.");
      }

      if (clinicalsResult.status === "fulfilled") {
        setClinicals(clinicalsResult.value);
      } else {
        setClinicals([]);
        const reason = clinicalsResult.status === "rejected" ? clinicalsResult.reason : undefined;
        const msg = reason instanceof Error ? reason.message : "진료 목록 연결에 실패했습니다. 환자 목록만 표시합니다.";
        setErrorMessage(msg);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "데이터를 불러오지 못했습니다.";
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const queue = React.useMemo(() => {
    if (!clinicals.length) return [];
    return clinicals.filter((v) => {
      const status = resolveClinicalStatus(v);
      if (tab === "WAIT") return status === "WAITING" || status === "CALLED" || status === "READY";
      if (tab === "RESERVATION") return v.clinicalType === "RESERVATION";
      return true;
    });
  }, [clinicals, tab]);

  const clinicalByPatientId = React.useMemo(() => {
    const m = new Map<number, ClinicalRes>();
    for (const v of clinicals) {
      const key = v.patientId ?? v.receptionId;
      if (key != null && !m.has(key)) m.set(key, v);
    }
    return m;
  }, [clinicals]);

  const patientMap = React.useMemo(() => {
    const m = new Map<number, Patient>();
    for (const p of patients) m.set(p.patientId, p);
    return m;
  }, [patients]);

  const listForLeft = React.useMemo(() => {
    const k = query.trim().toLowerCase();
    const base = queue.length
      ? (queue.map((v) => patientMap.get(v.patientId ?? v.receptionId ?? 0)).filter(Boolean) as Patient[])
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

  const totalLeftPages = Math.max(1, Math.ceil(listForLeft.length / LEFT_LIST_PAGE_SIZE));

  const paginatedLeftList = React.useMemo(() => {
    const start = (leftPage - 1) * LEFT_LIST_PAGE_SIZE;
    return listForLeft.slice(start, start + LEFT_LIST_PAGE_SIZE);
  }, [listForLeft, leftPage, LEFT_LIST_PAGE_SIZE]);

  const selectedClinical = selectedPatient ? clinicalByPatientId.get(selectedPatient.patientId) ?? null : null;
  const selectedStatus = clinicalStatusView(resolveClinicalStatus(selectedClinical));
  const vitals = selectedPatient ? "체온 37.5 · 맥박 90 · 혈압 118/76" : "-";
  const currentClinicalId = selectedClinical?.clinicalId ?? selectedClinical?.id ?? null;

  const ordersGrouped = React.useMemo(() => {
    const counts: Record<LabOrderType, number> = { BLOOD: 0, IMAGING: 0, PROCEDURE: 0 };
    for (const o of orders) {
      if (o.orderType in counts) counts[o.orderType as LabOrderType] += 1;
    }
    return (["BLOOD", "IMAGING", "PROCEDURE"] as const).map((type) => ({
      label: ORDER_TYPE_LABELS[type],
      count: counts[type],
    }));
  }, [orders]);

  const completedOrders = React.useMemo(
    () => orders.filter((o) => o.status === "COMPLETED"),
    [orders]
  );

  React.useEffect(() => {
    if (currentClinicalId != null) loadOrders(currentClinicalId);
    else setOrders([]);
  }, [currentClinicalId, loadOrders]);

  React.useEffect(() => {
    setSafetyChecked(false);
  }, [selectedPatientId]);

  React.useEffect(() => {
    setLeftPage(1);
  }, [query, tab]);

  React.useEffect(() => {
    if (leftPage > totalLeftPages) {
      setLeftPage(totalLeftPages);
    }
  }, [leftPage, totalLeftPages]);

  const handleStartNewClinical = React.useCallback(async () => {
    if (!selectedPatient) {
      window.alert("환자를 먼저 선택해 주세요.");
      return;
    }
    if (creatingClinicalRef.current) return;
    creatingClinicalRef.current = true;
    setCreatingClinical(true);
    try {
      setErrorMessage(null);
      await createClinicalApi(selectedPatient.patientId);
      await loadData();
      window.alert("신규 진료가 등록되었습니다.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "신규 진료 생성에 실패했습니다.";
      setErrorMessage(message);
      window.alert(message);
    } finally {
      creatingClinicalRef.current = false;
      setCreatingClinical(false);
    }
  }, [selectedPatient, loadData]);

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
            {errorMessage && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errorMessage}
              </Alert>
            )}
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
                id="clinical-patient-search"
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
              <Button
                type="button"
                variant="contained"
                sx={{ bgcolor: "var(--brand)" }}
                disabled={creatingClinical || !selectedPatient}
                onClick={() => void handleStartNewClinical()}
              >
                {creatingClinical ? "등록 중…" : "신규 진료 시작"}
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
            <CardContent
              sx={{
                p: isCompact ? 2 : 2.5,
                display: "flex",
                flexDirection: "column",
                minHeight: { xs: 420, lg: 620 },
              }}
            >
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
              <Stack spacing={1.25} sx={{ mt: 2, flexGrow: 1 }}>
                {paginatedLeftList.map((p) => (
                  <Box
                    key={`${p.patientId}-${p.patientNo ?? ""}`}
                    onClick={() => setSelectedPatientId(p.patientId)}
                    sx={{
                      p: isCompact ? 1.1 : 1.5,
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
                      <Stack direction="row" spacing={0.75}>
                        <Chip label={sexLabel(p.gender)} size="small" />
                        <Chip
                          label={clinicalStatusView(resolveClinicalStatus(clinicalByPatientId.get(p.patientId))).label}
                          color={clinicalStatusView(resolveClinicalStatus(clinicalByPatientId.get(p.patientId))).color}
                          size="small"
                        />
                        {clinicalByPatientId.get(p.patientId)?.priorityYn && (
                          <Chip label="우선" size="small" color="error" />
                        )}
                      </Stack>
                    </Stack>
                    <Typography sx={{ color: "var(--muted)", fontSize: isCompact ? 11 : 12 }}>
                      {p.patientNo ?? p.patientId} · {calcAge(p.birthDate)} · {p.phone ?? "-"}
                    </Typography>
                  </Box>
                ))}
                {!listForLeft.length && (
                  <Typography color="text.secondary">대기 환자가 없습니다.</Typography>
                )}
              </Stack>
              <Stack sx={{ mt: 1.5, pt: 1, borderTop: "1px solid var(--line)" }} alignItems="center">
                <Pagination
                  page={leftPage}
                  count={totalLeftPages}
                  size="small"
                  color="primary"
                  disabled={listForLeft.length === 0}
                  onChange={(_, page) => setLeftPage(page)}
                />
              </Stack>
            </CardContent>
          </Card>

          <Stack spacing={2}>
            <Card sx={{ borderRadius: 3, border: "1px solid var(--line)" }}>
              <CardContent sx={{ p: isCompact ? 2 : 2.5 }}>
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
                    <Chip label={selectedStatus.label} color={selectedStatus.color} size="small" />
                    <Chip label="건강보험" size="small" />
                    <Chip label={vitals} size="small" />
                  </Stack>
                </Stack>
                <Alert severity="warning" sx={{ mt: 1.5 }}>
                  환자안전 확인: {selectedPatient?.name ?? "-"} / {selectedPatient?.patientNo ?? "-"} /
                  {formatBirth(selectedPatient?.birthDate)}
                </Alert>
                <Stack direction="row" spacing={1} sx={{ mt: 1.25 }} alignItems="center">
                  <Button
                    variant={safetyChecked ? "contained" : "outlined"}
                    color={safetyChecked ? "success" : "inherit"}
                    size="small"
                    onClick={() => setSafetyChecked((prev) => !prev)}
                  >
                    {safetyChecked ? "환자 확인 완료" : "환자 확인 전"}
                  </Button>
                  <Typography sx={{ color: "var(--muted)", fontSize: 12 }}>
                    저장/진료종료 전 환자 정보 이중확인을 강제합니다.
                  </Typography>
                </Stack>
              </CardContent>
            </Card>

            <Card sx={{ borderRadius: 3, border: "1px solid var(--line)" }}>
              <CardContent sx={{ p: isCompact ? 2 : 2.5 }}>
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
                  <Button
                    variant="contained"
                    sx={{ bgcolor: "var(--brand)" }}
                    disabled={!safetyChecked}
                    onClick={() => window.alert("처방 저장 처리 예정")}
                  >
                    처방 저장
                  </Button>
                  <Button
                    variant="outlined"
                    disabled={!safetyChecked}
                    onClick={() => window.alert("진료 종료 처리 예정")}
                  >
                    진료 종료
                  </Button>
                </Stack>
              </CardContent>
            </Card>

            <Card sx={{ borderRadius: 3, border: "1px solid var(--line)" }}>
              <CardContent sx={{ p: isCompact ? 2 : 2.5 }}>
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
              <CardContent sx={{ p: isCompact ? 2 : 2.5 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <ScienceOutlinedIcon sx={{ color: "var(--accent)" }} />
                  <Typography fontWeight={800}>오더세트 / 검사</Typography>
                </Stack>
                {ordersLoading ? (
                  <Typography sx={{ mt: 2, color: "var(--muted)" }}>조회 중…</Typography>
                ) : (
                  <>
                    <Stack spacing={1} sx={{ mt: 2 }}>
                      {ordersGrouped.map((o) => (
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
                    <Typography fontWeight={700} sx={{ mt: 2, mb: 1 }}>검사 상태 관리 (요청/진행/완료)</Typography>
                    <Typography sx={{ fontSize: 12, color: "var(--muted)", mb: 1 }}>
                      현재 환자: {selectedPatient?.name ?? "-"}
                    </Typography>
                    <Stack spacing={1}>
                      {orders.map((ord) => (
                        <Box
                          key={ord.id}
                          sx={{
                            p: 1.25,
                            borderRadius: 2,
                            border: "1px solid var(--line)",
                            bgcolor: "rgba(255,255,255,0.7)",
                            minWidth: 0,
                          }}
                        >
                          <Stack direction="row" alignItems="center" spacing={1.5} flexWrap="nowrap" sx={{ minWidth: 0 }}>
                            <Typography sx={{ fontWeight: 600, flexShrink: 0, minWidth: 80 }}>
                              {ORDER_TYPE_LABELS[ord.orderType]}
                            </Typography>
                            <Typography sx={{ flex: 1, minWidth: 0, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {ord.orderName && !["BLOOD", "IMAGING", "PROCEDURE"].includes(ord.orderName)
                                ? ord.orderName
                                : selectedPatient?.patientNo ?? String(selectedPatient?.patientId ?? "-")}
                            </Typography>
                            <Chip
                              size="small"
                              label={orderStatusLabel(ord.status)}
                              sx={{ fontWeight: 600, flexShrink: 0 }}
                            />
                            <Select
                              size="small"
                              value={ord.status === "REQUEST" ? "REQUESTED" : (ord.status ?? "REQUESTED")}
                              onChange={async (e) => {
                                const next = e.target.value as OrderStatus;
                                const current = ord.status === "REQUEST" ? "REQUESTED" : (ord.status ?? "REQUESTED");
                                if (currentClinicalId == null || next === current) return;
                                setUpdatingOrderId(ord.id);
                                try {
                                  await updateClinicalOrderStatusApi(currentClinicalId, ord.id, next);
                                  setOrders((prev) =>
                                    prev.map((o) => (o.id === ord.id ? { ...o, status: next } : o))
                                  );
                                  await loadOrders(currentClinicalId);
                                } catch (err) {
                                  window.alert(err instanceof Error ? err.message : "상태 변경에 실패했습니다.");
                                  await loadOrders(currentClinicalId);
                                } finally {
                                  setUpdatingOrderId(null);
                                }
                              }}
                              disabled={updatingOrderId != null}
                              sx={{ minWidth: 100, fontSize: 12, flexShrink: 0 }}
                            >
                              <MenuItem value="REQUESTED">{orderStatusLabel("REQUESTED")}</MenuItem>
                              <MenuItem value="IN_PROGRESS">{orderStatusLabel("IN_PROGRESS")}</MenuItem>
                              <MenuItem value="COMPLETED">{orderStatusLabel("COMPLETED")}</MenuItem>
                            </Select>
                          </Stack>
                        </Box>
                      ))}
                      {orders.length === 0 && (
                        <Typography sx={{ color: "var(--muted)", fontSize: 13 }}>등록된 검사 오더가 없습니다.</Typography>
                      )}
                    </Stack>
                    <Button
                      variant="outlined"
                      size="small"
                      fullWidth
                      sx={{ mt: 2 }}
                      disabled={!selectedPatient}
                      onClick={() => {
                        if (currentClinicalId == null) {
                          window.alert("먼저 신규 진료를 시작해 주세요.");
                          return;
                        }
                        setNewOrderType("BLOOD");
                        setNewOrderName("");
                        setOrderDialogOpen(true);
                      }}
                    >
                      검사 오더 등록
                    </Button>
                  </>
                )}
                <Divider sx={{ my: 2 }} />
                <Typography fontWeight={700}>검사 결과</Typography>
                <Typography sx={{ fontSize: 12, color: "var(--muted)", mt: 0.5 }}>
                  완료된 검사 오더 기준
                </Typography>
                <Stack spacing={1} sx={{ mt: 1 }}>
                  {completedOrders.map((ord) => (
                    <Box
                      key={ord.id}
                      sx={{
                        p: 1.25,
                        borderRadius: 2,
                        bgcolor: "rgba(11, 91, 143, 0.08)",
                        border: "1px solid var(--line)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: 1,
                      }}
                    >
                      <Typography sx={{ fontWeight: 600 }}>
                        {ord.orderName && !["BLOOD", "IMAGING", "PROCEDURE"].includes(ord.orderName)
                          ? ord.orderName
                          : ORDER_TYPE_LABELS[ord.orderType]}
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip size="small" label={ORDER_TYPE_LABELS[ord.orderType]} />
                        <Chip size="small" color="success" label={orderStatusLabel(ord.status)} />
                      </Stack>
                    </Box>
                  ))}
                  {completedOrders.length === 0 && (
                    <Typography sx={{ color: "var(--muted)", fontSize: 13, py: 1 }}>
                      완료된 검사가 없습니다.
                    </Typography>
                  )}
                </Stack>
              </CardContent>
            </Card>

            <Card sx={{ borderRadius: 3, border: "1px solid var(--line)" }}>
              <CardContent sx={{ p: isCompact ? 2 : 2.5 }}>
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

      <Dialog open={orderDialogOpen} onClose={() => setOrderDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>검사 오더 등록</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormControl fullWidth size="small">
              <InputLabel>검사 유형</InputLabel>
              <Select
                value={newOrderType}
                label="검사 유형"
                onChange={(e) => setNewOrderType(e.target.value as LabOrderType)}
              >
                <MenuItem value="BLOOD">{ORDER_TYPE_LABELS.BLOOD}</MenuItem>
                <MenuItem value="IMAGING">{ORDER_TYPE_LABELS.IMAGING}</MenuItem>
                <MenuItem value="PROCEDURE">{ORDER_TYPE_LABELS.PROCEDURE}</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              size="small"
              label="검사/처치 명"
              value={newOrderName}
              onChange={(e) => setNewOrderName(e.target.value)}
              placeholder="예: CBC, 흉부 X-ray, 주사"
              helperText="입력 시 목록에서 같은 유형도 구분됩니다."
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOrderDialogOpen(false)}>취소</Button>
          <Button
            variant="contained"
            sx={{ bgcolor: "var(--brand)" }}
            disabled={!newOrderName.trim() || creatingOrder || currentClinicalId == null}
            onClick={async () => {
              if (currentClinicalId == null || !newOrderName.trim()) return;
              setCreatingOrder(true);
              try {
                await createClinicalOrderApi(currentClinicalId, {
                  orderType: newOrderType,
                  orderName: newOrderName.trim(),
                });
                await loadOrders(currentClinicalId);
                setOrderDialogOpen(false);
                setNewOrderName("");
              } catch (err) {
                window.alert(err instanceof Error ? err.message : "검사 오더 등록에 실패했습니다.");
              } finally {
                setCreatingOrder(false);
              }
            }}
          >
            {creatingOrder ? "등록 중…" : "등록"}
          </Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
}
