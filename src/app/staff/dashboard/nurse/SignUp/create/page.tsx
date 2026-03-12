"use client";

import NurseCreate from "@/components/employee/Dashboard/employeeDashboard/nurseDashboard/nurse/nurseCreate";
import MainLayout from "@/components/layout/MainLayout";



// ✅ 초대코드 발급 화면
export default function CreatePage() {
      return (
        <MainLayout showSidebar={false}>
 <NurseCreate />
  </MainLayout>
    );
}
