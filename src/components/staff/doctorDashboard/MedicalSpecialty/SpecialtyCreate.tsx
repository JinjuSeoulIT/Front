"use client";

import { type ChangeEvent, type FormEvent, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { Alert, Box, Button, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import type { RootState } from "@/store/rootReducer";
import { specialtyCreateRequest, resetSpecialtyState } from "@/features/staff/doctor/MedicalSpecialty/medicalSpecialtySlice";
import { initialSpecialtyCreateForm, type SpecialtyCreateRequest } from "@/features/staff/doctor/MedicalSpecialty/medicalSpecialtytypes";

export const SpecialtyCreate = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { loading, error, createSuccess } = useSelector((state: RootState) => state.specialty);
  const [form, setForm] = useState<SpecialtyCreateRequest>(initialSpecialtyCreateForm);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    dispatch(specialtyCreateRequest({
      staffId: Number(form.staffId),
      specialtyId: Number(form.specialtyId),
      medicalId: Number(form.specialtyId),
      assignedAt: form.assignedAt.trim(),
      primaryYn: form.primaryYn.trim(),
      rmk: form.rmk.trim(),
    }));
  };

  useEffect(() => {
    if (createSuccess) {
      alert("스페셜티 등록이 완료되었습니다.");
      dispatch(resetSpecialtyState());
      router.push("/staff/doctor/specialty/list");
    }
  }, [createSuccess, dispatch, router]);

  return (
    <Paper sx={{ p: 4, maxWidth: 900, mx: "auto", mt: 4 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>스페셜티 등록</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        스페셜티 화면은 doctor + medical 이 합쳐진 배정 결과 기준으로 수정했습니다.
      </Typography>
      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={2.5}>
          <TextField label="직원 ID *" name="staffId" value={form.staffId} onChange={handleChange} fullWidth required />
          <TextField label="메지컬 ID *" name="specialtyId" value={form.specialtyId} onChange={handleChange} fullWidth required />
          <TextField label="배정일" name="assignedAt" value={form.assignedAt} onChange={handleChange} fullWidth placeholder="YYYY-MM-DD" />
          <TextField select label="대표 여부" name="primaryYn" value={form.primaryYn} onChange={handleChange} fullWidth>
            <MenuItem value="Y">Y</MenuItem>
            <MenuItem value="N">N</MenuItem>
          </TextField>
          <TextField label="비고" name="rmk" value={form.rmk} onChange={handleChange} fullWidth multiline minRows={3} />
          <Stack direction="row" spacing={1.5} justifyContent="flex-end">
            <Button variant="outlined" onClick={() => router.push("/staff/doctor/specialty/list")}>취소</Button>
            <Button type="submit" variant="contained" disabled={loading}>{loading ? "등록 중..." : "등록"}</Button>
          </Stack>
          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      </Box>
    </Paper>
  );
};

export default SpecialtyCreate;
