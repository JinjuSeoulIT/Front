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
import type { EmergencyReceptionForm as EmergencyReceptionFormPayload } from "@/features/EmergencyReceptions/EmergencyReceptionTypes";

type EmergencyReceptionFormState = {
  receptionNo: string;
  patientId: string;
  departmentId: string;
  doctorId: string;
  scheduledAt: string;
  arrivedAt: string;
  status: string;
  note: string;
  triageLevel: string;
  chiefComplaint: string;
  vitalTemp: string;
  vitalBpSystolic: string;
  vitalBpDiastolic: string;
  vitalHr: string;
  vitalRr: string;
  vitalSpo2: string;
  arrivalMode: string;
  triageNote: string;
};

type EmergencyReceptionFormProps = {
  title: string;
  initial: EmergencyReceptionFormState;
  loading: boolean;
  error?: string | null;
  submitLabel: string;
  onSubmit: (form: EmergencyReceptionFormPayload) => void;
  onCancel: () => void;
};

const statusOptions = [
  { value: "WAITING", label: "대기" },
  { value: "CALLED", label: "호출" },
  { value: "IN_PROGRESS", label: "진료중" },
  { value: "COMPLETED", label: "완료" },
  { value: "PAYMENT_WAIT", label: "수납대기" },
  { value: "ON_HOLD", label: "보류" },
  { value: "CANCELED", label: "취소" },
  { value: "INACTIVE", label: "비활성" },
];

const arrivalModes = [
  { value: "WALK_IN", label: "도보" },
  { value: "AMBULANCE", label: "구급차" },
  { value: "TRANSFER", label: "전원" },
  { value: "OTHER", label: "기타" },
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

export default function EmergencyReceptionForm({
  title,
  initial,
  loading,
  error,
  submitLabel,
  onSubmit,
  onCancel,
}: EmergencyReceptionFormProps) {
  const [form, setForm] = React.useState<EmergencyReceptionFormState>(initial);

  React.useEffect(() => {
    setForm(initial);
  }, [initial]);

  const handleSubmit = () => {
    if (!form.receptionNo.trim()) return;
    const patientId = toOptionalNumber(form.patientId);
    const departmentId = toOptionalNumber(form.departmentId);
    const triageLevel = toOptionalNumber(form.triageLevel);

    if (!patientId || !departmentId || !triageLevel || !form.chiefComplaint.trim()) return;

    onSubmit({
      receptionNo: form.receptionNo.trim(),
      patientId,
      departmentId,
      doctorId: toOptionalNumber(form.doctorId) ?? null,
      scheduledAt: toOptionalString(form.scheduledAt),
      arrivedAt: toOptionalString(form.arrivedAt),
      status: (form.status || "WAITING") as any,
      note: toOptionalString(form.note) ?? null,
      triageLevel,
      chiefComplaint: form.chiefComplaint.trim(),
      vitalTemp: toOptionalNumber(form.vitalTemp),
      vitalBpSystolic: toOptionalNumber(form.vitalBpSystolic),
      vitalBpDiastolic: toOptionalNumber(form.vitalBpDiastolic),
      vitalHr: toOptionalNumber(form.vitalHr),
      vitalRr: toOptionalNumber(form.vitalRr),
      vitalSpo2: toOptionalNumber(form.vitalSpo2),
      arrivalMode: toOptionalString(form.arrivalMode),
      triageNote: toOptionalString(form.triageNote),
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
            응급 접수 정보를 입력해 주세요.
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

          <Divider />

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <TextField
              label="중증도(1~5)"
              value={form.triageLevel}
              onChange={(e) => setForm((prev) => ({ ...prev, triageLevel: e.target.value }))}
              required
              fullWidth
              sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }}
            />
            <TextField
              label="주호소"
              value={form.chiefComplaint}
              onChange={(e) => setForm((prev) => ({ ...prev, chiefComplaint: e.target.value }))}
              required
              fullWidth
              sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }}
            />
          </Stack>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <TextField
              label="체온"
              value={form.vitalTemp}
              onChange={(e) => setForm((prev) => ({ ...prev, vitalTemp: e.target.value }))}
              fullWidth
              sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }}
            />
            <TextField
              label="수축기"
              value={form.vitalBpSystolic}
              onChange={(e) => setForm((prev) => ({ ...prev, vitalBpSystolic: e.target.value }))}
              fullWidth
              sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }}
            />
            <TextField
              label="이완기"
              value={form.vitalBpDiastolic}
              onChange={(e) => setForm((prev) => ({ ...prev, vitalBpDiastolic: e.target.value }))}
              fullWidth
              sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }}
            />
          </Stack>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <TextField
              label="심박수"
              value={form.vitalHr}
              onChange={(e) => setForm((prev) => ({ ...prev, vitalHr: e.target.value }))}
              fullWidth
              sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }}
            />
            <TextField
              label="호흡수"
              value={form.vitalRr}
              onChange={(e) => setForm((prev) => ({ ...prev, vitalRr: e.target.value }))}
              fullWidth
              sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }}
            />
            <TextField
              label="SpO2"
              value={form.vitalSpo2}
              onChange={(e) => setForm((prev) => ({ ...prev, vitalSpo2: e.target.value }))}
              fullWidth
              sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }}
            />
          </Stack>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <TextField
              select
              label="도착 방법"
              value={form.arrivalMode}
              onChange={(e) => setForm((prev) => ({ ...prev, arrivalMode: e.target.value }))}
              fullWidth
              sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }}
            >
              {arrivalModes.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="트리아지 메모"
              value={form.triageNote}
              onChange={(e) => setForm((prev) => ({ ...prev, triageNote: e.target.value }))}
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
              !form.triageLevel.trim() ||
              !form.chiefComplaint.trim()
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
