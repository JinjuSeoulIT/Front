import MainLayout from "@/components/layout/MainLayout";
import NurseEdit from "@/components/nurseJoin/nurseEdit";

type Props = { params: Promise<{ id: string }> };

export default async function EditPage({ params }: Props) {
  const { id } = await params;
  const nurseId = Number(id);
    return (
       <MainLayout showSidebar={false}>
  <NurseEdit nurseId={nurseId} />;
  </MainLayout>
      );
}