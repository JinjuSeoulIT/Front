"use client";

import MainLayout from "@/components/layout/MainLayout";
import RecordDashboard from "@/components/record/RecordDashboard";
import { Typography } from "@mui/material";

const NursePage = () => {
  return (
    <MainLayout showSidebar={false}>
<Typography variant="h5" fontWeight="bold" gutterBottom> 간호 대시보드</Typography>
      <RecordDashboard/>
    </MainLayout>
  );
};

export default NursePage;
