import MainLayout from "@/components/layout/MainLayout";
import ReceptionList from "@/components/ReceptionList";

export default function ReceptionsCompletedPage() {
  return (
    <MainLayout>
      <ReceptionList initialSearchType="status" initialKeyword="COMPLETED" autoSearch />
    </MainLayout>
  );
}