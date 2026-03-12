
import DoctorDetail from "@/components/employee/Dashboard/employeeDashboard/doctorDashboard/doctor/DoctorDetail";
import MainLayout from "@/components/layout/MainLayout";

type Props = { params: Promise<{ id: string }> };


export default async function DetailPage({ params }: Props) {
  const { id } = await params;
  const doctorId = Number(id);
  return (
    <MainLayout showSidebar={false}>
      <DoctorDetail doctorId={doctorId} />
    </MainLayout>
  );
}





