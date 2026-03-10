"use client";

import { useEffect, useState } from "react";
import { Box, Button, FormControl, InputLabel, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";
import type { RecordForm as RecordFormState } from "@/features/Record/recordTypes";

export default function RecordForm({
  title, initial, mode, loading, error, onSubmit, onCancel, receptionId
}: {
  title: string; initial: RecordFormState; mode: "create" | "edit";
  loading: boolean; error?: string | null;
  onSubmit: (payload: any) => void; // 가공 없이 보내므로 타입을 any로 유연하게 둡니다
  onCancel: () => void;
  receptionId : string | null
}) {
  const [form, setForm] = useState<RecordFormState>(initial);

  useEffect(() => {
    setForm(initial);
  }, [initial]);

  const updateField = (key: keyof RecordFormState, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = () => {
    onSubmit(form);
  };

  const painScoreOptions = Array.from({ length: 11 }, (_, i) => String(i));
  const consciousnessLevelOptions = ["명료", "말에 반응", "통증에 반응", "아무 반응 없음"] as const;

  return (
    <Stack spacing={2}>
      <Typography sx={{ fontWeight: 800, fontSize: 18 }}>{title}</Typography>
      {error && <Typography color="error">{error}</Typography>}
      
      <Box sx={{ display: "grid", gap: 1.1, gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" } }}>
         <TextField label="기록 시각" type="datetime-local" value={(form.recordedAt ?? "").slice(0, 16)} 
         onChange={(e) => updateField("recordedAt", e.target.value)} size="small" fullWidth InputLabelProps={{ shrink: true }} />
        <TextField label="수축기 혈압" value={form.systolicBp ?? ""} onChange={(e) => updateField("systolicBp", e.target.value)} size="small" />
        <TextField label="이완기 혈압" value={form.diastolicBp ?? ""} onChange={(e) => updateField("diastolicBp", e.target.value)} size="small" />
        <TextField label="맥박" value={form.pulse ?? ""} onChange={(e) => updateField("pulse", e.target.value)} size="small" />
        <TextField label="호흡" value={form.respiration ?? ""} onChange={(e) => updateField("respiration", e.target.value)} size="small" />
        <TextField label="체온" value={form.temperature ?? ""} onChange={(e) => updateField("temperature", e.target.value)} size="small" />
        <TextField label="SpO2" value={form.spo2 ?? ""} onChange={(e) => updateField("spo2", e.target.value)} size="small" />
        <TextField label="접수 아이디" value={form.receptionId ?? ""} onChange={(e) => updateField("receptionId", e.target.value)} size="small" />


        <FormControl size="small" fullWidth>
          <InputLabel>통증 점수</InputLabel>
          <Select label="통증 점수" value={form.painScore ?? ""} onChange={(e) => updateField("painScore", e.target.value)}>
            <MenuItem value="">선택 안 함</MenuItem>
            {painScoreOptions.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </Select>
        </FormControl>

        <FormControl size="small" fullWidth>
          <InputLabel>의식 수준</InputLabel>
          <Select label="의식 수준" value={form.consciousnessLevel ?? ""} onChange={(e) => updateField("consciousnessLevel", e.target.value)}>
            <MenuItem value="">선택 안 함</MenuItem>
            {consciousnessLevelOptions.map((l) => <MenuItem key={l} value={l}>{l}</MenuItem>)}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ gridColumn: { xs: "1", md: "1 / span 2" } }}>
          <InputLabel>상태</InputLabel>
          <Select label="상태" value={form.status ?? "ACTIVE"} onChange={(e) => updateField("status", e.target.value)}>
            <MenuItem value="ACTIVE">ACTIVE</MenuItem>
            <MenuItem value="INACTIVE">INACTIVE</MenuItem>
          </Select>
        </FormControl>

        <TextField label="관찰 내용" value={form.observation ?? ""} onChange={(e) => updateField("observation", e.target.value)} multiline minRows={2} sx={{ gridColumn: "span 2" }} size="small" />
        <TextField label="초기 평가" value={form.initialAssessment ?? ""} onChange={(e) => updateField("initialAssessment", e.target.value)} multiline minRows={2} sx={{ gridColumn: "span 2" }} size="small" />
      </Box>

      <Stack direction="row" spacing={1}>
        <Button variant="contained" onClick={handleSubmit} disabled={loading} fullWidth>{mode === "create" ? "등록" : "수정 저장"}</Button>
        <Button variant="outlined" onClick={onCancel} fullWidth>취소</Button>
      </Stack>
    </Stack>
  );
}