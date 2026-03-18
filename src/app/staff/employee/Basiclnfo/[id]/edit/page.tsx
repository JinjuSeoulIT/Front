import MainLayout from "@/components/layout/MainLayout";
import BasicInfoUpdate from "@/components/employee/Dashboard/BasiclnfoDashboard/Basiclnfo/BasiclnfoUpdate";
import { Props } from "@/features/employee/Staff/BasiclnfoType";

export default async function StaffEditPage({ params }: Props) {
  const { id } = await params;
  const staffId = id;
  
  return (
    <MainLayout showSidebar={false}>
      <BasicInfoUpdate staffId={staffId} />
    </MainLayout>
  );
}
