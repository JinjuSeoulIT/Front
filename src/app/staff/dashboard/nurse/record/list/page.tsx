"use client";

import MainLayout from "@/components/layout/MainLayout";
import NurseRecordList from "@/features/staff/nurse/ui/record/NurseRecordList";


const RecordPage = () => {
  return (
    <MainLayout showSidebar={false}>
      <NurseRecordList />
    </MainLayout>
  );
};

export default RecordPage;
