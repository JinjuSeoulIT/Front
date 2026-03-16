
import DoctorDelete from "@/components/employee/Dashboard/doctorDashboard/doctor/doctorDelete";
import MainLayout from "@/components/layout/MainLayout";
import { Props } from "@/features/employee/Staff/BasiclnfoType";

export default async function DeletePage({ params }: Props) {
  const { id } = await params;

  return (
    <MainLayout showSidebar={false}>
      <DoctorDelete staffId={id} open={true} onClose={() => {}}/>
    </MainLayout>
  );
}




