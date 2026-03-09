"use client";

import MainLayout from "@/components/layout/MainLayout";
import NurseMain from "@/components/employee/Dashboard/employeeDashboard/nurseDashboard/nurse/nurseMain";

export default function ListPage() {
  return (
    <MainLayout showSidebar={true}>
      <NurseMain />
    </MainLayout>
  );
}