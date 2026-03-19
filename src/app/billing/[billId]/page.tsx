"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/store/store";
import toast from "react-hot-toast";

import {
  fetchBillingDetailRequest,
  fetchPaymentsByBillRequest,
  createPaymentRequest,
  confirmBillRequest,
  cancelPaymentRequest,
  refundPaymentRequest,
} from "@/features/billing/billingSlice";

import type { PaymentMethod } from "@/lib/billingApi";

/* MUI UI */
import {
  Chip,
  Card,
  CardContent,
  Stack,
  Typography,
  Button,
  Box,
} from "@mui/material";

/* Bill 상태 색상 */
const getBillStatusColor = (status: string) => {
  switch (status) {
    case "READY":
      return "default";
    case "CONFIRMED":
      return "warning";
    case "PAID":
      return "success";
    case "CANCELED":
      return "error";
    default:
      return "default";
  }
};

/* 입력값 보정 */
const normalizeAmount = (value: number, remaining: number): number => {
  if (value < 0) return 0;
  if (value > remaining) return remaining;
  return value;
};

const formatNumber = (value : number) => {
  return value.toLocaleString();
};

const unformatNumber = (value  : string) =>{
   return Number (value.replace(/,/g,""));
};

/* 스타일 */
const inputStyle: React.CSSProperties = {
  padding: "8px",
  marginRight: "8px",
  width: "140px",
  border: "1px solid #ccc",
  borderRadius: "6px",
  fontSize: "14px",
  backgroundColor: "#ffffff",
};

const paymentCardStyle: React.CSSProperties = {
  padding: "12px",
  border: "1px solid #e0e0e0",
  borderRadius: "8px",
  marginBottom: "8px",
  backgroundColor: "#ffffff",
  boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
};

// 결제수단 라디오 영역 스타일
const methodBoxStyle: React.CSSProperties = {
  display: "flex",
  gap: "16px",
  alignItems: "center",
  marginTop: "12px",
  marginBottom: "12px",
  backgroundColor: "#ffffff",
  padding: "10px 12px",
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
};

export default function BillingDetailPage() {
  const dispatch = useDispatch<AppDispatch>();
  const params = useParams<{ billId: string }>();
  const billId = Number(params.billId);

  const { billingDetail, payments, loading, error } = useSelector(
    (state: RootState) => state.billing
  );

  const [payAmount, setPayAmount] = useState<number>(0);

  // 결제수단 상태
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("CASH");

  const [refundTargetId, setRefundTargetId] = useState<number | null>(null);
  const [refundAmount, setRefundAmount] = useState<number>(0);

  useEffect(() => {
    if (billId) {
      dispatch(fetchBillingDetailRequest(billId));
      dispatch(fetchPaymentsByBillRequest(billId));
    }
  }, [billId, dispatch]);

  useEffect(() => {
    setPayAmount(0);

    // 상세가 바뀌면 기본 결제수단도 초기화
    setPaymentMethod("CASH");
  }, [billingDetail]);

  const handlePayment = () => {
    if (!billingDetail) return;

    if (payAmount <= 0) {
      toast.error("결제 금액을 입력하세요.");
      return;
    }

    if (payAmount > billingDetail.remainingAmount) {
      toast.error("남은 금액보다 클 수 없습니다.");
      return;
    }

    dispatch(
      createPaymentRequest({
        billId: billingDetail.billId,
        amount: payAmount,
        patientId: billingDetail.patientId,
        method: paymentMethod,
      })
    );
  };

  const handleCancelPayment = (paymentId: number) => {
    if (!billingDetail) return;

    const confirmCancel = confirm("정말로 수납을 취소하시겠습니까?");
    if (!confirmCancel) return;

    dispatch(
      cancelPaymentRequest({
        paymentId,
        billId: billingDetail.billId,
        patientId: billingDetail.patientId,
      })
    );
  };

  const handleFullPayment = () => {
    if (!billingDetail) return;

    if (billingDetail.remainingAmount <= 0) {
      toast.error("이미 전액 수납 완료되었습니다.");
      return;
    }

    dispatch(
      createPaymentRequest({
        billId: billingDetail.billId,
        amount: billingDetail.remainingAmount,
        patientId: billingDetail.patientId,
        method: paymentMethod,
      })
    );
  };

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(date.getDate()).padStart(2, "0")} ${String(
      date.getHours()
    ).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  };

  const sortedPayments = [...payments].sort(
    (a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime()
  );

  const completedCount = sortedPayments.filter(
    (p) => p.status === "COMPLETED"
  ).length;

  const canceledCount = sortedPayments.filter(
    (p) => p.status === "CANCELED"
  ).length;

  return (
    /* 화면 전체 배경색 추가 */
    <main
      style={{
        padding: "24px",
        backgroundColor: "#f4f6f8",
        minHeight: "100vh",
      }}
    >
      {/*제목 여백/굵기 보강 */}
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
        청구 상세
      </Typography>

      {loading && <p>로딩 중...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* 상단 KPI 요약 카드 */}
      {billingDetail && (
        <Card
          sx={{
            mt: 3,
            mb: 3,
            borderRadius: 3,
            boxShadow: 2,
            /* 카드 배경 자연스럽게 */
            backgroundColor: "#ffffff",
          }}
        >
          <CardContent>
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={3}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", md: "center" }}
            >
              <Box>
                <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                  총 금액
                </Typography>
                <Typography sx={{ fontWeight: 800, fontSize: 24 }}>
                  {billingDetail.totalAmount.toLocaleString()} 원
                </Typography>
              </Box>

              <Box>
                <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                  결제 금액
                </Typography>
                <Typography
                  sx={{ fontWeight: 800, fontSize: 24, color: "#1976d2" }}
                >
                  {billingDetail.paidAmount.toLocaleString()} 원
                </Typography>
              </Box>

              <Box>
                <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                  남은 금액
                </Typography>
                <Typography
                  sx={{ fontWeight: 800, fontSize: 24, color: "#d32f2f" }}
                >
                  {billingDetail.remainingAmount.toLocaleString()} 원
                </Typography>
              </Box>

              <Box>
                <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                  현재 상태
                </Typography>
                <Chip
                  label={billingDetail.status}
                  color={getBillStatusColor(billingDetail.status) as any}
                  sx={{ mt: 0.5 }}
                />
              </Box>
            </Stack>
          </CardContent>
        </Card>
      )}

      {billingDetail && (
        <section style={{ marginTop: "24px" }}>
          {/* 청구 요약 카드 */}
          <Card
            sx={{
              mb: 3,
              /* 라운드/그림자 강화 */
              borderRadius: 3,
              boxShadow: 2,
              /*  카드 배경색 */
              backgroundColor: "#ffffff",
            }}
          >
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                청구 요약
              </Typography>

              <Stack spacing={1}>
                <Typography>
                  청구 ID: {billingDetail.billId}
                </Typography>

                <Typography>
                  환자 ID: {billingDetail.patientId}
                </Typography>

                <Typography>
                  총 금액: {billingDetail.totalAmount.toLocaleString()} 원
                </Typography>

                <Typography>
                  결제 금액: {billingDetail.paidAmount.toLocaleString()} 원
                </Typography>

                <Typography>
                  남은 금액:
                  <span
                    style={{
                      color:
                        billingDetail.remainingAmount > 0
                          ? "#d32f2f"
                          : "#2e7d32",
                      fontWeight: "bold",
                      marginLeft: "6px",
                    }}
                  >
                    {billingDetail.remainingAmount.toLocaleString()} 원
                  </span>
                </Typography>

                <Typography component="div">
                  상태:
                  <Chip
                    label={billingDetail.status}
                    color={getBillStatusColor(
                      billingDetail.status
                    ) as any}
                    size="small"
                    sx={{ ml: 1 }}
                  />
                </Typography>
              </Stack>

              {/* 청구 확정 버튼 */}
              {billingDetail.status === "READY" && (
                <div style={{ marginTop: "12px" }}>
                  
                <Button
                  variant="contained"
                  color="warning"
                  onClick={() =>
                    dispatch(confirmBillRequest(billingDetail.billId))
                  }
                  disabled={loading}
                >
                  {loading ? "처리 중..." : "청구 확정"}
                </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 수납 처리 영역 제목 카드 */}
          {billingDetail.remainingAmount > 0 && (
            <Card
              sx={{
                mb: 2,
                borderRadius: 3,
                boxShadow: 1,
                /* 제목 카드 배경 */
                backgroundColor: "#ffffff",
              }}
            >
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  수납 처리
                </Typography>
                <Typography
                  sx={{ fontSize: 13, color: "text.secondary", mt: 0.5 }}
                >
                  결제 금액 입력 후 전액 또는 부분 수납을 진행할 수 있습니다.
                </Typography>
              </CardContent>
            </Card>
          )}

          {/* 결제 입력 */}
          {billingDetail.remainingAmount > 0 && (
            <div style={{ marginBottom: "24px" }}>

           <input
              type="text"
              value={payAmount === 0 ? "" : formatNumber(payAmount)}
              onChange={(e) => {
                const raw = unformatNumber(e.target.value);

                if (isNaN(raw)) return;

                setPayAmount(
                  normalizeAmount(
                    raw,
                    billingDetail.remainingAmount
                  )
                );
              }}
              placeholder="결제 금액 입력"
              style={inputStyle}
            />

              {/* 결제 수단 선택 */}
              <div style={methodBoxStyle}>
                <label>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="CASH"
                    checked={paymentMethod === "CASH"}
                    onChange={() => setPaymentMethod("CASH")}
                  />{" "}
                  현금
                </label>

                <label>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="CARD"
                    checked={paymentMethod === "CARD"}
                    onChange={() => setPaymentMethod("CARD")}
                  />{" "}
                  카드
                </label>

                <label>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="TRANSFER"
                    checked={paymentMethod === "TRANSFER"}
                    onChange={() => setPaymentMethod("TRANSFER")}
                  />{" "}
                  계좌이체
                </label>
              </div>

              {/* MUI 버튼 UI */}
              <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  onClick={handleFullPayment}
                  disabled={loading}
                >
                  전액 수납
                </Button>

                <Button
                  variant="contained"
                  color="success"
                  onClick={handlePayment}
                  disabled={
                    loading ||
                    payAmount <= 0 ||
                    payAmount > billingDetail.remainingAmount
                  }
                >
                  {loading ? "처리 중..." : "부분 수납"}
                </Button>
              </Stack>
            </div>
          )}

          {/*수납 내역 제목 간격 강화 */}
          <Typography variant="h6" sx={{ mb: 2, mt: 4 }}>
            수납 내역
          </Typography>

          {/* 수납 내역 상단 요약 카드 */}
          <Card
            sx={{
              mb: 2,
              borderRadius: 3,
              boxShadow: 1,
              /* 요약 카드 배경 */
              backgroundColor: "#ffffff",
            }}
          >
            <CardContent>
              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={2}
                justifyContent="space-between"
              >
                <Box>
                  <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                    현재 유효 결제 금액
                  </Typography>
                  <Typography sx={{ fontWeight: 700 }}>
                    {billingDetail.paidAmount.toLocaleString()}원
                  </Typography>
                </Box>

                <Box>
                  <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                    현재 잔액
                  </Typography>
                  <Typography sx={{ fontWeight: 700, color: "#d32f2f" }}>
                    {billingDetail.remainingAmount.toLocaleString()}원
                  </Typography>
                </Box>

                <Box>
                  <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                    총 결제 건수
                  </Typography>
                  <Typography sx={{ fontWeight: 700 }}>
                    {completedCount}건
                  </Typography>
                </Box>

                <Box>
                  <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                    총 취소 건수
                  </Typography>
                  <Typography sx={{ fontWeight: 700 }}>
                    {canceledCount}건
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {sortedPayments.map((p) => (
            <div key={p.paymentId} style={paymentCardStyle}>
              <Stack spacing={0.5}>
                <Typography variant="subtitle2">
                  결제 ID: {p.paymentId}
                </Typography>

                <Typography>
                  결제 금액:
                  <strong>
                    {p.paymentAmount.toLocaleString()}원
                  </strong>
                </Typography>

                <Typography>
                  결제 수단: {p.method}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  결제 일시: {formatDateTime(p.paidAt)}
                </Typography>
              </Stack>

              {p.status === "COMPLETED" && (
                <>
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  <Button
                    variant="contained"
                    color="error"
                    size="small"
                    onClick={() => handleCancelPayment(p.paymentId)}
                  >
                    수납 취소
                  </Button>
                  <Button
                    variant="contained"
                    color="info"
                    size="small"
                    onClick={() => {
                      setRefundTargetId(p.paymentId);
                      setRefundAmount(0);
                    }}
                  >
                      부분 환불
                    </Button>
                  </Stack>

                  {refundTargetId === p.paymentId && (
                    <div style={{ marginTop: "8px" }}>
                      <input
                        type="number"
                        value={refundAmount}
                        onChange={(e) => {
                          const value = Number(
                            e.target.value
                          );
                          if (value < 0) return;
                          if (value > p.paymentAmount) {
                            setRefundAmount(
                              p.paymentAmount
                            );
                          } else {
                            setRefundAmount(value);
                          }
                        }}
                        placeholder={`최대 ${p.paymentAmount}원`}
                        style={inputStyle}
                      />

                      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          onClick={() => {
                            if (refundAmount <= 0) {
                              toast.error("환불 금액을 입력하세요.");
                              return;
                            }

                            dispatch(
                              refundPaymentRequest({
                                paymentId: p.paymentId,
                                amount: refundAmount,
                                billId: billingDetail.billId,
                                patientId: billingDetail.patientId,
                              })
                            );

                            setRefundTargetId(null);
                            setRefundAmount(0);
                          }}
                        >
                          환불 실행
                        </Button>

                        <Button
                          variant="outlined"
                          color="inherit"
                          size="small"
                          onClick={() => {
                            setRefundTargetId(null);
                            setRefundAmount(0);
                          }}
                        >
                          취소
                        </Button>
                      </Stack>

                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </section>
      )}
    </main>
  );
}