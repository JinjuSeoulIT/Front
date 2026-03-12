"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { Box, Button, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";

import type { RootState } from "@/store/rootReducer";
import { deleteDoctorRequest, DoctorListRequest, resetSuccessEnd } from "@/features/employee/doctor/doctorSlice";

const DoctorList = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { doctorList, deleteSuccess } = useSelector((state: RootState) => state.doctor);


  //리스트 액션
  useEffect(() => {
    dispatch(DoctorListRequest());
  }, [dispatch]);



  //홈
  const handleHome = () => router.push("/staff/dashboard");
  //등록
  const handleCreate = () => router.push("/staff/dashboard/doctor/SignUp/create");
  //상세
  const handleDetail = (id: number) => router.push(`/staff/dashboard/doctor/SignUp/${id}/detail`);
  //수정
  const handleEdit = (id: number) => router.push(`/staff/dashboard/doctor/SignUp/${id}/edit`);


  const handleDelete = (doctorId: number) => {
  const ok = confirm("정말 삭제하시겠습니까?");
  if (!ok) return;
  dispatch(deleteDoctorRequest({ doctorId }));
  };


   //삭제 액션
  useEffect(() => {
    if (!deleteSuccess) return;
    dispatch(DoctorListRequest());
    dispatch(resetSuccessEnd());  //액션 끊기
  }, [deleteSuccess, dispatch]);






  return (
    <Box sx={{ maxWidth: 980, mx: "auto", px: 2, py: 2 }}>
      <Paper sx={{ p: 3, borderRadius: 3, border: "1px solid #dbe5f5" }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6" fontWeight={800}>
            의사 목록
          </Typography>
          <Button variant="contained" onClick={handleHome}>
            메인홈
          </Button>
        </Stack>

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>사번번호</TableCell>

              <TableCell>이름</TableCell>

              <TableCell>직책</TableCell>

              <TableCell>전문분야</TableCell>

              <TableCell>액션</TableCell>

            </TableRow>
          </TableHead>
        <TableBody>

                {doctorList.map((doctorId) => (
                <TableRow key={doctorId.doctorId}>
                <TableCell>{doctorId.doctorFileUrl}</TableCell>   
                <TableCell>{doctorId.licenseNo}</TableCell>
                <TableCell>{doctorId.specialtyId}</TableCell>



                <TableCell>
                  <Button size="small" onClick={() => handleDetail(doctorId.doctorId)}>
                    상세
                  </Button>

                  <Button size="small" onClick={() => handleEdit(doctorId.doctorId)}>
                    수정
                  </Button>

                  <Button size="small" color="error" onClick={() => handleDelete(doctorId.doctorId)}>
                    삭제
                  </Button>

              </TableCell>
              </TableRow>
              ))}
              </TableBody>
              </Table>


        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
          <Button variant="contained" onClick={handleCreate}>
            등록
          </Button>
        </Box>




      </Paper>
    </Box>
  );
};

export default DoctorList;



