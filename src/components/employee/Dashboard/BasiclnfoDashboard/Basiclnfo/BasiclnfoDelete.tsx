"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Paper, Stack, Typography } from "@mui/material";
import type { RootState } from "@/store/rootReducer";
import {
  deleteStaffRequest,
  resetSuccessEnd,
  StafflistRequest,
} from "@/features/employee/Staff/BasiclnfoSlict";




type Props = {
  open: boolean;
  staffId: string | null;
  onClose: () => void;
};


const BasicInfoDelete = ({ open, staffId, onClose }: Props) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { deleteSuccess, loading, error } = useSelector((state: RootState) => state.staff);



   const handleConfirmDelete = () => {
      if (!staffId) return;
      dispatch(deleteStaffRequest({ staffId }));
    };
  
    useEffect(() => {
      if (!deleteSuccess) return;

      onClose();
            dispatch(StafflistRequest());
            dispatch(resetSuccessEnd());
    }, [deleteSuccess, dispatch, onClose]);



    

  return (
      <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="xs" fullWidth>
    <DialogTitle>직원 삭제</DialogTitle>

        <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
        정말 삭제하시겠습니까?
        </DialogContentText>

        <Typography variant="body2" color="text.secondary">
        staffId: {staffId ?? "-"}
        </Typography>

        {loading && <CircularProgress sx={{ mt: 2 }} />}

        {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
            {error}
        </Alert>
        )}
        </DialogContent>

        <DialogActions>
        <Button onClick={onClose} disabled={loading}>
        취소
        </Button>
        <Button
        color="error"
        variant="contained"
        onClick={ handleConfirmDelete }
        disabled={loading || !staffId}
        >
        삭제
        </Button>
        </DialogActions>
        </Dialog>
  );
};

export default BasicInfoDelete;






