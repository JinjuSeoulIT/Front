import MainLayout from "@/components/layout/MainLayout";
import { Alert, Box } from "@mui/material";

export default function CreatePage() {
  return (
    <MainLayout showSidebar={false}>
      <Box sx={{ maxWidth: 780, mx: "auto", mt: 4 }}>
        <Alert severity="warning">공통 직원 상세에서 STAFF_ID를 선택한 뒤 간호사 등록으로 진입해주세요.</Alert>
      </Box>
    </MainLayout>
  );
}
