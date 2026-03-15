"use client";

import MainLayout from "@/components/layout/MainLayout";
import NurseList from "@/components/employee/Dashboard/nurseDashboard/nurse/nurseList";


export default function ListPage() {
  return (
    <MainLayout showSidebar={true}>
      <NurseList />
    </MainLayout>
  );
}
