"use client";

import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/rootReducer";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { initialNurseCreateForm, NurseCreateRequest } from "@/features/employee/nurse/nurseTypes";
import { createNurseRequest, resetSuccessEnd } from "@/features/employee/nurse/nurseSlice";

const NurseCreatePage = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const { createSuccess, loading, error } = useSelector((state: RootState) => state.nurse);
  const [form, setForm] = useState<NurseCreateRequest>(initialNurseCreateForm);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    const request: NurseCreateRequest = {
      unitId: (form.unitId ?? "").trim(),
      shiftType: (form.shiftType ?? "").trim(),
      employmentType: (form.employmentType ?? "").trim(),
      education: (form.education ?? "").trim(),
      careerDetail: (form.careerDetail ?? "").trim(),
    };

    dispatch(createNurseRequest(request));
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    if (!createSuccess) return;

    router.replace("/staff/dashboard/nurse/SignUp/list");
    dispatch(resetSuccessEnd());
  }, [createSuccess, router, dispatch]);

  return (
    <Box sx={{ maxWidth: 780, mx: "auto", px: { xs: 2, md: 0 } }}>
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
        <Stack spacing={2.5} component="form" onSubmit={handleSubmit}>
          <Stack spacing={0.5}>
            <Typography variant="h6" fontWeight={800}>
              간호사 상세정보 추가
            </Typography>
            <Typography color="text.secondary" fontWeight={600}>
              간호사 신규 등록 정보를 입력합니다.
            </Typography>
          </Stack>

          {error && <Alert severity="error">{error}</Alert>}

          <Divider />

          <Stack spacing={2}>
            <TextField
              label="간호사 사번 *"
              name="unitId"
              value={form.unitId ?? ""}
              onChange={handleChange}
              fullWidth
              required
              sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }}
            />

            <TextField
              label="근무 형태 *"
              name="shiftType"
              value={form.shiftType ?? ""}
              onChange={handleChange}
              fullWidth
              required
              sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }}
            />

            <TextField
              label="고용 형태"
              name="employmentType"
              value={form.employmentType ?? ""}
              onChange={handleChange}
              fullWidth
              sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }}
            />

            <TextField
              label="학력"
              name="education"
              value={form.education ?? ""}
              onChange={handleChange}
              fullWidth
              sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }}
            />

            <TextField
              label="경력 상세"
              name="careerDetail"
              value={form.careerDetail ?? ""}
              onChange={handleChange}
              fullWidth
              sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }}
            />

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
              <Button
                variant="outlined"
                onClick={() => router.replace("/staff/dashboard/nurse/SignUp/list")}
                disabled={loading}
                fullWidth
              >
                목록으로
              </Button>

              <Button type="submit" variant="contained" sx={{ bgcolor: "#2b5aa9" }} fullWidth>
                {loading ? <CircularProgress size={18} /> : "등록 완료"}
              </Button>
            </Stack>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
};

export default NurseCreatePage;
