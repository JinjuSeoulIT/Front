"use client";

import { FormEvent, useEffect,  useRef, useState } from "react";

import {  useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  createBoardRequest,


  uploadFileRequest,    // ✅ 독립 업로드 액션
  clearUploadstate,     // 🔥 업로드 스위치 액션
  clearUploadMetaData,  // 🔥 업로드 메타 초기화 데이터 
} from "@/components/fatures/board/boardSlice";

export type BoardCreateRes = { postId: number };


export default function BoardCreateForm() {

  
  const router = useRouter();

  const dispatch = useAppDispatch();
    

      
  //‘권한/소유자 검증’

  ////  ☑️ 독립업로드 결과 URL (store에 저장 여기가  업로드데이터 )
  const { createLoading,
          createDone,
          createdPostId, //🔑식별아이디 PK

          uploadLoading, 
          uploadDone,
          uploadedFileUrl, 
          error} = useAppSelector((Selector) => Selector.board);


// =======================
// 글 내용 입력
// ======================= 
  ////  ✅게시글 작성 폼의 입력값(제목) ”**
  const [formtitle, setformTitle] = useState("");
  
  ////  ✅게시글 작성 폼의 입력값(본문) ”**
  const [formcontent, setformContent] = useState("");



  
// =======================
// 파일 업로드 
// =======================
   //업로드할 때 FormData.append("file", file)에 들어가는 원본 API
  const [formfile, setformFile] = useState<File | null>(null);

  ////  🔥화면에 보여줄 미리보기용 화면 렌더링용 URL”**
  const [formpreviewUrl, setformPreviewUrl] = useState<string>("");



 // ✅초기화 (준비단계)
useEffect(() => {
  dispatch(clearUploadstate());
  dispatch(clearUploadMetaData());
}, [dispatch]);





// =======================
// 파일 선택 → 미리보기
// =======================
useEffect(() => {
  if (!formfile) {
    setformPreviewUrl("");
    return;
  }

  const url = URL.createObjectURL(formfile);
  setformPreviewUrl(url);

  return () => URL.revokeObjectURL(url);
}, [formfile]);

//“파일 → 임시 URL 생성 → 그 URL을 상태에 저장 → 화면에서 사용”



// ✅ 게시글 생성 성공 후 → 파일 첨부 업로드 
// (게시판 테이블에서 PK값 먼저받고나서 업로드 하기위해서  선택)
//그래서 게시글 PK값 받고나서 성공하고나면 ->파일업로드 가능 
// 식별자확인을 하기위함
useEffect(() => {
  if (!createDone) return;
  if (!createdPostId) return;  //🔑식별아이디 PK 여기가 성공하면 업로드에 건네주는 역활
  if (!formfile) return;

  dispatch(
    uploadFileRequest({
      postId: createdPostId,
      file: formfile,
    })
  );
}, [createDone, createdPostId, formfile, dispatch]);






// UI 보조동작

  //// ⭐파일 input을 “강제로 초기화/클릭”하기 위한 DOM 핸들
  const fileInputRef = useRef<HTMLInputElement | null>(null);

    // ⭐(초기화)"독립 업로드" 여기가 액션스타트랑  데이터값 한마디로 (초기화시키기)  
  const onResetFile = () => {
    setformFile(null);
    setformPreviewUrl("");
    dispatch(clearUploadstate()); //메타데이터도 초기화도 초기화해줌
    dispatch(clearUploadMetaData());
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
  //생성할때 업로드랑 같이보낼려고 액션 
  const onSubmit = (event:FormEvent<HTMLFormElement> ) => {event.preventDefault();

    if (createLoading || uploadLoading) return; // ✅ 중복 클릭 방지
    











    // 👉 글 생성할 때 게시글+파일업로드 같이 보낸다 (디스패치)
    dispatch(
      createBoardRequest({
          boardReq: {
          title: formtitle.trim(),
          content: formcontent.trim(),
          fileUrl: uploadedFileUrl || null,
          
      },
      
      })
      );
      };






useEffect(() => {
  // 파일 없는 글
  if (createDone && !formfile) {
    router.push("/board/list");
  }

  // 파일 있는 글 → 업로드까지 끝나야 이동
  if (createDone && formfile && uploadDone) {
    router.push("/board/list");
  }
}, [createDone, uploadDone, formfile, router]);





  //UI기능형 (단추용 input UI를 숨기고, 내가 만든 버튼/영역을 눌러서 파일 선택창을 띄우기)
  const onPickFile = () => fileInputRef.current?.click();

  return (

    <form
    
      /* 대표 제목, 내용  */
      onSubmit={onSubmit}
      style={{ padding: 16, display: "grid", gap: 12, maxWidth: 720 }}
    >
      <h2>글쓰기</h2>

      {error && <div style={{ color: "red" }}>{error}</div>}
      
      
      <input
        placeholder="제목"
        value={formtitle}
        onChange={(event) => setformTitle(event.target.value)}
      />

      <textarea
        placeholder="내용"
        value={formcontent}
        onChange={(event) => setformContent(event.target.value)}
        rows={10}
      />

      <div
      /* 대표 이미지 */
        style={{
          border: "1px solid #ddd",
          borderRadius: 12,
          padding: 12,
          display: "grid",
          gap: 10,
        }}
      >
        <div style={{ fontWeight: 700 }}>대표 이미지 (선택)</div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(event) => setformFile(event.target.files?.[0] ?? null)}
        />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={onPickFile}
            disabled={createLoading || uploadLoading}
          >
            파일 선택
          </button>

          <button type="button" onClick={onResetFile} disabled={!formfile && !formpreviewUrl}>
            초기화
          </button>
        </div>

        {formfile && ( /* 파일 업로드용*/
        <div style={{ fontSize: 12, color: "#555" }}>선택됨: {formfile.name}</div>
        )}
        
        {formpreviewUrl && (  /* 파일업로드 미리보기용*/
        <img
            src={formpreviewUrl}
            alt="preview"
            style={{
              width: "50%",
              maxHeight: 260,
              objectFit: "cover",
              borderRadius: 12,}}/>)}

 
        <button   /*등록버튼 */
  type="submit"
  disabled={createLoading || uploadLoading || !formtitle.trim() || !formcontent.trim()}
>
  {createLoading ? "등록 중..." : "등록"}
</button>


        {uploadLoading && (  /*간단 처리 원래 없어도 되는데 혹시모르니깐 간단용으로 */
          <div style={{ fontSize: 12, color: "#555" }}>업로드 중...</div>
        )}
        {!!uploadedFileUrl && (
          <div style={{ fontSize: 12, color: "#0a58ca" }}>업로드 완료</div>
        )}
      </div>
    </form>
  );
}