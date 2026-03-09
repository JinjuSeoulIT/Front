"use client";

import { useEffect} from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchBoardDetailRequest } from "@/components/fatures/board/boardSlice";


export default function BoardDetailPage() {
  const { postId } = useParams<{ postId: string }>(); //pk 넘버
  const postIdNum = Number(postId);




  const router = useRouter();
  const dispatch = useAppDispatch();

  //리두서 저장소에서 가져옴 (board) (디테일자체만으로 슬라이스에 타입선언되어있음)
  const { detail, detailLoading, error } = useAppSelector((Selector) => Selector.board);


  useEffect(() => {
  if (!Number.isFinite(postIdNum)) return; 
  
  dispatch(fetchBoardDetailRequest({ postId: postIdNum }));
}, [dispatch, postIdNum]);  //포스트 pk아이디 디스패치용

  


  return (
    <div style={{ padding: 16, display: "grid", gap: 12, maxWidth: 900 }}>
      <button onClick={() => router.back()} style={{ width: 120 }}>
        뒤로
      </button>



      {detailLoading && <div>로딩중...</div>}
      {error && <div style={{ color: "red" }}>{error}</div>}
      {!detailLoading && !detail && !error && <div>게시글이 없습니다.</div>}

      {detail && (
      <div style={{ display: "grid", gap: 12 }}>
      <h2 style={{ margin: 0 }}>{detail.title}</h2>

      {/* 대표 썸네일  크기조절*/}  
      {detail.fileUrl && (
      <img
    src={encodeURI(detail.fileUrl)}
    alt="이미지"
    style={{
    width: 160,        // ✅ 가로
    height: 160,       // ✅ 세로
    objectFit: "cover",
    borderRadius: 12,
    display: "block",
    marginTop: 12,
    }}/>)}
    <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
    {detail.content}
    </div>

          {/* 첨부 이미지 리스트 */}
          {Array.isArray(detail.files) && detail.files.length > 0 && (
          <div style={{ display: "grid", gap: 8 }}>
          <h4 style={{ margin: "12px 0 0" }}>첨부 이미지</h4>

          {detail.files.map((file, idx) => (
          <img
              key={`${file.fileUrl}-${idx}`}
              src={file.fileUrl}
              alt={`file-${idx}`}
              style={{
              width: "50%",
              maxHeight: 320,
              objectFit: "cover",
              borderRadius: 12,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}