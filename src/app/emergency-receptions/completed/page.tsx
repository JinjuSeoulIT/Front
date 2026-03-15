import MainLayout from "@/components/layout/MainLayout";
import EmergencyReceptionList from "@/components/EmergencyReceptionList";

export default function EmergencyReceptionsCompletedPage() {
  return (
    <MainLayout>
      <EmergencyReceptionList initialSearchType="status" initialKeyword="COMPLETED" autoSearch />
    </MainLayout>
  );
}