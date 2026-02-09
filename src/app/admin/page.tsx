"use client";

import MainLayout from "@/components/layout/MainLayout";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
  Button,
  LinearProgress,
} from "@mui/material";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";

const KPI = [
  { label: "일일 방문", value: "1,248", unit: "건" },
  { label: "평균 대기", value: "18", unit: "분" },
  { label: "보험 반려", value: "6", unit: "건" },
  { label: "병상 가동률", value: "87", unit: "%" },
];

const COMPLIANCE = [
  { label: "의무기록 미서명", value: 12, total: 40 },
  { label: "권한 변경 요청", value: 7, total: 20 },
  { label: "감사 로그 검토", value: 4, total: 12 },
];

export default function AdminPage() {
  return (
    <MainLayout>
      <Stack spacing={3}>
        <Card
          sx={{
            borderRadius: 3,
            border: "1px solid var(--line)",
            boxShadow: "var(--shadow-1)",
            background:
              "linear-gradient(120deg, rgba(75, 85, 99, 0.2) 0%, rgba(75, 85, 99, 0) 55%)",
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="center">
              <Stack spacing={0.5} sx={{ flexGrow: 1 }}>
                <Typography sx={{ fontSize: 22, fontWeight: 900 }}>
                  관리자 대시보드
                </Typography>
                <Typography sx={{ color: "var(--muted)" }}>
                  운영 KPI와 보안/감사 상태를 한눈에 확인합니다.
                </Typography>
              </Stack>
              <Button variant="contained" sx={{ bgcolor: "#4b5563" }}>
                리포트 내보내기
              </Button>
            </Stack>
          </CardContent>
        </Card>

        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: { xs: "1fr", md: "repeat(4, 1fr)" },
          }}
        >
          {KPI.map((item) => (
            <Card key={item.label} sx={{ borderRadius: 3, border: "1px solid var(--line)" }}>
              <CardContent sx={{ p: 2.5 }}>
                <Typography sx={{ color: "var(--muted)", fontSize: 13 }}>
                  {item.label}
                </Typography>
                <Typography sx={{ fontWeight: 800, fontSize: 22 }}>
                  {item.value}
                  <Box component="span" sx={{ fontSize: 12, ml: 0.5 }}>
                    {item.unit}
                  </Box>
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>

        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: { xs: "1fr", md: "1.2fr 1fr" },
          }}
        >
          <Card sx={{ borderRadius: 3, border: "1px solid var(--line)" }}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <InsightsOutlinedIcon sx={{ color: "var(--brand)" }} />
                <Typography fontWeight={800}>운영 지표</Typography>
              </Stack>
              <Stack spacing={2} sx={{ mt: 2 }}>
                {COMPLIANCE.map((item) => {
                  const pct = Math.round((item.value / item.total) * 100);
                  return (
                    <Box key={item.label}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography sx={{ color: "var(--muted)", fontSize: 13 }}>
                          {item.label}
                        </Typography>
                        <Typography sx={{ fontWeight: 700, fontSize: 13 }}>
                          {item.value}/{item.total}
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={pct}
                        sx={{
                          mt: 1,
                          height: 8,
                          borderRadius: 999,
                          bgcolor: "rgba(11, 91, 143, 0.12)",
                          "& .MuiLinearProgress-bar": {
                            borderRadius: 999,
                            bgcolor: "var(--brand)",
                          },
                        }}
                      />
                    </Box>
                  );
                })}
              </Stack>
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: 3, border: "1px solid var(--line)" }}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <SecurityOutlinedIcon sx={{ color: "var(--accent)" }} />
                <Typography fontWeight={800}>보안 / 감사</Typography>
              </Stack>
              <Stack spacing={1.25} sx={{ mt: 2 }}>
                {[
                  { label: "권한 변경 승인", tag: "승인 필요" },
                  { label: "접속 로그 점검", tag: "오늘" },
                  { label: "개인정보 마스킹", tag: "설정" },
                ].map((item) => (
                  <Box
                    key={item.label}
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      border: "1px solid var(--line)",
                      display: "flex",
                      justifyContent: "space-between",
                      bgcolor: "rgba(255,255,255,0.7)",
                    }}
                  >
                    <Typography fontWeight={700}>{item.label}</Typography>
                    <Chip label={item.tag} size="small" />
                  </Box>
                ))}
              </Stack>
              <Button
                variant="outlined"
                sx={{ mt: 2 }}
                startIcon={<AdminPanelSettingsOutlinedIcon />}
              >
                권한 관리
              </Button>
            </CardContent>
          </Card>
        </Box>
      </Stack>
    </MainLayout>
  );
}
