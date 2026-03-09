"use client";

import { useEffect,  useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/rootReducer";

// ✅ 너 프로젝트에 맞게 경로/이름 맞추기



import {
  Box,
  Paper,


} from "@mui/material";
import {  deleteNurseRequest, deleteNurseSuccess, resetCreateSuccess } from "@/features/employee/nurse/nurseSlice";


type Props = { nurseId: number };  //컴포넌트용 

const nurseDelete=({ nurseId }: Props) =>{
  const dispatch = useDispatch();  //훅이 없어서 일단 레이아웃쪽에 그냥 연결
    const router = useRouter();






  // ✅ 간호사 리듀스 슬라이스쪽 가져옴
  const {loading, deleteSuccess , error } = useSelector((state:RootState) => state.nurse);




// 컴포넌트 뜨면(마운트) 무조건 이 ID로 상세 조회
  useEffect(() => {
    if (nurseId) {
      dispatch(deleteNurseRequest(nurseId)); //디스패치 상세 리퀘스트랑 슬라이스 액션이 발동시킬려고 연결시켜놓음 (슬라이스 리퀘스트 넘버)
    }

  }, [dispatch, nurseId]);
  



  useEffect(() => {
    return () => {
      dispatch(deleteNurseSuccess());
    };
  }, [dispatch]);






   // ✅ 수정 성공 후 이동(원하면)
  useEffect(() => {
    if (!deleteSuccess) return;
    // 예: 수정 성공 후 뒤로가기 or 특정 페이지

    router.replace("/staff/nurse/join/list"); // ✅ 네 관리자 화면 라우트로
    dispatch(resetCreateSuccess()); 
}, [deleteSuccess, router , dispatch]);







   return (



    // <MainLayout requireAuth showSidebar={false}> //인증담당 지금은 걍뺌 
 <div style={{ maxWidth: 720, margin: "0 auto", padding: 16 }}>
      <h2 style={{ marginBottom: 8 }}>간호사 상세 (ID: {nurseId})</h2>

      <Box sx={{ maxWidth: 780, mx: "auto", px: { xs: 2, md: 0 } }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: 3,
            border: "1px solid #dbe5f5",
            bgcolor: "white",
            boxShadow: "0 14px 28px rgba(23, 52, 97, 0.15)",
          }}
        >

<div>
 <p>정말로 의사 정보를 삭제하시겠습니까?</p>
      {error && <p style={{ color: "red" }}>{error}</p>}

      
      <button  disabled={loading} style={{ marginRight: 8 }}>
        {loading ? "삭제 중..." : "삭제하기"}
      </button>
    
</div>


        </Paper>
      </Box>
    </div>
  
 
   );

}

export default nurseDelete;