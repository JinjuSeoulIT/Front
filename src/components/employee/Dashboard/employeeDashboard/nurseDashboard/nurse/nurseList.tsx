"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";

import { RootState } from "@/store/rootReducer";
import {
  deleteNurseRequest,
  nurselistRequest,
  resetSuccessEnd,
} from "@/features/employee/nurse/nurseSlice";

import { Box, Paper, Stack, Typography, Button, Alert } from "@mui/material";
import { Table, TableHead, TableBody, TableRow, TableCell } from "@mui/material";

const NurseListPage = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const { nurselist, deleteSuccess, loading, error } = useSelector((state: RootState) => state.nurse);

  useEffect(() => {
    dispatch(nurselistRequest());
  }, [dispatch]);

  const handleHome = () => router.push("/staff/dashboard");
  const handleCreate = () => router.push("/staff/dashboard/nurse/SignUp/create");
  const handleDetail = (id: number) => router.push(`/staff/dashboard/nurse/SignUp/${id}/detail`);
  const handleEdit = (id: number) => router.push(`/staff/dashboard/nurse/SignUp/${id}/edit`);

  const handleDelete = (nurseId: number) => {
    const ok = confirm("정말 삭제하시겠습니까?");
    if (!ok) return;
    dispatch(deleteNurseRequest({ nurseId }));
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
          <Typography variant="h6" fontWeight={800}>
            간호사 목록
          </Typography>
          <Button variant="contained" onClick={handleHome}>
            메인 홈
          </Button>
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>간호사 ID</TableCell>
              <TableCell>사번</TableCell>
              <TableCell>근무 형태</TableCell>
              <TableCell>고용 형태</TableCell>
              <TableCell>학력</TableCell>
              <TableCell>작업</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {nurselist.map((nurse) => (
              <TableRow key={nurse.nurseId}>
                <TableCell>{nurse.nurseId}</TableCell>
                <TableCell>{nurse.unitId}</TableCell>
                <TableCell>{nurse.shiftType}</TableCell>
                <TableCell>{nurse.employmentType}</TableCell>
                <TableCell>{nurse.education}</TableCell>
                <TableCell>
                  <Button size="small" onClick={() => handleDetail(nurse.nurseId)}>
                    상세
                  </Button>
                  <Button size="small" onClick={() => handleEdit(nurse.nurseId)}>
                    수정
                  </Button>
                  <Button size="small" color="error" onClick={() => handleDelete(nurse.nurseId)} disabled={loading}>
                    삭제
                  </Button>
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
