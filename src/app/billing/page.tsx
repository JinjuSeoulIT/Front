"use client";

import MainLayout from "@/components/layout/MainLayout";
import { Box, Card, CardContent, Stack, Typography } from "@mui/material";
import MonetizationOnOutlinedIcon from "@mui/icons-material/MonetizationOnOutlined";

export default function BillingPage() {
  return (
    <MainLayout>
      <Box sx={{ display: "grid", gap: 2 }}>
        <Card
          sx={{
            borderRadius: 3,
            border: "1px solid var(--line)",
            boxShadow: "var(--shadow-1)",
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  display: "grid",
                  placeItems: "center",
                  bgcolor: "rgba(245, 158, 11, 0.14)",
                  color: "#b45309",
                }}
              >
                <MonetizationOnOutlinedIcon />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 800, fontSize: 20 }}>
                  수납 대시보드
                </Typography>
                <Typography sx={{ color: "var(--muted)", fontSize: 14 }}>
                  수납/결제/보험 처리를 여기서 관리합니다.
                </Typography>
              </Box>
            </Stack>
<<<<<<< HEAD
            <Typography sx={{ color: "var(--muted)" }}>
              기능을 추가할 영역입니다.
            </Typography>
=======

            {loading && <Typography>로딩 중...</Typography>}
            {error && <Typography color="error">{error}</Typography>}

            {billingStats && (
              <>
                <Typography sx={{ fontWeight: 600, mb: 1 }}>
                  청구 상태
                </Typography>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                    gap: 2,
                    mb: 3,
                  }}
                >
                  <StatCard
                    icon={<HourglassEmptyIcon />}
                    title="READY"
                    value={billingStats.readyCount}
                    onClick={() => router.push("/billing/list?status=READY")}
                  />
                  
                  <StatCard
                    icon={<SyncIcon />}
                    title="CONFIRMED"
                    value={billingStats.confirmedCount}
                     onClick={() => router.push("/billing/list?status=CONFIRMED")}
                  />
                  <StatCard
                    icon={<CheckCircleIcon />}
                    title="PAID"
                    value={billingStats.paidCount}
                     onClick={() => router.push("/billing/list?status=PAID")}
                  />
                    <StatCard
                      icon={<AccountBalanceWalletIcon />}
                      title="미수금"
                      value=" "
                      onClick={() => router.push("/billing/outstanding")}
                    />

                </Box>

                <Divider sx={{ mb: 3 }} />

                <Typography sx={{ fontWeight: 700, mb: 1 }}>
                  오늘 수납 흐름
                </Typography>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                    gap: 2,
                    mb: 3,
                  }}
                >
                  <StatCard
                    icon={<TrendingUpIcon />}
                    title="오늘 결제"
                    value={`${billingStats.todayCompletedAmount.toLocaleString()} 원`}
                    color="#1976d2"
                  />
                  <StatCard
                    icon={<TrendingDownIcon />}
                    title="오늘 환불"
                    value={`${billingStats.todayRefundedAmount.toLocaleString()} 원`}
                    color="#d32f2f"
                  />
                  <StatCard
                    icon={<AccountBalanceWalletIcon />}
                    title="오늘 순수납"
                    value={`${billingStats.todayNetAmount.toLocaleString()} 원`}
                    highlight
                  />
                </Box>

                <Divider sx={{ mb: 3 }} />

                <Typography sx={{ fontWeight: 700, mb: 1 }}>
                  누적 수납 흐름
                </Typography>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                    gap: 2,
                  }}
                >
                  <StatCard
                    icon={<TrendingUpIcon />}
                    title="총 결제"
                    value={`${billingStats.totalCompletedAmount.toLocaleString()} 원`}
                    color="#1976d2"
                  />
                  <StatCard
                    icon={<TrendingDownIcon />}
                    title="총 환불"
                    value={`${billingStats.totalRefundedAmount.toLocaleString()} 원`}
                    color="#d32f2f"
                  />
                  <StatCard
                    icon={<AccountBalanceWalletIcon />}
                    title="총 순수납"
                    value={`${billingStats.totalNetAmount.toLocaleString()} 원`}
                    highlight
                  />
                </Box>
              </>
            )}
>>>>>>> feature/billing
          </CardContent>
        </Card>
      </Box>
    </MainLayout>
  );
}
<<<<<<< HEAD
=======

function StatCard({
  icon,
  title,
  value,
  highlight = false,
  color,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  highlight?: boolean;
  color?: string;
  onClick?: () => void;
}) {
  return (
    <Card
      onClick={onClick}
      sx={{
        cursor: onClick ? "pointer" : "default",
        borderRadius: 3,
        p: 1.5,
        height: "100%",
        background: highlight
          ? "linear-gradient(135deg, #e8f5e9, #c8e6c9)"
          : "white",

        border: highlight
          ? "2px solid #2e7d32"
          : "1px solid rgba(0,0,0,0.08)",

        transition: "all 0.25s ease",

        "&:hover": {
          transform: "translateY(-6px) scale(1.02)",
          boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
        },
      }}
    >
      <CardContent>
        <Stack direction="row" spacing={1} alignItems="center">
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              display: "grid",
              placeItems: "center",
              backgroundColor: "rgba(0,0,0,0.05)",
            }}
          >
            {icon}
          </Box>

          <Typography
            variant="subtitle2"
            sx={{ color: "rgba(0,0,0,0.6)", fontWeight: 600 }}
          >
            {title}
          </Typography>
        </Stack>

        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            mt: 2,
            color: highlight ? "#1b5e20" : color || "inherit",
          }}
        >
          {value}
        </Typography>

        <Typography
          sx={{
            fontSize: 12,
            mt: 1,
            color: "rgba(0,0,0,0.4)",
          }}
        >
          {title} 상태
        </Typography>
      </CardContent>
    </Card>
  );
}
>>>>>>> feature/billing
