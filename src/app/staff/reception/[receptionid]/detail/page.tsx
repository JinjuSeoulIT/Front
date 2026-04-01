import MainLayout from "@/components/layout/MainLayout";
import ReceptionDetail from "@/components/staff/receptionDashboard/reception/receptionDetail";

export default async function ReceptionDetailPage({ params }: { params: Promise<{ receptionid: string }> }) {
  const { receptionid } = await params;
  const receptionidNum = Number(receptionid);
  return (
    <MainLayout showSidebar={false}>
      <ReceptionDetail staffId={receptionidNum} />
    </MainLayout>
  );
}
