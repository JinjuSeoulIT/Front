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
} from "@/features/staff/Basiclnfo/BasiclnfoSlict";
import {
  initialstaffUpdateForm,
  staffIdNumber,
  staffResponse,
  type staffUpdateRequest,
} from "@/features/staff/Basiclnfo/BasiclnfoType";
import Script from "next/script";
import { resetSuccessEnd } from "@/features/staff/doctor/doctorSlice";



  const BasicInfoUpdate = ({ staffId }:staffIdNumber) => {

  const dispatch = useDispatch();

  const router = useRouter();


  //{/* 우편번호 📌📌📌📌📌*/}
  const address = useRef<HTMLInputElement | null>(null);

  const { StaffDetail, updateSuccess, loading, error } = useSelector((state: RootState) => state.staff);
  const [form, setForm] = useState<staffUpdateRequest>(initialstaffUpdateForm);



{/*StaffDetail로 form 세팅은 “최초 1번만”*/}
const loadedRef = useRef(false);
{/*StaffDetail로 form 세팅은 “최초 1번만”*/}

    useEffect(() => {
    if (staffId) {
      dispatch(DetailStaffRequest(staffId));
      dispatch(resetSuccessEnd());
    }
    }, [dispatch, staffId]);


    useEffect(() => {
    if (!StaffDetail) return;
    if (loadedRef.current) return;

    setForm({
      deptId:    StaffDetail.deptId ?? "",
      name:      StaffDetail.name ?? "",
      phone:     StaffDetail.phone ?? "",
      email:     StaffDetail.email ?? "",
      birthDate: StaffDetail.birthDate ?? "",
      genderCode:StaffDetail.genderCode ?? "",
      zipCode:   StaffDetail.zipCode ?? "",
      address1:  StaffDetail.address1 ?? "",
      address2:  StaffDetail.address2 ?? "",
      status:    StaffDetail.status ?? "ACTIVE",
    });

      //타입분기점
      loadedRef.current = true;

  }, [StaffDetail]);




  //{/* 타입분기점 🧩🧩🧩*/}
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



  //분기점
const handleDetail = (staff: staffResponse) => {

  //의사 디테일로
  if (staff.doctorType) {
    const path = `/staff/doctor/${staff.staffId}/detail`;
    console.log(path);//테스트 콘솔

    router.push(path);
    return;
  }

  //간호사 디테일로
  if (staff.nurseType) {
    const path = `/staff/nurse/${staff.staffId}/detail`;
    console.log(path);//테스트 콘솔

    router.push(path);
    return;
  }

  //공통 디테일로
  const path = `/staff/Basiclnfo/${staff.staffId}/detail`;
  console.log(path);//테스트 콘솔

  router.push(path);
};

//{/* 타입분기점 🧩🧩🧩*/}

  useEffect(() => {
    if (!updateSuccess) return;
    if (!StaffDetail) return;

    handleDetail(StaffDetail);
    dispatch(resetSuccessEnd());
  }, [dispatch,  staffId, updateSuccess ,router]);
// 여기서 푸시랑 라우터 연결후 디테일로 가게 만듬
// 수정 버튼 → handleSubmit → update 요청 → updateSuccess=true → useEffect 실행 → handleDetail() → router.push()

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };











{/* 우편번호 📌📌📌📌📌*/}
// ✅ 다음 우편번호 열기 
const openPostcode = () => {
  // 스크립트가 아직 로드 안 됐으면 방어
  const daum = (window as any).daum;if (!daum?.Postcode) {alert("주소 검색 모듈을 불러오는 중입니다.");
    return;}

    //roadAddress (도로명)   jibunAddress (도로명없거나 상황에 따라 작성)
  new daum.Postcode({ oncomplete: (data: any) => {
  const address =  data.roadAddress || data.jibunAddress || "";

  // ✅ address 사용자가 주소 입력후 덮어씌움
  setForm((prev) => ({
  ...prev,zipCode: data.zonecode ?? "",address1: address,}));


  // ✅ 상세주소로 포커스 이동
  setTimeout(() => address.current?.focus(), 0);
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
            <TextField label="부서 ID" name="deptId" value={form.deptId} onChange={handleChange} fullWidth required />


            <TextField select label="상태"  name="status" value={form.status}  onChange={handleChange} fullWidth>
            <MenuItem value="ACTIVE">   ACTIVE </MenuItem>
            <MenuItem value="INACTIVE">INACTIVE</MenuItem>
            </TextField>
            </Stack>





            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            
            <TextField label="이름" name="name"  value={form.name} onChange={handleChange}   fullWidth required />

            <TextField label="연락처" name="phone" value={form.phone}  onChange={handleChange} fullWidth />

            </Stack>


            <TextField label="이메일" name="email" value={form.email} onChange={handleChange} fullWidth />



            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>

            <TextField label="생년월일" name="birthDate" value={form.birthDate} onChange={handleChange} fullWidth placeholder="YYYY-MM-DD" />

            <TextField label="성별코드" name="genderCode" value={form.genderCode} onChange={handleChange} fullWidth />
            
            </Stack>
            
            

            {/* 우편번호 📌📌📌📌📌*/}
            <Box sx={{ maxWidth: 820, mx: "auto", px: 1, py: 1 }}></Box>
            
            </Stack>
            <Stack direction={{ xs: "column" }}  spacing={1}>


            <TextField label="우편번호" name="zipCode" value={form.zipCode ?? ""} fullWidth
            slotProps={{input: { readOnly: true}}} />

            <Box sx={{ mx: "auto", px: 1, py: 1 }}>
            <Button type="button" variant="contained" onClick={openPostcode} >🔍 주소 검색 </Button>
            </Box>

            <TextField label="주소1" name="address1" value={form.address1}  fullWidth
            slotProps={{input: { readOnly: true}}} />

            <TextField inputRef={address}
            label="주소2" name="address2" value={form.address2} onChange={handleChange} fullWidth />
            {/* 우편번호 📌📌📌📌📌*/}


                                    
            <Stack direction="row" spacing={1}  justifyContent="flex-end">  
            
            <Button variant="outlined" onClick={() => router.replace("/staff/Basiclnfo/list")} disabled={loading}>
            뒤로  
            </Button>

            {/* 타입분기점 🧩🧩🧩 완료후 디테일로 슈미트*/}
            <Button type="submit" variant="contained" disabled={loading}>
            수정
            </Button>
          
            </Stack>
          </Stack>
        </Box>
      </Paper>
    </Box>
      </>
  );
};






export default BasicInfoUpdate;
