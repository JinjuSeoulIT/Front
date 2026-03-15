import MainLayout from "@/components/layout/MainLayout";
import RecordEdit from "@/components/nurserecord/RecordEdit";

 
const RecordEditPage = () => {
  return (
    <MainLayout showSidebar={false}>
      <RecordEdit />
    </MainLayout>
  );
};

export default RecordEditPage;
