"use client";

import MainLayout from "@/components/layout/MainLayout";
import DoctorDashboard from "@/components/employee/Dashboard/doctorDashboard/DoctorDashboard";






const RecordPage = () => {
  return (
    <MainLayout showSidebar={false}>
      <DoctorDashboard />
    </MainLayout>
  );
};

export default RecordPage;
