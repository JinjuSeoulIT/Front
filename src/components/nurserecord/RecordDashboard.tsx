"use client"

import { Button } from "@mui/material";
import { Stack } from "@mui/system";
import { useRouter } from "next/navigation";




const RecordDashboard = () => {

    const menu =[
        {name:"간호 기록" , path:"/nurse/record/list"},
        {name:"검체 관리" , path:"/nurse/specimen"},
        {name:"영상 검사 관리" , path:"/nurse/imaging"},


        
        {name:"간호사 가입" , path:"/nurse/join/create"},
        {name:"간호사 정보" , path:"/nurse/join/detail"},
        {name:"간호사 수정" , path:"/nurse/join/edit"},
        {name:"간호사 삭제" , path:"/nurse/join/delete"},
        {name:"간호사 리스트 " , path:"/nurse/join/list"},
    ]

    const router = useRouter();


    return (
        
<Stack
  direction={{ xs: 'column', sm: 'row' }}
  spacing={{ xs: 10, sm: 10, md: 10 }}
>
    {menu.map((m)=>
    <Button variant="outlined" size="large" onClick={()=>{router.push(m.path)}} key={m.path}>
        {m.name}</Button>)}
</Stack>

    );
};

export default RecordDashboard;