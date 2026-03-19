"use client";

import { type FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, Box, Button, Paper, Stack, TextField, Typography } from "@mui/material";
import { DetailNurseApi, updateNursedApi } from "@/lib/nurseApi";
import { initialNurseUpdateForm, type NurseUpdateRequest } from "@/features/nurse/nurseTypes";

type Props = { nurseId: number };

export default function NurseEdit({ nurseId }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<NurseUpdateRequest>(initialNurseUpdateForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    void DetailNurseApi(nurseId)
      .then((res) => {
        if (!mounted) return;
        if (!res.success || !res.data) throw new Error(res.message || "조회 실패");
        setForm({
          nurseGrade: res.data.nurseGrade ?? "",
          unitId: res.data.unitId ?? "",
          shiftType: res.data.shiftType ?? "",
          department: res.data.department ?? "",
          employmentType: res.data.employmentType ?? "",
          status: res.data.status ?? "",
        });
      })
      .catch((err: unknown) => {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "조회 실패");
      });
    return () => {
      mounted = false;
    };
  }, [nurseId]);

  const onChange = (name: keyof NurseUpdateRequest, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const res = await updateNursedApi(nurseId, form);
      if (!res.success) throw new Error(res.message || "수정 실패");
      router.replace(`/staff/join/${nurseId}/detail`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "수정 실패");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 780, mx: "auto", px: 2 }}>
      <Paper sx={{ p: 3, borderRadius: 3, border: "1px solid #dbe5f5" }}>
        <Stack spacing={2} component="form" onSubmit={onSubmit}>
          <Typography variant="h6" fontWeight={800}>간호사 수정</Typography>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField label="간호사 등급" value={form.nurseGrade} onChange={(e) => onChange("nurseGrade", e.target.value)} required />
          <TextField label="사번" value={form.unitId} onChange={(e) => onChange("unitId", e.target.value)} required />
          <TextField label="근무형태" value={form.shiftType} onChange={(e) => onChange("shiftType", e.target.value)} required />
          <TextField label="부서" value={form.department} onChange={(e) => onChange("department", e.target.value)} required />
          <TextField label="고용형태" value={form.employmentType} onChange={(e) => onChange("employmentType", e.target.value)} required />
          <TextField label="재직상태" value={form.status} onChange={(e) => onChange("status", e.target.value)} required />
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" fullWidth onClick={() => router.replace(`/staff/join/${nurseId}/detail`)}>취소</Button>
            <Button variant="contained" type="submit" fullWidth disabled={loading}>저장</Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}
