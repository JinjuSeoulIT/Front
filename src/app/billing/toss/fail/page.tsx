"use client";

<<<<<<< HEAD
import { useMemo } from "react";
=======
import { useEffect, useMemo } from "react";
>>>>>>> feature/billing
import { useRouter, useSearchParams } from "next/navigation";

export default function TossFailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const code = searchParams.get("code");
  const message = searchParams.get("message");
  const orderId = searchParams.get("orderId");

  const hasErrorInfo = useMemo(() => {
    return Boolean(code || message || orderId);
  }, [code, message, orderId]);

<<<<<<< HEAD
=======
  /* orderId에서 billId 추출 */
  const parsedBillIdFromOrderId = useMemo(() => {
    if (!orderId) return null;

    const parts = orderId.split("-");
    if (parts.length < 2) return null;

    const maybeBillId = Number(parts[1]);
    if (Number.isNaN(maybeBillId) || maybeBillId <= 0) return null;

    return maybeBillId;
  }, [orderId]);

  /* 실패 페이지 진입 시 이전 toss context 정리 */
  useEffect(() => {
    if (typeof window === "undefined") return;
    sessionStorage.removeItem("tossPaymentContext");
  }, []);

  const moveToBillingDetail = () => {
    if (parsedBillIdFromOrderId == null) {
      router.push("/billing");
      return;
    }

    router.push(`/billing/${parsedBillIdFromOrderId}`);
  };

>>>>>>> feature/billing
  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "40px 20px",
        backgroundColor: "#f8fafc",
      }}
    >
      <div
        style={{
          maxWidth: "720px",
          margin: "0 auto",
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          padding: "32px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
        }}
      >
        <h1
          style={{
            margin: "0 0 16px 0",
            fontSize: "28px",
            fontWeight: 700,
            color: "#111827",
          }}
        >
          토스 결제 실패 페이지
        </h1>

        <p
          style={{
            margin: "0 0 24px 0",
            fontSize: "16px",
            color: "#374151",
            lineHeight: 1.6,
          }}
        >
<<<<<<< HEAD
          현재 단계는 <strong>토스에서 실패 페이지로 정상 이동하는지</strong> 확인하는
          단계입니다.
          <br />
          아직은 별도 예외 처리 없이, 전달받은 실패 정보를 화면에 보여줍니다.
=======
          현재 단계는 <strong>토스 결제가 승인되지 않아 실패 페이지로 이동한 상태</strong>
          입니다.
          <br />
          실패한 결제는 billing 수납 DB에 반영되지 않으며, 수납 상세 화면으로 돌아가
          결제를 다시 시도할 수 있습니다.
>>>>>>> feature/billing
        </p>

        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            padding: "20px",
            backgroundColor: "#f9fafb",
            marginBottom: "24px",
          }}
        >
          <div style={{ marginBottom: "12px" }}>
            <strong>code:</strong>{" "}
            <span>{code ?? "값 없음"}</span>
          </div>

          <div style={{ marginBottom: "12px" }}>
            <strong>message:</strong>{" "}
            <span>{message ?? "값 없음"}</span>
          </div>

<<<<<<< HEAD
          <div>
            <strong>orderId:</strong>{" "}
            <span>{orderId ?? "값 없음"}</span>
          </div>
=======
          <div style={{ marginBottom: "12px" }}>
            <strong>orderId:</strong>{" "}
            <span>{orderId ?? "값 없음"}</span>
          </div>

          <div>
            <strong>billId(orderId 기준):</strong>{" "}
            <span>{parsedBillIdFromOrderId ?? "값 없음"}</span>
          </div>
>>>>>>> feature/billing
        </div>

        <div
          style={{
            marginBottom: "24px",
            padding: "16px",
            borderRadius: "12px",
            backgroundColor: hasErrorInfo ? "#fef2f2" : "#fff7ed",
            color: hasErrorInfo ? "#991b1b" : "#9a3412",
            border: hasErrorInfo
              ? "1px solid #fecaca"
              : "1px solid #fdba74",
          }}
        >
          {hasErrorInfo
<<<<<<< HEAD
            ? "실패 URL 정보가 정상적으로 들어왔습니다."
            : "실패 URL 정보가 아직 없습니다."}
=======
            ? "결제 실패 정보가 확인되었습니다. billing DB에는 반영되지 않았습니다."
            : "실패 URL 정보가 아직 없습니다. 이전 화면으로 돌아가 다시 시도해주세요."}
>>>>>>> feature/billing
        </div>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <button
            type="button"
<<<<<<< HEAD
            onClick={() => router.push("/billing")}
=======
            onClick={moveToBillingDetail}
>>>>>>> feature/billing
            style={{
              padding: "12px 18px",
              border: "none",
              borderRadius: "10px",
              backgroundColor: "#2563eb",
              color: "#ffffff",
              cursor: "pointer",
              fontSize: "15px",
              fontWeight: 600,
            }}
          >
<<<<<<< HEAD
=======
            수납 상세로 이동
          </button>

          <button
            type="button"
            onClick={() => router.push("/billing")}
            style={{
              padding: "12px 18px",
              border: "1px solid #d1d5db",
              borderRadius: "10px",
              backgroundColor: "#ffffff",
              color: "#111827",
              cursor: "pointer",
              fontSize: "15px",
              fontWeight: 600,
            }}
          >
>>>>>>> feature/billing
            billing 목록으로 이동
          </button>

          <button
            type="button"
            onClick={() => router.back()}
            style={{
              padding: "12px 18px",
              border: "1px solid #d1d5db",
              borderRadius: "10px",
              backgroundColor: "#ffffff",
              color: "#111827",
              cursor: "pointer",
              fontSize: "15px",
              fontWeight: 600,
            }}
          >
            이전 페이지로
          </button>
        </div>
      </div>
    </div>
  );
}