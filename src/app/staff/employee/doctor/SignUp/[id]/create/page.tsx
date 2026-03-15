import DoctorCreate from "@/components/employee/Dashboard/doctorDashboard/doctor/doctorCreate";
import MainLayout from "@/components/layout/MainLayout";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function CreatePage({ params }: Props) {
  const { id } = await params;

  return (
    <MainLayout showSidebar={false}>
      <DoctorCreate staffId={id} />
    </MainLayout>
  );
}