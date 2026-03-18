import NurseSearchBar from "@/components/employee/Dashboard/nurseDashboard/nurse/nurseSearchBar";
import MainLayout from "@/components/layout/MainLayout";
import { Props } from "@/features/employee/Staff/BasiclnfoType";

export default async function SearchPage({ params }: Props) {
  const { id } = await params;

  return (
    <MainLayout showSidebar={false}>
      <NurseSearchBar staffId={id} />
    </MainLayout>
  );
}


