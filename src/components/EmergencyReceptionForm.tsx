"use client";

import * as React from "react";
import {
  Box,
  Button,
  Chip,
  Divider,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import EmergencyOutlinedIcon from "@mui/icons-material/EmergencyOutlined";
import EditNoteRoundedIcon from "@mui/icons-material/EditNoteRounded";
import type { EmergencyReceptionForm as EmergencyReceptionFormPayload } from "@/features/EmergencyReceptions/EmergencyReceptionTypes";
import { fetchEmergencyReceptionsApi } from "@/lib/emergencyReceptionApi";
import { buildNextReceptionNumber } from "@/lib/receptionNumber";

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
  mode?: "create" | "edit";
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
  mode = "create",
  onSubmit,
  onCancel,
}: EmergencyReceptionFormProps) {
  const isEditMode = mode === "edit";
  const accent = isEditMode ? "#b45309" : "#c2410c";
  const borderTone = isEditMode ? "rgba(180,83,9,0.24)" : "rgba(194,65,12,0.24)";
  const fieldSx = {
    "& .MuiInputBase-root": {
      bgcolor: "#fff8f2",
      borderRadius: 2,
    },
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: isEditMode ? "rgba(180,83,9,0.28)" : "rgba(194,65,12,0.24)",
    },
    "& .MuiInputBase-root:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: isEditMode ? "rgba(180,83,9,0.46)" : "rgba(194,65,12,0.42)",
    },
    "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: accent,
      borderWidth: "2px",
    },
  };

  const [form, setForm] = React.useState<EmergencyReceptionFormState>(initial);
  const [numberLoading, setNumberLoading] = React.useState(false);
  const [numberError, setNumberError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setForm(initial);
  }, [initial]);

  React.useEffect(() => {
    if (initial.receptionNo.trim()) return;
    let mounted = true;

    const generate = async () => {
      try {
        setNumberLoading(true);
        setNumberError(null);
        const list = await fetchEmergencyReceptionsApi();
        const next = buildNextReceptionNumber({
          existingNumbers: list.map((item) => item.receptionNo),
          startSequence: 101,
        });
        if (!mounted) return;
        setForm((prev) => ({ ...prev, receptionNo: next }));
      } catch (err) {
        if (!mounted) return;
        const fallback = buildNextReceptionNumber({
          existingNumbers: [],
          startSequence: 101,
        });
        setForm((prev) => ({ ...prev, receptionNo: fallback }));
        setNumberError(err instanceof Error ? err.message : "자동 채번에 실패했습니다.");
      } finally {
        if (mounted) {
          setNumberLoading(false);
        }
      }
    };

    generate();
    return () => {
      mounted = false;
    };
  }, [initial.receptionNo]);

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
        border: `1px solid ${borderTone}`,
        bgcolor: "white",
        background: isEditMode
          ? "linear-gradient(145deg, rgba(180,83,9,0.1), rgba(180,83,9,0.015) 45%)"
          : "linear-gradient(145deg, rgba(194,65,12,0.1), rgba(194,65,12,0.015) 45%)",
        boxShadow: "0 16px 32px rgba(89, 42, 14, 0.14)",
      }}
    >
      <Stack spacing={2.5}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={1.25}
        >
          <Stack spacing={0.75}>
            <Chip
              icon={isEditMode ? <EditNoteRoundedIcon /> : <EmergencyOutlinedIcon />}
              label={isEditMode ? "EMERGENCY EDIT" : "EMERGENCY RECEPTION"}
              size="small"
              sx={{
                width: "fit-content",
                bgcolor: isEditMode ? "rgba(180,83,9,0.13)" : "rgba(194,65,12,0.13)",
                color: accent,
                fontWeight: 800,
                "& .MuiChip-icon": { color: accent },
              }}
            />
            <Typography variant="h5" fontWeight={900} sx={{ letterSpacing: -0.2 }}>
              {title}
            </Typography>
            <Typography color="text.secondary" fontWeight={700}>
              응급도와 바이탈을 빠르게 입력해 진료 준비를 완료하세요.
            </Typography>
          </Stack>
          <Box
            sx={{
              px: 1.25,
              py: 0.75,
              borderRadius: 2,
              border: `1px solid ${borderTone}`,
              bgcolor: "rgba(255,255,255,0.82)",
            }}
          >
            <Typography sx={{ fontSize: 12, color: "#7f6a57", fontWeight: 700 }}>
              처리 상태
            </Typography>
            <Typography sx={{ fontSize: 14, color: accent, fontWeight: 900 }}>
              {isEditMode ? "응급 접수 수정" : "응급 접수 등록"}
            </Typography>
          </Box>
        </Stack>
        <Divider />

        <Stack
          spacing={2}
          sx={{
            p: { xs: 1.5, md: 2 },
            borderRadius: 2.5,
            border: "1px solid rgba(148, 163, 184, 0.2)",
            bgcolor: "rgba(255,255,255,0.72)",
          }}
        >
          <TextField
            label="접수번호"
            value={form.receptionNo}
            required
            fullWidth
            InputProps={{ readOnly: true }}
            helperText={
              numberError
                ? "자동 채번 조회에 실패해 기본 번호를 넣었습니다."
                : "접수번호는 자동 생성됩니다."
            }
            sx={fieldSx}
          />
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <TextField
              label="환자 ID"
              value={form.patientId}
              onChange={(e) => setForm((prev) => ({ ...prev, patientId: e.target.value }))}
              required
              fullWidth
              sx={fieldSx}
            />
            <TextField
              label="진료과 ID"
              value={form.departmentId}
              onChange={(e) => setForm((prev) => ({ ...prev, departmentId: e.target.value }))}
              required
              fullWidth
              sx={fieldSx}
            />
          </Stack>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <TextField
              label="의사 ID"
              value={form.doctorId}
              onChange={(e) => setForm((prev) => ({ ...prev, doctorId: e.target.value }))}
              fullWidth
              sx={fieldSx}
            />
            <TextField
              select
              label="상태"
              value={form.status}
              onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
              fullWidth
              sx={fieldSx}
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
              sx={fieldSx}
            />
            <TextField
              type="datetime-local"
              label="도착 시간"
              InputLabelProps={{ shrink: true }}
              value={form.arrivedAt}
              onChange={(e) => setForm((prev) => ({ ...prev, arrivedAt: e.target.value }))}
              fullWidth
              sx={fieldSx}
            />
          </Stack>

          <Divider />

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <TextField
              label="중증도 (1~5)"
              value={form.triageLevel}
              onChange={(e) => setForm((prev) => ({ ...prev, triageLevel: e.target.value }))}
              required
              fullWidth
              sx={fieldSx}
            />
            <TextField
              label="주호소"
              value={form.chiefComplaint}
              onChange={(e) => setForm((prev) => ({ ...prev, chiefComplaint: e.target.value }))}
              required
              fullWidth
              sx={fieldSx}
            />
          </Stack>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <TextField
              label="체온"
              value={form.vitalTemp}
              onChange={(e) => setForm((prev) => ({ ...prev, vitalTemp: e.target.value }))}
              fullWidth
              sx={fieldSx}
            />
            <TextField
              label="수축기혈압"
              value={form.vitalBpSystolic}
              onChange={(e) => setForm((prev) => ({ ...prev, vitalBpSystolic: e.target.value }))}
              fullWidth
              sx={fieldSx}
            />
            <TextField
              label="이완기혈압"
              value={form.vitalBpDiastolic}
              onChange={(e) => setForm((prev) => ({ ...prev, vitalBpDiastolic: e.target.value }))}
              fullWidth
              sx={fieldSx}
            />
          </Stack>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <TextField
              label="심박수"
              value={form.vitalHr}
              onChange={(e) => setForm((prev) => ({ ...prev, vitalHr: e.target.value }))}
              fullWidth
              sx={fieldSx}
            />
            <TextField
              label="호흡수"
              value={form.vitalRr}
              onChange={(e) => setForm((prev) => ({ ...prev, vitalRr: e.target.value }))}
              fullWidth
              sx={fieldSx}
            />
            <TextField
              label="SpO2"
              value={form.vitalSpo2}
              onChange={(e) => setForm((prev) => ({ ...prev, vitalSpo2: e.target.value }))}
              fullWidth
              sx={fieldSx}
            />
          </Stack>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <TextField
              select
              label="도착 방법"
              value={form.arrivalMode}
              onChange={(e) => setForm((prev) => ({ ...prev, arrivalMode: e.target.value }))}
              fullWidth
              sx={fieldSx}
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
              sx={fieldSx}
            />
          </Stack>
          <TextField
            label="메모"
            value={form.note}
            onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))}
            fullWidth
            multiline
            minRows={3}
            sx={fieldSx}
          />
        </Stack>

        {error && (
          <Typography color="error" fontWeight={800}>
            {error}
          </Typography>
        )}

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
          <Button
            variant="outlined"
            onClick={onCancel}
            disabled={loading}
            sx={{
              borderColor: isEditMode ? "rgba(180,83,9,0.5)" : "rgba(194,65,12,0.45)",
              color: accent,
              fontWeight: 800,
              bgcolor: "rgba(255,255,255,0.86)",
              "&:hover": { borderColor: accent, bgcolor: "rgba(194,65,12,0.06)" },
            }}
          >
            취소
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={
              loading ||
              numberLoading ||
              !form.receptionNo.trim() ||
              !form.patientId.trim() ||
              !form.departmentId.trim() ||
              !form.triageLevel.trim() ||
              !form.chiefComplaint.trim()
            }
            sx={{
              bgcolor: accent,
              px: 2.25,
              fontWeight: 900,
              borderRadius: 2,
              boxShadow: isEditMode
                ? "0 10px 20px rgba(180,83,9,0.28)"
                : "0 10px 20px rgba(194,65,12,0.28)",
              "&:hover": { bgcolor: isEditMode ? "#92400e" : "#9a3412" },
            }}
          >
            {submitLabel}
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}

