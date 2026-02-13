import MainLayout from "@/components/layout/MainLayout";
import InpatientReceptionList from "@/components/InpatientReceptionList";

export default function InpatientReceptionsDischargedPage() {
  return (
    <MainLayout>
      <InpatientReceptionList
        initialSearchType="status"
        initialKeyword="COMPLETED"
        autoSearch
      />
    </MainLayout>
  );
}