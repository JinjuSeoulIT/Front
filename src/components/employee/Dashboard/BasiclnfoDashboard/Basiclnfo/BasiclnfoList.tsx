"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import type { RootState } from "@/store/rootReducer";
import {
  StafflistRequest,
} from "@/features/employee/Staff/BasiclnfoSlict";
import { staffResponse } from "@/features/employee/Staff/BasiclnfoType";


const BasicInfoList = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const { Stafflist, loading, error } = useSelector((state: RootState) => state.staff);

  useEffect(() => {
    dispatch(StafflistRequest());
  }, [dispatch]);



//타입 명령어 (분기점)
  const getJobType = (staff: staffResponse) => {
    if (staff.nurseType) return "NURSE";
    if (staff.doctorType) return "DOCTOR";
    return null;
  };
const handleDetail = (staff: staffResponse) => {
  const jobType = getJobType(staff);

  //의사 디테일로
  if (jobType === "DOCTOR") {
    const path = `/staff/employee/doctor/SignUp/${staff.staffId}/detail`;
    console.log("doctor detail path =", path);
    router.push(path);
    return;
  }

  //간호사 디테일로
  if (jobType === "NURSE") {
    const path = `/staff/employee/nurse/SignUp/${staff.staffId}/detail`;
    console.log("nurse detail path =", path);
    router.push(path);
    return;
  }

  //공통 디테일로
  const path = `/staff/employee/Basiclnfo/${staff.staffId}/detail`;
  console.log("basic detail path =", path);
  router.push(path);
};

    


//수정
  const handleEdit = (staff: staffResponse) => {
      //공통 수정
  const path = `/staff/employee/Basiclnfo/${staff.staffId}/edit`;
  console.log("basic detail path =", path);
  router.push(path);
  };





//삭제
const handleDelete = (staffId: string) => {
  const path = `/staff/employee/Basiclnfo/${staffId}/delete`;
  console.log("basic delete path =", path);
  router.push(path);
};




  return (
    <Box sx={{ maxWidth: 1100, mx: "auto", px: 2, py: 2 }}>
      <Paper sx={{ p: 3, borderRadius: 3, border: "1px solid #dbe5f5" }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 2 }}
        >
          <Typography variant="h6" fontWeight={800}>
            직원 공통 목록
          </Typography>

          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              onClick={() => router.push("/staff/employee")}
            >
              직원 홈
            </Button>

            <Button
              variant="contained"
              onClick={() => router.push("/staff/employee/Basiclnfo/create")}
            >
              + 직원등록
            </Button>
          </Stack>
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>직원번호</TableCell>
              <TableCell>부서</TableCell>
              <TableCell>이름</TableCell>
              <TableCell>연락처</TableCell>
              <TableCell>이메일</TableCell>
              <TableCell>상태</TableCell>
              <TableCell>직업</TableCell>
              <TableCell align="center">관리</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {Stafflist.map((staff: staffResponse) => {
              const jobType = getJobType(staff);

              return (
                <TableRow key={staff.staffId} hover>
                  <TableCell>{staff.staffId}</TableCell>
                  <TableCell>{staff.deptId}</TableCell>
                  <TableCell>{staff.name}</TableCell>
                  <TableCell>{staff.phone}</TableCell>
                  <TableCell>{staff.email}</TableCell>
                  <TableCell>{staff.status}</TableCell>

                  
                  <TableCell>{jobType ?? "미등록"}</TableCell>
                  <TableCell>
                    <Button size="small" onClick={() => handleDetail(staff)}>
                      상세
                    </Button>

                    <Button size="small" onClick={() => handleEdit(staff)}>
                      수정
                    </Button>





            <Button
  size="small"
  color="error"
  disabled={loading}
  onClick={() => handleDelete(staff.staffId)}
>
  삭제
</Button>
                  </TableCell>
                </TableRow>
              );
            })}

            {!Stafflist.length && !loading && (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  조회된 직원이 없습니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default BasicInfoList;