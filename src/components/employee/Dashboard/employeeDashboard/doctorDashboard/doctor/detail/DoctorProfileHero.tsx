"use client";

import { useEffect, useMemo, useState } from "react";
import "@/components/employee/doctor/detail/DoctorDetailProfileStyle.css";

type Props = {
  // ✅ 네 변수명 그대로
  name: string;
  phone: string;
  email: string;
  position: string;
  specialtyCode: string;
  profileSummary: string;
  education: string;
  careerDetail: string;

  // ✅ 버킷 URL(또는 빈 문자열)
  doctorFileUrl: string;

  // 옵션
  hoverImageUrl?: string;      // 없으면 primary로 대체
  logoWatermarkUrl?: string;   // 워터마크 svg/url

  // 버튼
  onClickBack?: () => void;
  onClickList?: () => void;
  onClickReserve?: () => void;
};

export default function DoctorProfileHero({
  name,
  phone,
  email,
  position,
  specialtyCode,
  profileSummary,
  education,
  careerDetail,
  doctorFileUrl,
  hoverImageUrl,
  logoWatermarkUrl,
  onClickBack,
  onClickList,
  onClickReserve,
}: Props) {
  // ✅ 이름 타이핑(균등, 총 2.5초)
  const totalMs = 2500;
  const safeName = name ?? "";
  const intervalMs = useMemo(() => {
    const len = Math.max(1, safeName.length);
    return Math.max(30, Math.floor(totalMs / len));
  }, [safeName]);

  const [typed, setTyped] = useState("");

  useEffect(() => {
    let i = 0;
    setTyped("");

    const id = window.setInterval(() => {
      i += 1;
      setTyped(safeName.slice(0, i));
      if (i >= safeName.length) window.clearInterval(id);
    }, intervalMs);

    return () => window.clearInterval(id);
  }, [safeName, intervalMs]);

  // ✅ 핵심 변경:
  // - 로컬 "/images/doctor-placeholder.jpg" 제거
  // - doctorFileUrl이 비어있으면 img 태그 자체를 렌더링하지 않음(요청도 안 나감)
  const primaryImageUrl = (doctorFileUrl ?? "").trim();
  const hoverUrl = (hoverImageUrl ?? "").trim() || primaryImageUrl;

  const summaryLines = profileSummary ? [profileSummary] : [];
  const educationLines = education ? [education] : [];
  const careerLines = careerDetail ? [careerDetail] : [];

  const hasImage = !!primaryImageUrl;

  return (
    <section className="dp-hero">
      <div className="dp-hero__top">
        <button
          className="dp-btn dp-btn--ghost"
          type="button"
          onClick={onClickBack}
        >
          ← 뒤로
        </button>

        <button
          className="dp-btn dp-btn--ghost"
          type="button"
          onClick={onClickList}
        >
          목록
        </button>
      </div>

      <div className="dp-hero__grid">
        {/* LEFT: 프로필 이미지(hover 슬라이드: 왼→오) */}
        <div className="dp-photo">
          <div className="dp-photo__frame">
            {hasImage ? (
              <div className="dp-photo__rail">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="dp-photo__img"
                  src={primaryImageUrl}
                  alt="의사 프로필"
                />
                {/* hover 이미지가 없으면 동일 이미지로 */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="dp-photo__img"
                  src={hoverUrl}
                  alt="의사 프로필(hover)"
                />
              </div>
            ) : (
              // ✅ 이미지 없을 때: 요청 안 나가고, 깔끔한 플레이스홀더 UI만 보여줌
              <div className="dp-photo__fallback">
                <div className="dp-photo__fallbackIcon">🩺</div>
                <div className="dp-photo__fallbackText">프로필 이미지 없음</div>
                <div className="dp-photo__fallbackHint">
                  (업로드 반영 중일 수 있어요)
                </div>
              </div>
            )}
          </div>

          <div className="dp-photo__caption">
            <div className="dp-photo__name">{name}</div>
            <div className="dp-photo__sub">
              {position || "직책"} {specialtyCode ? `· ${specialtyCode}` : ""}
            </div>
          </div>
        </div>

        {/* RIGHT: 텍스트 + 워터마크(정적) */}
        <div
          className="dp-info"
          style={
            logoWatermarkUrl
              ? ({ ["--wm-url" as any]: `url(${logoWatermarkUrl})` } as any)
              : undefined
          }
        >
          <div className="dp-info__head">
            <div className="dp-kicker">DOCTOR PROFILE</div>
            <h1 className="dp-title">{typed}</h1>
            <div className="dp-subtitle">
              {position || "직책"} {specialtyCode ? `· ${specialtyCode}` : ""}
            </div>
          </div>

          <div className={`dp-card ${logoWatermarkUrl ? "dp-card--wm" : ""}`}>
            <div className="dp-block">
              <div className="dp-block__title">요약</div>
              <ul className="dp-list">
                {summaryLines.length ? (
                  summaryLines.map((t, i) => <li key={`s-${i}`}>{t}</li>)
                ) : (
                  <li className="dp-empty">-</li>
                )}
              </ul>
            </div>

            <div className="dp-divider" />

            <div className="dp-block">
              <div className="dp-block__title">학력</div>
              <ul className="dp-list">
                {educationLines.length ? (
                  educationLines.map((t, i) => <li key={`e-${i}`}>{t}</li>)
                ) : (
                  <li className="dp-empty">-</li>
                )}
              </ul>
            </div>

            <div className="dp-divider" />

            <div className="dp-block">
              <div className="dp-block__title">경력</div>
              <ul className="dp-list">
                {careerLines.length ? (
                  careerLines.map((t, i) => <li key={`c-${i}`}>{t}</li>)
                ) : (
                  <li className="dp-empty">-</li>
                )}
              </ul>
            </div>

            <div className="dp-contact">
              <div className="dp-contact__left">
                {phone ? <div className="dp-contact__row">📞 {phone}</div> : null}
                {email ? <div className="dp-contact__row">✉️ {email}</div> : null}
              </div>

              <button
                className="dp-btn dp-btn--primary"
                type="button"
                onClick={onClickReserve}
              >
                진료 예약
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}