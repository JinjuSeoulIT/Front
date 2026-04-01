import MainLayout from "@/components/layout/MainLayout";
import NurseDetail from "@/components/staff/nurseDashboard/nurse/nurseDetail";


export default async function DetailPage({ params }: { params: Promise<{ nurseid: string }> }) {
  const { nurseid } = await params;
  const nurseidNum = Number(nurseid);
  return (
    <MainLayout showSidebar={false}>
      <NurseDetail staffId={nurseidNum} />
    </MainLayout>
  );
}
