import MainLayout from "@/components/layout/MainLayout";
import NurseDelete from "@/components/employee/Dashboard/nurseDashboard/nurse/nurseDelete";

type Props = { params: Promise<{ id: string }> };

export default async function DeletePage({ params }: Props) {
  const { id } = await params;
  return (
    <MainLayout showSidebar={false}>
      <NurseDelete staffId={id} open={true} onClose={() => {}} />
    </MainLayout>
  );
}
  