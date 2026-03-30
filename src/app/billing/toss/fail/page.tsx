"use client";

import { useMemo } from "react";
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
          현재 단계는 <strong>토스에서 실패 페이지로 정상 이동하는지</strong> 확인하는
          단계입니다.
          <br />
          아직은 별도 예외 처리 없이, 전달받은 실패 정보를 화면에 보여줍니다.
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

          <div>
            <strong>orderId:</strong>{" "}
            <span>{orderId ?? "값 없음"}</span>
          </div>
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
            ? "실패 URL 정보가 정상적으로 들어왔습니다."
            : "실패 URL 정보가 아직 없습니다."}
        </div>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => router.push("/billing")}
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