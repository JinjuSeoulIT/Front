"use client";

import * as React from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import MainLayout from "@/components/layout/MainLayout";

import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  MenuItem,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import AssignmentIndOutlinedIcon from "@mui/icons-material/AssignmentIndOutlined";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import SwapHorizOutlinedIcon from "@mui/icons-material/SwapHorizOutlined";
import LocalHospitalOutlinedIcon from "@mui/icons-material/LocalHospitalOutlined";
import HotelOutlinedIcon from "@mui/icons-material/HotelOutlined";

import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/store/store";
import { patientActions } from "@/features/patients/patientSlice";
import type { Patient } from "@/features/patients/patientTypes";
import type { PatientRestriction } from "@/lib/restrictionApi";
import { fetchPatientRestrictionsApi } from "@/lib/restrictionApi";
import type { PatientFlag } from "@/lib/flagApi";
import { fetchPatientFlagsApi } from "@/lib/flagApi";
import { changePatientStatusApi } from "@/lib/patientApi";
import { fetchCodesApi } from "@/lib/codeApi";
import { createReservationApi, fetchReservationsApi } from "@/lib/reservationAdminApi";
import { createReceptionApi, fetchReceptionsApi } from "@/lib/receptionsCrudApi";
import { buildNextReceptionNumber } from "@/lib/receptionNumber";

function sexLabel(g?: Patient["gender"]) {
  if (g === "M") return "남(M)";
  if (g === "F") return "여(F)";
  return "-";
}

function resolveFileUrl(url?: string | null) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const base =
    process.env.NEXT_PUBLIC_PATIENTS_API_BASE_URL ?? "http://192.168.1.60:8181";
  return `${base}${url.startsWith("/") ? "" : "/"}${url}`;
}

type RestrictionOption = { value: string; label: string };
type FlagOption = { value: string; label: string };
type StatusOption = { value: string; label: string };

function restrictionLabel(type: string, options: RestrictionOption[]) {
  const found = options.find((opt) => opt.value === type);
  return found ? found.label : type;
}

function flagLabel(type: string, options: FlagOption[]) {
  const found = options.find((opt) => opt.value === type);
  return found ? found.label : type;
}

function flagColor(type: string) {
  switch (type) {
    case "VIOLENCE":
    case "INFECTIOUS":
      return "error";
    case "FALL_RISK":
    case "ALLERGY":
    case "SEIZURE":
    case "PSYCHIATRIC":
      return "warning";
    case "DNR":
    case "SPECIAL_CARE":
      return "info";
    default:
      return "default";
  }
}

function buildFlags(
  p: Patient,
  restrictions: PatientRestriction[],
  flags: PatientFlag[],
  flagOptions: FlagOption[],
  restrictionOptions: RestrictionOption[]
) {
  const chips: {
    key: string;
    label: string;
    color?: "default" | "warning" | "error" | "info" | "success";
  }[] = [];

  if (p.isVip) {
    chips.push({ key: "vip", label: "VIP", color: "warning" });
  }

  for (const r of restrictions) {
    if (!r.activeYn) continue;
    chips.push({
      key: `restriction-${r.restrictionId}`,
      label: restrictionLabel(r.restrictionType, restrictionOptions),
      color: "default",
    });
  }

  for (const f of flags) {
    if (!f.activeYn) continue;
    chips.push({
      key: `flag-${f.flagId}`,
      label: flagLabel(f.flagType, flagOptions),
      color: flagColor(f.flagType),
    });
  }

  return chips;
}

function statusLabel(code?: string | null, options?: StatusOption[]) {
  if (!code) return "-";
  const found = options?.find((opt) => opt.value === code);
  if (found) return `${found.label}(${found.value})`;
  return code;
}

function toApiDateTime(value?: string) {
  if (!value) return undefined;
  return value.length === 16 ? `${value}:00` : value;
}

function resolveErrorMessage(err: unknown, fallback: string) {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as
      | { message?: string; error?: string; detail?: string }
      | undefined;
    if (data?.message) return data.message;
    if (data?.error) return data.error;
    if (data?.detail) return data.detail;
    if (err.message) return err.message;
  }
  if (err instanceof Error && err.message) return err.message;
  if (typeof err === "string" && err.trim()) return err;
  return fallback;
}

const departments = [
  { id: 1, name: "내과", doctor: "송태민", doctorId: 1 },
  { id: 2, name: "외과", doctor: "이현석", doctorId: 2 },
  { id: 3, name: "정형외과", doctor: "성숙희", doctorId: 3 },
  { id: 4, name: "신경외과", doctor: "최효정", doctorId: 4 },
];

const defaultDepartment = departments[0];

export default function PatientDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const patientId = Number(params.id);

  const { selected, loading, error } = useSelector((s: RootState) => s.patients);
  const p = selected;

  const [restrictions, setRestrictions] = React.useState<PatientRestriction[]>([]);
  const [flags, setFlags] = React.useState<PatientFlag[]>([]);

  const [statusDialogOpen, setStatusDialogOpen] = React.useState(false);
  const [statusCode, setStatusCode] = React.useState("");
  const [statusReason, setStatusReason] = React.useState("");
  const [statusChangedBy, setStatusChangedBy] = React.useState("");
  const [statusSaving, setStatusSaving] = React.useState(false);

  const [statusOptions, setStatusOptions] = React.useState<StatusOption[]>([]);
  const [flagOptions, setFlagOptions] = React.useState<FlagOption[]>([]);
  const [restrictionOptions, setRestrictionOptions] = React.useState<RestrictionOption[]>([]);

  const [vipUpdating, setVipUpdating] = React.useState(false);
  const [receptionDialogOpen, setReceptionDialogOpen] = React.useState(false);
  const [receptionSaving, setReceptionSaving] = React.useState(false);
  const [receptionForm, setReceptionForm] = React.useState({
    deptCode: defaultDepartment.name,
    doctorId: String(defaultDepartment.doctorId),
    visitType: "OUTPATIENT",
    arrivedAt: "",
    note: "",
  });

  const [reservationDialogOpen, setReservationDialogOpen] = React.useState(false);
  const [reservationSaving, setReservationSaving] = React.useState(false);
  const [reservationForm, setReservationForm] = React.useState({
    deptCode: defaultDepartment.name,
    doctorId: String(defaultDepartment.doctorId),
    reservationId: "",
    scheduledAt: "",
    arrivalAt: "",
    note: "",
    memo: "",
  });

  React.useEffect(() => {
    dispatch(patientActions.fetchPatientRequest({ patientId }));
  }, [dispatch, patientId]);

  React.useEffect(() => {
    let mounted = true;
    const loadRestrictions = async () => {
      if (!patientId) return;
      try {
        const res = await fetchPatientRestrictionsApi(patientId);
        if (mounted) setRestrictions(res);
      } catch {
        if (mounted) setRestrictions([]);
      }
    };
    loadRestrictions();
    return () => {
      mounted = false;
    };
  }, [patientId]);

  React.useEffect(() => {
    let mounted = true;
    const loadFlags = async () => {
      if (!patientId) return;
      try {
        const res = await fetchPatientFlagsApi(patientId);
        if (mounted) setFlags(res);
      } catch {
        if (mounted) setFlags([]);
      }
    };
    loadFlags();
    return () => {
      mounted = false;
    };
  }, [patientId]);

  React.useEffect(() => {
    let mounted = true;
    const loadCodes = async () => {
      try {
        const [statusList, flagList, restrictionList] = await Promise.all([
          fetchCodesApi("PATIENT_STATUS"),
          fetchCodesApi("PATIENT_FLAG"),
          fetchCodesApi("PATIENT_RESTRICTION"),
        ]);

        if (!mounted) return;
        setStatusOptions(statusList.map((c) => ({ value: c.code, label: c.name })));
        setFlagOptions(flagList.map((c) => ({ value: c.code, label: c.name })));
        setRestrictionOptions(restrictionList.map((c) => ({ value: c.code, label: c.name })));
      } catch {
        if (!mounted) return;
        setStatusOptions([]);
        setFlagOptions([]);
        setRestrictionOptions([]);
      }
    };

    loadCodes();
    return () => {
      mounted = false;
    };
  }, []);

  const addressText = p
    ? `${p.address ?? "-"} ${p.addressDetail ? `(${p.addressDetail})` : ""}`
    : "-";

  const detailRows = [
    { label: "환자 ID", value: p?.patientId ?? "-" },
    { label: "성별", value: p ? sexLabel(p.gender) : "-" },
    { label: "연락처", value: p?.phone ?? "-" },
    { label: "보호자명", value: p?.guardianName ?? "-" },
    { label: "보호자 연락처", value: p?.guardianPhone ?? "-" },
    { label: "보호자 관계", value: p?.guardianRelation ?? "-" },
    { label: "국적", value: p?.isForeigner ? "외국인" : "내국인" },
    {
      label: "연락 우선순위",
      value: p?.contactPriority === "GUARDIAN" ? "보호자" : "본인",
    },
    { label: "메모", value: p?.note ?? "-" },
    { label: "주소", value: addressText },
    { label: "상태", value: statusLabel(p?.statusCode, statusOptions) },
  ];

  const cards = [
    { title: "보험", desc: "환자 보험 등록/수정", href: `/patients/${patientId}/insurances` },
    { title: "동의서", desc: "동의서 등록/파일 관리", href: `/patients/${patientId}/consents` },
    { title: "메모", desc: "주의사항/요청사항 기록", href: `/patients/${patientId}/memos` },
    { title: "제한", desc: "환자 제한 상태 관리", href: `/patients/${patientId}/restrictions` },
    { title: "플래그", desc: "환자 플래그 관리", href: `/patients/${patientId}/flags` },
    { title: "정보 변경 이력", desc: "기본정보 변경 이력", href: `/patients/${patientId}/info-history` },
    { title: "상태 변경 이력", desc: "환자 상태 변경 이력", href: `/patients/${patientId}/status-history` },
  ];

  const onDelete = () => {
    if (!p) return;
    if (!confirm("환자를 비활성 처리할까요?")) return;
    dispatch(patientActions.deletePatientRequest(p.patientId));
    router.replace("/patients");
  };

  const openStatusDialog = () => {
    setStatusCode(p?.statusCode ?? statusOptions[0]?.value ?? "");
    setStatusReason("");
    setStatusChangedBy("");
    setStatusDialogOpen(true);
  };

  const toggleVip = (checked: boolean) => {
    if (!p) return;
    if (!confirm(checked ? "VIP로 지정할까요?" : "VIP를 해제할까요?")) return;
    try {
      setVipUpdating(true);
      dispatch(
        patientActions.updatePatientVipRequest({
          patientId: p.patientId,
          isVip: checked,
        })
      );
    } finally {
      setVipUpdating(false);
    }
  };

  const saveStatus = async () => {
    if (!patientId || !statusCode) return;
    try {
      setStatusSaving(true);
      await changePatientStatusApi(patientId, {
        statusCode,
        reason: statusReason.trim() || undefined,
        changedBy: statusChangedBy.trim() || undefined,
      });
      setStatusDialogOpen(false);
      dispatch(patientActions.fetchPatientRequest({ patientId }));
    } finally {
      setStatusSaving(false);
    }
  };

  const openReservationDialog = () => {
    setReservationForm({
      deptCode: defaultDepartment.name,
      doctorId: String(defaultDepartment.doctorId),
      reservationId: "",
      scheduledAt: "",
      arrivalAt: "",
      note: "",
      memo: "",
    });
    setReservationDialogOpen(true);
  };

  const openReceptionDialog = () => {
    setReceptionForm({
      deptCode: defaultDepartment.name,
      doctorId: String(defaultDepartment.doctorId),
      visitType: "OUTPATIENT",
      arrivedAt: "",
      note: "",
    });
    setReceptionDialogOpen(true);
  };

  const saveReservation = async () => {
    if (!p) return;
    if (!reservationForm.scheduledAt) {
      alert("예약 일시는 필수입니다.");
      return;
    }

    try {
      setReservationSaving(true);
      const reservedAt = toApiDateTime(reservationForm.scheduledAt);
      if (!reservedAt) {
        alert("예약 일시 형식이 올바르지 않습니다.");
        return;
      }

      const list = await fetchReservationsApi();
      const reservationNo = buildNextReceptionNumber({
        existingNumbers: list.map((item) => item.reservationNo),
        startSequence: 301,
      });
      const selectedDept = departments.find((dept) => dept.name === reservationForm.deptCode);
      const selectedByDoctor = departments.find(
        (dept) => String(dept.doctorId) === reservationForm.doctorId
      );
      const resolvedDept = selectedDept ?? selectedByDoctor ?? defaultDepartment;

      await createReservationApi({
        reservationNo,
        patientId: p.patientId,
        patientName: p.name,
        departmentId: resolvedDept.id,
        departmentName: resolvedDept.name,
        doctorId: Number(reservationForm.doctorId || resolvedDept.doctorId),
        doctorName: resolvedDept.doctor,
        reservedAt,
        status: "RESERVED",
        note: reservationForm.note?.trim() || reservationForm.memo?.trim() || null,
      });

      setReservationDialogOpen(false);
      alert("예약이 등록되었습니다.");
    } catch (err: unknown) {
      console.error("saveReservation failed", err);
      alert(`예약 등록에 실패했습니다.\n원인: ${resolveErrorMessage(err, "알 수 없는 오류")}`);
    } finally {
      setReservationSaving(false);
    }
  };

  const saveReception = async () => {
    if (!p) return;

    try {
      setReceptionSaving(true);
      const list = await fetchReceptionsApi();
      const nextReceptionNo = buildNextReceptionNumber({
        existingNumbers: list.map((item) => item.receptionNo),
        startSequence: 1,
      });
      const selectedDept = departments.find((dept) => dept.name === receptionForm.deptCode);
      const selectedByDoctor = departments.find(
        (dept) => String(dept.doctorId) === receptionForm.doctorId
      );
      const resolvedDept = selectedDept ?? selectedByDoctor ?? defaultDepartment;

      await createReceptionApi({
        receptionNo: nextReceptionNo,
        patientId: p.patientId,
        patientName: p.name,
        visitType: receptionForm.visitType,
        departmentId: resolvedDept.id,
        departmentName: resolvedDept.name,
        doctorId: Number(receptionForm.doctorId || resolvedDept.doctorId),
        doctorName: resolvedDept.doctor,
        arrivedAt: toApiDateTime(receptionForm.arrivedAt) ?? new Date().toISOString().slice(0, 19),
        status: "WAITING",
        note: receptionForm.note?.trim() || "환자 상세 화면에서 접수 등록",
      });

      setReceptionDialogOpen(false);
      router.push("/receptions");
    } catch (err: unknown) {
      alert(`접수 등록에 실패했습니다.\n원인: ${resolveErrorMessage(err, "알 수 없는 오류")}`);
    } finally {
      setReceptionSaving(false);
    }
  };

  return (
    <MainLayout>
      <Stack spacing={2.5}>
        <Card
          sx={{
            borderRadius: 3,
            border: "1px solid #dbe5f5",
            boxShadow: "0 14px 28px rgba(23, 52, 97, 0.15)",
          }}
        >
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Grid container spacing={3} alignItems="stretch">
              <Grid size={{ xs: 12, md: 3 }}>
                <Box
                  sx={{
                    width: { xs: "100%", sm: 220 },
                    aspectRatio: "3 / 4",
                    borderRadius: 4,
                    border: "1px solid #dbe5f5",
                    boxShadow: "0 10px 22px rgba(23, 52, 97, 0.12)",
                    overflow: "hidden",
                    bgcolor: "#f3f6fb",
                    backgroundImage: p?.photoUrl
                      ? `url(${resolveFileUrl(p.photoUrl)})`
                      : "linear-gradient(135deg, #cfdcf2, #e6eefb)",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {!p?.photoUrl && (
                    <Typography variant="h3" fontWeight={900} color="white">
                      {p?.name?.slice(0, 1) ?? "?"}
                    </Typography>
                  )}
                </Box>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Stack spacing={1.25} sx={{ pt: { md: 0.5 } }}>
                  <Stack direction="row" spacing={1} alignItems="baseline" sx={{ flexWrap: "wrap" }}>
                    <Typography variant="h4" fontWeight={900}>
                      {p?.name ?? "환자 상세"}
                    </Typography>
                    <Typography color="text.secondary" fontWeight={800}>
                      {p?.patientNo ?? "-"}
                    </Typography>
                    {p && (
                      <Typography color="text.secondary" fontWeight={800}>
                        {sexLabel(p.gender)} · {p.birthDate ?? "-"}
                      </Typography>
                    )}
                  </Stack>

                  <Typography color="text.secondary" fontWeight={700}>
                    환자 기본 정보를 확인하세요.
                  </Typography>

                  {p && (
                    <FormControlLabel
                      control={
                        <Switch
                          checked={Boolean(p.isVip)}
                          onChange={(e) => toggleVip(e.target.checked)}
                          disabled={vipUpdating || loading}
                        />
                      }
                      label="VIP"
                    />
                  )}

                  <Stack spacing={0.75} sx={{ mt: 0.5 }}>
                    {detailRows.map((row) => (
                      <Stack key={row.label} direction="row" spacing={1.5} alignItems="center">
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          fontWeight={800}
                          sx={{ minWidth: 96 }}
                        >
                          {row.label}
                        </Typography>
                        <Typography fontWeight={900}>{row.value}</Typography>
                      </Stack>
                    ))}
                  </Stack>

                  <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", mt: 0.5 }}>
                    {p &&
                      buildFlags(p, restrictions, flags, flagOptions, restrictionOptions).map((c) => (
                        <Chip key={c.key} label={c.label} color={c.color ?? "default"} sx={{ fontWeight: 900 }} />
                      ))}
                    {!p && <Chip label={loading ? "로딩..." : "선택 없음"} />}
                  </Stack>
                </Stack>
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <Stack spacing={1.5} alignItems={{ xs: "stretch", md: "flex-end" }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.5,
                      borderRadius: 3,
                      border: "1px solid #d7e4fb",
                      background: "linear-gradient(180deg, #f7fbff 0%, #eef5ff 100%)",
                      boxShadow: "0 8px 18px rgba(43, 90, 169, 0.12)",
                      width: "100%",
                      maxWidth: 380,
                    }}
                  >
                    <Stack spacing={1.2}>
                      <Typography
                        variant="caption"
                        sx={{ color: "#5b6f96", fontWeight: 900, letterSpacing: 0.4 }}
                      >
                        QUICK ACTIONS
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 1,
                        }}
                      >
                    <Button
                      variant="contained"
                      color="info"
                      startIcon={<AssignmentIndOutlinedIcon />}
                      onClick={openReceptionDialog}
                      disabled={!p}
                      sx={{ fontWeight: 800, whiteSpace: "nowrap", flex: "1 1 140px", minWidth: 140 }}
                    >
                      접수 등록
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<EventAvailableOutlinedIcon />}
                      onClick={openReservationDialog}
                      disabled={!p}
                      sx={{ fontWeight: 800, whiteSpace: "nowrap", flex: "1 1 140px", minWidth: 140 }}
                    >
                      예약 등록
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      startIcon={<LocalHospitalOutlinedIcon />}
                      component={Link}
                      href="/emergency-receptions/new"
                      disabled={!p}
                      sx={{ fontWeight: 800, whiteSpace: "nowrap", flex: "1 1 140px", minWidth: 140 }}
                    >
                      응급 등록
                    </Button>
                    <Button
                      variant="contained"
                      color="secondary"
                      startIcon={<HotelOutlinedIcon />}
                      component={Link}
                      href="/inpatient-receptions/new"
                      disabled={!p}
                      sx={{ fontWeight: 800, whiteSpace: "nowrap", flex: "1 1 140px", minWidth: 140 }}
                    >
                      입원 등록
                    </Button>
                      </Box>

                      <Divider sx={{ borderColor: "#d7e4fb" }} />

                      <Box
                        sx={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 1,
                        }}
                      >
                        <Button
                          variant="outlined"
                          startIcon={<ArrowBackOutlinedIcon />}
                          onClick={() => router.back()}
                          sx={{ fontWeight: 800, whiteSpace: "nowrap", flex: "1 1 120px", minWidth: 120 }}
                        >
                      뒤로
                        </Button>
                        {p && (
                          <Button
                            variant="outlined"
                            component={Link}
                            href={`/patients/${p.patientId}/edit`}
                            startIcon={<EditOutlinedIcon />}
                            sx={{ fontWeight: 800, whiteSpace: "nowrap", flex: "1 1 120px", minWidth: 120 }}
                          >
                            수정
                          </Button>
                        )}
                        <Button
                          variant="outlined"
                          startIcon={<SwapHorizOutlinedIcon />}
                          onClick={openStatusDialog}
                          disabled={!p || statusOptions.length === 0}
                          sx={{ fontWeight: 800, whiteSpace: "nowrap", flex: "1 1 120px", minWidth: 120 }}
                        >
                          상태 변경
                        </Button>
                        {p && (
                          <Button
                            variant="outlined"
                            color="warning"
                            startIcon={<BlockOutlinedIcon />}
                            onClick={onDelete}
                            sx={{ fontWeight: 800, whiteSpace: "nowrap", flex: "1 1 120px", minWidth: 120 }}
                          >
                            비활성
                          </Button>
                        )}
                      </Box>
                    </Stack>
                  </Paper>
                </Stack>
              </Grid>

              <Grid size={{ xs: 12 }}>
                {error && (
                  <Typography color="error" fontWeight={900} sx={{ mt: 1 }}>
                    {error}
                  </Typography>
                )}
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Grid container spacing={2}>
          {cards.map((card) => (
            <Grid key={card.title} size={{ xs: 12, md: 6 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 4,
                  border: "1px solid var(--line)",
                  bgcolor: "white",
                  boxShadow: "var(--shadow-1)",
                }}
              >
                <Stack spacing={1}>
                  <Typography fontWeight={900}>{card.title}</Typography>
                  <Typography color="text.secondary" fontWeight={700}>
                    {card.desc}
                  </Typography>
                  <Divider />
                  <Button variant="outlined" component={Link} href={card.href}>
                    이동
                  </Button>
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Stack>

      <Dialog
        open={statusDialogOpen}
        onClose={() => setStatusDialogOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 4 } }}
      >
        <DialogTitle>상태 변경</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              select
              label="상태"
              value={statusCode}
              onChange={(e) => setStatusCode(e.target.value)}
              fullWidth
              disabled={statusOptions.length === 0}
            >
              {statusOptions.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>
            {statusOptions.length === 0 && (
              <Typography variant="caption" color="error">
                환자 상태 코드가 비활성화 상태입니다.
              </Typography>
            )}
            <TextField
              label="사유"
              value={statusReason}
              onChange={(e) => setStatusReason(e.target.value)}
              fullWidth
              multiline
              minRows={2}
            />
            <TextField
              label="변경자"
              value={statusChangedBy}
              onChange={(e) => setStatusChangedBy(e.target.value)}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialogOpen(false)}>취소</Button>
          <Button
            variant="contained"
            onClick={saveStatus}
            disabled={!statusCode || statusSaving || statusOptions.length === 0}
          >
            저장
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={receptionDialogOpen}
        onClose={() => setReceptionDialogOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 4 } }}
      >
        <DialogTitle>접수 등록</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              select
              label="진료과"
              value={receptionForm.deptCode}
              onChange={(e) =>
                setReceptionForm((prev) => {
                  const nextDeptName = e.target.value;
                  const nextDept = departments.find((d) => d.name === nextDeptName);
                  return {
                    ...prev,
                    deptCode: nextDeptName,
                    doctorId: nextDept ? String(nextDept.doctorId) : prev.doctorId,
                  };
                })
              }
              fullWidth
            >
              {departments.map((dept) => (
                <MenuItem key={dept.id} value={dept.name}>
                  {dept.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="담당의"
              value={receptionForm.doctorId}
              onChange={(e) =>
                setReceptionForm((prev) => {
                  const nextDoctorId = e.target.value;
                  const nextDept = departments.find(
                    (dept) => String(dept.doctorId) === nextDoctorId
                  );
                  return {
                    ...prev,
                    doctorId: nextDoctorId,
                    deptCode: nextDept?.name ?? prev.deptCode,
                  };
                })
              }
              fullWidth
            >
              {departments.map((dept) => (
                <MenuItem key={dept.doctorId} value={String(dept.doctorId)}>
                  {dept.doctor}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="내원유형"
              value={receptionForm.visitType}
              onChange={(e) =>
                setReceptionForm((prev) => ({
                  ...prev,
                  visitType: e.target.value,
                }))
              }
              fullWidth
            >
              <MenuItem value="OUTPATIENT">외래</MenuItem>
              <MenuItem value="EMERGENCY">응급</MenuItem>
              <MenuItem value="INPATIENT">입원</MenuItem>
            </TextField>

            <TextField
              label="내원 일시(선택)"
              type="datetime-local"
              value={receptionForm.arrivedAt}
              onChange={(e) =>
                setReceptionForm((prev) => ({
                  ...prev,
                  arrivedAt: e.target.value,
                }))
              }
              InputLabelProps={{ shrink: true }}
              fullWidth
            />

            <TextField
              label="접수 메모(선택)"
              value={receptionForm.note}
              onChange={(e) =>
                setReceptionForm((prev) => ({
                  ...prev,
                  note: e.target.value,
                }))
              }
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReceptionDialogOpen(false)}>취소</Button>
          <Button variant="contained" onClick={saveReception} disabled={receptionSaving}>
            저장
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={reservationDialogOpen}
        onClose={() => setReservationDialogOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 4 } }}
      >
        <DialogTitle>예약 등록</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              select
              label="진료과"
              value={reservationForm.deptCode}
              onChange={(e) =>
                setReservationForm((prev) => {
                  const nextDeptName = e.target.value;
                  const nextDept = departments.find((d) => d.name === nextDeptName);
                  return {
                    ...prev,
                    deptCode: nextDeptName,
                    doctorId: nextDept ? String(nextDept.doctorId) : prev.doctorId,
                  };
                })
              }
              fullWidth
            >
              {departments.map((dept) => (
                <MenuItem key={dept.id} value={dept.name}>
                  {dept.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="담당의"
              value={reservationForm.doctorId}
              onChange={(e) =>
                setReservationForm((prev) => {
                  const nextDoctorId = e.target.value;
                  const nextDept = departments.find(
                    (dept) => String(dept.doctorId) === nextDoctorId
                  );
                  return {
                    ...prev,
                    doctorId: nextDoctorId,
                    deptCode: nextDept?.name ?? prev.deptCode,
                  };
                })
              }
              fullWidth
            >
              {departments.map((dept) => (
                <MenuItem key={dept.doctorId} value={String(dept.doctorId)}>
                  {dept.doctor}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="예약 ID"
              value={reservationForm.reservationId}
              onChange={(e) =>
                setReservationForm((prev) => ({
                  ...prev,
                  reservationId: e.target.value,
                }))
              }
              fullWidth
            />

            <TextField
              label="예약 일시"
              type="datetime-local"
              value={reservationForm.scheduledAt}
              onChange={(e) =>
                setReservationForm((prev) => ({
                  ...prev,
                  scheduledAt: e.target.value,
                }))
              }
              InputLabelProps={{ shrink: true }}
              fullWidth
            />

            <TextField
              label="내원 일시(선택)"
              type="datetime-local"
              value={reservationForm.arrivalAt}
              onChange={(e) =>
                setReservationForm((prev) => ({
                  ...prev,
                  arrivalAt: e.target.value,
                }))
              }
              InputLabelProps={{ shrink: true }}
              fullWidth
            />

            <TextField
              label="예약 메모"
              value={reservationForm.note}
              onChange={(e) =>
                setReservationForm((prev) => ({
                  ...prev,
                  note: e.target.value,
                }))
              }
              fullWidth
            />

            <TextField
              label="접수 메모(선택)"
              value={reservationForm.memo}
              onChange={(e) =>
                setReservationForm((prev) => ({
                  ...prev,
                  memo: e.target.value,
                }))
              }
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReservationDialogOpen(false)}>취소</Button>
          <Button variant="contained" onClick={saveReservation} disabled={reservationSaving}>
            저장
          </Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
}
