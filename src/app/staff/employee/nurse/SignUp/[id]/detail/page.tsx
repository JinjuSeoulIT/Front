import MainLayout from "@/components/layout/MainLayout";
import NurseDetail from "@/components/employee/Dashboard/nurseDashboard/nurse/nurseDetail";
import { Props } from "@/features/employee/Staff/BasiclnfoType";


export default async function DetailPage({ params }: Props) {
  const { id } = await params;
  return (
    <MainLayout showSidebar={false}>
      <NurseDetail staffId={id} />
    </MainLayout>
  );
}
