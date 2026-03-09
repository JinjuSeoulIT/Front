"use client";
////실시간 랜더링용
import Link from "next/link";
import type { BoardListItem } from "@/components/fatures/board/boardTypes";

export default function BoardListView({ items }: { items: BoardListItem[] }) {
  if (items.length === 0) return <div className="text-gray-500">게시글이 없어요.</div>;

  return (
    <div className="space-y-3">
      {items.map((board) => (
        <Link
          key={board.postId}
          href={`/board/${board.postId}/detail`}
          className="block rounded-xl border bg-white p-4 shadow-sm transition hover:bg-gray-50"
        >
          <div className="flex gap-4">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border bg-gray-100">
              {board.fileUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={encodeURI(board.fileUrl)}
                  alt="thumbnail"
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : null}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <h3 className="truncate text-sm font-semibold text-gray-900">{board.title}</h3>
                <span className="shrink-0 text-xs text-gray-500">
                  {(board.createdAt ?? "").slice(0, 10)}
                </span>
              </div>

              <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                {(board.content ?? "").slice(0, 140)}
              </p>

              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                <span>작성자: {board.authorName}</span>
                <span>직업: {board.authorType}</span>
                <span>조회 {board.hitCnt}</span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}