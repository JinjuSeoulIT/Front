import NurseDetail from "@/components/nurseJoin/nurseDetail";

type Props = { params: Promise<{ id: string }> };

export default async function EditPage({ params }: Props) {
  const { id } = await params;
  const nurseId = Number(id);
  return <NurseDetail nurseId={nurseId} />;
}