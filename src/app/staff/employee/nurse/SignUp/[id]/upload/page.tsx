import NnurseUpload from "@/components/employee/Dashboard/nurseDashboard/nurse/nurseUpload";
import MainLayout from "@/components/layout/MainLayout";

type Props = { params: Promise<{ id: string }> };

export default async function UploadPage({ params }: Props) {
  const { id } = await params;
  return (
    <MainLayout showSidebar={false}>
      <NnurseUpload staffId={id} />
    </MainLayout>
  );
}
