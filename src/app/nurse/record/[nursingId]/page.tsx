import MainLayout from "@/components/layout/MainLayout";
import RecordDetail from "@/components/nurserecord/RecordDetail";

 

const RecordDetailPage = () => {
  return (
    <MainLayout showSidebar={false}>
      <RecordDetail />
    </MainLayout>
  );
};

export default RecordDetailPage;
