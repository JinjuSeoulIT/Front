
import DoctorUpdate from "@/components/employee/Dashboard/employeeDashboard/doctorDashboard/doctor/doctorUpdate";
import MainLayout from "@/components/layout/MainLayout";

type Props = { params: Promise<{ id: string }> };


export default async function EditPage({ params }: Props) {
  const { id } = await params;
  const doctorId = Number(id);

  return (
    <MainLayout showSidebar={false}>
      <DoctorUpdate doctorId={doctorId} />
    </MainLayout>
  );
}


