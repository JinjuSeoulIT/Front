"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/store/store";

import {
  fetchBillingDetailRequest,
  fetchPaymentsByBillRequest,
  createPaymentRequest,
  cancelPaymentRequest,
  refundPaymentRequest,
} from "@/features/billing/billingSlice";


// MUI Chip 사용 (청구 상태 표시)
import { Chip } from "@mui/material";
import MainLayout from "@/components/layout/MainLayout";


// Bill 상태 스타일
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

const notifyError = (message: string) => {
  if (typeof window !== "undefined") {
    window.alert(message);
  } else {
    console.error(message);
  }
};

const normalizeAmount = (
  value: number,
  remaining: number
): number => {
  if (value < 0) return 0;
  if (value > remaining) return remaining;
  return value;
};

const inputStyle: React.CSSProperties = {
  padding: "8px",
  marginRight: "8px",
  width: "140px",
  border: "1px solid #ccc",
  borderRadius: "6px",
  fontSize: "14px",
};

const fullPayBtnStyle = (loading: boolean): React.CSSProperties => ({
  padding: "8px 16px",
  marginRight: "8px",
  backgroundColor: loading ? "#9e9e9e" : "#1565c0",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: loading ? "not-allowed" : "pointer",
});

const partialPayBtnStyle = (loading: boolean): React.CSSProperties => ({
  padding: "8px 16px",
  backgroundColor: loading ? "#9e9e9e" : "#2e7d32",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: loading ? "not-allowed" : "pointer",
});

const summaryBoxStyle: React.CSSProperties = {
  padding: "12px",
  border: "1px solid #ddd",
  borderRadius: "8px",
  marginBottom: "16px",
  backgroundColor: "#f9f9f9",
};

const paymentCardStyle: React.CSSProperties = {
  padding: "12px",
  border: "1px solid #e0e0e0",
  borderRadius: "8px",
  marginBottom: "8px",
};

const cancelBtnStyle: React.CSSProperties = {
  marginTop: "8px",
  padding: "6px 12px",
  backgroundColor: "#d32f2f",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "12px",
};

const refundBtnStyle: React.CSSProperties = {
  marginTop: "8px",
  marginLeft: "8px",
  padding: "6px 12px",
  backgroundColor: "#1976d2",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "12px",
};

export default function BillingDetailPage() {
  const dispatch = useDispatch<AppDispatch>();
  const params = useParams<{ billId: string }>();
  const billId = Number(params.billId);

  const { billingDetail, payments, loading, error } = useSelector(
    (state: RootState) => state.billing
  );

  const [payAmount, setPayAmount] = useState<number>(0);

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
  }, [billingDetail]);

  const handlePayment = () => {
    if (!billingDetail) return;

    if (payAmount <= 0) {
      notifyError("결제 금액을 입력하세요.");
      return;
    }

    if (payAmount > billingDetail.remainingAmount) {
      notifyError("남은 금액보다 클 수 없습니다.");
      return;
    }

    dispatch(
      createPaymentRequest({
        billId: billingDetail.billId,
        amount: payAmount,
        patientId: billingDetail.patientId,
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
      notifyError("이미 전액 수납 완료되었습니다.");
      return;
    }

    dispatch(
      createPaymentRequest({
        billId: billingDetail.billId,
        amount: billingDetail.remainingAmount,
        patientId: billingDetail.patientId,
      })
    );
  };

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")} 
    ${String(date.getHours()).padStart(2,"0")}:${String(date.getMinutes()).padStart(2,"0")}`;
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
    <MainLayout>
    <main style={{ padding: "24px" }}>
      <h1>청구 상세</h1>

      {loading && <p>로딩 중...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {billingDetail && (
        <section style={{ marginTop: "24px" }}>

          <div>청구 ID: {billingDetail.billId}</div>
          <div>환자 ID: {billingDetail.patientId}</div>

          
          {/* 금액 표시 통일 */}
          <div>총 금액: {billingDetail.totalAmount.toLocaleString()} 원</div>
          <div>결제 금액: {billingDetail.paidAmount.toLocaleString()} 원</div>

          <div>
            남은 금액:
            <span
              style={{
                color:
                  billingDetail.remainingAmount > 0
                    ? "#d32f2f"
                    : "#2e7d32",
                fontWeight: "bold",
              }}
            >
              {billingDetail.remainingAmount.toLocaleString()} 원
            </span>
          </div>

          
          {/* Bill 상태 Chip */}
          <div style={{ marginTop: "8px" }}>
            상태:
            <Chip
              label={billingDetail.status}
              color={getBillStatusColor(billingDetail.status) as any}
              size="small"
              style={{ marginLeft: "8px" }}
            />
          </div>

          {billingDetail.remainingAmount > 0 && (
            <div style={{ marginTop: "16px" }}>
              <input
                type="number"
                value={payAmount}
                onChange={(e) => {
                  const raw = Number(e.target.value);
                  setPayAmount(
                    normalizeAmount(raw, billingDetail.remainingAmount)
                  );
                }}
                placeholder="결제 금액 입력"
                style={inputStyle}
              />

              <button
                onClick={handleFullPayment}
                disabled={loading}
                style={fullPayBtnStyle(loading)}
              >
                전액
              </button>

              <button
                onClick={handlePayment}
                disabled={
                  loading ||
                  payAmount <= 0 ||
                  payAmount > billingDetail.remainingAmount
                }
                style={partialPayBtnStyle(loading)}
              >
                {loading ? "처리 중..." : "부분 수납"}
              </button>
            </div>
          )}

          <section style={{ marginTop: "24px" }}>
            <h2>수납 내역</h2>

            <div style={summaryBoxStyle}>
              <div>현재 유효 결제 금액: {billingDetail.paidAmount.toLocaleString()}원</div>
              <div>현재 잔액: {billingDetail.remainingAmount.toLocaleString()}원</div>
              <div>총 결제 건수: {completedCount}건</div>
              <div>총 취소 건수: {canceledCount}건</div>
            </div>

            {sortedPayments.map((p) => (
              <div key={p.paymentId} style={paymentCardStyle}>
                <div>결제 ID: {p.paymentId}</div>
                <div>결제 금액: {p.paymentAmount.toLocaleString()}원</div>
                <div>결제 수단: {p.method}</div>

                <div>결제 일시: {formatDateTime(p.paidAt)}</div>

                {p.status === "COMPLETED" && (
                  <>
                    <button
                      onClick={() => handleCancelPayment(p.paymentId)}
                      style={cancelBtnStyle}
                    >
                      수납 취소
                    </button>

                    <button
                      onClick={() => {
                        setRefundTargetId(p.paymentId);
                        setRefundAmount(0);
                      }}
                      style={refundBtnStyle}
                    >
                      부분 환불
                    </button>

                    {refundTargetId === p.paymentId && (
                      <div style={{ marginTop: "8px" }}>
                        <input
                          type="number"
                          value={refundAmount}
                          onChange={(e) => {
                            const value = Number(e.target.value);
                            if (value < 0) return;
                            if (value > p.paymentAmount) {
                              setRefundAmount(p.paymentAmount);
                            } else {
                              setRefundAmount(value);
                            }
                          }}
                          placeholder={`최대 ${p.paymentAmount}원`}
                          style={inputStyle}
                        />

                        <button
                          onClick={() => {
                            if (refundAmount <= 0) {
                              notifyError("환불 금액을 입력하세요.");
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
                          style={partialPayBtnStyle(loading)}
                        >
                          환불 실행
                        </button>

                        <button
                          onClick={() => {
                            setRefundTargetId(null);
                            setRefundAmount(0);
                          }}
                          style={{ ...cancelBtnStyle, backgroundColor:"#9e9e9e" }}
                        >
                          취소
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </section>
        </section>
      )}
    </main>
    </MainLayout>
  );
}
