"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/store/store";

import MainLayout from "@/components/layout/MainLayout";
import Link from "next/link";

import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  Chip,
} from "@mui/material";

import { fetchOutstandingBillsRequest } from "@/features/billing/billingSlice";

export default function OutstandingBillingPage() {
  const dispatch = useDispatch<AppDispatch>();

  const { billingList, loading, error } = useSelector(
    (state: RootState) => state.billing
  );

  //미수금 조회
  useEffect(() => {
    dispatch(fetchOutstandingBillsRequest());
  }, [dispatch]);

  return (
    <MainLayout>
      <Box sx={{ display: "grid", gap: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          미수금 목록
        </Typography>

        {loading && <Typography>로딩 중...</Typography>}
        {error && <Typography color="error">{error}</Typography>}

        {/* 테이블 */}
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

                  <TableCell>
                    {bill.totalAmount.toLocaleString()} 원
                  </TableCell>

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

              {/* 데이터 없을 때 */}
              {(billingList ?? []).length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    미수금 데이터가 없습니다
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