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
import type { InpatientReceptionForm as InpatientReceptionFormPayload } from "@/features/InpatientReceptions/InpatientReceptionTypes";

type InpatientReceptionFormState = {
  receptionNo: string;
  patientId: string;
  departmentId: string;
  doctorId: string;
  scheduledAt: string;
  arrivedAt: string;
  status: string;
  note: string;
  admissionPlanAt: string;
  wardId: string;
  roomId: string;
};

type InpatientReceptionFormProps = {
  title: string;
  initial: InpatientReceptionFormState;
  loading: boolean;
  error?: string | null;
  submitLabel: string;
  onSubmit: (form: InpatientReceptionFormPayload) => void;
  onCancel: () => void;
};

const statusOptions = [
  { value: "WAITING", label: "대기" },
  { value: "CALLED", label: "호출" },
  { value: "IN_PROGRESS", label: "진행중" },
  { value: "COMPLETED", label: "완료" },
  { value: "PAYMENT_WAIT", label: "수납대기" },
  { value: "ON_HOLD", label: "보류" },
  { value: "CANCELED", label: "취소" },
  { value: "INACTIVE", label: "비활성" },
];

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

export default function InpatientReceptionForm({
  title,
  initial,
  loading,
  error,
  submitLabel,
  onSubmit,
  onCancel,
}: InpatientReceptionFormProps) {
  const [form, setForm] = React.useState<InpatientReceptionFormState>(initial);

  React.useEffect(() => {
    setForm(initial);
  }, [initial]);

  const handleSubmit = () => {
    if (!form.receptionNo.trim()) return;
    const patientId = toOptionalNumber(form.patientId);
    const departmentId = toOptionalNumber(form.departmentId);

    if (!patientId || !departmentId || !form.admissionPlanAt.trim()) return;

    onSubmit({
      receptionNo: form.receptionNo.trim(),
      patientId,
      departmentId,
      doctorId: toOptionalNumber(form.doctorId) ?? null,
      scheduledAt: toOptionalString(form.scheduledAt),
      arrivedAt: toOptionalString(form.arrivedAt),
      status: (form.status || "WAITING") as any,
      note: toOptionalString(form.note) ?? null,
      admissionPlanAt: form.admissionPlanAt,
      wardId: toOptionalNumber(form.wardId),
      roomId: toOptionalNumber(form.roomId),
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
            입원 접수 정보를 입력해 주세요.
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
              label="환자 ID"
              value={form.patientId}
              onChange={(e) => setForm((prev) => ({ ...prev, patientId: e.target.value }))}
              required
              fullWidth
              sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }}
            />
            <TextField
              label="진료과 ID"
              value={form.departmentId}
              onChange={(e) => setForm((prev) => ({ ...prev, departmentId: e.target.value }))}
              required
              fullWidth
              sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }}
            />
          </Stack>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <TextField
              label="의사 ID"
              value={form.doctorId}
              onChange={(e) => setForm((prev) => ({ ...prev, doctorId: e.target.value }))}
              fullWidth
              sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }}
            />
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
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <TextField
              type="datetime-local"
              label="입원 예정일시"
              InputLabelProps={{ shrink: true }}
              value={form.admissionPlanAt}
              onChange={(e) => setForm((prev) => ({ ...prev, admissionPlanAt: e.target.value }))}
              required
              fullWidth
              sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }}
            />
            <TextField
              label="병동 ID"
              value={form.wardId}
              onChange={(e) => setForm((prev) => ({ ...prev, wardId: e.target.value }))}
              fullWidth
              sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }}
            />
            <TextField
              label="병실 ID"
              value={form.roomId}
              onChange={(e) => setForm((prev) => ({ ...prev, roomId: e.target.value }))}
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
              !form.patientId.trim() ||
              !form.departmentId.trim() ||
              !form.admissionPlanAt.trim()
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
