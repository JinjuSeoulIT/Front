import MainLayout from "@/components/layout/MainLayout";
import BasicInfoDelete from "@/components/staff/BasiclnfoDashboard/Basiclnfo/BasiclnfoDelete";

export default async function StaffDeletePage({ params }: { params: Promise<{ basiclnfoid: string }> }) {
  const { basiclnfoid } = await params;
  
  return (
    <MainLayout showSidebar={false}>
      <BasicInfoDelete staffId={basiclnfoid} open={true} onClose={() => {}} />
    </MainLayout>
  );
}