import MainLayout from "@/components/layout/MainLayout";
import NurseDelete from "@/components/staff/nurseDashboard/nurse/nurseDelete";


export default async function DeletePage({ params }: { params: Promise<{ nurseid: string }> }) {
  const { nurseid } = await params;
  const nurseidNum = Number(nurseid);
  return (
    <MainLayout showSidebar={false}>
      <NurseDelete staffId={nurseidNum} open={true} onClose={() => {}} />
    </MainLayout>
  );
}
  