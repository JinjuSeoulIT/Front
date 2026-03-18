"use client";

import DoctorUpload from "@/components/employee/Dashboard/doctorDashboard/doctor/DoctorUpload";
import MainLayout from "@/components/layout/MainLayout";
import { Props } from "@/features/employee/Staff/BasiclnfoType";


export default async function UploadPage({ params }: Props) {
  const { id } = await params;


 return (
  <MainLayout showSidebar={false}>
 <DoctorUpload staffId={id} />
 </MainLayout>
  );

}






