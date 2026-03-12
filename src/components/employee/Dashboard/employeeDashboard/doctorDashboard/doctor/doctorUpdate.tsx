"use client";

import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/store/rootReducer";

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


import {
  DetailDoctorRequest,
  updateDoctorRequest,
  resetSuccessEnd,
} from "@/features/employee/doctor/doctorSlice";
import { DoctorIdNumber, DoctorUpdateRequest, initialDoctorUpdateForm } from "@/features/employee/doctor/doctortypes";

const DoctorUpdate = ({ doctorId }: DoctorIdNumber) => {
  const dispatch = useDispatch();
  const router = useRouter();

  // ✅ doctor slice 기준
  const { doctorDetail, loading, updateSuccess, error } = useSelector((state: RootState) => state.doctor);
  const [form, setForm] = useState<DoctorUpdateRequest>(initialDoctorUpdateForm);



  
  useEffect(() => {
    if (doctorId) {
      dispatch(DetailDoctorRequest({ doctorId }));}
  }, [dispatch, doctorId]);



  // 2) 상세 조회된 값으로 수정 폼 채우기
  useEffect(() => {
    if (!doctorDetail) return;

    setForm({

      licenseNo: doctorDetail.licenseNo ?? "",
      specialtyId: doctorDetail.specialtyId ?? "",
      doctorFileUrl : doctorDetail.doctorFileUrl ?? "",
      profileSummary: doctorDetail.profileSummary ?? "",
      education: doctorDetail.education ?? "",
      careerDetail: doctorDetail.careerDetail ?? "",
    });
  }, [doctorDetail]);



  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // 4) 수정 제출
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    const doctorReq:DoctorUpdateRequest = {
      
        licenseNo: (form.licenseNo ?? "").trim(),
        specialtyId: (form.specialtyId ?? "").trim(),
        doctorFileUrl : (form.doctorFileUrl ?? "").trim(),
        profileSummary: (form.profileSummary ?? "").trim(),
        education: (form.education ?? "").trim(),
        careerDetail: (form.careerDetail ?? "").trim(),
    };
    dispatch(updateDoctorRequest( { doctorId,doctorReq}));};






  // 5) 수정 성공 후 이동
  useEffect(() => {
    if (!updateSuccess) return;

    router.replace("/staff/dashboard/doctor/SignUp/list");
    dispatch(resetSuccessEnd());

    
  }, [updateSuccess, router, dispatch]);







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
              의사 상세정보 수정
            </Typography>
            <Typography color="text.secondary" fontWeight={600}>
              기존 의사 정보를 수정합니다.
            </Typography>
          </Stack>

          {error && <Alert severity="error">{error}</Alert>}

          <Divider />

          <Stack spacing={2}>
            <TextField
              label="면허 번호 *"
              name="licenseNo"
              value={form.licenseNo ?? ""}
              onChange={handleChange}
              fullWidth
              required
              sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }}
            />

            <TextField
              label="진료과 코드 *"
              name="specialtyId"
              value={form.specialtyId ?? ""}
              onChange={handleChange}
              placeholder="예: IM / SUR / PED"
              fullWidth
              required
              sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }}
            />

            <TextField
              label="한줄 소개"
              name="profileSummary"
              value={form.profileSummary ?? ""}
              onChange={handleChange}
              placeholder="예: 소화기내과 전문의"
              fullWidth
              sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }}
            />

            <TextField
              label="학력"
              name="education"
              value={form.education ?? ""}
              onChange={handleChange}
              placeholder="예: OO대학교 의과대학 졸업"
              fullWidth
              sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }}
            />

            <TextField
              label="경력 상세"
              name="careerDetail"
              value={form.careerDetail ?? ""}
              onChange={handleChange}
              placeholder="예: OO병원 내과 전공의 수료"
              fullWidth
              multiline
              minRows={4}
              sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }}
            />

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
              <Button
                variant="outlined"
                onClick={() => router.replace("/staff/dashboard/doctor/SignUp/list")}
                disabled={loading}
                fullWidth
              >
                뒤로가기
              </Button>

              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{ bgcolor: "#2b5aa9" }}
                fullWidth
              >
                {loading ? <CircularProgress size={18} /> : "상세정보 수정 완료"}
              </Button>
            </Stack>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
};

export default DoctorUpdate;