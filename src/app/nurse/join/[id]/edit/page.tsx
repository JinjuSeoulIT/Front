import NurseEdit from "@/components/nurseJoin/nurseEdit";

type Props = { params: Promise<{ id: string }> };

export default async function EditPage({ params }: Props) {
  const { id } = await params;
  const nurseId = Number(id);
  return <NurseEdit nurseId={nurseId} />;
}