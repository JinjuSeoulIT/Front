"use client";

import { useEffect,  useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/rootReducer";

// ✅ 너 프로젝트에 맞게 경로/이름 맞추기



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
import { initialNurseCreateForm, NurseCreateRequest } from "@/features/nurse/nurseTypes";
import { createNurseRequest, resetCreateSuccess } from "@/features/nurse/nurseSlice";


// function routeByRole(roleCode: string | null): string {
//   switch (roleCode) {
//     case "ADMIN":
//       return "/invites/create";
//     case "DOCTOR":
//       return "/doctor";
//     case "NURSE":
//       return "/nurse";
//     default:
//       return "/";
//   }
// }

const NurseCreatePage=()=> {
  const dispatch = useDispatch();  //훅이 없어서 일단 레이아웃쪽에 그냥 연결
    const router = useRouter();



  // ✅ 간호사 리듀스 슬라이스쪽 가져옴
  const {loading, createdSuccess , error } = useSelector((state:RootState) => state.nurse);

  const [form, setForm] = useState<NurseCreateRequest>(initialNurseCreateForm);


//   const [successMsg, setSuccessMsg] = useState<string | null>(null);
//   // ✅ 성공 시 me 갱신
//   useEffect(() => {
//     if (!Success) return;
//     setSuccessMsg("상세정보가 등록되었습니다.");
//     dispatch(meRequest());
//   }, [Success, dispatch]);

//   // ✅ me에 profileId 생기면 역할별 이동
//   useEffect(() => {
//     if (!me?.profileId) return;
//     router.replace(routeByRole(me.roleCode));
//   }, [me?.profileId, me?.roleCode, router]);

    const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    const req: NurseCreateRequest = {
 
   
    nurseGrade : (form.nurseGrade ?? "").trim(),  //간호사 등급 직급
    unitId : (form.unitId??"").trim(),            //간호사 사번코드 [업무용]
    shiftType : (form.shiftType??"").trim(),      //근무형태 “DAY”, “EVENING”, “NIGHT”, “3교대”, “2교대” 등)
    department: (form.department??"").trim(),      //부서
    employmentType:(form.employmentType??"").trim(),  //“정규직”, “계약직”, “파트타임” 등)
    status: (form.status??"").trim(),               ////재직/상태 (예: “ACTIVE/INACTIVE”, “재직/휴직/퇴사” 등)  
    };
    
    dispatch(createNurseRequest(req));
    };

  const handleChange = (event: ChangeEvent<any>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };


   // ✅ 수정 성공 후 이동(원하면)
  useEffect(() => {
    if (!createdSuccess) return;
    // 예: 수정 성공 후 뒤로가기 or 특정 페이지

    router.replace("/nurse/join/list"); // ✅ 네 관리자 화면 라우트로
    dispatch(resetCreateSuccess()); // ✅ 성공 “소비” 후 바로 끄기
}, [createdSuccess, router , dispatch]);


   return (
    // <MainLayout requireAuth showSidebar={false}> //인증담당 지금은 걍뺌 



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
                간호사 상세정보 가입
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
                label="간호사 등급 *"
                name="nurseGrade"
                value={form.nurseGrade ?? ""}
                onChange={handleChange}
                fullWidth
                required
                sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }}

              />

              {/* ✅ '사번'은 네 타입 기준으로 unitId로 받는 게 자연스러움 */}
              <TextField
                label="사번 *"
                name="unitId"
                value={form.unitId ?? ""}
                onChange={handleChange}
                fullWidth
                required
                sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }}
              />

              <TextField
                label="근무형태 *"
                name="shiftType"
                value={form.shiftType ?? ""}
                onChange={handleChange}
                placeholder='예: DAY / NIGHT / 3교대'
                fullWidth
                required
                sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }}
              />

              <TextField
                label="부서 *"
                name="department"
                value={form.department ?? ""}
                onChange={handleChange}
                placeholder="예: ICU / ER / Ward"
                fullWidth
                required
                sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }}
              />

              {/* 선택 입력들 */}
              <TextField
                label="고용형태"
                name="employmentType"
                value={form.employmentType ?? ""}
                onChange={handleChange}
                placeholder="예: 정규직/계약직"
                fullWidth
                sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }}
              />

              <TextField
                label="재직상태"
                name="status"
                value={form.status ?? ""}
                onChange={handleChange}
                placeholder="예: ACTIVE / 휴직 / 퇴사"
                fullWidth
                sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }}
              />

              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
                <Button
                  variant="outlined"
                  onClick={() => router.replace("/")}
                  disabled={loading}
                  fullWidth
                >
                  취소
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
export default NurseCreatePage;