"use client";

import MainLayout from "@/components/layout/MainLayout";
import NurseCreate from "@/components/nurseJoin/nurseCreate";


// ✅ 초대코드 발급 화면
export default function CreatePage() {
  return (
    <MainLayout showSidebar={false}>
      <NurseCreate />
    </MainLayout>
  );
}
