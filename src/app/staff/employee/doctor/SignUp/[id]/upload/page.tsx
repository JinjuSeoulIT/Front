"use client";




import DoctorUpload from "@/components/employee/Dashboard/doctorDashboard/doctor/DoctorUpload";
import MainLayout from "@/components/layout/MainLayout";

type Props = { params: Promise<{ id: string }> };



export default async function UploadPage({ params }: Props) {
  const { id } = await params;


 return (
  <MainLayout showSidebar={false}>
 <DoctorUpload staffId={id} />
 </MainLayout>
  );

}






