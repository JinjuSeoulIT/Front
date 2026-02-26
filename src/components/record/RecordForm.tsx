"use client";

import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import type {
  RecordForm as RecordFormState,
} from "@/features/Record/recordTypes";
import type { NursingRecordCreatePayload } from "@/lib/recordApi";
import { useEffect, useState } from "react";

type RecordFormProps = {
  title: string;
  initial: RecordFormState;
  loading: boolean;
  error?: string | null;
  submitLabel: string;
  onSubmit: (payload: NursingRecordCreatePayload) => void;
  onCancel: () => void;
};

const painScoreOptions = Array.from({ length: 11 }, (_, i) => String(i));
const consciousnessLevelOptions = [
  "명료",
  "말에 반응",
  "통증에 반응",
  "아무 반응 없음",
] as const;

const toOptionalInt = (value?: string) => {
  const v = value?.trim();
  if (!v) return null;
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  return Math.trunc(n);
};

const toOptionalFloat = (value?: string) => {
  const v = value?.trim();
  if (!v) return null;
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  return n;
};

const normalizeText = (value?: string) => {
  const v = value?.trim();
  return v ? v : null;
};

const normalizeDateTime = (value?: string) => {
  const v = value?.trim();
  if (!v) return null;
  return v.length === 16 ? `${v}:00` : v;
};

export default function RecordForm({
  title,
  initial,
  loading,
  error,
  submitLabel,
  onSubmit,
  onCancel,
}: RecordFormProps) {
  const [form, setForm] = useState<RecordFormState>(initial);

 useEffect(() => {
    setForm(initial);
  }, [initial]);

  const handleSubmit = () => {
    onSubmit({
      visitId: toOptionalInt(form.visitId),
      recordedAt: normalizeDateTime(form.recordedAt),
      systolicBp: toOptionalInt(form.systolicBp),
      diastolicBp: toOptionalInt(form.diastolicBp),
      pulse: toOptionalInt(form.pulse),
      respiration: toOptionalInt(form.respiration),
      temperature: toOptionalFloat(form.temperature),
      spo2: toOptionalInt(form.spo2),
      painScore: toOptionalInt(form.painScore),
      consciousnessLevel: normalizeText(form.consciousnessLevel),
      observation: normalizeText(form.observation),
      initialAssessment: normalizeText(form.initialAssessment),
      status: normalizeText(form.status) ?? "ACTIVE",
    });
  };

  return (
    <Stack spacing={2}>
      <Typography sx={{ fontWeight: 800, fontSize: 18 }}>{title}</Typography>
      {error && <Typography color="error">{error}</Typography>}
      <Box
        sx={{
          display: "grid",
          gap: 1.1,
          gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
        }}
      >
        <TextField
          label="방문 ID"
          value={form.visitId}
          onChange={(e) => setForm((prev) => ({ ...prev, visitId: e.target.value }))}
          size="small"
          fullWidth
        />
        <TextField
          label="기록 시각"
          type="datetime-local"
          value={form.recordedAt}
          onChange={(e) => setForm((prev) => ({ ...prev, recordedAt: e.target.value }))}
          size="small"
          fullWidth
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="수축기 혈압"
          value={form.systolicBp}
          onChange={(e) => setForm((prev) => ({ ...prev, systolicBp: e.target.value }))}
          size="small"
          fullWidth
        />
        <TextField
          label="이완기 혈압"
          value={form.diastolicBp}
          onChange={(e) => setForm((prev) => ({ ...prev, diastolicBp: e.target.value }))}
          size="small"
          fullWidth
        />
        <TextField
          label="맥박"
          value={form.pulse}
          onChange={(e) => setForm((prev) => ({ ...prev, pulse: e.target.value }))}
          size="small"
          fullWidth
        />
        <TextField
          label="호흡"
          value={form.respiration}
          onChange={(e) => setForm((prev) => ({ ...prev, respiration: e.target.value }))}
          size="small"
          fullWidth
        />
        <TextField
          label="체온"
          value={form.temperature}
          onChange={(e) => setForm((prev) => ({ ...prev, temperature: e.target.value }))}
          size="small"
          fullWidth
        />
        <TextField
          label="SpO2(동맥혈산소포화도)"
          value={form.spo2}
          onChange={(e) => setForm((prev) => ({ ...prev, spo2: e.target.value }))}
          size="small"
          fullWidth
        />

        <FormControl size="small" fullWidth>
          <InputLabel id="record-pain-score-label">통증 점수</InputLabel>
          <Select
            labelId="record-pain-score-label"
            label="통증 점수"
            value={form.painScore}
            onChange={(e) => setForm((prev) => ({ ...prev, painScore: String(e.target.value) }))}
          >
            <MenuItem value="">선택 안 함</MenuItem>
            {painScoreOptions.map((score) => (
              <MenuItem key={score} value={score}>
                {score}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" fullWidth>
          <InputLabel id="record-consciousness-label">의식 수준</InputLabel>
          <Select
            labelId="record-consciousness-label"
            label="의식 수준"
            value={form.consciousnessLevel}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, consciousnessLevel: String(e.target.value) }))
            }
          >
            <MenuItem value="">선택 안 함</MenuItem>
            {consciousnessLevelOptions.map((level) => (
              <MenuItem key={level} value={level}>
                {level}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ gridColumn: { xs: "1", md: "1 / span 2" } }}>
          <InputLabel id="record-status-label">상태</InputLabel>
          <Select
            labelId="record-status-label"
            label="상태"
            value={form.status}
            onChange={(e) => setForm((prev) => ({ ...prev, status: String(e.target.value) }))}
          >
            <MenuItem value="ACTIVE">ACTIVE</MenuItem>
            <MenuItem value="INACTIVE">INACTIVE</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="관찰 내용"
          value={form.observation}
          onChange={(e) => setForm((prev) => ({ ...prev, observation: e.target.value }))}
          size="small"
          multiline
          minRows={2}
          sx={{ gridColumn: { xs: "1", md: "1 / span 2" } }}
        />
        <TextField
          label="초기 평가"
          value={form.initialAssessment}
          onChange={(e) => setForm((prev) => ({ ...prev, initialAssessment: e.target.value }))}
          size="small"
          multiline
          minRows={2}
          sx={{ gridColumn: { xs: "1", md: "1 / span 2" } }}
        />
      </Box>

      <Stack direction="row" spacing={1}>
        <Button variant="contained" onClick={handleSubmit} disabled={loading} fullWidth>
          {submitLabel}
        </Button>
        <Button variant="outlined" onClick={onCancel} disabled={loading} fullWidth>
          취소
        </Button>
      </Stack>
    </Stack>
  );
}
