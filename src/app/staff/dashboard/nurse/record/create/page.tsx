import MainLayout from "@/components/layout/MainLayout";
import NurseRecordCreate from "@/features/staff/nurse/ui/record/NurseRecordCreate";

 

const RecordCreatePage = () => {
  return (
    <MainLayout showSidebar={false}>
      <NurseRecordCreate />
    </MainLayout>
  );
};

export default RecordCreatePage;
