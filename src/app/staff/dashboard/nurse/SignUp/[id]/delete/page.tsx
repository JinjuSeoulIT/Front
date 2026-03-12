import NurseSignUpDelete from "@/features/staff/nurse/ui/signup/NurseSignUpDelete";

type Props = { params: Promise<{ id: string }> };

export default async function DeletePage({ params }: Props) {
  const { id } = await params;
  const nurseId = Number(id);
  return <NurseSignUpDelete nurseId={nurseId} />;
}
