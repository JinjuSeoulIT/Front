import MainLayout from "@/components/layout/MainLayout";
import ReceptionSearchBar from "@/components/staff/receptionDashboard/reception/receptionSearchBar";

export default async function ReceptionSearchPage({ params }: { params: Promise<{ receptionid: string }> }) {
  const { receptionid } = await params;
  const receptionidNum = Number(receptionid);
  return (
    <MainLayout showSidebar={false}>
      <ReceptionSearchBar staffId={receptionidNum} />
    </MainLayout>
  );
}
