
import DoctorUpdate from "@/components/employee/Dashboard/doctorDashboard/doctor/doctorUpdate";
import MainLayout from "@/components/layout/MainLayout";
import { Props } from "@/features/employee/Staff/BasiclnfoType";

export default async function EditPage({ params }: Props) {
  const { id } = await params;

  return (
    <MainLayout showSidebar={false}>
      <DoctorUpdate staffId={id} />
    </MainLayout>
  );
}


