import NurseCreate from "@/components/employee/Dashboard/nurseDashboard/nurse/nurseCreate";
import MainLayout from "@/components/layout/MainLayout";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function CreatePage({ params }: Props) {
  const { id } = await params;

  return (
    <MainLayout showSidebar={false}>
      <NurseCreate staffId={id} />
    </MainLayout>
  );
}
