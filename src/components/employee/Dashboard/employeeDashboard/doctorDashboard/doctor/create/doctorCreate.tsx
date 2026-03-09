"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearUploadMetaData, clearUploadstate, createDoctorRequest, uploadFileRequest } from "@/components/fatures/doctor/doctorSlice";
import type { DoctorCreateRequest } from "@/components/fatures/doctor/doctortypes";
import { initialDoctorCreatForm } from "@/components/fatures/doctor/doctortypes";
import "@/components/employee/doctor/create/doctorCreateStyle.css"



export default function DoctorCreate() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { loading, error,createSuccess ,uploadLoading, uploadDone} = useAppSelector((state) => state.doctor);

  const [form, setForm] = useState<DoctorCreateRequest>(initialDoctorCreatForm);

// const canSubmit = position.length > 0 && specialtyCode.length > 0; //직책과 진료과 안넣으면 생성못하게

//생성 슈미트
const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
  event.preventDefault();

const doctorreq : DoctorCreateRequest = {

  licenseNo: (form.licenseNo ?? "").trim(),          //면호번호
  position: (form.position ?? "").trim(),            //직책
  specialtyCode: (form.specialtyCode ?? "").trim(),  //진료과 코드

  careerDetail : (form.careerDetail ?? "").trim(), //경력상세
  education : (form.education ?? "").trim(),       //학력
  profileSummary : (form.profileSummary ?? "").trim(), //한줄소개
};
  // if (!canSubmit) return;

dispatch(createDoctorRequest(doctorreq));

}



  // ✅ 파일 업로드용 
  //업로드 매칭용  API "DoctorFile, file"
  const [formDoctorFile, setDoctorFile] = useState<File | null>(null);
  //미리보기용
  const [formDoctorpreviewUrl, setformDoctorpreviewUrl] = useState<string>("");


 // ✅초기화 (준비단계)
useEffect(() => {
  dispatch(clearUploadstate());
  dispatch(clearUploadMetaData());
}, [dispatch]);

// =======================
// 파일 선택 → 미리보기
// =======================

  useEffect(() => {
    if (!formDoctorFile) {
      setformDoctorpreviewUrl("");
      return;
    }
    const url = URL.createObjectURL(formDoctorFile);
    setformDoctorpreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [formDoctorFile]);

//“파일 → 임시 URL 생성 → 그 URL을 상태에 저장 → 화면에서 사용”

// =======================
//❗파일객체저장
//**브라우저 메모리(state)에 “업로드할 파일을 들고 있는 것”**이야.
//내 게시판이랑 다른점  게시판엔 영구저장할 목적으로 db
const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0] ?? null;
  setDoctorFile(file);  //임시
};



//✅  동시성 실행
useEffect(() => {
  if (!createSuccess) return;
  if (!formDoctorFile) return;
  if (uploadLoading || uploadDone) return;

  dispatch(uploadFileRequest({ file: formDoctorFile }));
}, [createSuccess, formDoctorFile, uploadLoading, uploadDone, dispatch]);



const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                               //	<input>	                   <textarea>
                               //입력 줄 수	                   여러 줄
  const { name, value } = event.target;
  setForm((prev) => ({ ...prev, [name]: value }));
};


// ✅ 생성 성공하면 바로 목록으로 이동
useEffect(() => {
    if (!createSuccess) return;
  router.push("/doctor/list");
}, [createSuccess, router]);





  return (
    <section className="doc-create">
      <header className="doc-create__head">
        <div>
          <div className="doc-create__kicker">의료진 등록</div>
          <h1 className="doc-create__title">의사 프로필 생성</h1>
          <p className="doc-create__desc">프로필은 세련되게, 입력은 양식처럼 정돈해서 등록합니다.</p>
        </div>

        <div className="doc-create__headActions">
          <button type="button" className="doc-btn doc-btn--ghost" onClick={() => router.back()}>
            뒤로
          </button>
        </div>
      </header>

      <div className="doc-create__grid">
        {/* ✅ 1) 세련된 프로필 카드 */}
        <aside className="doc-profile">
          <div className="doc-profile__top">
            <div className="doc-avatar">
               {/* eslint-disable-next-line @next/next/no-img-element */}
  {formDoctorpreviewUrl ? (
    <img src={formDoctorpreviewUrl} alt="profile" />
  ) : (
    <div className="doc-avatar__fallback">사진 없음</div>
  )}
            </div>

            <div className="doc-profile__meta">
              <div className="doc-profile__name">
              
              </div>

              <div className="doc-profile__sub">
            
              </div>
            </div>
          </div>

          <label className="doc-upload">
            <input type="file" accept="image/*" onChange={handleFile} />
            <span className="doc-upload__btn">프로필 사진 선택</span>
            <span className="doc-upload__hint">
              0~1장 / JPG, PNG 권장{formDoctorFile ? ` · ${formDoctorFile.name}` : ""} {/* ✅ 변수명 통일 */}
            </span>
          </label>

          <div className="doc-profile__note">
            * 생성 성공 후(doctor row 생성) 파일이 있으면 자동 업로드됩니다.
          </div>
        </aside>

        {/* ✅ 2) 양식 느낌 폼 */}
        <main className="doc-formWrap">
          <form className="doc-form" onSubmit={handleSubmit}>
            <div className="doc-row">
              <div className="doc-field">
                <label className="doc-label">면허번호 (선택)</label>
                <input
                  className="doc-input"
                  name="licenseNo"
                  value={form.licenseNo ?? ""}
                  onChange={handleChange}
                  placeholder="예: 12-345678"
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="doc-row doc-row--2">
              <div className="doc-field">
                <label className="doc-label">
                  직책 <span className="req">*</span>
                </label>
                <input
                  className="doc-input"
                  name="position"
                  value={form.position ?? ""}
                  onChange={handleChange}
                  placeholder="예: 과장 / 원장 / 전문의"
                  autoComplete="off"
                />
              </div>

              <div className="doc-field">
                <label className="doc-label">
                  진료과 코드 <span className="req">*</span>
                </label>
                <input
                  className="doc-input"
                  name="specialtyCode"
                  value={form.specialtyCode ?? ""}
                  onChange={handleChange}
                  placeholder="예: IM / ENT / OS"
                  autoComplete="off"
                />
                <div className="doc-help">* 나중에 드롭다운으로 바꿔도 됨</div>
              </div>
            </div>

{/* ✅ 3) 한줄소개(4~5줄 여백) */}
<div className="doc-row">
  <div className="doc-field">
    <label className="doc-label">한줄 소개</label>
    <textarea
      className="doc-textarea"
      name="profileSummary"
      value={form.profileSummary ?? ""}
      onChange={handleChange}
      placeholder="예: 환자에게 친절하고 설명을 꼼꼼히 하는 내과 전문의입니다."
      rows={5}
    />
    <div className="doc-help">* 60자 이내 </div>
  </div>
</div>

{/* ✅ 4) 학력 */}
<div className="doc-row">
  <div className="doc-field">
    <label className="doc-label">학력</label>
    <input
      className="doc-input"
      name="education"
      value={form.education ?? ""}
      onChange={handleChange}
      placeholder="예: 서울대 의대 졸업 / ○○병원 인턴·레지던트"
      autoComplete="off"
    />
    <div className="doc-help">* 300자 이내 </div>
  </div>
</div>

{/* ✅ 5) 경력 상세 DB CLOB로 설정 */}
<div className="doc-row">
  <div className="doc-field">
    <label className="doc-label">경력 상세</label>
    <textarea
      className="doc-textarea"
      name="careerDetail"
      value={form.careerDetail ?? ""}
      onChange={handleChange}
      placeholder={`예)
- 2021~2024 ○○병원 내과 전문의
- 2020 ○○학회 연수 수료`}
      rows={7}
    />
    <div className="doc-help">* 300자 이내 </div>
  </div>
</div>


<div className="doc-actions">
  <button
    type="submit"
    className="doc-btn doc-btn--primary"
    disabled={loading}
  >
    {loading ? "처리중..." : "등록"}
  </button>
</div>
{error && <p style={{ color: "red" }}>에러: {String(error)}</p>}
          </form>
        </main>
      </div>
    </section>
  );
}