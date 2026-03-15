import MainLayout from "@/components/layout/MainLayout";
import BasicInfoDelete from "@/components/employee/Dashboard/BasiclnfoDashboard/Basiclnfo/BasiclnfoDelete";


type Props = { params: Promise<{ id: string }> };




export default async function StaffDeletePage({ params }: Props) {
  const { id } = await params;
  const staffId = id;
  
  return (
    <MainLayout showSidebar={false}>
      <BasicInfoDelete staffId={staffId} />
    </MainLayout>
  );
}