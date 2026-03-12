"use client";


import NnurseUpload from "@/components/employee/Dashboard/employeeDashboard/nurseDashboard/nurse/nurseUpload";
import MainLayout from "@/components/layout/MainLayout";

type Props = { params: Promise<{ id: string }> };



export default async function UploadPage({ params }: Props) {
  const { id } = await params;
  const nurseId = Number(id);


 return (
  <MainLayout showSidebar={false}>
 <NnurseUpload nurseId={nurseId} />;
 </MainLayout>
  );

}






