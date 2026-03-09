"use client";

import { useRouter } from "next/navigation";
import { Button, Card, CardContent, Divider, Stack, Typography } from "@mui/material";

const menus = [
  { title: "의사 데시보드", path: "/staff/dashboard/doctor" },
  { title: "간호 데시보드", path: "/staff/dashboard/nurse" },


];


const EmployeeCommonDashboard = () => {
  const router = useRouter();

  return (
    <Card sx={{ borderRadius: 3, minHeight: 320 }}>
      <CardContent>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          직원 메뉴
        </Typography>

        <Divider sx={{ mb: 2 }} />

        <Stack spacing={1.5}>
          {menus.map((menu) => (
            <Button
              key={menu.title}
              variant="contained"
              onClick={() => router.push(menu.path)}
              sx={{ justifyContent: "flex-start", py: 1.2 }}
            >
              {menu.title}
            </Button>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default EmployeeCommonDashboard;
