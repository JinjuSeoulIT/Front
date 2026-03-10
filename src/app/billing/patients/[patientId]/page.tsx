"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/store/store";
import { fetchBillsByPatientRequest } from "@/features/billing/billingSlice";
import MainLayout from "@/components/layout/MainLayout";

export default function PatientBillingListPage() {
  const params = useParams<{ patientId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const patientId = Number(params.patientId);
  const [status, setStatus] = useState("");

  const { billingList, loading, error } = useSelector((state: RootState) => state.billing);

  useEffect(() => {
    if (patientId) {
      dispatch(fetchBillsByPatientRequest({ patientId, status: status || undefined }));
    }
  }, [dispatch, patientId, status]);

  return (
    <MainLayout>
    <div style={{ padding: "20px" }}>
      <h2>환자 청구 목록</h2>

      <div style={{ marginBottom: "15px" }}>
        <label>상태 필터 : </label>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">전체</option>
          <option value="READY">READY</option>
          <option value="CONFIRMED">CONFIRMED</option>
          <option value="PAID">PAID</option>
        </select>
      </div>

      {loading && <p>로딩 중...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <ul>
        {billingList.map((bill) => (
          <li key={bill.billId}>
            <Link href={`/billing/${bill.billId}`}>청구번호: {bill.billId}</Link>
            {" | "}
            진료일: {bill.treatmentDate}
            {" | "}
            총금액: {bill.totalAmount}
            {" | "}
            상태: {bill.status}
          </li>
        ))}
      </ul>
    </div>
    </MainLayout>
  );
}
