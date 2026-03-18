"use client";

import { FormEvent, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import type { RootState } from "@/store/rootReducer";
import {
  resetSuccessEnd,
  searchStaffListRequest,
  StafflistRequest,
} from "@/features/employee/Staff/BasiclnfoSlict";
import { SearchStaffPayload, staffResponse, staffSearchType } from "@/features/employee/Staff/BasiclnfoType";
import BasicInfoDelete from "./BasiclnfoDelete";
import StatusBadge from "./BasiclnfoStatus/StatusBadge";

import NurseFont from "../../nurseDashboard/nurse/Style/NurseFont";
import DoctorFont from "../../doctorDashboard/doctor/Style/DoctorFont";


const BasicInfoList = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const { Stafflist,  StaffSearch, loading, error } = useSelector((state: RootState) => state.staff);

  // 삭제 대상 이동다이얼그램 컴포넌트
  const [staffDelete, setstaffDelete] = useState<string | null>(null);

  //서치바 검색
  const [search, setSearch] = useState("");
  const [searchType, setSearchType] = useState<staffSearchType>("all");


  useEffect(() => {
    dispatch(StafflistRequest());
  }, [dispatch]);




  //분기점
const handleDetail = (staff: staffResponse) => {

  //의사 디테일로
  if (staff.doctorType) {
    const path = `/staff/employee/doctor/SignUp/${staff.staffId}/detail`;
    console.log(path);//테스트 콘솔

    router.push(path);
    return;
  }

  //간호사 디테일로
  if (staff.nurseType) {
    const path = `/staff/employee/nurse/SignUp/${staff.staffId}/detail`;
    console.log(path);//테스트 콘솔

    router.push(path);
    return;
  }

  //공통 디테일로
  const path = `/staff/employee/Basiclnfo/${staff.staffId}/detail`;
  console.log(path);//테스트 콘솔

  router.push(path);
};



//수정
  const handleEdit = (staff: staffResponse) => {
      //공통 수정
  const path = `/staff/employee/Basiclnfo/${staff.staffId}/edit`;
  console.log(path);//테스트 콘솔

  router.push(path);
  };



//삭제 [모달창 형식]
  const handleOpenDeleteDialog = (staffId: string) => {
    setstaffDelete(staffId);
  };
  const handleCloseDeleteDialog = () => {
    setstaffDelete(null);
  };




{/*🔍🔍검색바🔍🔍 */}
  const handleSubmit = (event: FormEvent) => {
  event.preventDefault();

  console.log(search);
  console.log(searchType);
  
  if (!search.trim()) {
    dispatch(StafflistRequest());
    dispatch(resetSuccessEnd());
    return;
  }
    const StaffReq: SearchStaffPayload = {
      search: search.trim(),
      searchType,
    };
    console.log("StaffReq", StaffReq);
    dispatch(searchStaffListRequest(StaffReq));
  };

const staffs = search.trim() ? StaffSearch : Stafflist;



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



       {/*🔍🔍검색바🔍🔍 */}
        <Box component="form" onSubmit={handleSubmit}  sx={{ mb: 2 }}>
        {/*가로 세로 정렬 */}
        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
        
        <TextField  
          select
          label="검색조건"
          value={searchType}
          onChange={(event) =>setSearchType(event.target.value as staffSearchType)}
          sx={{ minWidth: 180 }}
        >
          {/*서치 검색UI */}
          <MenuItem value="all">전체</MenuItem>
          <MenuItem value="name">이름</MenuItem>
          <MenuItem value="status">상태</MenuItem>
          <MenuItem value="staffId">사원번호</MenuItem>
          <MenuItem value="dept">부서</MenuItem>
          <MenuItem value="nurseType">간호사</MenuItem>
          <MenuItem value="doctorType">의사</MenuItem>
        </TextField>


        <TextField
          label="검색어"
          value={search}
          onChange={(e) => setSearch(e.target.value)} fullWidth/>
        <Button type="submit" variant="contained">
          검색
        </Button>
        </Stack>
        </Box>
        {/*🔍🔍검색바🔍🔍 */}



              <Table size="small">
              <TableHead>
              <TableRow>
              <TableCell>직원번호</TableCell>
              <TableCell align="center">부서</TableCell>
              <TableCell>이름</TableCell>
              <TableCell align="center">연락처</TableCell>
              {/* <TableCell>이메일</TableCell> */}


              <TableCell align="center">상태</TableCell>


              <TableCell align="center">직업</TableCell>
              <TableCell align="center">관리</TableCell>
              </TableRow>
              </TableHead>
              <TableBody> 



            {staffs.map((staff: staffResponse) => {

                  return (
                  <TableRow key={staff.staffId} hover>
                  <TableCell>{staff.staffId}</TableCell>
                  <TableCell>{staff.deptId}</TableCell>
                  <TableCell>{staff.name}</TableCell>
                  <TableCell>{staff.phone}</TableCell>
                  {/* <TableCell>{staff.email}</TableCell> */}


                  <TableCell>
                  <StatusBadge status={staff.status} />
                  </TableCell>
                  

                  <TableCell>
                {staff.doctorType ? (<DoctorFont doctorType={staff.doctorType} />) 
            
                :staff.nurseType  ? (<NurseFont  nurseType= {staff.nurseType} /> ) 
                
                :(<TableCell align="center">미등록</TableCell> )}


                  </TableCell>
                  
                  
                  <TableCell>
                  <Button size="small" onClick={() => handleDetail(staff)}>
                  상세
                  </Button>

                  <Button size="small" onClick={() => handleEdit(staff)}>
                  수정
                  </Button>

      
                    <Button
                      color="error"
                      onClick={() => handleOpenDeleteDialog(staff.staffId)}
                    >
                      삭제
                    </Button>
                    </TableCell>
                    </TableRow>
                    );
                    })}
                    {/*🔍🔍검색바🔍🔍 */}



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


        <BasicInfoDelete
        //삭제 [모달창 형식]
        open={!!staffDelete}
        staffId={staffDelete}
        onClose={handleCloseDeleteDialog}
        />
        </Box>
  );
};

export default BasicInfoList;