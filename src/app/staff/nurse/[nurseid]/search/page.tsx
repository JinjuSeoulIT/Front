import NurseSearchBar from "@/components/staff/nurseDashboard/nurse/nurseSearchBar";
import MainLayout from "@/components/layout/MainLayout";

export default async function SearchPage({ params }: { params: Promise<{ nurseid: string }> }) {
  const { nurseid } = await params;
  const nurseidNum = Number(nurseid);

  return (
    <MainLayout showSidebar={false}>
      <NurseSearchBar staffId={nurseidNum} />
    </MainLayout>
  );
}


