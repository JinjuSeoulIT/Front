"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, Box, Button, Paper, Stack, TextField, Typography } from "@mui/material";
import { createNurseApi } from "@/lib/nurseApi";
import { initialNurseCreateForm, type NurseCreateRequest } from "@/features/nurse/nurseTypes";

export default function NurseCreate() {
  const router = useRouter();
  const [form, setForm] = useState<NurseCreateRequest>(initialNurseCreateForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onChange = (name: keyof NurseCreateRequest, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const res = await createNurseApi(form);
      if (!res.success) throw new Error(res.message || "등록 실패");
      router.replace("/staff/join/list");
    } catch (err) {
      setError(err instanceof Error ? err.message : "등록 실패");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 780, mx: "auto", px: 2 }}>
      <Paper sx={{ p: 3, borderRadius: 3, border: "1px solid #dbe5f5" }}>
        <Stack spacing={2} component="form" onSubmit={onSubmit}>
          <Typography variant="h6" fontWeight={800}>간호사 등록</Typography>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField label="간호사 등급" value={form.nurseGrade} onChange={(e) => onChange("nurseGrade", e.target.value)} required />
          <TextField label="사번" value={form.unitId} onChange={(e) => onChange("unitId", e.target.value)} required />
          <TextField label="근무형태" value={form.shiftType} onChange={(e) => onChange("shiftType", e.target.value)} required />
          <TextField label="부서" value={form.department} onChange={(e) => onChange("department", e.target.value)} required />
          <TextField label="고용형태" value={form.employmentType} onChange={(e) => onChange("employmentType", e.target.value)} required />
          <TextField label="재직상태" value={form.status} onChange={(e) => onChange("status", e.target.value)} required />
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" fullWidth onClick={() => router.replace("/staff/join/list")}>취소</Button>
            <Button variant="contained" type="submit" fullWidth disabled={loading}>저장</Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}
