"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import type { RootState } from "@/store/rootReducer";
import {
  DetailStaffRequest,

  updateStaffRequest,
} from "@/features/employee/Staff/BasiclnfoSlict";
import {
  initialstaffUpdateForm,
  staffIdNumber,
  staffResponse,
  type staffUpdateRequest,
} from "@/features/employee/Staff/BasiclnfoType";
import Script from "next/script";
import { resetSuccessEnd } from "@/features/employee/doctor/doctorSlice";



  const BasicInfoUpdate = ({ staffId }:staffIdNumber) => {

  const dispatch = useDispatch();

  const router = useRouter();


  //{/* 우편번호 📌📌📌📌📌*/}
  const addr2Ref = useRef<HTMLInputElement | null>(null);



  const { StaffDetail, updateSuccess, loading, error } = useSelector((state: RootState) => state.staff);
  const [form, setForm] = useState<staffUpdateRequest>(initialstaffUpdateForm);




    useEffect(() => {
    if (staffId) {
      dispatch(DetailStaffRequest(staffId));
    }
    }, [dispatch, staffId]);


    useEffect(() => {
    if (!StaffDetail) return;
    setForm({
      deptId: StaffDetail.deptId ?? "",
      name: StaffDetail.name ?? "",
      phone: StaffDetail.phone ?? "",
      email: StaffDetail.email ?? "",
      birthDate: StaffDetail.birthDate ?? "",
      genderCode: StaffDetail.genderCode ?? "",
      zipCode: StaffDetail.zipCode ?? "",
      address1: StaffDetail.address1 ?? "",
      address2: StaffDetail.address2 ?? "",
      status: StaffDetail.status ?? "ACTIVE",
    });
  }, [StaffDetail]);




  
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    dispatch(updateStaffRequest({
      staffId,
      staffReq: {
        deptId: form.deptId.trim(),
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        birthDate: form.birthDate.trim(),
        genderCode: form.genderCode.trim(),
        zipCode: form.zipCode.trim(),
        address1: form.address1.trim(),
        address2: form.address2.trim(),
        status: form.status.trim() || "ACTIVE",
      },
    }));
  };



  //{/* 타입분기점 🧩🧩🧩*/}
  const getJobType = (staff: staffResponse) => {
    if (staff.nurseType) return "NURSE";
    if (staff.doctorType) return "DOCTOR";
    return null;
  };


const handleDetail = (staff: staffResponse) => {
  const jobType = getJobType(staff);


  //의사 디테일로
  if (jobType === "DOCTOR") {
    const path = `/staff/employee/doctor/SignUp/${staff.staffId}/detail`;
    console.log("doctor detail path =", path);
    router.push(path);
    return;
  }

  //간호사 디테일로
  if (jobType === "NURSE") {
    const path = `/staff/employee/nurse/SignUp/${staff.staffId}/detail`;
    console.log("nurse detail path =", path);
    router.push(path);
    return;
  }

  //공통 디테일로
  const path = `/staff/employee/Basiclnfo/${staff.staffId}/detail`;
  console.log("basic detail path =", path);
  router.push(path);
};
//{/* 타입분기점 🧩🧩🧩*/}


  useEffect(() => {
    if (!updateSuccess) return;
    if (!StaffDetail) return;

    handleDetail(StaffDetail);
    dispatch(resetSuccessEnd());
  }, [dispatch, router, staffId, updateSuccess]);




  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };
















{/* 우편번호 📌📌📌📌📌*/}
// ✅ 다음 우편번호 열기 
const openPostcode = () => {
  // 스크립트가 아직 로드 안 됐으면 방어
  if (typeof window === "undefined") return;
  const daum = (window as any).daum;
  if (!daum?.Postcode) {
    alert("주소 검색 모듈을 불러오는 중입니다. 잠시 후 다시 시도하세요 🙏");
    return;
  }
  new daum.Postcode({
    oncomplete: (data: any) => {
      const address =
        data.roadAddress || data.jibunAddress || data.address || "";

      setForm((prev) => ({
        ...prev,
        zipCode: data.zonecode ?? "",
        address1: address,
        // address2는 사용자가 입력
      }));

      // ✅ 상세주소로 포커스 이동
      setTimeout(() => addr2Ref.current?.focus(), 0);
    },
  }).open();
};
{/* 우편번호 📌📌📌📌📌*/}















  return (

     <>
<Script
  src="https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
  strategy="afterInteractive"
/>
{/* 우편번호 📌📌📌📌📌*/}






    <Box sx={{ maxWidth: 820, mx: "auto", px: 2, py: 2 }}>
      <Paper sx={{ p: 3, borderRadius: 3, border: "1px solid #dbe5f5" }}>
        <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>
          직원 공통 정보 수정
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <TextField label="부서 ID" 
              name="deptId" value={form.deptId} 
              onChange={handleChange} fullWidth required />

              <TextField select label="상태" 
              name="status" value={form.status} 
              onChange={handleChange} fullWidth>
                <MenuItem value="ACTIVE">ACTIVE</MenuItem>
                <MenuItem value="INACTIVE">INACTIVE</MenuItem>
              </TextField>
            </Stack>

            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <TextField label="이름" name="realName" 
              value={form.name} onChange={handleChange} 
              fullWidth required />
              <TextField label="이름" 
              name="name" value={form.name} 
              onChange={handleChange} fullWidth required />

              <TextField label="연락처" 
              name="phone" value={form.phone} 
            onChange={handleChange} fullWidth />
            </Stack>

            <TextField label="이메일" 
            name="email" value={form.email} 
            onChange={handleChange} fullWidth />

            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>

              <TextField label="생년월일" 
              name="birthDate" value={form.birthDate} 
              onChange={handleChange} fullWidth placeholder="YYYY-MM-DD" />

              <TextField label="성별코드" 
              name="genderCode" value={form.genderCode} 
              onChange={handleChange} fullWidth />
              </Stack>
            
            


      
            
              <Box sx={{ maxWidth: 820, mx: "auto", px: 1, py: 1 }}></Box>
            </Stack>
            <Stack direction={{ xs: "column" }} 
            spacing={1}>
            {/* 우편번호 📌📌📌📌📌*/}
            <div>

            <TextField label="우편번호" name="zipCode" value={form.zipCode ?? ""} 
            fullWidth
            slotProps={{input: { readOnly: true}}} />
          
            </div>

            <TextField 
            label="주소1" name="address1" value={form.address1}  fullWidth
            slotProps={{input: { readOnly: true}}}  />

            <TextField 
            inputRef={addr2Ref}
            label="주소2" name="address2" value={form.address2} onChange={handleChange} fullWidth />

                <Button
            type="button"
            variant="contained"
            onClick={openPostcode}>
            🔍 주소 검색
            </Button>

            {/* 우편번호 📌📌📌📌📌*/}
            


            
            <Stack direction="row" //열 레이아웃용  //"column" 세로
            spacing={1}            //사이 폭
            justifyContent="flex-end">  
            
              <Button 
              variant="outlined" 
              onClick={() => router.replace("/staff/employee/Basiclnfo/list")} 
              disabled={loading} 
              // sx={{ width: 120 }} //버튼 넓이
              >뒤로  
              </Button>


              {/* 타입분기점 🧩🧩🧩*/}
              <Button
                variant="outlined"
                onClick={() => StaffDetail && handleDetail(StaffDetail)}>
                수정
              </Button>
              {/* 타입분기점 🧩🧩🧩*/}
            </Stack>

          </Stack>
        </Box>
      </Paper>
    </Box>
      </>
  );
};






export default BasicInfoUpdate;
