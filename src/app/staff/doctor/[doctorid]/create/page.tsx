import DoctorCreate from "@/components/staff/doctorDashboard/doctor/doctorCreate";
import MainLayout from "@/components/layout/MainLayout";

export default async function CreatePage({ params }: { params: Promise<{ doctorid: string }> }) {
  const { doctorid } = await params;

  return (
    <MainLayout showSidebar={false}>
      <DoctorCreate staffId={doctorid} />
    </MainLayout>
  );
}