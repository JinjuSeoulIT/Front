"use client";

import Link from "next/link";
import MainLayout from "@/components/layout/MainLayout";
import { Button, Card, CardContent, Divider, Paper, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";

const menus = [
  { title: "외래 접수", desc: "일반 접수 목록/처리", href: "/receptions" },
  { title: "응급 접수", desc: "응급 환자 접수 관리", href: "/emergency-receptions" },
  { title: "입원 접수", desc: "입원 접수/병실 배정", href: "/inpatient-receptions" },
  { title: "예약", desc: "예약 목록/처리", href: "/reservations" },
  { title: "접수 대시보드", desc: "일정/체크리스트", href: "/receptions/dashboard" },
];

export default function ReceptionHubPage() {
  return (
    <MainLayout>
      <Stack spacing={2.5}>
        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <Stack spacing={0.75}>
              <Typography variant="h5" fontWeight={900}>
                접수 메인
              </Typography>
              <Typography color="text.secondary" fontWeight={700}>
                접수 업무 영역으로 이동하세요.
              </Typography>
            </Stack>
          </CardContent>
        </Card>

        <Grid container spacing={2}>
          {menus.map((menu) => (
            <Grid key={menu.href} size={{ xs: 12, md: 6 }}>
              <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid var(--line)", boxShadow: "var(--shadow-1)" }}>
                <Stack spacing={1}>
                  <Typography fontWeight={900}>{menu.title}</Typography>
                  <Typography color="text.secondary" fontWeight={700}>
                    {menu.desc}
                  </Typography>
                  <Divider />
                  <Button variant="outlined" component={Link} href={menu.href}>
                    이동
                  </Button>
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Stack>
    </MainLayout>
  );
}