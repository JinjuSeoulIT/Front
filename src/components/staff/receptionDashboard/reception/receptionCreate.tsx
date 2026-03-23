"use client";

import { type ChangeEvent, type FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { Alert, Box, Button, CircularProgress, Divider, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import { DetailStaffApi } from "@/lib/staff/employeeBasiclnfoAPI";
import type { RootState } from "@/store/rootReducer";
import {
  createReceptionRequest,
  resetReceptionSuccessEnd,
} from "@/features/staff/reception/receptionSlice";
import {
  initialReceptionCreateForm,
  type ReceptionCreateRequest,
  type ReceptionIdNumber,
} from "@/features/staff/reception/receptionTypes";

const ReceptionCreate = ({ staffId }: ReceptionIdNumber) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { loading, error, createSuccess } = useSelector((state: RootState) => state.reception);
  const [form, setForm] = useState<ReceptionCreateRequest>(initialReceptionCreateForm);

  const [staffInfo, setStaffInfo] = useState<{ staffId: string; deptId: string; name: string }>({
    staffId: "",
    deptId: "",
    name: "",
  });

  useEffect(() => {
    if (!staffId) return;
    const loadStaff = async () => {
      const response = await DetailStaffApi(staffId);
      const next = {
        staffId: response.data.staffId ?? staffId,
        deptId: response.data.deptId ?? "",
        name: response.data.name ?? "",
      };
      setStaffInfo(next);
      setForm((prev) => ({ ...prev, staffId: next.staffId, receptionType: "RECEPTION" }));
    };
    void loadStaff();
  }, [staffId]);

  useEffect(() => {
    if (!createSuccess) return;
    router.replace("/staff/reception/list");
    dispatch(resetReceptionSuccessEnd());
  }, [createSuccess, dispatch, router]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    dispatch(createReceptionRequest({
      staffId: form.staffId.trim(),
      jobTypeCd: form.jobTypeCd.trim(),
      deskNo: form.deskNo.trim(),
      shiftType: form.shiftType.trim(),
      startDate: form.startDate.trim(),
      windowArea: form.windowArea.trim(),
      multiTask: form.multiTask.trim() || "불가",
      rmk: form.rmk.trim(),
      receptionType: form.receptionType.trim() || "RECEPTION",
      extNo: form.extNo.trim(),
    }));
  };

  return (
    <Box sx={{ maxWidth: 780, mx: "auto", px: { xs: 2, md: 0 } }}>
      <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, border: "1px solid #dbe5f5", bgcolor: "white", boxShadow: "0 14px 28px rgba(23, 52, 97, 0.15)" }}>
        <Stack spacing={2.5} component="form" onSubmit={handleSubmit}>
          <Stack spacing={0.5}>
            <Typography variant="h6" fontWeight={800}>원무 상세정보 추가</Typography>
          </Stack>
          <Divider />

          <Stack spacing={2}>
            <TextField label="부서" value={staffInfo.deptId} fullWidth InputProps={{ readOnly: true }} sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }} />
            <TextField label="직원번호(staffId)" value={staffInfo.staffId} fullWidth InputProps={{ readOnly: true }} sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }} />
            <TextField label="이름" value={staffInfo.name} fullWidth InputProps={{ readOnly: true }} sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }} />
            <TextField label="직군 타입" name="receptionType" value={form.receptionType} fullWidth InputProps={{ readOnly: true }} sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }} />

            <TextField label="업무 구분 *" name="jobTypeCd" value={form.jobTypeCd} onChange={handleChange} fullWidth required sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }} />
            <TextField label="창구 번호 *" name="deskNo" value={form.deskNo} onChange={handleChange} fullWidth required sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }} />

            <TextField
              label="업무 시작일"
              name="startDate"
              type="date"
              value={form.startDate}
              onChange={handleChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
              sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }}
            />

            <TextField
              select
              label="근무 형태 *"
              name="shiftType"
              value={form.shiftType}
              onChange={handleChange}
              fullWidth
              sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }}
            >
              <MenuItem value="DAY">주간</MenuItem>
              <MenuItem value="NIGHT">야간</MenuItem>
              <MenuItem value="ROTATION">교대</MenuItem>
            </TextField>

            <TextField label="창구 구역" name="windowArea" value={form.windowArea} onChange={handleChange} fullWidth sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }} />
            <TextField label="사내번호" name="extNo" value={form.extNo} onChange={handleChange} fullWidth sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }} />
            <TextField select label="파트타임/멀티태스크" name="multiTask" value={form.multiTask} onChange={handleChange} fullWidth sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }}>
              <MenuItem value="가능">가능</MenuItem>
              <MenuItem value="불가">불가</MenuItem>
            </TextField>
            <TextField label="비고" name="rmk" value={form.rmk} onChange={handleChange} fullWidth multiline minRows={3} sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }} />

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
              <Button variant="outlined" onClick={() => router.replace("/staff/reception/list")} disabled={loading} fullWidth>목록으로</Button>
              <Button type="submit" variant="contained" disabled={loading || !form.staffId} sx={{ bgcolor: "#2b5aa9" }} fullWidth>
                {loading ? <CircularProgress size={18} /> : "등록중"}
              </Button>
            </Stack>

            {error && <Alert severity="error">{error}</Alert>}
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
};

export default ReceptionCreate;
