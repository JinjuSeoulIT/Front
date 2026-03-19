"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/store/store";

import MainLayout from "@/components/layout/MainLayout";
import {
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
  Divider,
  CircularProgress, 
} from "@mui/material";

import MonetizationOnOutlinedIcon from "@mui/icons-material/MonetizationOnOutlined";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import SyncIcon from "@mui/icons-material/Sync";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";

import { fetchBillingStatsRequest } from "@/features/billing/billingSlice";

export default function BillingPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const { billingStats, loading, error } = useSelector(
    (state: RootState) => state.billing
  );

  // 환불 비율 계산
  const refundRate =
    billingStats && billingStats.totalCompletedAmount > 0
      ? Math.round(
          (billingStats.totalRefundedAmount /
            billingStats.totalCompletedAmount) *
            100
        )
      : 0;

  useEffect(() => {
    dispatch(fetchBillingStatsRequest());
  }, [dispatch]);

  return (
    <MainLayout>
      <Box sx={{ display: "grid", gap: 3 }}>

       {billingStats && (
          <Card
            sx={{
              borderRadius: 3,
              background: "linear-gradient(135deg, #1e3c72, #2a5298)",
              color: "white",
              boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
            }}
          >
            <CardContent>
              <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>
                현재 총 순수납 (Net Revenue)
              </Typography>

              <Stack direction="row" alignItems="center" spacing={1} mt={1}>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>
                  {billingStats.totalNetAmount.toLocaleString()} 원
                </Typography>
              </Stack>

              <Typography sx={{ opacity: 0.85, mt: 1, fontSize: 14 }}>
                결제 금액에서 환불 금액을 차감한 실제 병원 매출 기준입니다.
              </Typography>


               {/* 환불 비율 도넛 */}
              <Box sx={{ mt: 3, display: "flex", alignItems: "center", gap: 3 }}>
                <Box sx={{ position: "relative", display: "inline-flex" }}>
                  <CircularProgress
                    variant="determinate"
                    value={100}
                    size={80}
                    thickness={4}
                    sx={{ color: "rgba(255,255,255,0.2)" }}
                  />
                  <CircularProgress
                    variant="determinate"
                    value={refundRate}
                    size={80}
                    thickness={4}
                    sx={{
                      position: "absolute",
                      left: 0,
                      color:
                        refundRate > 50
                          ? "#ff6b6b"
                          : refundRate > 30
                          ? "#ffa726"
                          : "#66bb6a",
                    }}
                  />
                  <Box
                    sx={{
                      top: 0,
                      left: 0,
                      bottom: 0,
                      right: 0,
                      position: "absolute",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Typography sx={{ fontWeight: 700 }}>
                      {refundRate}%
                    </Typography>
                  </Box>
                </Box>

                <Box>
                  <Typography sx={{ fontSize: 14, opacity: 0.9 }}>
                    환불 비율
                  </Typography>
                  <Typography sx={{ fontSize: 13, opacity: 0.7 }}>
                    총 결제 대비 환불 비중
                  </Typography>
                </Box>
              </Box>
           
              {/* 보조 지표 영역 */}
              <Stack
                direction="row"
                spacing={3}
                sx={{
                  mt: 3,
                  pt: 2,
                  borderTop: "1px solid rgba(255,255,255,0.2)",
                }}
              >
                <Box>
                  <Typography sx={{ fontSize: 13, opacity: 0.8 }}>
                    총 결제
                  </Typography>
                  <Typography sx={{ fontWeight: 700 }}>
                    {billingStats.totalCompletedAmount.toLocaleString()} 원
                  </Typography>
                </Box>

                <Box>
                  <Typography sx={{ fontSize: 13, opacity: 0.8 }}>
                    총 환불
                  </Typography>
                  <Typography sx={{ fontWeight: 700 }}>
                    {billingStats.totalRefundedAmount.toLocaleString()} 원
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
)}

        <Card
          sx={{
            borderRadius: 3,
            border: "1px solid var(--line)",
            boxShadow: "var(--shadow-1)",
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
              <Box
                sx={{
                  width: 42,
                  height: 42,
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
                  결제 / 환불 / 순수납 흐름을 관리합니다.
                </Typography>
              </Box>
            </Stack>

            {loading && <Typography>로딩 중...</Typography>}
            {error && <Typography color="error">{error}</Typography>}

            {billingStats && (
              <>
                <Typography sx={{ fontWeight: 700, mb: 1 }}>
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
          </CardContent>
        </Card>
      </Box>
    </MainLayout>
  );
}

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
        border: highlight
          ? "2px solid #2e7d32"
          : "1px solid rgba(0,0,0,0.08)",
        backgroundColor: highlight ? "#e8f5e9" : "white",
        transition: "all 0.2s ease",
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: "0 8px 20px rgba(0,0,0,0.08)",

        },
      }}
    >
      <CardContent>
        <Stack direction="row" spacing={1} alignItems="center">
          {icon}
          <Typography variant="subtitle2" sx={{ color: "rgba(0,0,0,0.6)" }}>
            {title}
          </Typography>
        </Stack>

        <Typography
          variant="h5"
          sx={{
            fontWeight: 800,
            mt: 1,
            color: highlight ? "#2e7d32" : color || "inherit",
          }}
        >
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}