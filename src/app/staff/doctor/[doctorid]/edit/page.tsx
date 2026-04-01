
import DoctorUpdate from "@/components/staff/doctorDashboard/doctor/doctorUpdate";
import MainLayout from "@/components/layout/MainLayout";

export default async function EditPage({ params }: { params: Promise<{ doctorid: string }> }) {
  const { doctorid } = await params;

  return (
    <MainLayout showSidebar={false}>
      <DoctorUpdate staffId={doctorid} />
    </MainLayout>
  );
}


