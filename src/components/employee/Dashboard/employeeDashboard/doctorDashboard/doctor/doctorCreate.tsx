"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { DoctorCreateRequest, initialDoctorCreateForm } from "@/features/employee/doctor/doctortypes";


import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/rootReducer";
import { createDoctorRequest, resetSuccessEnd } from "@/features/employee/doctor/doctorSlice";
import { Alert, Box, Button, CircularProgress, Divider, Paper, Stack, TextField, Typography } from "@mui/material";



const DoctorCreate = ()=> {
  const dispatch = useDispatch();  //훅이 없어서 일단 레이아웃쪽에 그냥 연결
  const router = useRouter();

  const { loading, error,createSuccess} = useSelector((state:RootState) => state.doctor);

  const [form, setForm] = useState<DoctorCreateRequest>(initialDoctorCreateForm);





//생성 슈미트
const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
  event.preventDefault();

const doctorReq : DoctorCreateRequest = {

  licenseNo: (form.licenseNo ?? "").trim(),            //의사 면허
  specialtyId: (form.specialtyId ?? "").trim(),        //전문과목
  doctorFileUrl : (form.doctorFileUrl?? "").trim(),    //널 (나중에 추가)
  profileSummary : (form.profileSummary ?? "").trim(), //한줄소개
  education : (form.education ?? "").trim(),           //학력
  careerDetail : (form.careerDetail ?? "").trim(),     //경력상세
  
};
dispatch(createDoctorRequest(doctorReq));
}


const handleChange = (event: ChangeEvent<any>) => {
  const { name, value } = event.target;
  setForm((prev) => ({ ...prev, [name]: value }));
};






// ✅ 생성 성공하면 바로 목록으로 이동
useEffect(() => {
    if (!createSuccess) return; //성공이 아니면 리턴
    
  router.push("/staff/dashboard/doctor/SignUp/list");
       dispatch(resetSuccessEnd())// ✅ 성공 “소비” 후 바로 끄기
  
}, [createSuccess, router]);





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
                의사 상세정보 가입
              </Typography>
              <Typography color="text.secondary" fontWeight={600}>
                로그인은 되어 있지만 프로필이 없는 경우 1회만 작성합니다.
              </Typography>
            </Stack>

            {error && <Alert severity="error">{error}</Alert>}
            {/* {successMsg && <Alert severity="success">{successMsg}</Alert>} */}

              <Divider />

            <Stack spacing={2}>
              <TextField
                label="의사 면허 *"
                name="licenseNo"
                value={form.licenseNo ?? ""}
                onChange={handleChange}
                fullWidth
                required
                sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }}

              />

              {/* ✅ '사번'은 네 타입 기준으로 unitId로 받는 게 자연스러움 */}
              <TextField
                label="전문 과목"
                name="specialtyId"
                value={form.specialtyId ?? ""}
                onChange={handleChange}
                fullWidth
                required
                sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }}
              />

              <TextField
                label="한줄 소개"
                name="profileSummary"
                value={form.profileSummary ?? ""}
                onChange={handleChange}
                placeholder='예: DAY / NIGHT / 3교대'
                fullWidth
                required
                sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }}
              />

              <TextField
                label="학 력"
                name="education"
                value={form.education ?? ""}
                onChange={handleChange}
                placeholder="예: ICU / ER / Ward"
                fullWidth
                required
                sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }}
              />

              {/* 선택 입력들 */}
              <TextField
                label="경력 상세"
                name="careerDetail"
                value={form.careerDetail ?? ""}
                onChange={handleChange}
                placeholder="예: 정규직/계약직"
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
                  뒤로가기
                </Button>

                <Button
                  type="submit"
                  variant="contained"
            
                  sx={{ bgcolor: "#2b5aa9" }}
                  fullWidth
                >
                  {loading ? <CircularProgress size={18} /> : "상세정보 가입 완료"}
                </Button>
              </Stack>
            </Stack>
          </Stack>
        </Paper>
      </Box>
    // </MainLayout>
  );
}

export default DoctorCreate;
