import axios from "axios";
import type {
  ApiResponse,
  BoardFileCreateReq,
  BoardDetail,
  BoardListItem,
  FileUploadResDTO,

} from "./employeeboardTypes";
import { BoardCreateRes } from "@/components/board/BoardCreate/BoardCreateForm";


export const boardApi = axios.create({
  // ✅ 브라우저는 항상 Next 자신(/api)만 때린다
  // ✅ Next rewrites가 백엔드로 프록시한다
  baseURL: "/api",
  withCredentials: true,
  // ✅ 4xx는 우리가 ApiResponse로 처리할 수 있게 통과
  // ✅ 5xx/네트워크만 catch로
  validateStatus: (status) => status >= 200 && status < 500,
});

// export const boardApi = axios.create({
//   baseURL: "http://localhost:9880",
//   withCredentials: true,
// });

// const BOARD_BASE = "/api/board";


// ✅ 목록: GET /api/board/posts
export async function fetchBoardListApi(): Promise<ApiResponse<BoardListItem[]>> {
  const res = await boardApi.get<ApiResponse<BoardListItem[]>>("/boards/list");
  return res.data;
}
// ✅ 상세: GET /api/board/posts/{postId}
export async function fetchBoardDetailApi(postId: number ): Promise<ApiResponse<BoardDetail>> {
  const res = await boardApi.get<ApiResponse<BoardDetail>>(`/boards/${postId}`);
  return res.data;
}




// ✅ 생성: POST /api/board/posts
export async function createBoardApi(boardreq: BoardFileCreateReq): Promise<ApiResponse<BoardCreateRes>> {

  const res = await boardApi.post<ApiResponse<BoardCreateRes>>("/boards/create", boardreq);
  return res.data;
}

// ✅ 첨부 업로드: POST /api/files/{postId}/files  (key="files")
export async function uploadFileApi(postId: number, file: File): Promise<ApiResponse<FileUploadResDTO>> {
  const form = new FormData();
  form.append("files", file);

  const res = await boardApi.post<ApiResponse<FileUploadResDTO>>(
    `/boards/${postId}/files`,
    form
  );

  return res.data;
}




//✅ 수정







//✅ 삭제