"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { Box, Button, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";

import type { RootState } from "@/store/rootReducer";
import { deleteNurseRequest, nurselistRequest, resetSuccessEnd } from "@/features/employee/nurse/nurseSlice";
import NurseDelete from "./nurseDelete"


const NurseList = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { nurselist, deleteSuccess, loading } = useSelector((state: RootState) => state.nurse);

  // 삭제 대상 이동다이얼그램 컴포넌트
  const [nurseDelete, setnurseDelete] = useState<string | null>(null);



  useEffect(() => {
    dispatch(nurselistRequest());
  }, [dispatch]);

  const handleHome = () => router.push("/staff/employee");

  const handleCreate = () => router.push("/staff/employee/nurse/SignUp/create");

  const handleDetail = (staffId: string) => router.push(`/staff/employee/nurse/SignUp/${staffId}/detail`);

  const handleEdit = (staffId: string) => router.push(`/staff/employee/nurse/SignUp/${staffId}/edit`);



  const handleOpenDeleteDialog = (staffId: string) => {
    setnurseDelete(staffId);
  };

  const handleCloseDeleteDialog = () => {
    if (loading) return;
    setnurseDelete(null);
  };




  useEffect(() => {
    if (!deleteSuccess) return;
    dispatch(nurselistRequest());
    dispatch(resetSuccessEnd());
  }, [deleteSuccess, dispatch]);

  return (
    <Box sx={{ maxWidth: 980, mx: "auto", px: 2, py: 2 }}>
      <Paper sx={{ p: 3, borderRadius: 3, border: "1px solid #dbe5f5" }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>

          <Typography variant="h6" fontWeight={800}>간호사 목록</Typography>

          <Button variant="contained" onClick={handleHome}>메인홈</Button>
        </Stack>

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>직원번호</TableCell>
              <TableCell>간호사 면허번호</TableCell>
              <TableCell>근무형태</TableCell>
              <TableCell>고용형태</TableCell>


            </TableRow>
          </TableHead>
          <TableBody>
            {nurselist.map((nurse) => (
              <TableRow key={nurse.staffId}>
                <TableCell>{nurse.staffId}</TableCell>
                <TableCell>{nurse.licenseNo}</TableCell>
                <TableCell>{nurse.shiftType}</TableCell>
    
                <TableCell>
                  <Button size="small" onClick={() => handleDetail(nurse.staffId)}>상세</Button>
                  <Button size="small" onClick={() => handleEdit(nurse.staffId)}>수정</Button>

                  
                  <Button
                    size="small"
                    //삭제 컴포넌트 이동
                    color="error"
                    onClick={() => handleOpenDeleteDialog(nurse.staffId)}
                    disabled={loading}
                  >
                    삭제
                  </Button>



            
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
          <Button variant="contained" onClick={handleCreate}>등록</Button>
        </Box>
      </Paper>


     <NurseDelete
        open={!!nurseDelete}
        staffId={nurseDelete}
        onClose={handleCloseDeleteDialog}
      />


    </Box>
  );
};

export default NurseList;
