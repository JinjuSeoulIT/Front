import MainLayout from "@/components/layout/MainLayout";
import BasicInfoDelete from "@/components/employee/Dashboard/BasiclnfoDashboard/Basiclnfo/BasiclnfoDelete";
import { Props } from "@/features/employee/Staff/BasiclnfoType";

export default async function StaffDeletePage({ params }: Props) {
  const { id } = await params;
  
  return (
    <MainLayout showSidebar={false}>
      <BasicInfoDelete staffId={id} open={true} onClose={() => {}} />
    </MainLayout>
  );
}