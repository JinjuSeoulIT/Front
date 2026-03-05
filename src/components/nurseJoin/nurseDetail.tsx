"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";

import { RootState } from "@/store/rootReducer";
import { DetailNurseRequest } from "@/features/nurse/nurseSlice";

import { Box, Paper, Stack, Typography, Button } from "@mui/material";
import { Table, TableBody, TableRow, TableCell } from "@mui/material";

type Props = { nurseId: number };

export default function NurseDetail({ nurseId }: Props) {
  const dispatch = useDispatch();
  const router = useRouter();

  const { nurseDetail, loading, error } = useSelector((s: RootState) => s.nurse);

  useEffect(() => {
    if (!Number.isFinite(nurseId)) return;
    dispatch(DetailNurseRequest(nurseId));
  }, [dispatch, nurseId]);

  const goList = () => router.replace("/nurse/join/list");
  const goEdit = () => router.push(`/nurse/join/${nurseId}/edit`);

  // ✅ 화면에 보여줄 상태 텍스트만 정리 (return 남발 X)
  let content: React.ReactNode = null;

  if (loading) content = <Typography>로딩중...</Typography>;
  else if (error) content = <Typography color="error">에러: {error}</Typography>;
  else if (!nurseDetail) content = <Typography>데이터 없음</Typography>;
  else {
    content = (
      <Table size="small">
        <TableBody>
          <TableRow>
            <TableCell sx={{ width: 180, fontWeight: 700 }}>사번번호</TableCell>
            <TableCell>{nurseDetail.unitId ?? "-"}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{ fontWeight: 700 }}>직책</TableCell>
            <TableCell>{nurseDetail.nurseGrade ?? "-"}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{ fontWeight: 700 }}>교대근무</TableCell>
            <TableCell>{nurseDetail.shiftType ?? "-"}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{ fontWeight: 700 }}>부서</TableCell>
            <TableCell>{nurseDetail.department ?? "-"}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{ fontWeight: 700 }}>계약상태</TableCell>
            <TableCell>{nurseDetail.employmentType ?? "-"}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{ fontWeight: 700 }}>재직상태</TableCell>
            <TableCell>{nurseDetail.status ?? "-"}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
  }

  return (
    <Box sx={{ maxWidth: 980, mx: "auto", px: 2, py: 2 }}>
      <Paper sx={{ p: 3, borderRadius: 3, border: "1px solid #dbe5f5" }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6" fontWeight={800}>
            간호사 상세
          </Typography>

          <Stack direction="row" spacing={1}>
            <Button variant="outlined" onClick={goList}>뒤로가기</Button>
            <Button variant="contained" onClick={goEdit} disabled={!nurseDetail}>
              수정
            </Button>
          </Stack>
        </Stack>

        {content}
      </Paper>
    </Box>
  );
}