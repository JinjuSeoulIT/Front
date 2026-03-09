"use client";

//게시판 목록위 UI 설정
import {  useState } from "react";

export default function BoardSearchBox({ onGo }: { onGo: (postId: number) => void }) {


const [boardboxview, setboardboxview] = useState("");

const postId = Number(boardboxview);
const canGo = postId > 0;
const go = () => {
 if (!canGo) return;
onGo(postId) };

  return (
    <div className="flex items-center gap-2">
      <input
        inputMode="numeric"
        placeholder="postId로 이동"
        value={boardboxview}
        onChange={(boardboxview) => setboardboxview(boardboxview.target.value.replace(/[^\d]/g, ""))}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
          event.preventDefault();
          go();
          }
        }}
        className="w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:ring-2"
      />
      <button
        type="button"
        onClick={go}
        disabled={!postId}
        className="shrink-0 rounded-xl border px-4 py-2 text-sm disabled:opacity-50"
      >
        이동
      </button>
    </div>
  );
}