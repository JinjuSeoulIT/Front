"use client";


import DoctorCreate from "@/components/employee/Dashboard/employeeDashboard/doctorDashboard/doctor/doctorCreate";
import MainLayout from "@/components/layout/MainLayout";




export default function CreatePage() {
  return (
    <MainLayout showSidebar={true}>
      <DoctorCreate />
    </MainLayout>
  );
}
