
import DoctorDetail from "@/components/staff/doctorDashboard/doctor/DoctorDetail";
import MainLayout from "@/components/layout/MainLayout";

export default async function DetailPage({ params }: { params: Promise<{ doctorid: string }> }) {
  const { doctorid } = await params;
  return (
    <MainLayout showSidebar={false}>
      <DoctorDetail staffId={doctorid} />
    </MainLayout>
  );
}





