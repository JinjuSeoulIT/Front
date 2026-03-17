"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { Box, Paper, Stack, Typography, Button, CircularProgress, Table, TableBody, TableRow, TableCell } from "@mui/material";

import type { RootState } from "@/store/rootReducer";
import { DetailDoctorRequest, resetSuccessEnd } from "@/features/employee/doctor/doctorSlice";
import { DoctorIdNumber } from "@/features/employee/doctor/doctortypes";
import DoctorUpload from "./DoctorUpload";

const DoctorDetail = ({ staffId }: DoctorIdNumber) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { doctorDetail, loading, error } = useSelector((state: RootState) => state.doctor);

 
  const goList = () => router.replace("/staff/employee/doctor/SignUp/list");
  const goEdit = () => router.push(`/staff/employee/doctor/SignUp/${staffId}/edit`);


  
   useEffect(() => {
    if (!staffId) return;
    dispatch(DetailDoctorRequest({ staffId }));
    
    dispatch(resetSuccessEnd());

  }, [dispatch, staffId]);

  return (
    <Box sx={{ maxWidth: 980, mx: "auto", px: 2, py: 2 }}>
      <Paper sx={{ p: 3, borderRadius: 3, border: "1px solid #dbe5f5" }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6" fontWeight={800}>의사 상세</Typography>
        </Stack>

        {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
        {loading && <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}><CircularProgress /></Box>}



        {/*이미지 */}
        {!loading && doctorDetail && (
          <Stack spacing={3}>
            <Box sx={{ display: "flex", 
              justifyContent: "center", 
              alignItems: "center", mb: 1 }}>

              {doctorDetail.doctorFileUrl ? (
                <Box component="img" 
                src={doctorDetail.doctorFileUrl} 
                alt="의사 프로필" 
                sx={{ width: 140, height: 140, borderRadius: 3, objectFit: "cover", 
                  border: "1px solid #dbe5f5", bgcolor: "#f4f7fd" }} />

              ) : (
                <Box sx={{ width: 140, height: 140, borderRadius: 3, 
                border: "1px solid #dbe5f5", bgcolor: "#f4f7fd", 
                display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Typography variant="body2" color="text.secondary">이미지 없음</Typography>
                </Box>
              )}
            </Box>




                  <Table size="small">

                  <TableBody>
                  <TableRow>
                  <TableCell 
                  sx={{ fontWeight: 700, width: 160 }}>직원번호
                 </TableCell>
                  <TableCell>
                  {doctorDetail.staffId ?? "-"}
                  </TableCell>
                  </TableRow>

                  <TableRow>
                  <TableCell  
                  sx={{ fontWeight: 700 }}>면허번호
                 </TableCell>
                  <TableCell>
                  {doctorDetail.licenseNo ?? "-"}
                  </TableCell>
                  </TableRow>

                  <TableRow>
                  <TableCell 
                  sx={{ fontWeight: 700 }}>의사 타입
                 </TableCell>
                  <TableCell>
                  {doctorDetail.doctorType ?? "-"}
                  </TableCell>
                  </TableRow>

                  <TableRow>
                  <TableCell 
                  sx={{ fontWeight: 700 }}>진료과 코드
                 </TableCell>
                  <TableCell>
                  {doctorDetail.specialtyId ?? "-"}
                  </TableCell>
                  </TableRow>

                  <TableRow>
                  <TableCell 
                  sx={{ fontWeight: 700 }}>한줄 소개
                 </TableCell>
                  <TableCell>
                  {doctorDetail.profileSummary ?? "-"}
                  </TableCell>
                  </TableRow>

                  <TableRow>
                  <TableCell 
                  sx={{ fontWeight: 700 }}>학력
                 </TableCell>
                  <TableCell>
                  {doctorDetail.education ?? "-"}
                  </TableCell>
                  </TableRow>

                  <TableRow>
                  <TableCell 
                  sx={{ fontWeight: 700 }}>경력
                 </TableCell>
                  <TableCell>
                  {doctorDetail.careerDetail ?? "-"}
                  </TableCell>
                  </TableRow>
              </TableBody>
            </Table>

            <Stack direction="row" spacing={1.5}>
              
            <Button variant="outlined" onClick={goList}>목록</Button>
            <Button variant="contained" onClick={goEdit} sx={{ bgcolor: "#2b5aa9" }}>수정</Button>
            </Stack>

            <DoctorUpload staffId={staffId} />
          </Stack>
        )}
      </Paper>
    </Box>
  );
};

export default DoctorDetail;
