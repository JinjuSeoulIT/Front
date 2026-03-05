"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";

import { RootState } from "@/store/rootReducer";
import { deleteNurseRequest, nurselistRequest, resetCreateSuccess } from "@/features/nurse/nurseSlice";

import { Box, Paper, Stack, Typography, Button } from "@mui/material";
import { Table, TableHead, TableBody, TableRow, TableCell } from "@mui/material";

const NurseListPage = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const { nurselist, deleteSuccess ,loading, error } = useSelector((state: RootState) => state.nurse);

  useEffect(() => {
    dispatch(nurselistRequest());
  }, [dispatch]);


  const handlehome  = () => router.push("/");
  const handleCreate = () => router.push("/staff/join/create");
  const handleDetail = (id: number) => router.push(`/staff/join/${id}/detail`);
  const handleEdit = (id: number) => router.push(`/staff/join/${id}/edit`);

  const handleDelete = (id: number) => {
    const ok = confirm("정말 삭제하시겠습니까?");
    if (!ok) return;
    dispatch(deleteNurseRequest(id));
  };




   // ✅ 삭제 성공 후 이동(원하면)
  useEffect(() => {
    if (!deleteSuccess) return;
    // 예: 삭제 성공 후  재리로딩
    dispatch(nurselistRequest());     // ✅ 다시 조회해서 리스트 갱신
    dispatch(resetCreateSuccess());
}, [deleteSuccess, router,dispatch]);



  
  return (
    <Box sx={{ maxWidth: 980, mx: "auto", px: 2, py: 2 }}>
      <Paper sx={{ p: 3, borderRadius: 3, border: "1px solid #dbe5f5" }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6" fontWeight={800}>
            간호사 목록
          </Typography>

      
           <Button variant="contained" onClick={handlehome}>
           메인홈피
          </Button>
        </Stack>

        {/* ✅ 최소표시: 로딩/에러는 텍스트로만 */}
        {/* <Typography variant="body2" sx={{ mb: 1 }}>
          loading: {String(loading)} 에러: {String(error)}
        </Typography> */}

          <Table size="small">
          <TableHead>
            <TableRow>
            
              <TableCell>사번번호</TableCell>

              <TableCell>잭책</TableCell>

              <TableCell>교대근무</TableCell>

              <TableCell>부서</TableCell>
              <TableCell>계약상태</TableCell>
              <TableCell>재직상태</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {nurselist.map((e) => (
              <TableRow key={e.nurseId}>

                <TableCell>{e.unitId}</TableCell>
                <TableCell>{e.nurseGrade}</TableCell>
                {/* 교대근무에 shiftType을, 부서에 department를 표기 */}
                <TableCell>{e.shiftType}</TableCell>
                <TableCell>{e.department}</TableCell>
                <TableCell>{e.employmentType}</TableCell>
                <TableCell>{e.status}</TableCell>
                <TableCell>
                  <Button size="small" onClick={() => handleDetail(e.nurseId)}>상세</Button>
                  <Button size="small" onClick={() => handleEdit(e.nurseId)}>수정</Button>
                  <Button size="small" color="error" onClick={() => handleDelete(e.nurseId)}>삭제</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

<div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
            <Button variant="contained" onClick={handleCreate}>
            등록
          </Button>
        </div>
          </Paper>
      
          </Box>
    
    

  );
};

export default NurseListPage;
