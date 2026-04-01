"use client";

import DoctorUpload from "@/components/staff/doctorDashboard/doctor/DoctorUpload";
import MainLayout from "@/components/layout/MainLayout";


export default async function UploadPage({ params }: { params: Promise<{ doctorid: string }> }) {
  const { doctorid } = await params;
  const doctoridNum = Number(doctorid);


 return (
  <MainLayout showSidebar={false}>
 <DoctorUpload staffId={doctoridNum} />
 </MainLayout>
  );

}






