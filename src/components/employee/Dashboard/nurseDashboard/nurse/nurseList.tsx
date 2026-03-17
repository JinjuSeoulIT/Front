"use client";

import { FormEvent, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { Box, Button, MenuItem, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from "@mui/material";

import type { RootState } from "@/store/rootReducer";
import {
  nurselistRequest,
  resetSuccessEnd,
  searchNurseListRequest,
} from "@/features/employee/nurse/nurseSlice";
import type { NurseSearchType, SearchNursePayload } from "@/features/employee/nurse/nurseTypes";


const NurseList = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { nurselist, nurseSearch ,loading ,error} = useSelector((state: RootState) => state.nurse);

  // SearchNursePayload //검색
    const [search, setSearch] = useState("");
    const [searchType, setSearchType] = useState<NurseSearchType>("all");




  useEffect(() => {
    dispatch(nurselistRequest());
  }, [dispatch]);


  const handleHome = () => router.push("/staff/employee");

  const handleCreate = () => router.push("/staff/employee/nurse/SignUp/create");

  const handleDetail = (staffId: string) => router.push(`/staff/employee/nurse/SignUp/${staffId}/detail`);

  const handleEdit = (staffId: string) => router.push(`/staff/employee/nurse/SignUp/${staffId}/edit`);




//검색바
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

  if (!search.trim()) {
    dispatch(nurselistRequest());
    dispatch(resetSuccessEnd());
    return;
  }
    const nurseReq: SearchNursePayload = {
      search: search.trim(),
      searchType,
    };
    console.log("doctorReq", nurseReq);
    dispatch(searchNurseListRequest(nurseReq));
  };


const nurses = search.trim() ? nurseSearch : nurselist;

  

  return (
    <Box sx={{ maxWidth: 1480, mx: "auto", px: 2, py: 2 }}>
      <Paper sx={{ p: 3, borderRadius: 3, border: "1px solid #0f69fa" }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6" fontWeight={800}>간호사 목록</Typography>
          <Button variant="contained" onClick={handleHome} sx={{ mb: 2 }}>메인홈</Button>
        </Stack>



         {/*검색바 */}
        <Box component="form"  onSubmit={handleSubmit}  sx={{ mb: 2 }}>
        {/*가로 세로 정렬 */}
        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
        
        <TextField  
          select
          label="검색조건"
          value={searchType}
          onChange={(event) =>setSearchType(event.target.value as NurseSearchType)}
          sx={{ minWidth: 180 }}
        >
          {/*서치 검색UI */}
          <MenuItem value="all">전체</MenuItem>
          <MenuItem value="name">이름</MenuItem>
          <MenuItem value="shifttype">근무형태</MenuItem>
          <MenuItem value="staffId">사원번호</MenuItem>
          <MenuItem value="dept">부서</MenuItem>
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


              <Table size="small">
              <TableHead>
                <TableRow>
                <TableCell>직원번호</TableCell>
                <TableCell>이름</TableCell>
                <TableCell>부서</TableCell>
                <TableCell>간호사 면허번호</TableCell>
                <TableCell>근무형태</TableCell>
                <TableCell>직업</TableCell>
                <TableCell>액션</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
              {nurses.map((nurse) => (
              <TableRow key={nurse.staffId}>
                <TableCell>{nurse.staffId}</TableCell>
                <TableCell>{nurse.name}</TableCell>
                <TableCell>{nurse.deptId}</TableCell>
                <TableCell>{nurse.licenseNo}</TableCell>
                <TableCell>{nurse.shiftType}</TableCell>
                <TableCell>{nurse.nurseType ?? "NURSE"}</TableCell>
                <TableCell>
                  <Button size="small" onClick={() => handleDetail(nurse.staffId)}>상세</Button>
                  <Button size="small" onClick={() => handleEdit(nurse.staffId)}>수정</Button>
                </TableCell>
              </TableRow>
            ))}
            </TableBody>
            </Table>

        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
          <Button variant="contained" onClick={handleCreate}>등록</Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default NurseList;
