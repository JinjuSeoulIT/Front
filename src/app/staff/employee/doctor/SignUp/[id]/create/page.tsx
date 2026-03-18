import DoctorCreate from "@/components/employee/Dashboard/doctorDashboard/doctor/doctorCreate";
import MainLayout from "@/components/layout/MainLayout";
import { Props } from "@/features/employee/Staff/BasiclnfoType";

export default async function CreatePage({ params }: Props) {
  const { id } = await params;

  return (
    <MainLayout showSidebar={false}>
      <DoctorCreate staffId={id} />
    </MainLayout>
  );
}