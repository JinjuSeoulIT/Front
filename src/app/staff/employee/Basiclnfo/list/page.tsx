import MainLayout from "@/components/layout/MainLayout";
import BasicInfoList from "@/components/employee/Dashboard/BasiclnfoDashboard/Basiclnfo/BasiclnfoList";

export default function StaffListPage() {
  return (
    <MainLayout showSidebar={false}>
      <BasicInfoList />
    </MainLayout>
  );
}
