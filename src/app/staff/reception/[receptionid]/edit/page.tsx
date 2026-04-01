import MainLayout from "@/components/layout/MainLayout";
import ReceptionEdit from "@/components/staff/receptionDashboard/reception/receptionEdit";

export default async function ReceptionEditPage({ params }: { params: Promise<{ receptionid: string }> }) {
  const { receptionid } = await params;
  const receptionidNum = Number(receptionid);
  return (
    <MainLayout showSidebar={false}>
      <ReceptionEdit staffId={receptionidNum} />
    </MainLayout>
  );
}
