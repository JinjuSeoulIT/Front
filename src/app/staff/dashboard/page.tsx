"use client";

import { Typography } from "@mui/material";
import MedicalMainDashboard from "@/components/employee/Dashboard/MedicalDashboard/MedicalMainDashboard";
import MainLayout from "@/components/layout/MainLayout";

const MedicalDashboardPage = () => {
  return (
    <MainLayout showSidebar={true}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        의료진 대시보드
      </Typography>
      <MedicalMainDashboard />
    </MainLayout>
  );
};

export default MedicalDashboardPage;
