"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, Box, Button, Paper, Stack, Typography } from "@mui/material";
import { deleteNurseApi } from "@/lib/nurseApi";

type Props = { nurseId: number };

export default function NurseDelete({ nurseId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDelete = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await deleteNurseApi(nurseId);
      if (!res.success) throw new Error(res.message || "삭제 실패");
      router.replace("/staff/join/list");
    } catch (err) {
      setError(err instanceof Error ? err.message : "삭제 실패");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 720, mx: "auto", px: 2, py: 2 }}>
      <Paper sx={{ p: 3, borderRadius: 3, border: "1px solid #dbe5f5" }}>
        <Stack spacing={2}>
          <Typography variant="h6" fontWeight={800}>간호사 삭제</Typography>
          <Typography>대상 ID: {nurseId}</Typography>
          <Typography color="text.secondary">삭제 후 복구할 수 없습니다.</Typography>
          {error && <Alert severity="error">{error}</Alert>}
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" fullWidth onClick={() => router.replace("/staff/join/list")} disabled={loading}>취소</Button>
            <Button variant="contained" color="error" fullWidth onClick={onDelete} disabled={loading}>삭제</Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}
