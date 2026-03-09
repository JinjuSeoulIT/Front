"use client";

import { useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { DoctorProfileByIdRequest } from "@/components/fatures/doctor/doctorSlice";
import DoctorProfileHero from "./DoctorProfileHero";

type DoctorDetailProps = {
  doctorId: number;
};

// ✅ 개발용: 버킷에 기본 placeholder 하나 올려두고 그 URL을 박아두는 걸 추천
// - 또는 빈 문자열("")로 두고 Hero에서 placeholder 렌더를 '숨김' 처리해도 됨
const BUCKET_PLACEHOLDER_URL =
  process.env.NEXT_PUBLIC_DOCTOR_PLACEHOLDER_URL ||
  ""; // 예: "http://192.168.1.58:9000/doctor-bucket/doctor-placeholder.jpg"

export default function DoctorDetailProfile({ doctorId }: DoctorDetailProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const { DoctorDetail, loading, error } = useAppSelector((state) => state.doctor);

  // ✅ 최초 조회
  useEffect(() => {
    if (doctorId > 0) dispatch(DoctorProfileByIdRequest(doctorId));
  }, [dispatch, doctorId]);

  // ✅ 업로드가 create 뒤에 붙는 구조라 doctorFileUrl이 "잠깐 비어있을 수 있음"
  //    -> 짧게 폴링해서 URL이 붙는지 확인 (최대 3초)
  const pollRef = useRef<number | null>(null);

  const needsRefetch = useMemo(() => {
    // DoctorDetail이 없거나, 파일 URL이 아직 없으면 잠깐 재조회
    return !!DoctorDetail && !DoctorDetail.doctorFileUrl;
  }, [DoctorDetail]);

  useEffect(() => {
    // 이미 로딩 중/에러면 폴링 하지 않음
    if (!DoctorDetail || loading || error) return;

    // doctorFileUrl이 이미 있으면 폴링 불필요
    if (!needsRefetch) return;

    // 기존 폴링 제거
    if (pollRef.current) window.clearInterval(pollRef.current);

    const start = Date.now();
    pollRef.current = window.setInterval(() => {
      const elapsed = Date.now() - start;

      // 최대 3초까지만 재조회
      if (elapsed > 3000) {
        if (pollRef.current) window.clearInterval(pollRef.current);
        pollRef.current = null;
        return;
      }

      dispatch(DoctorProfileByIdRequest(doctorId));
    }, 700);

    return () => {
      if (pollRef.current) window.clearInterval(pollRef.current);
      pollRef.current = null;
    };
  }, [DoctorDetail, needsRefetch, loading, error, dispatch, doctorId]);

  if (loading) return <div className="dp-page dp-page--state">불러오는 중...</div>;
  if (error) return <div className="dp-page dp-page--state">에러: {String(error)}</div>;
  if (!DoctorDetail) return <div className="dp-page dp-page--state">의사 정보를 찾을 수 없습니다.</div>;

  // ✅ 변수명 니거 그대로
  const name = DoctorDetail?.realName ?? "의료진";
  const phone = DoctorDetail?.phone ?? "";
  const email = DoctorDetail?.email ?? "";
  const position = DoctorDetail?.position ?? "";
  const specialtyCode = DoctorDetail?.specialtyCode ?? "";
  const profileSummary = DoctorDetail?.profileSummary ?? "";
  const education = DoctorDetail?.education ?? "";
  const careerDetail = DoctorDetail?.careerDetail ?? "";

  // ✅ 중요한 부분:
  // - doctorFileUrl이 없을 때 "/images/doctor-placeholder.jpg"로 가지 말 것
  //   (지금 니 환경에서 그 파일이 없어서 3001로 GET 찍히고 지랄남)
  const doctorFileUrl = DoctorDetail?.doctorFileUrl || BUCKET_PLACEHOLDER_URL;

  return (
    <div className="dp-page">
      <DoctorProfileHero
        name={name}
        phone={phone}
        email={email}
        position={position}
        specialtyCode={specialtyCode}
        profileSummary={profileSummary}
        education={education}
        careerDetail={careerDetail}
        doctorFileUrl={doctorFileUrl}
        hoverImageUrl={doctorFileUrl || undefined}
        logoWatermarkUrl="/images/medical-watermark.svg" // 이건 니 public에 있어야 함
        onClickBack={() => router.back()}
        onClickList={() => router.push("/doctor/list")}
        onClickReserve={() => router.push(`/reserve/${doctorId}`)}
      />
    </div>
  );
}