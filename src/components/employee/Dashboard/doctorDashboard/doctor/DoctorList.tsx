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

  useEffect(() => {
    dispatch(DoctorListRequest());
  }, [dispatch]);

  const handleHome = () => router.push("/staff/employee");

  const handleCreate = () => router.push("/staff/employee/Basiclnfo/list");

  const handleDetail = (staffId: string) => router.push(`/staff/employee/doctor/SignUp/${staffId}/detail`);

  const handleEdit = (staffId: string) => router.push(`/staff/employee/doctor/SignUp/${staffId}/edit`);

  const handleDelete = (staffId: string) => {
    const ok = confirm("정말 삭제하시겠습니까?");
    if (!ok) return;
    dispatch(deleteDoctorRequest({ staffId }));
  };

  useEffect(() => {
    if (!deleteSuccess) return;
    dispatch(DoctorListRequest());
    dispatch(resetSuccessEnd());
  }, [deleteSuccess, dispatch]);

  return (
    <Box sx={{ maxWidth: 980, mx: "auto", px: 2, py: 2 }}>
      <Paper sx={{ p: 3, borderRadius: 3, border: "1px solid #dbe5f5" }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6" fontWeight={800}>의사 목록</Typography>
          <Button variant="contained" onClick={handleHome}>메인홈</Button>
        </Stack>

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>직원번호</TableCell>
              <TableCell>면허번호</TableCell>
              <TableCell>직업</TableCell>
              <TableCell>전문분야</TableCell>
              <TableCell>액션</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>

            {doctorList.map((doctor) => (
              <TableRow key={doctor.staffId}>
                
                <TableCell>{doctor.staffId}</TableCell>
                <TableCell>{doctor.licenseNo}</TableCell>
                <TableCell>{doctor.doctorType ?? "DOCTOR"}</TableCell>
                <TableCell>{doctor.specialtyId}</TableCell>
                <TableCell>
                  <Button size="small" onClick={() => handleDetail(doctor.staffId)}>상세</Button>
                  <Button size="small" onClick={() => handleEdit(doctor.staffId)}>수정</Button>
                  <Button size="small" color="error" onClick={() => handleDelete(doctor.staffId)}>삭제</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
          <Button variant="contained" onClick={handleCreate}>의사 등록</Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default DoctorList;
