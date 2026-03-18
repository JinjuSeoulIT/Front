import MainLayout from "@/components/layout/MainLayout";
import NurseDelete from "@/components/employee/Dashboard/nurseDashboard/nurse/nurseDelete";
import { Props } from "@/features/employee/Staff/BasiclnfoType";


export default async function DeletePage({ params }: Props) {
  const { id } = await params;
  return (
    <MainLayout showSidebar={false}>
      <NurseDelete staffId={id} open={true} onClose={() => {}} />
    </MainLayout>
  );
}
  