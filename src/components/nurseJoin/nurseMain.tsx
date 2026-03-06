"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { deleteNurseApi, nurselistApi } from "@/lib/nurseApi";
import type { NurseResponse } from "@/features/nurse/nurseTypes";

export default function NurseMain() {
  const router = useRouter();
  const [list, setList] = useState<NurseResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await nurselistApi();
      if (!res.success) throw new Error(res.message || "목록 조회 실패");
      setList(res.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "목록 조회 실패");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      setLoading(true);
      const res = await deleteNurseApi(id);
      if (!res.success) throw new Error(res.message || "삭제 실패");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "삭제 실패");
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 1100, mx: "auto", px: 2, py: 2 }}>
      <Paper sx={{ p: 3, borderRadius: 3, border: "1px solid #dbe5f5" }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6" fontWeight={800}>
            간호사 목록
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" onClick={() => router.push("/staff/dashboard")}>대시보드</Button>
            <Button variant="contained" onClick={() => router.push("/staff/join/create")}>등록</Button>
          </Stack>
        </Stack>

        {error && (
          <Typography color="error" sx={{ mb: 1 }}>
            {error}
          </Typography>
        )}

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>사번</TableCell>
              <TableCell>직책</TableCell>
              <TableCell>교대근무</TableCell>
              <TableCell>부서</TableCell>
              <TableCell>고용형태</TableCell>
              <TableCell>재직상태</TableCell>
              <TableCell>작업</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {list.map((nurse) => (
              <TableRow key={nurse.nurseId}>
                <TableCell>{nurse.unitId}</TableCell>
                <TableCell>{nurse.nurseGrade}</TableCell>
                <TableCell>{nurse.shiftType}</TableCell>
                <TableCell>{nurse.department}</TableCell>
                <TableCell>{nurse.employmentType}</TableCell>
                <TableCell>{nurse.status}</TableCell>
                <TableCell>
                  <Button size="small" onClick={() => router.push(`/staff/join/${nurse.nurseId}/detail`)}>상세</Button>
                  <Button size="small" onClick={() => router.push(`/staff/join/${nurse.nurseId}/edit`)}>수정</Button>
                  <Button size="small" color="error" disabled={loading} onClick={() => handleDelete(nurse.nurseId)}>삭제</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}
