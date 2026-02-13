"use client";

import * as React from "react";
import MainLayout from "@/components/layout/MainLayout";
import {
  Box,
  Button,
  Chip,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import { formatDepartmentName } from "@/lib/departmentLabel";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "";

type ReceptionStatus =
  | "WAITING"
  | "CALLED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "PAYMENT_WAIT"
  | "ON_HOLD"
  | "CANCELED"
  | "INACTIVE";

type Reception = {
  receptionId: number;
  receptionNo: string;
  patientId?: number | null;
  patientName?: string | null;
  visitType?: string;
  departmentId: number;
  departmentName?: string | null;
  doctorId?: number | null;
  doctorName?: string | null;
  reservationId?: number | null;
  scheduledAt?: string | null;
  arrivedAt?: string | null;
  status: ReceptionStatus;
  note?: string | null;
  isActive?: boolean | null;
  cancelReasonText?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

function statusLabel(s?: string | null) {
  const code = normalizeStatus(s);
  switch (code) {
    case "WAITING":
      return "대기";
    case "CALLED":
      return "호출";
    case "IN_PROGRESS":
      return "진료중";
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
      return s?.trim() || "-";
  }
}

function statusChipSx(status?: string | null) {
  const code = normalizeStatus(status);
  switch (code) {
    case "WAITING":
      return { bgcolor: "#E3F2FD", color: "#1565C0", fontWeight: 700 };
    case "CALLED":
      return { bgcolor: "#E8EAF6", color: "#283593", fontWeight: 700 };
    case "IN_PROGRESS":
      return { bgcolor: "#FFF3E0", color: "#E65100", fontWeight: 700 };
    case "COMPLETED":
      return { bgcolor: "#E8F5E9", color: "#1B5E20", fontWeight: 700 };
    case "PAYMENT_WAIT":
      return { bgcolor: "#F3E5F5", color: "#6A1B9A", fontWeight: 700 };
    case "ON_HOLD":
      return { bgcolor: "#F5F5F5", color: "#616161", fontWeight: 700 };
    case "CANCELED":
      return { bgcolor: "#FFEBEE", color: "#B71C1C", fontWeight: 700 };
    case "INACTIVE":
      return { bgcolor: "#ECEFF1", color: "#455A64", fontWeight: 700 };
    default:
      return { bgcolor: "#EEEEEE", color: "#424242", fontWeight: 700 };
  }
}

function normalizeStatus(value?: string | null): ReceptionStatus | "" {
  if (!value) return "";
  const trimmed = value.trim();
  switch (trimmed) {
    case "대기":
      return "WAITING";
    case "호출":
      return "CALLED";
    case "진료중":
      return "IN_PROGRESS";
    case "완료":
      return "COMPLETED";
    case "수납대기":
      return "PAYMENT_WAIT";
    case "보류":
      return "ON_HOLD";
    case "취소":
      return "CANCELED";
    case "비활성":
      return "INACTIVE";
    default:
      return trimmed as ReceptionStatus;
  }
}

function formatTime(value?: string | null) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
}

export default function ReceptionRegistrationPage() {
  const [receptions, setReceptions] = React.useState<Reception[]>([]);
  const [tab, setTab] = React.useState<ReceptionStatus | "ALL">("ALL");
  const [keyword, setKeyword] = React.useState("");
  const [queueOnly, setQueueOnly] = React.useState(false);
  const [departmentId, setDepartmentId] = React.useState("");
  const [doctorId, setDoctorId] = React.useState("");
  const [queueDate, setQueueDate] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [cancelDialogOpen, setCancelDialogOpen] = React.useState(false);
  const [cancelReason, setCancelReason] = React.useState("");
  const [selectedReception, setSelectedReception] = React.useState<Reception | null>(
    null
  );

  const loadReceptions = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (departmentId.trim()) params.set("departmentId", departmentId.trim());
      if (doctorId.trim()) params.set("doctorId", doctorId.trim());
      if (queueDate.trim()) params.set("date", queueDate.trim());

      const endpoint = queueOnly ? "/api/receptions/queue" : "/api/receptions";
      const url = params.toString()
        ? `${API_BASE}${endpoint}?${params}`
        : `${API_BASE}${endpoint}`;

      const res = await fetch(url, { cache: "no-store" });
      const data = await res.json();
      if (data?.success) {
        setReceptions(data.result ?? []);
      } else {
        setError(data?.message ?? "목록 조회 실패");
      }
    } catch (err) {
      setError("목록 조회 실패");
    } finally {
      setLoading(false);
    }
  }, [departmentId, doctorId, queueDate, queueOnly]);

  React.useEffect(() => {
    loadReceptions();
  }, [loadReceptions]);

  const updateStatus = async (
    receptionId: number,
    status: ReceptionStatus,
    reasonText?: string
  ) => {
    try {
      const res = await fetch(`${API_BASE}/api/receptions/${receptionId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          changedBy: 1,
          reasonCode: reasonText ? "CANCEL" : null,
          reasonText: reasonText ?? null,
        }),
      });
      const data = await res.json();
      if (data?.success) {
        setReceptions((prev) =>
          prev.map((r) => (r.receptionId === receptionId ? data.result : r))
        );
      } else {
        setError(data?.message ?? "상태 변경 실패");
      }
    } catch (err) {
      setError("상태 변경 실패");
    }
  };

  const handleCancel = async () => {
    if (!selectedReception) return;
    await updateStatus(selectedReception.receptionId, "CANCELED", cancelReason);
    setCancelDialogOpen(false);
    setCancelReason("");
    setSelectedReception(null);
  };

  const filtered = React.useMemo(() => {
    let list = [...receptions];
    if (tab !== "ALL") {
      list = list.filter((r) => normalizeStatus(r.status) === tab);
    }
    const k = keyword.trim().toLowerCase();
    if (k) {
      list = list.filter(
        (r) =>
          r.receptionNo.toLowerCase().includes(k) ||
          String(r.receptionId).includes(k)
      );
    }
    list.sort((a, b) => (a.createdAt ?? "").localeCompare(b.createdAt ?? ""));
    return list;
  }, [receptions, tab, keyword]);

  const counts = React.useMemo(() => {
    const c: Record<ReceptionStatus, number> = {
      WAITING: 0,
      CALLED: 0,
      IN_PROGRESS: 0,
      COMPLETED: 0,
      PAYMENT_WAIT: 0,
      ON_HOLD: 0,
      CANCELED: 0,
      INACTIVE: 0,
    };
    for (const r of receptions) {
      const code = normalizeStatus(r.status);
      if (code) c[code] += 1;
    }
    return c;
  }, [receptions]);

  return (
    <MainLayout>
      <Box sx={{ p: 0 }}>
        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, mb: 2 }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            spacing={2}
          >
            <Box>
              <Typography variant="h5" fontWeight={900}>
                접수/진료 관리
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {loading ? "불러오는 중..." : error ?? "정상"}
              </Typography>
            </Box>
            <IconButton onClick={loadReceptions} title="새로고침">
              <RefreshIcon />
            </IconButton>
          </Stack>
        </Paper>

        <Paper elevation={0} sx={{ p: 2, borderRadius: 3 }}>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2, flexWrap: "wrap" }}>
            <TextField
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              size="small"
              placeholder="접수번호 / 환자명"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              size="small"
              placeholder="진료과"
            />
            <TextField
              value={doctorId}
              onChange={(e) => setDoctorId(e.target.value)}
              size="small"
              placeholder="의사 이름"
            />
            <TextField
              value={queueDate}
              onChange={(e) => setQueueDate(e.target.value)}
              size="small"
              type="date"
              InputLabelProps={{ shrink: true }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={queueOnly}
                  onChange={(e) => setQueueOnly(e.target.checked)}
                />
              }
              label="대기열만"
            />
            <Tabs
              value={tab}
              onChange={(_, v) => setTab(v)}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab value="ALL" label="전체" />
              <Tab value="WAITING" label={`대기(${counts.WAITING})`} />
              <Tab value="CALLED" label={`호출(${counts.CALLED})`} />
              <Tab value="IN_PROGRESS" label={`진료중(${counts.IN_PROGRESS})`} />
              <Tab value="COMPLETED" label={`완료(${counts.COMPLETED})`} />
              <Tab value="PAYMENT_WAIT" label={`수납대기(${counts.PAYMENT_WAIT})`} />
              <Tab value="ON_HOLD" label={`보류(${counts.ON_HOLD})`} />
              <Tab value="CANCELED" label={`취소(${counts.CANCELED})`} />
            </Tabs>
          </Stack>

          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>시간</TableCell>
                <TableCell>접수번호</TableCell>
                <TableCell>환자</TableCell>
                <TableCell>진료과</TableCell>
                <TableCell>상태</TableCell>
                <TableCell align="right">작업</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r.receptionId} hover>
                  <TableCell>{formatTime(r.createdAt ?? r.arrivedAt)}</TableCell>
                  <TableCell>{r.receptionNo}</TableCell>
                  <TableCell>
                    {r.patientName?.trim() || `환자 ${r.patientId ?? "-"}`}
                  </TableCell>
                  <TableCell>
                    {formatDepartmentName(r.departmentName, r.departmentId)}
                  </TableCell>
                  <TableCell>
                    <Chip size="small" label={statusLabel(r.status)} sx={statusChipSx(r.status)} />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      {normalizeStatus(r.status) === "WAITING" ? (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => updateStatus(r.receptionId, "CALLED")}
                        >
                          호출
                        </Button>
                      ) : null}
                      {normalizeStatus(r.status) === "CALLED" ? (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() =>
                            updateStatus(r.receptionId, "IN_PROGRESS")
                          }
                        >
                          진료중
                        </Button>
                      ) : null}
                      {normalizeStatus(r.status) === "IN_PROGRESS" ? (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => updateStatus(r.receptionId, "COMPLETED")}
                        >
                          완료
                        </Button>
                      ) : null}
                      {normalizeStatus(r.status) !== "COMPLETED" &&
                      normalizeStatus(r.status) !== "CANCELED" ? (
                        <Button
                          size="small"
                          color="error"
                          variant="outlined"
                          onClick={() => {
                            setSelectedReception(r);
                            setCancelDialogOpen(true);
                          }}
                        >
                          취소
                        </Button>
                      ) : null}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}

              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Typography variant="body2" color="text.secondary">
                      표시할 접수 데이터가 없습니다.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </Paper>

        <Dialog
          open={cancelDialogOpen}
          onClose={() => setCancelDialogOpen(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>취소 사유</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="취소 사유"
              fullWidth
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="환자 이탈 / 진료 거부 / 중복 접수"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCancelDialogOpen(false)}>닫기</Button>
            <Button
              color="error"
              variant="contained"
              onClick={handleCancel}
              disabled={!cancelReason.trim()}
            >
              취소 확정
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </MainLayout>
  );
}


