import MainLayout from "@/components/layout/MainLayout";
import RecordCreate from "@/components/employee/Dashboard/employeeDashboard/nurseDashboard/record/RecordCreate";

 

const RecordCreatePage = () => {
  return (
    <MainLayout showSidebar={false}>
      <RecordCreate />
    </MainLayout>
  );
};

export default RecordCreatePage;
