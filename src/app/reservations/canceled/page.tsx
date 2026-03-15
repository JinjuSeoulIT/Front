import MainLayout from "@/components/layout/MainLayout";
import ReservationList from "@/components/ReservationList";

export default function CanceledReservationsPage() {
  return (
    <MainLayout>
      <ReservationList
        initialSearchType="status"
        initialKeyword="CANCELED"
        autoSearch
        hideCanceled={false}
      />
    </MainLayout>
  );
}
