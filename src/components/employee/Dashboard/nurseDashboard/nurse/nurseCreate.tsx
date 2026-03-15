"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/rootReducer";
import { Alert, Box, Button, CircularProgress, Divider, Paper, Stack, TextField, Typography } from "@mui/material";
import { initialNurseCreateForm, NurseCreateRequest, NurseStaffIdParam } from "@/features/employee/nurse/nurseTypes";
import { createNurseRequest, resetSuccessEnd } from "@/features/employee/nurse/nurseSlice";
import { DetailStaffApi } from "@/lib/employeeBasiclnfo";

type StaffInfo = {
  staffId: string;
  deptId: string;
  name: string;
};

const NurseCreatePage = ({ staffId }: NurseStaffIdParam) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { createSuccess, loading, error } = useSelector((state: RootState) => state.nurse);
  const [form, setForm] = useState<NurseCreateRequest>(initialNurseCreateForm);
  const [staffInfo, setStaffInfo] = useState<StaffInfo>({ staffId: "", deptId: "", name: "" });
  const [staffLoading, setStaffLoading] = useState(false);
  const [staffLoadError, setStaffLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!staffId) {
      setStaffLoadError("직원번호가 없습니다. 공통 직원 상세에서 다시 진입해주세요.");
      return;
    }

    let active = true;

    const loadStaff = async () => {
      setStaffLoading(true);
      setStaffLoadError(null);
      try {
        const response = await DetailStaffApi(staffId);
        if (!active) return;

        if (!response.success || !response.data) {
          setStaffLoadError(response.message || "직원 기본정보를 불러오지 못했습니다.");
          return;
        }

        setStaffInfo({
          staffId: response.data.staffId ?? staffId,
          deptId: response.data.deptId ?? "",
          name: response.data.name ?? "",
        });

        setForm((prev) => ({
          ...prev,
          staffId: response.data.staffId ?? staffId,
        }));
      } catch (err) {
        console.error("직원 기본정보 조회 실패", err);
        if (!active) return;
        setStaffLoadError("직원 기본정보를 불러오지 못했습니다.");
      } finally {
        if (active) setStaffLoading(false);
      }
    };

    loadStaff();
    return () => {
      active = false;
    };
  }, [staffId]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const request: NurseCreateRequest = {
      staffId: (form.staffId ?? "").trim(),
      licenseNo: (form.licenseNo ?? "").trim(),
      nurseType: "NURSE",
      shiftType: (form.shiftType ?? "").trim(),

      nurseFileUrl: (form.nurseFileUrl ?? "").trim(),
      education: (form.education ?? "").trim(),
      careerDetail: (form.careerDetail ?? "").trim(),
    };
    console.log("nurse create payload", request);
    dispatch(createNurseRequest(request));
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    if (!createSuccess) return;
    router.replace("/staff/employee/nurse/SignUp/list");
    dispatch(resetSuccessEnd());
  }, [createSuccess, router, dispatch]);

  return (
    <Box sx={{ maxWidth: 780, mx: "auto", px: { xs: 2, md: 0 } }}>
      <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, border: "1px solid #dbe5f5", bgcolor: "white", boxShadow: "0 14px 28px rgba(23, 52, 97, 0.15)" }}>
        <Stack spacing={2.5} component="form" onSubmit={handleSubmit}>
          <Stack spacing={0.5}>
            <Typography variant="h6" fontWeight={800}>간호사 상세정보 추가</Typography>
            <Typography color="text.secondary" fontWeight={600}>공통 직원의 STAFF_ID(FK) 기준으로 간호사 상세를 연결합니다.</Typography>
          </Stack>

          {staffLoadError && <Alert severity="error">{staffLoadError}</Alert>}
          {error && <Alert severity="error">{error}</Alert>}
          <Divider />

          <Stack spacing={2}>
            <TextField label="부서 ID"
            value={staffInfo.deptId} 
            fullWidth InputProps={{ readOnly: true }} helperText="공통 직원 기본정보에서 가져온 표시용 값입니다."
            sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }} />

            <TextField label="직원번호(staffId) *" 
            value={staffInfo.staffId} fullWidth 
            required InputProps={{ readOnly: true }} helperText="공통 직원 기본정보의 STAFF_ID(FK) 입니다." 
            sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }} />

            <TextField label="이름" 
            value={staffInfo.name} fullWidth InputProps={{ readOnly: true }} helperText="공통 직원 기본정보에서 가져온 표시용 값입니다." 
            sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }} />

            <TextField label="간호사 면허 *" name="licenseNo" 
            value={form.licenseNo ?? ""} onChange={handleChange} 
            fullWidth required 
            sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }} />

            <TextField label="근무 형태 *" name="shiftType" 
            value={form.shiftType ?? ""} onChange={handleChange} 
            fullWidth required sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }} />

            <TextField label="학력" name="education" 
            value={form.education ?? ""} onChange={handleChange} 
            fullWidth sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }} />

            <TextField label="경력 상세" name="careerDetail" 
            value={form.careerDetail ?? ""} onChange={handleChange} 
            fullWidth sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }} />

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>

            <Button variant="outlined" onClick={() => router.replace("/staff/employee/nurse/SignUp/list")} 
            disabled={loading || staffLoading} fullWidth>목록으로</Button>

            <Button type="submit" variant="contained" disabled={loading || staffLoading || !form.staffId} 
            sx={{ bgcolor: "#2b5aa9" }} fullWidth>{loading || staffLoading ? <CircularProgress size={18} /> : "등록 완료"}</Button>
            </Stack>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
};

export default NurseCreatePage;
