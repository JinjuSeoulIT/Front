"use client";
//내용물 가져오기
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchBoardListRequest } from "@/components/fatures/board/boardSlice";
import BoardListView from "@/components/board/BoardList/boardListView";
import BoardSearchBox from "@/components/board/BoardList/BoardSearchBox";

export default function BoardListContainer() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { list, listLoading, error } = useAppSelector((s) => s.board);

    useEffect(() => {
    dispatch(fetchBoardListRequest());
    }, [dispatch]);

    return (
    <div className="mx-auto max-w-4xl space-y-4 p-4">
    <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">게시판</h2>
        <button
        className="rounded-xl border bg-white px-4 py-2 text-sm shadow-sm hover:bg-gray-50"
        onClick={() => router.push("/board/create")}
        >
        글쓰기
        </button>
    </div>
    
    <BoardSearchBox onGo={(postId) => router.push(`/board/${postId}/detail`)} /> 

    {listLoading && <div className="text-gray-600">로딩중...</div>}
    {error && <div className="text-red-500">{error}</div>}
    {!listLoading && !error && <BoardListView items={list} />}
    </div>
    );
    }