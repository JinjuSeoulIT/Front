// "use client";

// import { useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { useDispatch, useSelector } from "react-redux";
// import { Box, Button, Paper, Stack, Typography } from "@mui/material";

// import type { RootState } from "@/store/rootReducer";
// import {

//   deleteDoctorRequest,
//   DetailDoctorRequest,
// } from "@/features/employee/doctor/doctorSlice";
// import { DoctorIdNumber } from "@/features/employee/doctor/doctortypes";



// const DoctorDelete = ({ doctorId }: DoctorIdNumber) => {
//   const dispatch = useDispatch();
//   const router = useRouter();
//   const { doctorDetail, loading, error, deleteSuccess } = useSelector((state: RootState) => state.doctor);





//   useEffect(() => {
//     if (doctorId) {
//       dispatch(DetailDoctorRequest({doctorId}));
//     }
//   }, [dispatch, doctorId]);

//   useEffect(() => {
//     if (!deleteSuccess) return;
//     router.push("/staff/dashboard/doctor/SignUp/list");
//   }, [deleteSuccess, router]);


//   const onConfirm = () => {
//     const  = doctorDetail?.;
//     if (!doctorDetail) return;
//     dispatch(deleteDoctorRequest({  }));
//   };

//   return (
//     <Box sx={{ maxWidth: 520, mx: "auto", px: 2, py: 2 }}>
//       <Paper sx={{ p: 3, borderRadius: 3, border: "1px solid #dbe5f5" }}>
//         <Stack spacing={2}>
//           <Typography variant="h6" fontWeight={800}>
//             의사 삭제
//           </Typography>
//           <Typography>
//             {DoctorDetail
//               ? `${DoctorDetail.realName} 의사 정보를 삭제하시겠습니까?`
//               : "삭제할 의사 정보를 불러오는 중입니다."}
//           </Typography>
//           {error && (
//             <Typography color="error" variant="body2">
//               {error}
//             </Typography>
//           )}
//           <Stack direction="row" spacing={1}>
//             <Button
//               variant="contained"
//               color="error"
//               onClick={onConfirm}
//               disabled={loading || !DoctorDetail}
//             >
//               {loading ? "처리중..." : "삭제"}
//             </Button>
//             <Button variant="outlined" onClick={() => router.back()} disabled={loading}>
//               취소
//             </Button>
//           </Stack>
//         </Stack>
//       </Paper>
//     </Box>
//   );
// };

// export default DoctorDelete;
