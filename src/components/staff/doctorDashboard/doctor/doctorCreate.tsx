"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { Alert, Box, Button, CircularProgress, Divider, Paper, Stack, TextField, Typography } from "@mui/material";


import { DoctorCreateRequest, DoctorIdNumber, initialDoctorCreateForm } from "@/features/staff/doctor/doctortypes";
import { createDoctorRequest, resetSuccessEnd } from "@/features/staff/doctor/doctorSlice";
import { RootState } from "@/store/rootReducer";
import { DetailStaffApi } from "@/lib/staff/employeeBasiclnfoAPI";



const DoctorCreate = ({ staffId }: DoctorIdNumber) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { loading, error, createSuccess } = useSelector((state: RootState) => state.doctor);

  const [form, setForm] = useState<DoctorCreateRequest>(initialDoctorCreateForm);


  //확인조회용
  const [staffInfo, setStaffInfo] = useState<{staffId: string; deptId: string; name: string;}>
                                            ({ staffId: "", deptId: "", name: "" });





// 여기서부터 staffId [PK] 조회후 생성용 (비동기상태에서 백엔드에서 받아오는것만 하면 됨)
async function fetchStaffInfo(staffId: string) {
  const response = await DetailStaffApi(staffId); //부모 StaffApi 

  return {
    staffId: response.data.staffId ?? staffId,
    deptId: response.data.deptId ?? "",
    name: response.data.name ?? "",
  };
}


//비동기에서 부모값 staffid 백엔드에서 받아오면 리랜더링
useEffect(() => {
  if (!staffId) return;
    const loadStaff = async () => {

    const staffInfo = await fetchStaffInfo(staffId);
    setStaffInfo(staffInfo);
    
    setForm((prev) => ({   //등록 활성화이벤트
  ...prev,
  staffId: staffInfo.staffId,
}));

  };
  loadStaff();}, 
  [staffId]);








    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const doctorReq: DoctorCreateRequest = {
      staffId: (form.staffId ?? "").trim(),
      licenseNo: (form.licenseNo ?? "").trim(),
      specialtyId: (form.specialtyId ?? "").trim(),
      doctorType: "DOCTOR", //백엔드에도 타입적용중
      doctorFileUrl: (form.doctorFileUrl ?? "").trim(),
      extNo: (form.extNo ?? "").trim(),
      profileSummary: (form.profileSummary ?? "").trim(),
      education: (form.education ?? "").trim(),
      careerDetail: (form.careerDetail ?? "").trim(),
    };

    console.log(doctorReq);

    dispatch(createDoctorRequest(doctorReq));
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  //성공하면
  useEffect(() => {
    if (!createSuccess) return;
    router.replace("/staff/doctor/list");
    dispatch(resetSuccessEnd());
  }, [createSuccess, router, dispatch]);













  return (
    <Box sx={{ maxWidth: 780, mx: "auto", px: { xs: 2, md: 0 } }}>

      <Paper elevation={0} 
      sx={{ p: { xs: 3, md: 4 }, 
      borderRadius: 3, 
      border: "1px solid #dbe5f5", 
      bgcolor: "white", 
      boxShadow: "0 14px 28px rgba(23, 52, 97, 0.15)" }}>


        <Stack spacing={2.5} 
        component="form" 
        onSubmit={handleSubmit}>


          <Stack spacing={0.5}>

            <Typography variant="h6" fontWeight={800}>의사 상세정보 가입</Typography>

          </Stack>

          {/* 구분선 */}
          <Divider /> 

            {/* 의사 기본정보 확인 */}
          <Stack spacing={2}>
            <TextField label="부서 ID" 
            value={staffInfo.deptId} 
            fullWidth 
            InputProps={{ readOnly: true }} 
            helperText="공통 직원 기본정보에서 가져온 표시용 값입니다." 
            sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }} />

            <TextField 
            label="직원번호(staffId) *" 
            value={staffInfo.staffId} 
            fullWidth required InputProps={{ readOnly: true }} 
            helperText="공통 직원 기본정보의 STAFF_ID(FK) 입니다." 
            sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }} />


            <TextField label="이름" 
            value={staffInfo.name} 
            fullWidth InputProps={{ readOnly: true }} 
            helperText="공통 직원 기본정보에서 가져온 표시용 값입니다." 
            sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }} />



            {/* 의사 상세정보 가입 */}
            <TextField label="의사 면허 *" 
            name="licenseNo" value={form.licenseNo ?? ""} 
            onChange={handleChange} fullWidth required 
            sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }} />


            <TextField label="전문 과목 *" 
            name="specialtyId" value={form.specialtyId ?? ""} 
            onChange={handleChange} fullWidth required 
            sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }} />

            <TextField label="사내번호"
            name="extNo" value={form.extNo ?? ""}
            onChange={handleChange} fullWidth
            sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }} />


            <TextField label="한줄 소개" 
            name="profileSummary" value={form.profileSummary ?? ""} 
            onChange={handleChange} fullWidth 
            sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }} />


            <TextField label="학력" 
            name="education" value={form.education ?? ""} 
            onChange={handleChange} fullWidth 
            sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }} />


            <TextField label="경력 상세" 
            name="careerDetail" value={form.careerDetail ?? ""} 
            onChange={handleChange} fullWidth 
            sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }} />


            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
            <Button variant="outlined" 
            onClick={() => router.replace("/staff/doctor/list")} 
            disabled={loading} fullWidth>뒤로가기
              </Button>


          <Button
          type="submit"
          variant="contained"
          disabled={loading || !form.staffId}
          sx={{ bgcolor: "#2b5aa9" }}
          fullWidth>  
          {/*CircularProgress 로딩중 표시하는 스피너*/}
          {loading ? <CircularProgress size={18} /> : "등록중"} 
          </Button>
          
          {createSuccess && <Alert severity="success">등록이 완료되었습니다.</Alert>}

          {error && <Alert severity="error">{error}</Alert>}
            </Stack>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
};

export default DoctorCreate;
