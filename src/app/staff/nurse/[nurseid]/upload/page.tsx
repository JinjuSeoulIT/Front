import NnurseUpload from "@/components/staff/nurseDashboard/nurse/nurseUpload";
import MainLayout from "@/components/layout/MainLayout";


export default async function UploadPage({ params }: { params: Promise<{ nurseid: string }> }) {
  const { nurseid } = await params;
  const nurseidNum = Number(nurseid);
  return (
    <MainLayout showSidebar={false}>
      <NnurseUpload staffId={nurseidNum} />
    </MainLayout>
  );
}
