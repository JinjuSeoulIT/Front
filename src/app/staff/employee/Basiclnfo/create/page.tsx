import MainLayout from "@/components/layout/MainLayout";
import BasicInfoCreate from "@/components/employee/Dashboard/BasiclnfoDashboard/Basiclnfo/BasiclnfoCreate";

export default function StaffCreatePage() {
  return (
    <MainLayout showSidebar={false}>
      <BasicInfoCreate />
    </MainLayout>
  );
}
