import MainLayout from "@/components/layout/MainLayout";
import ReservationList from "@/components/ReservationList";

export default function ReservationsCompletedPage() {
  return (
    <MainLayout>
      <ReservationList
        initialSearchType="status"
        initialKeyword="COMPLETED"
        autoSearch
        hideCanceled={false}
      />
    </MainLayout>
  );
}