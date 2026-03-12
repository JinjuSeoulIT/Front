"use client";



import DoctorUpload from "@/components/employee/Dashboard/employeeDashboard/doctorDashboard/doctor/DoctorUpload";
import MainLayout from "@/components/layout/MainLayout";

type Props = { params: Promise<{ id: string }> };



export default async function UploadPage({ params }: Props) {
  const { id } = await params;
  const doctorId = Number(id);


 return (
  <MainLayout showSidebar={false}>
 <DoctorUpload doctorId={doctorId} />;
 </MainLayout>
  );

}






