import MainLayout from "@/components/layout/MainLayout";
import BasicInfoDelete from "@/components/staff/BasiclnfoDashboard/Basiclnfo/BasiclnfoDelete";

export default async function StaffDeletePage({ params }: { params: Promise<{ basiclnfoid: string }> }) {
  const { basiclnfoid } = await params;
  const basiclnfoidNum = Number(basiclnfoid);
  
  return (
    <MainLayout showSidebar={false}>
      <BasicInfoDelete staffId={basiclnfoidNum} open={true} onClose={() => {}} />
    </MainLayout>
  );
}