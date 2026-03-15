import MainLayout from "@/components/layout/MainLayout";
import BasicInfoDetail from "@/components/employee/Dashboard/BasiclnfoDashboard/Basiclnfo/BasiclnfoDetail";


type Props = { params: Promise<{ id: string }> };



export default async function StaffDetailPage({ params }: Props) {
  const { id } = await params;
  const staffId = id;
  return (
    <MainLayout showSidebar={false}>
      <BasicInfoDetail staffId={staffId} />
    </MainLayout>
  );
}




// import DoctorDetail from "@/components/employee/Dashboard/doctorDashboard/doctor/DoctorDetail";
// import MainLayout from "@/components/layout/MainLayout";

// type Props = { params: Promise<{ id: string }> };


// export default async function DetailPage({ params }: Props) {
//   const { id } = await params;
//   const doctorId = Number(id);
//   return (
//     <MainLayout showSidebar={false}>
//       <DoctorDetail doctorId={doctorId} />
//     </MainLayout>
//   );
// }





