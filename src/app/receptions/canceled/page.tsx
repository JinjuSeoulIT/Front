import MainLayout from "@/components/layout/MainLayout";
import ReceptionList from "@/components/ReceptionList";

export default function ReceptionsCanceledPage() {
  return (
    <MainLayout>
      <ReceptionList initialSearchType="status" initialKeyword="CANCELED" autoSearch />
    </MainLayout>
  );
}