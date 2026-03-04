import MainLayout from "@/components/layout/MainLayout";
import RecordCreate from "@/components/record/RecordCreate";
import RecordDetail from "@/components/record/RecordDetail";

 

const RecordDetailPage = () => {
  return (
    <MainLayout showSidebar={false}>
      <RecordDetail />
    </MainLayout>
  );
};

export default RecordDetailPage;
