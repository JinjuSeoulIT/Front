
//게시판 리스트
export type BoardListItem = {
  postId: number;
  title: string;
  fileUrl?: string | null;
  createdAt?: string | null;
 

  // ✅ 작성자 표시(조인 결과)
  authorName?: string | null;
  authorType?: string | null; // "DOCTOR" | "NURSE" | "ADMIN" 

  hitCnt?: number | null;

  

  // 목록에서 content까지 주면 넣고, 아니면 빼도 됨
  content?: string | null;
};

//게시판 상세 적기
export type BoardDetail = {
  postId: number;
  authenticationId?: number;
  title: string;
  content: string;
  fileUrl: string | null; // 대표(썸네일)
  hitCnt: number;
  createdAt: string; 
  updatedAt: string;
  // ✅ 작성자 표시(조인 결과)
  authorName?: string | null;
  authorType?: string | null; // "DOCTOR" | "NURSE" | "ADMIN" 
  
  files: BoardFile[];
};


///////////////////////////////////////////////////////////////////////////////////////////////


//게시판 파일 등록
export type BoardFileCreateReq = {
  title: string;
  content: string;
  fileUrl: string | null; // ✅ 추가
  // MVP: 대표이미지 0~1개. (백엔드가 files 리스트 받을 수 있게 되어있음)
  files?: BoardFile[];  //// (원래는 여러 파일 메타 목록용)
};



//게시판 파일 연결되는 파일메타 
export type BoardFile = {
  fileUrl: string;
  sortOrder?: number | null;  //파일정렬
};


//API용 파일 업로드 
export type FileUploadResDTO = {
  postId: number;
  fileUrl: string;
  objectKey: string;
  contentType: string;
  size: number;
  originalName: string;
};


///////////////////////////////////////////////////////////////////////////////////////





//에러요청 타입

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

