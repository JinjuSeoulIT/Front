import MainLayout from "@/components/layout/MainLayout";
import BasiclnfoHub from "@/components/staff/BasiclnfoDashboard/BasiclnfoHub";

export default async function StaffBoardPage({ params }: { params: Promise<{ basiclnfoid: string }> }) {
  const { basiclnfoid } = await params;
  const basiclnfoidNum = Number(basiclnfoid);
  const staffId = basiclnfoidNum;

  return (
    <MainLayout showSidebar={false}>
      <BasiclnfoHub staffId={staffId} />
    </MainLayout>
  );
}
