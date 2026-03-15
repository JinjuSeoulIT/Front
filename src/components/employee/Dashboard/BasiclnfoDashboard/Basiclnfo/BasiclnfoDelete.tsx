"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { Alert, Box, Button, Paper, Stack, Typography } from "@mui/material";
import type { RootState } from "@/store/rootReducer";
import {
  deleteStaffRequest,
  deleteStaffSuccess,
  resetCreateSuccess,
} from "@/features/employee/Staff/BasiclnfoSlict";

type Props = {
  staffId: string;
};

const BasicInfoDelete = ({ staffId }: Props) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { deleteSuccess, loading, error } = useSelector((state: RootState) => state.staff);

  useEffect(() => {
    if (!deleteSuccess) return;
    router.push("/staff/employee/Basiclnfo/list");
    dispatch(resetCreateSuccess());
  }, [deleteSuccess, dispatch, router]);








  return (
    <Box sx={{ maxWidth: 540, mx: "auto", px: 2, py: 2 }}>
      <Paper sx={{ p: 3, borderRadius: 3, border: "1px solid #dbe5f5" }}>
        <Stack spacing={2}>
          <Typography variant="h6" 
          fontWeight={800}>직원 공통 삭제
          </Typography>

          <Typography>직원번호 
            <strong>{staffId}</strong> 를 "영구"삭제하시겠습니까?
            </Typography>


          {error && <Alert severity="error">{error}</Alert>}
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button variant="outlined" 
            onClick={() => router.back()} 
            disabled={loading}>취소</Button>


            <Button variant="contained" 
            color="error" 
            disabled={loading} 
            onClick={() => dispatch(deleteStaffRequest(staffId))}>
              {loading ? "삭제 중..." : "삭제"}
            </Button>

          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
};

export default BasicInfoDelete;
