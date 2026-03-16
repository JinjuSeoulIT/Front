
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type {
  FileUploadResDTO,
  NurseCreateRequest,
  NurseFile,

  NurseResponse,
  NurseUpdateNumber,
  NurseIdNumber,
} from "./nurseTypes";


export interface NurseState {
  nurselist:NurseResponse[];

  nurseDetail : NurseResponse | null;
  nursecreated: NurseResponse | null;
  nurseupdated: NurseResponse | null;


  
  updateSuccess: boolean;
  createSuccess: boolean;
  deleteSuccess: boolean;

  loading:  boolean;
  error: string | null;
  SuccessEnd : boolean;

  
  //메타데이터용 업로드
  uploaded:        FileUploadResDTO | null;   // 업로드 결과 전체
  uploadLoading:   boolean;
  uploadSuccess:      boolean;                   // 1회성 성공 
  uploadedFileUrl: string | null;             // 화면에서 바로 쓰기 좋은 URL
}



const initialState: NurseState = {
  nurselist:[],


  nurseDetail : null,
  nursecreated: null,
  nurseupdated: null,



  updateSuccess: false,
  createSuccess: false,
  deleteSuccess: false,

  loading:  false,
  error: null,
  SuccessEnd : false,

  uploaded: null,
  uploadLoading: false,
  uploadSuccess: false,
  uploadedFileUrl: null,
};

const nurseSlice = createSlice({
  name: "nurse",
  initialState,
  reducers: {


    // 목록
    //“컴포넌트에서  디스패치하면서 실어 보내는 요청 데이터”(없음)
    nurselistRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    //“서버에서 응답으로 받을 데이터”
    nurselistSuccess: (state, action: PayloadAction<NurseResponse[]>) => {
      state.loading= false;
      state.nurselist = action.payload;
    },
    nurselistFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },


    // 상세
    DetailNurseRequest: (state, action: PayloadAction<NurseIdNumber>) => {
      state.loading = true;
      state.error = null;
    },
    //“서버에서 응답으로 받을 데이터”
    DetailNurseSuccess: (state, action: PayloadAction<NurseResponse>) => {
      state.loading = false;
      state.nurseDetail = action.payload;
    },
    DetailNurseFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },



    // 생성
    //“컴포넌트에서  디스패치하면서 실어 보내는 요청 데이터”(있음)
    createNurseRequest: (state, action: PayloadAction<NurseCreateRequest>) => {
      state.loading = true;
      state.error = null;
    },
    //“서버에서 응답으로 받을 데이터”
    createNurseSuccess: (state, action: PayloadAction<NurseResponse>) => {
      state.loading = false;
      state.createSuccess = true;            // ✅ 성공시 액션
      state.nursecreated = action.payload;   //데이터 
    },
    createNurseFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;

    },


    // 수정
    //“컴포넌트에서  디스패치하면서 실어 보내는 요청 데이터”(있음)
    updateNursedRequest: (state, action: PayloadAction<NurseUpdateNumber>) => {
      state.loading = true;
      state.error = null;
    },
    //“서버에서 응답으로 받을 데이터”
    updateNurseSuccess: (state, action: PayloadAction<NurseResponse>) => {
      state.loading = false;
      state.updateSuccess = true;          // ✅ 성공시 액션
      state.nurseupdated = action.payload;  //데이터 
    },
    updateNurseFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },


    // 삭제
    //“컴포넌트에서  디스패치하면서 실어 보내는 요청 데이터”(없음)
    deleteNurseRequest: (state, action: PayloadAction<NurseIdNumber>) => {
      state.loading = true;
      state.error = null;
    },
    //“서버에서 응답으로 받을 데이터”
    deleteNurseSuccess: (state) => {
      state.loading = false;
      state.deleteSuccess = true;  // ✅ 성공시 액션 
    },
    deleteNurseFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },


  //업로드  (메타데이터)
    uploadNurseFileRequest: (state,_action: PayloadAction<NurseFile>) => {
      state.uploadLoading = true;
      state.error = null;

      state.uploadSuccess = false;
      state.uploaded = null;
      state.uploadedFileUrl = null;
    },
    uploadNurseFileSuccess: (state,action: PayloadAction<FileUploadResDTO>) => {
      state.uploadLoading = false;
      state.uploadSuccess = true;
      state.uploaded = action.payload;
      // ✅ (미리보기용)
      state.uploadedFileUrl = action.payload.fileUrl;
    },
    uploadNurseFileFailure: (state, action: PayloadAction<string>) => {
      state.uploadLoading = false;
      state.error = action.payload;
      state.uploadedFileUrl = null;
      state.uploadSuccess = false;
    },
    


     //리랜더링 끄기용 액션용
    resetSuccessEnd: (state) => {
      state.SuccessEnd = false;
      state.createSuccess = false;
      state.updateSuccess = false;
      state.deleteSuccess = false;
      state.uploadSuccess = false;
}

  },
});

export const {


  nurselistRequest,
  nurselistSuccess,
  nurselistFailure,

  DetailNurseRequest,
  DetailNurseSuccess,
  DetailNurseFailure,

  createNurseRequest,
  createNurseSuccess,
  createNurseFailure,

  updateNursedRequest,
  updateNurseSuccess,
  updateNurseFailure,

  deleteNurseRequest,
  deleteNurseSuccess,
  deleteNurseFailure,

    // 업로드
  uploadNurseFileRequest,
  uploadNurseFileSuccess,
  uploadNurseFileFailure,

  resetSuccessEnd
} = nurseSlice.actions;

export default nurseSlice.reducer;
