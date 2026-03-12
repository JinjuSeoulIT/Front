import MainLayout from "@/components/layout/MainLayout";
import NurseRecordEdit from "@/features/staff/nurse/ui/record/NurseRecordEdit";

 
const RecordEditPage = () => {
  return (
    <MainLayout showSidebar={false}>
      <NurseRecordEdit />
    </MainLayout>
  );
};

export default RecordEditPage;
