"use client";

;
import NurseList from "@/components/employee/Dashboard/nurseDashboard/nurse/NurseList";
import MainLayout from "@/components/layout/MainLayout";



export default function ListPage() {
  return (
    <MainLayout showSidebar={true}>
      <NurseList />
    </MainLayout>
  );
}
