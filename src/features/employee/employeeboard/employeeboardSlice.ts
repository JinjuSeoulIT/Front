// boardSlice.ts

//임시업로드: 프론트가 URL을 받아서 create 요청에 포함해야 하니까 store에 저장

// 첨부업로드: 서버가 DB에 메타를 저장해버리니까 프론트가 URL을 굳이 저장할 필요가 줄어듦
// (상세 조회 때 DB에서 다시 가져오면 됨)
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { BoardFileCreateReq, BoardDetail, BoardListItem, FileUploadResDTO } from "./employeeboardTypes";

type BoardState = {
  list: BoardListItem[];
  detail: BoardDetail | null;
  
  // ✅ 글 생성
  listLoading: boolean;


  detailLoading: boolean;



  createLoading: boolean;
  createdPostId: number | null;  //🔑식별아이디 PK
  createDone: boolean;   // ✅ 추가

  // ✅ 대표 이미지 독립 업로드
  uploadLoading: boolean;
  uploadDone: boolean;    //“이벤트(트리거)” ✅
  uploadedFileUrl: string | null;  //“결과 데이터” ✅

  // (선택) create가 void면 굳이 필요 없음 //목록에 포스트아이디 pk참조할때 수정
  
  
  error: string | null;
};

const initialState: BoardState = {
  list: [],
  detail: null,

  //✅ 글 생성
  listLoading: false,

  detailLoading: false,


  createLoading: false,
  createdPostId: null,   //🔑식별아이디 PK
  createDone: false,

  //✅ 대표 이미지 독립 업로드
  uploadLoading: false,
  uploadDone: false,
  uploadedFileUrl: null,
  // (선택) create가 void면 굳이 필요 없음 //목록에 포스트아이디 pk참조할때 수정


  error: null,
};

const boardSlice = createSlice({
  name: "board",
  initialState,
  reducers: {
  

    /* =======================
      목록
    ======================= */
    fetchBoardListRequest(state) {
      state.listLoading = true;
      state.error = null;
    },
    fetchBoardListSuccess(state, action: PayloadAction<BoardListItem[]>) {
      state.listLoading = false;
      state.list = action.payload;
    },
    fetchBoardListFailure(state, action: PayloadAction<string>) {
      state.listLoading = false;
      state.error = action.payload;
    },

    /* =======================
      상세
    ======================= */
    fetchBoardDetailRequest(state, _action: PayloadAction<{ postId: number }>) {
      state.detailLoading = true;
      state.error = null;
      state.detail = null;
    },
    fetchBoardDetailSuccess(state, action: PayloadAction<BoardDetail>) {
      state.detailLoading = false;
      state.detail = action.payload;
    },
    fetchBoardDetailFailure(state, action: PayloadAction<string>) {
      state.detailLoading = false;
      state.error = action.payload;
    },





    /* =======================
      ✅ 게시판 생성 
      - postId 안 받는 정책이면 success payload 없음
    ======================= */
    createBoardRequest(state, _action: PayloadAction<{ boardReq: BoardFileCreateReq }>) {
      state.createLoading = true;
       state.createDone = false;     // ✅ 요청 시작하면 내려
      state.error = null;
      state.createdPostId = null; //🔑식별아이디 PK 성공액션
    },
    createBoardSuccess(state, action: PayloadAction<{ postId: number }>) {
      state.createdPostId = action.payload.postId;  // ✅ 여기서 저장
      state.createLoading = false;
      state.createDone = true;      // ✅ 성공 스위치 올려
    },
    createBoardFailure(state, action: PayloadAction<string>) {
      state.createLoading = false;
      state.createDone = false;     // ✅ 실패면 내려
      state.error = action.payload;
    },



    /* =======================
    ✅ 독립 업로드(대표 이미지 0~1)
    POST /api/files/upload
    ======================= */ 
//어디에(postId) + 무엇을(file) (1)
    uploadFileRequest(state, _action: PayloadAction<{ postId: number; file: File }>) {
      state.uploadLoading = true;
      state.error = null;
      state.uploadDone = false;  //스위치 
      state.uploadedFileUrl = null;
    },
    uploadFileSuccess(state) {
      state.uploadLoading = false;
      state.uploadDone = true;
      // state.uploadedFileUrl = action.payload.fileUrl;
    },
    uploadFileFailure(state, action: PayloadAction<string>) {
      state.uploadLoading = false;
      state.error = action.payload;
      state.uploadDone = false;  //스위치 
      state.uploadedFileUrl = null;
    },

    // 업로드 상태 초기화
    clearUploadstate(state) {   //“업로드 성공 이벤트가 한 번 발생했음”을 알려주는 스위치
      state.uploadDone = false;
    },
    clearUploadMetaData(state) {   //"업로드 결과로 받은 실제 데이터(결과물)""
      state.uploadedFileUrl = null;
    },
  },
});


export const {


  fetchBoardListRequest,
  fetchBoardListSuccess,
  fetchBoardListFailure,

  fetchBoardDetailRequest,
  fetchBoardDetailSuccess,
  fetchBoardDetailFailure,

  createBoardRequest,
  createBoardSuccess,
  createBoardFailure,
  


  uploadFileRequest,  //업로드파일 
  uploadFileSuccess,
  uploadFileFailure,
  

   
  clearUploadstate,   //상태초기화
  clearUploadMetaData,
} = boardSlice.actions;

export default boardSlice.reducer;