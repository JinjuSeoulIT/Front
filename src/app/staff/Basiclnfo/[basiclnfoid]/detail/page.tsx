import MainLayout from "@/components/layout/MainLayout";
import BasicInfoDetail from "@/components/staff/BasiclnfoDashboard/Basiclnfo/BasiclnfoDetail";

export default async function StaffDetailPage({ params }: { params: Promise<{ basiclnfoid: string }> }) {
  const { basiclnfoid } = await params;
  const basiclnfoidNum = Number(basiclnfoid);
  const staffId = basiclnfoidNum;
  return (
    <MainLayout showSidebar={false}>
      <BasicInfoDetail staffId={staffId} />
    </MainLayout>
  );
}




// import DoctorDetail from "@/components/employee/Dashboard/doctorDashboard/doctor/DoctorDetail";
// import MainLayout from "@/components/layout/MainLayout";

// type Props = { params: Promise<{ id: string }> };


// export default async function DetailPage({ params }: { params: Promise<{ basiclnfoid: string }> }) {
//   const { basiclnfoid } = await params;
//   const doctorId = Number(id);
//   return (
//     <MainLayout showSidebar={false}>
//       <DoctorDetail doctorId={doctorId} />
//     </MainLayout>
//   );
// }





