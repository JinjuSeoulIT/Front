import MainLayout from "@/components/layout/MainLayout";
import NurseEdit from "@/components/employee/Dashboard/nurseDashboard/nurse/nurseEdit";

type Props = { params: Promise<{ id: string }> };

export default async function EditPage({ params }: Props) {
  const { id } = await params;
  return (
    <MainLayout showSidebar={false}>
      <NurseEdit staffId={id} />
    </MainLayout>
  );
}
