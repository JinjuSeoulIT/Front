import MainLayout from "@/components/layout/MainLayout";
import NurseEdit from "@/components/staff/nurseDashboard/nurse/nurseEdit";

export default async function EditPage({ params }: { params: Promise<{ nurseid: string }> }) {
  const { nurseid } = await params;
  const nurseidNum = Number(nurseid);
  return (
    <MainLayout showSidebar={false}>
      <NurseEdit staffId={nurseidNum} />
    </MainLayout>
  );
}
