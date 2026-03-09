import MainLayout from "@/components/layout/MainLayout";
import RecordEdit from "@/components/employee/Dashboard/employeeDashboard/nurseDashboard/record/RecordEdit";

 
const RecordEditPage = () => {
  return (
    <MainLayout showSidebar={false}>
      <RecordEdit />
    </MainLayout>
  );
};

export default RecordEditPage;
