import MainLayout from "@/components/layout/MainLayout";
import BasicInfoUpdate from "@/components/staff/BasiclnfoDashboard/Basiclnfo/BasiclnfoUpdate";

export default async function StaffEditPage({ params }: { params: Promise<{ basiclnfoid: string }> }) {
  const { basiclnfoid } = await params;
  const basiclnfoidNum = Number(basiclnfoid);
  const staffId = basiclnfoidNum;
  
  return (
    <MainLayout showSidebar={false}>
      <BasicInfoUpdate staffId={staffId} />
    </MainLayout>
  );
}
