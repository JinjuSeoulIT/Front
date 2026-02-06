import Link from "next/link";
import { Box, Button, Stack, Typography } from "@mui/material";

const EmployeeListHeader = () => {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      justifyContent="space-between"
      alignItems={{ xs: "flex-start", sm: "center" }}
      gap={2}
      mb={3}
    >
      <Box>
        <Typography variant="h4" fontWeight={700}>
          직원 목록
        </Typography>
        <Typography color="text.secondary">
          전체 직원 정보를 조회하고 관리할 수 있습니다.
        </Typography>
      </Box>

      <Button component={Link} href="/employees/register" variant="contained">
        직원 등록
      </Button>
    </Stack>
  );
};

export default EmployeeListHeader;
