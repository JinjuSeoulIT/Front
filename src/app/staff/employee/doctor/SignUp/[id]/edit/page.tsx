
import DoctorUpdate from "@/components/employee/Dashboard/doctorDashboard/doctor/doctorUpdate";
import MainLayout from "@/components/layout/MainLayout";

type Props = { params: Promise<{ id: string }> };


export default async function EditPage({ params }: Props) {
  const { id } = await params;

  return (
    <MainLayout showSidebar={false}>
      <DoctorUpdate staffId={id} />
    </MainLayout>
  );
}


