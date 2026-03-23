"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";

import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";

import Script from "next/script";  //{/* 우편번호 📌📌📌📌📌*/}

import {Alert,Box,Button,MenuItem,Paper,Stack,TextField,Typography,
} from "@mui/material";

import type { RootState } from "@/store/rootReducer";
import {
  createStaffRequest,
  resetSuccessEnd,

} from "@/features/staff/Basiclnfo/BasiclnfoSlict";
import {
  initialstaffCreateForm,
  type staffCreateRequest,
} from "@/features/staff/Basiclnfo/BasiclnfoType";

import { 
  formatPhoneKR, 
  sanitizeBirthDate, 
  sanitizeGenderCode
} from "@/components/staff/BasiclnfoDashboard/BasiclnfoUtils";


const BasicInfoCreate = () => {
  const dispatch = useDispatch();
  const router = useRouter();
    //{/* 우편번호 📌📌📌📌📌*/}
  const address = useRef<HTMLInputElement | null>(null); //useRef 값을 React 내부에서 값 기억 (DOM 참조용 / 임시 저장용) 재랜더링 안함

  const { createSuccess, loading, error } = useSelector((state: RootState) => state.staff);

  const [form, setForm] = useState<staffCreateRequest>(initialstaffCreateForm);



  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();


    dispatch(createStaffRequest({
      staffId: form.staffId.trim(),
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
    }));};


  // ✅ 유틸 폼
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
  const { name, value } = event.target;

  // ✅ 생년월일: 주민번호 앞 6자리(YYMMDD)만 허용
  if (name === "birthDate") {
    setForm((prev) => ({ ...prev, birthDate: sanitizeBirthDate(value), }));
    return;
  }

  // ✅ 성별코드: 주민번호 뒷자리 첫 숫자 1자리만 허용
  if (name === "genderCode") {
    setForm((prev) => ({...prev, genderCode: sanitizeGenderCode(value),}));
    return;
  }

   // ✅ 전화 자동포맷
  if (name === "phone") {
  setForm((prev) => ({...prev, phone: formatPhoneKR(value) }));
  return;
  }

  setForm((prev) => ({ ...prev, [name]: value }));
};

  //성공시 이동
  useEffect(() => {
  if (!createSuccess) return;

  router.replace("/staff/Basiclnfo/list");
  dispatch(resetSuccessEnd());
  }, [createSuccess, dispatch, router]);





  {/* 우편번호 📌📌📌📌📌*/}
  // ✅ 다음 우편번호 열기 
  const openPostcode = () => {
  // 스크립트가 아직 로드 안 됐으면 예외처리
  const daum = (window as any).daum;if (!daum?.Postcode) 
    {alert("주소 검색 모듈을 불러오는 중입니다.");
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
 {/* 우편번호 주소모듈 📌📌📌📌📌*/}
<Script
  src="https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
  strategy="afterInteractive"/>



      <Box sx={{ maxWidth: 820, mx: "auto", px: 2, py: 2 }}>
      <Paper sx={{ p: 3, borderRadius: 3, border: "1px solid #dbe5f5" }}>

        <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>
          직원 공통 정보 등록
        </Typography>


              <Box component="form" onSubmit={handleSubmit}>


              <Stack spacing={2}>
              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <TextField label="직원번호" name="staffId" 
              value={form.staffId} onChange={handleChange} fullWidth required />


              <TextField label="부서 ID" name="deptId" 
              value={form.deptId} onChange={handleChange} fullWidth required />
              </Stack>

            
              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <TextField label="이름" name="name" 
              value={form.name} onChange={handleChange} fullWidth required />


              <TextField label="연락처" name="phone" value={form.phone} onChange={handleChange} fullWidth />
              </Stack>


              <TextField label="이메일" name="email" value={form.email} onChange={handleChange} fullWidth />
            
            
              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            {/* ✅ 주민형식 기준으로 라벨/placeholder 변경 */}
              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
  <TextField
    label="생년월일(주민 앞 6자리)"
    name="birthDate"
    value={form.birthDate}
    onChange={handleChange}
    fullWidth
    placeholder="예: 900101"
    inputProps={{ maxLength: 6, inputMode: "numeric" }}
    autoComplete="off"
  />

  <TextField
    label="성별코드(1자리)"
    name="genderCode"
    value={form.genderCode}
    onChange={handleChange}
    fullWidth
    placeholder="예: 1"
    inputProps={{ maxLength: 1, inputMode: "numeric" }}
    autoComplete="off"

helperText={
  <>
    <p style={{ margin: 0 }}>2000년생 미만 1[남] 2[여]</p>
    <p style={{ margin: 0 }}>2000년생 이상 3[남] 4[여]</p>
  </>
}
  />
</Stack>


            </Stack>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                    <TextField select label="상태" name="status" value={form.status} onChange={handleChange} fullWidth>
                            <MenuItem value="ACTIVE">ACTIVE</MenuItem>
                            <MenuItem value="INACTIVE">INACTIVE</MenuItem>
                    </TextField>
            </Stack>



            {/* 우편번호 📌📌📌📌📌*/}
            <div>
            <TextField label="우편번호" name="zipCode" value={form.zipCode ?? ""} 
            fullWidth
            slotProps={{input: { readOnly: true}}} />
            <Button
            type="button"
            variant="contained"
            onClick={openPostcode}>
            🔍 주소 검색
            </Button>
            </div>

            <TextField 
            label="주소1" name="address1" value={form.address1}  fullWidth
            slotProps={{input: { readOnly: true}}}  />

            <TextField 
            inputRef={address}
            label="주소2" name="address2" value={form.address2} onChange={handleChange} fullWidth />
            {/* 우편번호 📌📌📌📌📌*/}






            <Stack direction="row" spacing={1} justifyContent="flex-end">

              <Button variant="outlined" onClick={() => router.push("/staff/Basiclnfo/list")}>목록</Button>

              <Button type="submit" variant="contained" disabled={loading}>
                {loading ? "저장 중..." : "등록"}
              </Button>
              
              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            </Stack>
          </Stack>
        </Box>
      </Paper>
    </Box>
        </>
  );
};

export default BasicInfoCreate;

//머지