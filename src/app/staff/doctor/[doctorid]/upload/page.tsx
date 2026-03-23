"use client";

import DoctorUpload from "@/components/staff/doctorDashboard/doctor/DoctorUpload";
import MainLayout from "@/components/layout/MainLayout";


export default async function UploadPage({ params }: { params: Promise<{ doctorid: string }> }) {
  const { doctorid } = await params;


 return (
  <MainLayout showSidebar={false}>
 <DoctorUpload staffId={doctorid} />
 </MainLayout>
  );

}






