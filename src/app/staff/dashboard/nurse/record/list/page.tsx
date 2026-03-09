"use client";

import MainLayout from "@/components/layout/MainLayout";
import RecordList from "@/components/employee/Dashboard/employeeDashboard/nurseDashboard/record/RecordList";


const RecordPage = () => {
  return (
    <MainLayout showSidebar={false}>
      <RecordList />
    </MainLayout>
  );
};

export default RecordPage;
