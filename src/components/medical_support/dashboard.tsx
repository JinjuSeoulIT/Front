"use client"

import { useRouter } from "next/navigation";
import {
  Box,
  Card,
  CardContent,
  Typography
} from "@mui/material";



const Dashboard = () => {
 const menu = [{
    key: "record",
    label: "간호 기록",
    desc: "간호 기록 관리",
    path:"/medical_support/record/list",
    tone:"linear-gradient(135deg, rgba(23, 162, 142, 0.22), rgba(23, 162, 142, 0))",
  },
    {
    key: "testExecution",
    label: "검사 수행",
    desc: "검사 수행 관리",
    path:"/medical_support/testExecution/list",
    tone:"linear-gradient(135deg, rgba(23, 162, 142, 0.22), rgba(23, 162, 142, 0))",
  },
  {
    key: "imaging",
    label: "영상 검사",
    desc: "영상 검사 관리",
    path:"/medical_support/imaging",
    tone:"linear-gradient(135deg, rgba(23, 162, 142, 0.22), rgba(23, 162, 142, 0))",
  },
  {
    key: "specimen",
    label: "검체",
    desc: "검체 관리",
    path:"/medical_support/specimen/list",
    tone:"linear-gradient(135deg, rgba(23, 162, 142, 0.22), rgba(23, 162, 142, 0))",
  }
]

    const router = useRouter();
    return (
        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr 1fr",
              lg: "repeat(4, 1fr)",
            },
          }}>
          {menu.map((m) => (
            <Card
              key={m.key}
              sx={{
                borderRadius: 3,
                border: "1px solid var(--line)",
                cursor: "pointer",
                boxShadow: "var(--shadow-1)",
                background: m.tone }}
              onClick ={()=>{router.push(m.path)}}>
              <CardContent sx={{ p: 4 }}>
                <Box
                  sx={{
                    // width: 44,
                    // height: 44,
                    // borderRadius: 2,
                    bgcolor: "rgba(255,255,255,0.85)",
                    display: "grid",
                    placeItems: "center",
                    color: "var(--brand-strong)",
                    mb: 2}}>
                </Box>
                <Typography sx={{ fontWeight: 600, fontSize: 18 }}>
                  {m.label}
                </Typography>
                <Typography
                  sx={{ color: "var(--muted)", mt: 0.5, minHeight: 44 }}>
                  {m.desc}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>


    );
};

export default Dashboard;
