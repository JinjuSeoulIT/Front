import MainLayout from "@/components/layout/MainLayout";
import NurseRecordDetail from "@/features/staff/nurse/ui/record/NurseRecordDetail";

 

const RecordDetailPage = () => {
  return (
    <MainLayout showSidebar={false}>
      <NurseRecordDetail />
    </MainLayout>
  );
};

export default RecordDetailPage;
