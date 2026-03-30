"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/store/store";

import MainLayout from "@/components/layout/MainLayout";

/* 청구번호 클릭 시 상세 페이지 이동 */
import Link from "next/link";

import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Chip,

  /* Table UI  */
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
} from "@mui/material";

/*  API import  */
import { fetchBillsRequest } from "@/features/billing/billingSlice";

export default function BillingListPage() {
  const searchParams = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();

  const status = searchParams.get("status");

  /*   billingList 사용  */
  const { billingList, loading, error } = useSelector(
    (state: RootState) => state.billing
  );

  const STATUS_OPTIONS = ["READY", "CONFIRMED", "PAID"] as const;

  /*상태 기반 목록 조회  */
  useEffect(() => {
    if (status) {
      dispatch(fetchBillsRequest(status));
    }
  }, [dispatch, status]);

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
              label={s}
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

        {/* 현재 필터 상태 표시 */}
        {status && (
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="subtitle1">현재 필터 상태:</Typography>
            <Chip label={status} color="primary" />
          </Stack>
        )}

        {loading && <Typography>로딩 중...</Typography>}
        {error && <Typography color="error">{error}</Typography>}

        {/* 청구 목록 Table  */}
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
              {(billingList ?? []).map((bill) => (
                <TableRow key={bill.billId}>
                  <TableCell>
                    {/* 청구번호 클릭 시 BillingDetailPage 이동 */}
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
                      label={bill.status}
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

              {/* 조회 결과 없을 때 메시지 표시 */}
              {(billingList ?? []).length === 0 && !loading && (
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