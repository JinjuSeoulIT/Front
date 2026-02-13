import MainLayout from "@/components/layout/MainLayout";
import EmergencyReceptionList from "@/components/EmergencyReceptionList";

export default function EmergencyReceptionsCanceledPage() {
  return (
    <MainLayout>
      <EmergencyReceptionList initialSearchType="status" initialKeyword="CANCELED" autoSearch />
    </MainLayout>
  );
}