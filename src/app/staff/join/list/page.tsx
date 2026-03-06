"use client";

import MainLayout from "@/components/layout/MainLayout";
import NurseMain from "@/components/nurseJoin/nurseMain";

export default function CreatePage() {
  return (
    <MainLayout showSidebar={false}>
      <NurseMain />
    </MainLayout>
  );
}