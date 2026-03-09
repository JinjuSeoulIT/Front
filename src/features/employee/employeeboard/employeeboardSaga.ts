// boardSaga.ts
import { call, put, takeLatest } from "redux-saga/effects";
import type { SagaIterator } from "redux-saga";

import {
  fetchBoardListRequest,
  fetchBoardListSuccess,
  fetchBoardListFailure,

  fetchBoardDetailRequest,
  fetchBoardDetailSuccess,
  fetchBoardDetailFailure,

  createBoardRequest,
  createBoardSuccess,
  createBoardFailure,

  uploadFileRequest,
  uploadFileSuccess,
  uploadFileFailure,
} from "./employeeboardSlice";

import {
  fetchBoardListApi,
  fetchBoardDetailApi,
  createBoardApi,
  uploadFileApi,
} from "./employeeboardAPI";

import type { ApiResponse, BoardDetail, BoardListItem,  FileUploadResDTO } from "./employeeboardTypes";

//이 saga들 전부 원칙: try=백엔드 success/message, catch=연결실패로 통일해줘”
// “중복 제거(헬퍼 함수/유틸)로 깔끔하게 만들어줘”


/* =======================
  목록
======================= */
function* fetchBoardListWorker(): SagaIterator {
  try {
    const res: ApiResponse<BoardListItem[]> = yield call(fetchBoardListApi);
    if (res.success) {
    yield put(fetchBoardListSuccess(res.data));
    } else{
      yield put(fetchBoardListFailure(res.message))  // 백엔드 실패처리
    }
    //“성공이면 success, 실패면 failure 후 return” 패턴
    }catch (error: unknown) {  //언카노운 : 타입스크립트에서 **“뭔지 모르는 값”**이라는 타입
    yield put(fetchBoardListFailure("게시글 리스트 연결실패 500"));
    }
    }
/* =======================
  상세
======================= */
                                  //action: PayloadAction<DoctorCreateRequest>
                                  //옛날방식
function* fetchBoardDetailWorker(action: ReturnType<typeof fetchBoardDetailRequest>): SagaIterator {
                                 //요즘 Redux Toolkit + Saga에서 더 권장되는 방식
                                 //“단일 진실 소스”
                                 //타입변경 시 에러가 강제로 드러남
                                 // 유지보수 비용 ↓↓↓
  try {
    const res: ApiResponse<BoardDetail> = yield call(fetchBoardDetailApi,action.payload.postId);
    if (res.success) {
    yield put(fetchBoardDetailSuccess(res.data));
    } else {
    yield put(fetchBoardDetailFailure(res.message))  
    }
    //“성공이면 success, 실패면 failure 후 return” 패턴
    } catch (error: unknown) {  
    yield put(fetchBoardDetailFailure("게시글 상세 연결실패 500"));
    }
    }







/* =======================
  ✅ 생성 (void 성공)
   action.payload = { req }  //대부분 게시판은 생성 후 목록으로 가기때문에 굳이 id안받아옴 
======================= */

// function* createBoardWorker(action: ReturnType<typeof createBoardRequest>): SagaIterator {
//   try {                     
//     const res: ApiResponse<> = yield call(createBoardApi, action.payload.boardReq);
    
    
//       if (res.success) {
//          // ✅ 핵심: postId를 성공하면 담아라
//       yield put(createBoardSuccess({ postId: res.data.postId })); //🔑식별아이디 PK
//       } else {


//       yield put(createBoardFailure(res.message))  
//       }    
     

//       } catch (error: unknown) {
//       // ✅ 프론트 최종 안전망: 연결 실패
//       yield put(createBoardFailure("게시글 생성 연결실패 500"));
//       }
//       }

/* =======================
  ✅ 대표 이미지 업로드(첨부 업로드: postId 필요)
  - 성공 시: fileUrl 리턴(보장)
======================= */
function* uploadFileWorker(
  action: ReturnType<typeof uploadFileRequest>): SagaIterator {
  try {
  
    const { postId, file } = action.payload; //🔑식별아이디 PK
    const res: ApiResponse<FileUploadResDTO> = yield call(uploadFileApi,postId,file); //🔑식별아이디 PK

    //업로드 결과(파일 자체 정보) (2)
    if (res.success) {
      yield put(uploadFileSuccess());
    } else {
      yield put(uploadFileFailure(res.message));
    }
  } catch ( error: unknown) {
    yield put(uploadFileFailure("파일 업로드 연결실패"));
  }
}




















export function* boardSaga(): SagaIterator {
                            //사가 2중타입 안전성때문에 넣음
  yield takeLatest(fetchBoardListRequest.type, fetchBoardListWorker);

  yield takeLatest(fetchBoardDetailRequest.type, fetchBoardDetailWorker);

  yield takeLatest(uploadFileRequest.type, uploadFileWorker);

  // yield takeLatest(createBoardRequest.type, createBoardWorker);
}