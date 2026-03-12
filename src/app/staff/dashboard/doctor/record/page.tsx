"use client";

import MainLayout from "@/components/layout/MainLayout";

import DoctorRecordWorkspace from "@/features/staff/doctor/ui/DoctorRecordWorkspace";


const RecordPage = () => {
  return (
    <MainLayout showSidebar={false}>
      <DoctorRecordWorkspace />
    </MainLayout>
  );
};

export default RecordPage;
