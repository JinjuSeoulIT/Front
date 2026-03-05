import NurseDelete from "@/components/nurseJoin/nurseDelete";

type Props = { params: Promise<{ id: string }> };

export default async function DeletePage({ params }: Props) {
  const { id } = await params;
  const nurseId = Number(id);
  return <NurseDelete nurseId={nurseId} />;
}