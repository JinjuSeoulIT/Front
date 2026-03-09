"use client";

import MainLayout from "@/components/layout/MainLayout";


import DoctorList from "@/components/employee/Dashboard/employeeDashboard/doctorDashboard/DoctorList";


const RecordPage = () => {
  return (
    <MainLayout showSidebar={false}>
      <DoctorList />
    </MainLayout>
  );
};

export default RecordPage;
