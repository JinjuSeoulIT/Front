import MainLayout from "@/components/layout/MainLayout";
import ReceptionCreate from "@/components/staff/receptionDashboard/reception/receptionCreate";

export default async function ReceptionCreatePage({ params }: { params: Promise<{ receptionid: string }> }) {
  const { receptionid } = await params;
  const receptionidNum = Number(receptionid);
  return (
    <MainLayout showSidebar={false}>
      <ReceptionCreate staffId={receptionidNum} />
    </MainLayout>
  );
}
