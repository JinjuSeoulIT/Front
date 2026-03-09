"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { deleteDoctorRequest, deleteDoctorSuccess } from "@/components/fatures/doctor/doctorSlice";

const DoctorDeleteContent = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();

  const { loading, error, deleteSuccess } = useAppSelector((s) => s.doctor);
  const authenticationId = Number(searchParams.get("authenticationId") ?? 0);


  const onConfirm = () => {
    if (!authenticationId) return;
    dispatch(deleteDoctorRequest({ authenticationId }));
  };




  useEffect(() => {
    return () => {
      dispatch(deleteDoctorSuccess());
    };
  }, [dispatch]);



  
  useEffect(() => {
    if (deleteSuccess && !loading) {
      router.push("/");
    }
  }, [deleteSuccess, loading, router]);




  if (!authenticationId) {
    return (
      <div>
        <p>잘못된 요청입니다.</p>
        <button onClick={() => router.back()}>돌아가기</button>
      </div>
    );
  }



  return (
    <div>
      <p>정말로 의사 정보를 삭제하시겠습니까?</p>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <button onClick={onConfirm} disabled={loading} style={{ marginRight: 8 }}>
        {loading ? "삭제 중..." : "삭제하기"}
      </button>
      <button onClick={() => router.back()} disabled={loading}>
        취소
      </button>
    </div>
  );
};

const DoctorDelete = () => {
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <DoctorDeleteContent />
    </Suspense>
  );
};

export default DoctorDelete;
