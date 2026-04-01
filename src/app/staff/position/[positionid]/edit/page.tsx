import MainLayout from "@/components/layout/MainLayout";
import PositionUpdate from "@/components/staff/BasiclnfoDashboard/position/PositionUpdate";

export default async function PositionEditPage({ params }: { params: Promise<{ positionid: string }> }) {
  const { positionid } = await params;
  const positionidNum = Number(positionid);

  return (
    <MainLayout showSidebar={false}>
      <PositionUpdate positionId={positionidNum} />
    </MainLayout>
  );
}
