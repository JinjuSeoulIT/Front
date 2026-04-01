import MainLayout from "@/components/layout/MainLayout";
import ReceptionDelete from "@/components/staff/receptionDashboard/reception/receptionDelete";

export default async function ReceptionDeletePage({ params }: { params: Promise<{ receptionid: string }> }) {
  const { receptionid } = await params;
  const receptionidNum = Number(receptionid);
  return (
    <MainLayout showSidebar={false}>
      <ReceptionDelete staffId={receptionidNum} open={true} onClose={() => {}} />
    </MainLayout>
  );
}
