import MainLayout from "@/components/layout/MainLayout";

import NurseSignUpEdit from "@/features/staff/nurse/ui/signup/NurseSignUpEdit";
type Props = { params: Promise<{ id: string }> };

export default async function EditPage({ params }: Props) {
  const { id } = await params;
  const nurseId = Number(id);
    return (
  <MainLayout showSidebar={false}>
  <NurseSignUpEdit nurseId={nurseId} />
  </MainLayout>
      );
}
