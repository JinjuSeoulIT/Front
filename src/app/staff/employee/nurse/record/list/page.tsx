"use client";

import MainLayout from "@/components/layout/MainLayout";
import RecordList from "@/components/record/RecordList";
import RecordSearchBar from "@/components/record/RecordSearchBar";



const RecordPage = () => {
  return (
    <MainLayout showSidebar={false}>
      <RecordList />
    </MainLayout>
  );
};

export default RecordPage;
