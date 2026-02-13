"use client";

import * as React from "react";
import {
  Button,
  Divider,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import type { ReceptionForm as ReceptionFormPayload } from "@/features/Receptions/ReceptionTypes";

type ReceptionFormState = {
  receptionNo: string;
  patientName: string;
  departmentName: string;
  doctorName: string;
  visitType: string;
  scheduledAt: string;
  arrivedAt: string;
  status: string;
  note: string;
};

type ReceptionFormProps = {
  title: string;
  initial: ReceptionFormState;
  loading: boolean;
  error?: string | null;
  submitLabel: string;
  onSubmit: (form: ReceptionFormPayload) => void;
  onCancel: () => void;
};

const visitTypes = [
  { value: "OUTPATIENT", label: "외래" },
  { value: "EMERGENCY", label: "응급" },
  { value: "INPATIENT", label: "입원" },
];

const statusOptions = [
  { value: "WAITING", label: "대기" },
  { value: "CALLED", label: "호출" },
  { value: "IN_PROGRESS", label: "진료중" },
  { value: "COMPLETED", label: "완료" },
  { value: "PAYMENT_WAIT", label: "수납대기" },
  { value: "ON_HOLD", label: "보류" },
  { value: "CANCELED", label: "취소" },
  //{ value: "INACTIVE", label: "비활성" },
];

const departments = [
  { id: 1, name: "내과", doctor: "송태민", doctorId: 1 },
  { id: 2, name: "외과", doctor: "이현석", doctorId: 2 },
  { id: 3, name: "정형외과", doctor: "성숙희", doctorId: 3 },
  { id: 4, name: "신경외과", doctor: "최효정", doctorId: 4 },
];

const doctors = departments.map((d) => ({
  id: d.doctorId,
  name: d.doctor,
  departmentId: d.id,
  departmentName: d.name,
}));

function toOptionalNumber(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parsed = Number(trimmed);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function toOptionalString(value: string) {
  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
}

export default function ReceptionForm({
  title,
  initial,
  loading,
  error,
  submitLabel,
  onSubmit,
  onCancel,
}: ReceptionFormProps) {
  const [form, setForm] = React.useState<ReceptionFormState>(initial);

  React.useEffect(() => {
    setForm(initial);
  }, [initial]);

  const handleSubmit = () => {
    if (!form.receptionNo.trim()) return;
    if (!form.patientName.trim()) return;
    if (!form.departmentName.trim()) return;

    const selectedDept = departments.find((d) => d.name === form.departmentName);
    const selectedDoctor = doctors.find((d) => d.name === form.doctorName);
    if (!selectedDept) return;

    onSubmit({
      receptionNo: form.receptionNo.trim(),
      patientName: form.patientName.trim(),
      patientId: null,
      visitType: form.visitType || "OUTPATIENT",
      departmentId: selectedDept.id,
      departmentName: selectedDept.name,
      doctorId: selectedDoctor?.id ?? null,
      doctorName: selectedDoctor?.name ?? null,
      scheduledAt: toOptionalString(form.scheduledAt),
      arrivedAt: toOptionalString(form.arrivedAt),
      status: (form.status || "WAITING") as any,
      note: toOptionalString(form.note) ?? null,
    });
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 3, md: 4 },
        borderRadius: 3,
        border: "1px solid #dbe5f5",
        bgcolor: "white",
        boxShadow: "0 14px 28px rgba(23, 52, 97, 0.15)",
      }}
    >
      <Stack spacing={2.5}>
        <Stack spacing={0.5}>
          <Typography variant="h6" fontWeight={800}>
            {title}
          </Typography>
          <Typography color="text.secondary" fontWeight={600}>
            접수 기본 정보를 입력해 주세요.
          </Typography>
        </Stack>
        <Divider />

        <Stack spacing={2}>
          <TextField
            label="접수번호"
            value={form.receptionNo}
            onChange={(e) => setForm((prev) => ({ ...prev, receptionNo: e.target.value }))}
            required
            fullWidth
            sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }}
          />
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <TextField
              label="환자 이름"
              value={form.patientName}
              onChange={(e) => setForm((prev) => ({ ...prev, patientName: e.target.value }))}
              required
              fullWidth
              sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }}
            />
            <TextField
              select
              label="진료과"
              value={form.departmentName}
              onChange={(e) => {
                const name = e.target.value;
                const dept = departments.find((d) => d.name === name);
                setForm((prev) => ({
                  ...prev,
                  departmentName: name,
                  doctorName: dept?.doctor ?? "",
                }));
              }}
              required
              fullWidth
              sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }}
            >
              {departments.map((opt) => (
                <MenuItem key={opt.id} value={opt.name}>
                  {opt.name}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <TextField
              select
              label="의사 이름"
              value={form.doctorName}
              onChange={(e) => {
                const name = e.target.value;
                const doctor = doctors.find((d) => d.name === name);
                setForm((prev) => ({
                  ...prev,
                  doctorName: name,
                  departmentName: doctor?.departmentName ?? prev.departmentName,
                }));
              }}
              fullWidth
              sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }}
            >
              {doctors.map((opt) => (
                <MenuItem key={opt.id} value={opt.name}>
                  {opt.name}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <TextField
              select
              label="내원 유형"
              value={form.visitType}
              onChange={(e) => setForm((prev) => ({ ...prev, visitType: e.target.value }))}
              fullWidth
              sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }}
            >
              {visitTypes.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="상태"
              value={form.status}
              onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
              fullWidth
              sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }}
            >
              {statusOptions.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <TextField
              type="datetime-local"
              label="예약 시간"
              InputLabelProps={{ shrink: true }}
              value={form.scheduledAt}
              onChange={(e) => setForm((prev) => ({ ...prev, scheduledAt: e.target.value }))}
              fullWidth
              sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }}
            />
            <TextField
              type="datetime-local"
              label="도착 시간"
              InputLabelProps={{ shrink: true }}
              value={form.arrivedAt}
              onChange={(e) => setForm((prev) => ({ ...prev, arrivedAt: e.target.value }))}
              fullWidth
              sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }}
            />
          </Stack>
          <TextField
            label="메모"
            value={form.note}
            onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))}
            fullWidth
            multiline
            minRows={3}
            sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }}
          />
        </Stack>

        {error && (
          <Typography color="error" fontWeight={800}>
            {error}
          </Typography>
        )}

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
          <Button variant="outlined" onClick={onCancel} disabled={loading}>
            취소
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={
              loading ||
              !form.receptionNo.trim() ||
              !form.patientName.trim() ||
              !form.departmentName.trim()
            }
            sx={{ bgcolor: "#2b5aa9" }}
          >
            {submitLabel}
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}
