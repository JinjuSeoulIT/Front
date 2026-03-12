"use client";

import MainLayout from "@/components/layout/MainLayout";
import NurseDashboard from "@/components/employee/Dashboard/employeeDashboard/nurseDashboard/NurseDashboard";



const RecordPage = () => {
  return (
    <MainLayout showSidebar={false}>
      <NurseDashboard />
    </MainLayout>
  );
};

export default RecordPage;
