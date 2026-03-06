"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, Paper, Stack, Table, TableBody, TableCell, TableRow, Typography } from "@mui/material";
import { DetailNurseApi } from "@/lib/nurseApi";
import type { NurseResponse } from "@/features/nurse/nurseTypes";

type Props = { nurseId: number };

export default function NurseDetail({ nurseId }: Props) {
  const router = useRouter();
  const [nurse, setNurse] = useState<NurseResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    void DetailNurseApi(nurseId)
      .then((res) => {
        if (!mounted) return;
        if (!res.success) throw new Error(res.message || "조회 실패");
        setNurse(res.data);
      })
      .catch((err: unknown) => {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "조회 실패");
      });
    return () => {
      mounted = false;
    };
  }, [nurseId]);

  return (
    <Box sx={{ maxWidth: 980, mx: "auto", px: 2, py: 2 }}>
      <Paper sx={{ p: 3, borderRadius: 3, border: "1px solid #dbe5f5" }}>
        <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography variant="h6" fontWeight={800}>간호사 상세</Typography>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" onClick={() => router.replace("/staff/join/list")}>목록</Button>
            <Button variant="contained" onClick={() => router.push(`/staff/join/${nurseId}/edit`)}>수정</Button>
          </Stack>
        </Stack>

        {error && <Typography color="error">{error}</Typography>}
        {!error && !nurse && <Typography>로딩중...</Typography>}

        {nurse && (
          <Table size="small">
            <TableBody>
              <TableRow><TableCell>사번</TableCell><TableCell>{nurse.unitId}</TableCell></TableRow>
              <TableRow><TableCell>직책</TableCell><TableCell>{nurse.nurseGrade}</TableCell></TableRow>
              <TableRow><TableCell>교대근무</TableCell><TableCell>{nurse.shiftType}</TableCell></TableRow>
              <TableRow><TableCell>부서</TableCell><TableCell>{nurse.department}</TableCell></TableRow>
              <TableRow><TableCell>고용형태</TableCell><TableCell>{nurse.employmentType}</TableCell></TableRow>
              <TableRow><TableCell>재직상태</TableCell><TableCell>{nurse.status}</TableCell></TableRow>
            </TableBody>
          </Table>
        )}
      </Paper>
    </Box>
  );
}
