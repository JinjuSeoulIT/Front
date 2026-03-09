"use client";

import MainLayout from "@/components/layout/MainLayout";

import NurseList from "@/components/employee/Dashboard/employeeDashboard/nurseDashboard/NurseList";


const RecordPage = () => {
  return (
    <MainLayout showSidebar={false}>
      <NurseList />
    </MainLayout>
  );
};

export default RecordPage;
