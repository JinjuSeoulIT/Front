"use client";

import MainLayout from "@/components/layout/MainLayout";

import RecordSearchBar from "@/components/employee/Dashboard/employeeDashboard/doctorDashboard/record/RecordSearchBar";


const RecordPage = () => {
  return (
    <MainLayout showSidebar={false}>
      <RecordSearchBar/>
    </MainLayout>
  );
};

export default RecordPage;
