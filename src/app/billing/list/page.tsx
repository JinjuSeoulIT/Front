"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/store/store";

import MainLayout from "@/components/layout/MainLayout";
import Link from "next/link";

import {
  Box,
  Typography,
  Stack,
  Chip,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
} from "@mui/material";

import { fetchBillsRequest } from "@/features/billing/billingSlice";
import { getBillingStatusLabel } from "@/lib/billing/billingStatus";

export default function BillingListPage() {
  const searchParams = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();

  const status = searchParams.get("status");

  const { billingList, loading, error } = useSelector(
    (state: RootState) => state.billing
  );

  const STATUS_OPTIONS = ["READY", "CONFIRMED", "PAID"] as const;

  useEffect(() => {
    if (status) {
      dispatch(fetchBillsRequest(status));
    }
  }, [dispatch, status]);

  /* 
     진료일 최신순(내림차순) 정렬용 목록
     - 원본 billingList는 건드리지 않고
     - 화면 출력용으로만 복사 후 정렬
   */
  const sortedBillingList = [...(billingList ?? [])].sort((a, b) => {
    return (
      new Date(b.treatmentDate).getTime() -
      new Date(a.treatmentDate).getTime()
    );
  });

  return (
    <MainLayout>
      <Box sx={{ display: "grid", gap: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          청구 목록
        </Typography>

        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <Typography variant="subtitle1" sx={{ mr: 1 }}>
            상태 필터:
          </Typography>

          {STATUS_OPTIONS.map((s) => (
            <Chip
              key={s}
              label={getBillingStatusLabel(s)}
              component={Link}
              href={`/billing/list?status=${s}`}
              clickable
              color={status === s ? "primary" : "default"}
              variant={status === s ? "filled" : "outlined"}
              sx={{ mb: 1 }}
            />
          ))}

          {!status && (
            <Typography variant="body2" sx={{ ml: 1, color: "text.secondary" }}>
              상태를 선택하면 해당 청구 목록을 조회합니다.
            </Typography>
          )}
        </Stack>

        {status && (
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="subtitle1">현재 필터 상태:</Typography>
            <Chip label={getBillingStatusLabel(status)} color="primary" />
          </Stack>
        )}

        {loading && <Typography>로딩 중...</Typography>}
        {error && <Typography color="error">{error}</Typography>}

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>청구번호</TableCell>
                <TableCell>환자ID</TableCell>
                <TableCell>진료일</TableCell>
                <TableCell>총 금액</TableCell>
                <TableCell>상태</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {/* 
                 수정: 화면에는 최신 진료일 순으로 정렬된 목록 사용
               */}
              {sortedBillingList.map((bill) => (
                <TableRow key={bill.billId}>
                  <TableCell>
                    <Link
                      href={`/billing/${bill.billId}`}
                      style={{
                        textDecoration: "none",
                        color: "#1976d2",
                        fontWeight: 600,
                      }}
                    >
                      {bill.billId}
                    </Link>
                  </TableCell>

                  <TableCell>{bill.patientId}</TableCell>
                  <TableCell>{bill.treatmentDate}</TableCell>
                  <TableCell>{bill.totalAmount.toLocaleString()} 원</TableCell>

                  <TableCell>
                    <Chip
                      label={getBillingStatusLabel(bill.status)}
                      color={
                        bill.status === "PAID"
                          ? "success"
                          : bill.status === "CONFIRMED"
                          ? "warning"
                          : "default"
                      }
                    />
                  </TableCell>
                </TableRow>
              ))}

              {/* 
                 수정: 정렬된 목록 기준으로 빈 결과 여부 판단
               */}
              {sortedBillingList.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    조회 결과가 없습니다
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </MainLayout>
  );
}