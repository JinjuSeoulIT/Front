import MainLayout from "@/components/layout/MainLayout";
import PositionDelete from "@/components/staff/BasiclnfoDashboard/position/PositionDelete";

export default async function PositionDeletePage({ params }: { params: Promise<{ positionid: string }> }) {
  const { positionid } = await params;
  const positionidNum = Number(positionid);

  return (
    <MainLayout showSidebar={false}>
      <PositionDelete positionId={positionidNum} />
    </MainLayout>
  );
}
