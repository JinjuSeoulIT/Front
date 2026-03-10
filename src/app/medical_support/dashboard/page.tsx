"use client";

import MainLayout from "@/components/layout/MainLayout";
import RecordDashboard from "@/components/record/RecordDashboard";
import { Typography } from "@mui/material";

const NursePage = () => {
  return (
    <MainLayout showSidebar={false}>
<Typography variant="h5" fontWeight="bold" gutterBottom> 
    진료 지원 대시보드</Typography>
      <RecordDashboard/>
    </MainLayout>
  );
};

export default NursePage;
