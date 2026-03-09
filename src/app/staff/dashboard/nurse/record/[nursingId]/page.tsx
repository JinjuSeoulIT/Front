import MainLayout from "@/components/layout/MainLayout";
import RecordDetail from "@/components/employee/Dashboard/employeeDashboard/nurseDashboard/record/RecordDetail";

 

const RecordDetailPage = () => {
  return (
    <MainLayout showSidebar={false}>
      <RecordDetail />
    </MainLayout>
  );
};

export default RecordDetailPage;
