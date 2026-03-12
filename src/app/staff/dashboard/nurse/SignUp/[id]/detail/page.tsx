import NurseSignUpDetail from "@/features/staff/nurse/ui/signup/NurseSignUpDetail";


type Props = { params: Promise<{ id: string }> };

export default async function EditPage({ params }: Props) {
  const { id } = await params;
  const nurseId = Number(id);
  return <NurseSignUpDetail nurseId={nurseId} />;
}
