"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Script from "next/script";  //{/* 우편번호 📌📌📌📌📌*/}
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
  createStaffRequest,
  resetSuccessEnd,

} from "@/features/employee/Staff/BasiclnfoSlict";
import {
  initialstaffCreateForm,
  type staffCreateRequest,
} from "@/features/employee/Staff/BasiclnfoType";

const BasicInfoCreate = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  //{/* 우편번호 📌📌📌📌📌*/}
  const addr2Ref = useRef<HTMLInputElement | null>(null);

  const { createSuccess, loading, error } = useSelector((state: RootState) => state.staff);

  const [form, setForm] = useState<staffCreateRequest>(initialstaffCreateForm);



  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // ✅ 주민번호 앞 6자리 형식 검증
  if (form.birthDate && !/^\d{6}$/.test(form.birthDate.trim())) {
    alert("생년월일은 주민번호 앞 6자리 형식(YYMMDD)으로 입력해주세요.");
    return;
  }

    // ✅ 성별코드 1자리 검증
  if (form.genderCode && !/^[1-4]$/.test(form.genderCode.trim())) {
    alert("2000년생 이상  3[남].4[여]");
    return;
  }

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
    }));
  };


  // ✅
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
  const { name, value } = event.target;

  // ✅ 생년월일: 주민번호 앞 6자리(YYMMDD)만 허용
  if (name === "birthDate") {
    const onlyNumber = value.replace(/\D/g, "").slice(0, 6);
    setForm((prev) => ({ ...prev, birthDate: onlyNumber }));
    return;
  }

  // ✅ 성별코드: 주민번호 뒷자리 첫 숫자 1자리만 허용
  if (name === "genderCode") {
    const onlyNumber = value.replace(/\D/g, "").slice(0, 1);
    setForm((prev) => ({ ...prev, genderCode: onlyNumber }));
    return;
  }

  // ✅ 연락처도 숫자/하이픈 정도로 정리하고 싶으면 여기서 같이 가능
  if (name === "phone") {
    const onlyPhone = value.replace(/[^\d-]/g, "").slice(0, 13);
    setForm((prev) => ({ ...prev, phone: onlyPhone }));
    return;
  }

  setForm((prev) => ({ ...prev, [name]: value }));
};


//성공시 이동

  useEffect(() => {
    if (!createSuccess) return;

    router.replace("/staff/employee/Basiclnfo/list");
    dispatch(resetSuccessEnd());
  }, [createSuccess, dispatch, router]);











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
          직원 공통 정보 등록
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

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
            inputRef={addr2Ref}
            label="주소2" name="address2" value={form.address2} onChange={handleChange} fullWidth />
            {/* 우편번호 📌📌📌📌📌*/}






            <Stack direction="row" spacing={1} justifyContent="flex-end">

              <Button variant="outlined" onClick={() => router.push("/staff/employee/Basiclnfo/list")}>목록</Button>

              <Button type="submit" variant="contained" disabled={loading}>
                {loading ? "저장 중..." : "등록"}
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Paper>
    </Box>
        </>
  );
};

export default BasicInfoCreate;
