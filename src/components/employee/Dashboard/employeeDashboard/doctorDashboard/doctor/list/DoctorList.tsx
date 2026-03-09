"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { DoctorProfileListRequest } from "@/components/fatures/doctor/doctorSlice";
import type { DoctorListView } from "@/components/fatures/doctor/doctortypes";

/* =========================
   UI: 작은 컴포넌트들
   ========================= */

function FilterChip({
  active,
  children,
  onClick,
}: {
  active?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={["chip", "chip-filter", active ? "active" : ""].join(" ")}
    >
      {children}
    </button>
  );
}

function Chip({ text }: { text: string }) {
  return <span className="chip">{text}</span>;
}

/** ✅ staff-card 톤 스켈레톤 */
function SkeletonCard() {
  return (
    <div className="staff-card" style={{ padding: 16 }}>
      <div className="row" style={{ gap: 14 }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 999,
            background: "rgba(255,255,255,.12)",
          }}
        />
        <div style={{ flex: 1 }}>
          <div
            style={{
              height: 14,
              width: 200,
              borderRadius: 10,
              background: "rgba(255,255,255,.12)",
            }}
          />
          <div
            style={{
              marginTop: 10,
              height: 12,
              width: 260,
              borderRadius: 10,
              background: "rgba(255,255,255,.10)",
            }}
          />
        </div>
      </div>
    </div>
  );
}

/* =========================
   데이터 유틸
   ========================= */

function toDeptLabel(code?: string | null) {
  const key = (code ?? "").trim().toUpperCase(); // ✅ 소문자(os) 들어와도 매핑되게
  if (!key) return "";

  const map: Record<string, string> = {
    ENT: "이비인후과",
    IM: "내과",
    FM: "가정의학과",
    OS: "정형외과",
    PD: "소아청소년과",
    OB: "산부인과",
    DM: "피부과",
  };
  return map[key] ?? key;
}

function getInitial(name?: string | null) {
  const n = (name ?? "").trim();
  if (!n) return "D";
  // 한글/영문 상관없이 첫 글자
  return n.slice(0, 1);
}

/* =========================
   카드 컴포넌트
   ========================= */

function DoctorCard({ d }: { d: DoctorListView }) {
  console.log("doctorId", d.doctorId, "doctorFileUrl", d.doctorFileUrl);
  const dept = toDeptLabel(d.specialtyCode);
  const tags = [dept].filter(Boolean).slice(0, 2);

  // ✅ 파일 기본이미지 제거: URL이 있을 때만 img 렌더링
  const raw = (d.doctorFileUrl ?? "").trim();
  const hasImg = raw.length > 0;

  return (


    <Link href={`/doctor/${d.doctorId}/detailprofile`} className="block">

      <div
        className="staff-card card-hover row"
        style={{ padding: 16, justifyContent: "space-between" }}
      >
        <div className="row" style={{ gap: 14, minWidth: 0, flex: 1 }}>
          {/* 썸네일 */}
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 999,
              overflow: "hidden",
              background: "rgba(255,255,255,.10)",
              border: "1px solid rgba(255,255,255,.12)",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "rgba(255,255,255,.88)",
              fontWeight: 950,
              letterSpacing: 0.2,
            }}
          >
            {hasImg ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={raw}
                alt={d.realName || "doctor"}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
                loading="lazy"
                onError={(e) => {
                  // ✅ 깨지면 이미지 숨기고 이니셜이 보이게(부모 div 배경/텍스트 유지)
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                  // 아래 span이 렌더링되어 있지 않으니, "깨졌을 때"를 대비해
                  // 가장 간단하게는 텍스트를 부모에 넣는 방식이 필요하지만,
                  // 여기서는 깨짐 시에도 최소한 UI가 망가지지 않게 숨김 처리만 함.
                }}
              />
            ) : (
              <span>{getInitial(d.realName)}</span>
            )}
          </div>

          {/* 텍스트 */}
          <div style={{ minWidth: 0, flex: 1 }}>
            <div className="row" style={{ gap: 10 }}>
              <div
                style={{
                  fontWeight: 950,
                  color: "#fff",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {d.realName}
                {d.position ? (
                  <span
                    style={{
                      marginLeft: 6,
                      fontWeight: 800,
                      color: "rgba(255,255,255,.78)",
                    }}
                  >
                    {d.position}
                  </span>
                ) : null}
              </div>
            </div>

            <div
              style={{
                marginTop: 6,
                color: "rgba(255,255,255,.72)",
                fontSize: 13,
              }}
            >
              {dept ? `${dept} · 프로필 확인하기` : "프로필 확인하기"}
            </div>

            {tags.length > 0 ? (
              <div
                className="row"
                style={{ marginTop: 10, gap: 8, flexWrap: "wrap" as any }}
              >
                {tags.map((t) => (
                  <Chip key={t} text={t} />
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div
          style={{
            color: "rgba(255,255,255,.55)",
            fontSize: 22,
            paddingLeft: 10,
          }}
        >
          ›
        </div>
      </div>
    </Link>
  );
}

/* =========================
   페이지
   ========================= */

export default function DoctorListPage() {
  const dispatch = useAppDispatch();
  const { list, loading, error } = useAppSelector((s) => s.doctor);

  const [chip, setChip] = useState<"basic" | "available" | "visited">("basic");

  useEffect(() => {
    dispatch(DoctorProfileListRequest());
  }, [dispatch]);

  // 현재 chip 필터는 UI만 있고 실제 필터링 로직은 아직 없음(필요하면 여기서 적용)
  const renderedList: DoctorListView[] = useMemo(() => {
    const arr = ((list ?? []) as DoctorListView[]).slice();
    return arr;
  }, [list, chip]);

  return (
    <div className="staff-hero">
      <div className="container container-px staff-hero-inner">
        {/* 헤더 */}
        <div
          className="row"
          style={{ justifyContent: "space-between", alignItems: "flex-end" }}
        >
          <div>
            <div className="staff-kicker">의료진</div>
            <div className="staff-title">의사 목록</div>
            <div className="staff-desc">
              원하는 의사를 카드형 리스트로 빠르게 탐색합니다.
            </div>
          </div>

          <Link href="/doctor/create" className="btn btn-light">
            + 등록
          </Link>
        </div>

        {/* 칩 바 */}
        <div
          className="row"
          style={{ marginTop: 16, gap: 10, flexWrap: "wrap" as any }}
        >
          <FilterChip active={chip === "basic"} onClick={() => setChip("basic")}>
            기본순
          </FilterChip>
          <FilterChip
            active={chip === "available"}
            onClick={() => setChip("available")}
          >
            바로 진료가능
          </FilterChip>
          <FilterChip
            active={chip === "visited"}
            onClick={() => setChip("visited")}
          >
            진료받은 병원
          </FilterChip>
        </div>

        {/* 본문 */}
        <div
          className="stack"
          style={{ marginTop: 18, gap: 12, paddingBottom: 18 }}
        >
          {loading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : error ? (
            <div className="staff-card" style={{ padding: 18 }}>
              <div style={{ fontSize: 18, fontWeight: 950, color: "#fff" }}>
                불러오기 실패
              </div>
              <div
                style={{
                  marginTop: 8,
                  fontSize: 13,
                  color: "rgba(255,255,255,.75)",
                }}
              >
                {String(error)}
              </div>
              <button
                type="button"
                onClick={() => dispatch(DoctorProfileListRequest())}
                className="btn btn-light"
                style={{ marginTop: 14 }}
              >
                다시 시도
              </button>
            </div>
          ) : renderedList.length === 0 ? (
            <div className="staff-card" style={{ padding: 18 }}>
              <div className="row" style={{ gap: 12, alignItems: "flex-start" }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 16,
                    background: "rgba(255,255,255,.14)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                  }}
                >
                  🩺
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 18, fontWeight: 950, color: "#fff" }}>
                    표시할 의사가 없습니다.
                  </div>
                  <div
                    style={{
                      marginTop: 6,
                      fontSize: 13,
                      color: "rgba(255,255,255,.75)",
                    }}
                  >
                    아직 등록된 의사 프로필이 없거나, 필터 조건에 맞는 데이터가
                    없습니다.
                  </div>

                  <div
                    className="row"
                    style={{ marginTop: 14, gap: 10, flexWrap: "wrap" as any }}
                  >
                    <Link href="/doctor/create" className="btn btn-light">
                      의사 프로필 등록하기
                    </Link>
                    <Link href="/home" className="btn btn-ghost">
                      홈으로
                    </Link>
                  </div>

                  <div
                    style={{
                      marginTop: 12,
                      fontSize: 12,
                      color: "rgba(255,255,255,.60)",
                    }}
                  >
                    * 서버가 500이면(백엔드 오류) 목록이 비어 보일 수 있습니다.
                  </div>
                </div>
              </div>
            </div>
          ) : (
            renderedList.map((d) => <DoctorCard key={d.doctorId} d={d} />)
          )}
        </div>
      </div>
    </div>
  );
}