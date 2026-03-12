"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";

import { RootState } from "@/store/rootReducer";
import { DetailNurseRequest } from "@/features/employee/nurse/nurseSlice";

import {
  Box,
  Paper,
  Stack,
  Typography,
  Button,
  CircularProgress,
} from "@mui/material";
import { Table, TableBody, TableRow, TableCell } from "@mui/material";
import { NurseIdnNumber } from "@/features/employee/nurse/nurseTypes";
import NurseUpload from "./nurseUpload";


const NurseDetail = ({ nurseId }: NurseIdnNumber) => {
  const dispatch = useDispatch();
  const router = useRouter();

  const { nurseDetail, loading, error } = useSelector(
    (state: RootState) => state.nurse
  );

  useEffect(() => {
    if (nurseId) {
      dispatch(DetailNurseRequest({ nurseId }));
    }
  }, [dispatch, nurseId]);



  const goList = () => router.replace("/staff/dashboard/nurse/SignUp/list");
  const goEdit = () => router.push(`/staff/dashboard/nurse/SignUp/${nurseId}/edit`);



  return (
    <Box sx={{ maxWidth: 980, mx: "auto", px: 2, py: 2 }}>
      <Paper sx={{ p: 3, borderRadius: 3, border: "1px solid #dbe5f5" }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 2 }}
        >
          <Typography variant="h6" fontWeight={800}>
            간호사 상세
          </Typography>

          <Stack direction="row" spacing={1}>
            <Button variant="outlined" onClick={goList}>
              뒤로가기
            </Button>
            <Button variant="contained" onClick={goEdit} disabled={!nurseDetail}>
              수정
            </Button>
          </Stack>
        </Stack>

        {loading && (
          <Box sx={{ py: 4, textAlign: "center" }}>
            <CircularProgress />
          </Box>
         )}


      {!loading && nurseDetail && (
        <Stack spacing={3}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              mb: 1,
            }}
          >
            {nurseDetail.nurseFileUrl ? (
              <Box
                component="img"
                src={nurseDetail.nurseFileUrl}
                alt="간호사 프로필"
                sx={{
                  width: 140,
                  height: 140,
                  borderRadius: 3,
                  objectFit: "cover",
                  border: "1px solid #dbe5f5",
                  bgcolor: "#f4f7fd",
                }}
              />
            ) : (
              <Box
                sx={{
                  width: 140,
                  height: 140,
                  borderRadius: 3,
                  border: "1px solid #dbe5f5",
                  bgcolor: "#f4f7fd",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  이미지 없음
                </Typography>
              </Box>
            )}
          </Box>




            <Table size="small">
              <TableBody>
                <TableRow>
                  <TableCell sx={{ width: 180, fontWeight: 700 }}>
                    간호사 번호
                  </TableCell>
                  <TableCell>{nurseDetail.nurseId ?? "-"}</TableCell>
                </TableRow>

                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>
                    근무 형태
                  </TableCell>
                  <TableCell>{nurseDetail.employmentType ?? "-"}</TableCell>
                </TableRow>

                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>
                    교대 근무
                  </TableCell>
                  <TableCell>{nurseDetail.shiftType ?? "-"}</TableCell>
                </TableRow>

                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>
                    학력
                  </TableCell>
                  <TableCell>{nurseDetail.education ?? "-"}</TableCell>
                </TableRow>

                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>
                    경력 상세
                  </TableCell>
                  <TableCell>{nurseDetail.careerDetail ?? "-"}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
         
         
         
         
         
        
   <Stack direction="row" spacing={1.5}>
            <Button variant="outlined" onClick={goList}>
              뒤로가기
            </Button>

            <Button
              variant="contained"
              onClick={goEdit}
              disabled={!nurseDetail}
            >
              수정
            </Button>
          </Stack>

          <NurseUpload nurseId={nurseId} />
        </Stack>

        )}
      </Paper>

      
    </Box>
  );
};

export default NurseDetail;