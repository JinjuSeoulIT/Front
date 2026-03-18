
import BasiclnfoDashboard from "@/components/employee/Dashboard/BasiclnfoDashboard/BasiclnfoDashboard";
import MainLayout from "@/components/layout/MainLayout";
import { Props } from "@/features/employee/Staff/BasiclnfoType";

export default async function BasiclnfoDashboardPage({ params }: Props) {
   const { id } = await params;
   
    return (
         <MainLayout showSidebar={false}>
    <BasiclnfoDashboard staffId={id}/>;
     </MainLayout>
    )
}



