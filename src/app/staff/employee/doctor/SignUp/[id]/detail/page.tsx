
import DoctorDetail from "@/components/employee/Dashboard/doctorDashboard/doctor/DoctorDetail";
import MainLayout from "@/components/layout/MainLayout";
import { Props } from "@/features/employee/Staff/BasiclnfoType";

export default async function DetailPage({ params }: Props) {
  const { id } = await params;
  return (
    <MainLayout showSidebar={false}>
      <DoctorDetail staffId={id} />
    </MainLayout>
  );
}





