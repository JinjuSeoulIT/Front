import MainLayout from "@/components/layout/MainLayout";
import RecordCreate from "@/components/nurserecord/RecordCreate";

 

const RecordCreatePage = () => {
  return (
    <MainLayout showSidebar={false}>
      <RecordCreate />
    </MainLayout>
  );
};

export default RecordCreatePage;
