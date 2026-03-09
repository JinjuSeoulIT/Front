
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { DoctorCreateRequest, DoctorDeleteRequest, DoctorDetailResView, DoctorListView, DoctorResponse, DoctorUpdateRequest, FileUploadResDTO } from "./doctortypes";

type DoctorState = {
   list: DoctorListView[];
   DoctorDetail: DoctorDetailResView | null;  //닥터 상세 뷰


  loading: boolean;
  doctor: DoctorResponse | null;
  error: string | null;
  lastReq: any | null;
  createSuccess: boolean;
  deleteSuccess: boolean;




// ✅ 대표 이미지 독립 업로드
  uploaded: FileUploadResDTO | null;  //“결과 데이터” ✅
  uploadLoading: boolean;
  uploadDone: boolean;    //“이벤트(트리거)” ✅
  uploadedFileUrl: string | null;  //“결과 데이터” ✅




};

const initialState: DoctorState = {
  list: [],
  DoctorDetail: null,   //닥터 상세 뷰


  lastReq: null,
  loading: false,
  doctor: null,
  error: null,
  createSuccess: false,
  deleteSuccess: false,



//✅ 대표 이미지 독립 업로드
  uploaded: null,  //“결과 데이터” ✅
  uploadLoading: false,
  uploadDone: false,
  uploadedFileUrl: null,


};


const doctorSlice = createSlice({
  name: "doctor",
  initialState,
  reducers: {


  //리스트
   // 🔹 요청
    DoctorProfileListRequest(state) {
      state.loading = true;
      state.error = null;
    },

    // 🔹 성공
    DoctorProfileListSuccess(state,action: PayloadAction<DoctorListView[]>
    ) {
      state.loading = false;
      state.list = action.payload;
    },
    // 🔹 실패
    DoctorProfileListFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },


    
    //의사 상세
    DoctorProfileByIdRequest(state, action: PayloadAction<number>) {
      state.loading = true;
      state.lastReq = action.payload;
      state.error = null;
    },
    DoctorProfileSuccess(state, action: PayloadAction<DoctorDetailResView>) {
      state.loading = false;
      state.DoctorDetail = action.payload;
    },
    DoctorProfileFail(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },














    // //상세
    // DoctorByIdRequest(state, action: PayloadAction<number>) {
    //   state.loading = true;
    //   state.lastReq = action.payload;
    //   state.error = null;
    // },
    // DoctorSuccess(state, action: PayloadAction<DoctorResponse>) {
    //   state.loading = false;
    //   state.doctor = action.payload;
    // },
    // DoctorFail(state, action: PayloadAction<string>) {
    //   state.loading = false;
    //   state.error = action.payload;
    // },





    createDoctorRequest(state, action: PayloadAction<DoctorCreateRequest>) {
      state.loading = true;
      state.error = null;
      state.lastReq = action.payload;
      state.deleteSuccess = false;
    },
    createDoctorSuccess(state, action: PayloadAction<DoctorResponse>) {
      state.loading = false;
      state.doctor = action.payload;
      state.createSuccess = true;
    },
    createDoctorFail(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    
   /* =======================
    ✅ 독립 업로드(대표 이미지 0~1)
    POST /api/files/upload
    ======================= */ 
//어디에(postId) + 무엇을(file) (1)
    uploadFileRequest(state, _action: PayloadAction<{  file: File }>) {
      state.uploadLoading = true;
      state.error = null;
      state.uploadDone = false;  //스위치 
      state.uploadedFileUrl = null;
    },
    uploadFileSuccess(state, action: PayloadAction<FileUploadResDTO>) {
      state.uploadLoading = false;
      state.uploaded = action.payload;       // ✅ 업로드 결과 저장
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









    
    updateDoctorRequest(state, action: PayloadAction<DoctorUpdateRequest>) {
      state.loading = true;
      state.error = null;
      state.lastReq = action.payload;
    
    },
    updateDoctorSuccess(state, action: PayloadAction<DoctorResponse>) {
      state.loading = false;
      state.doctor = action.payload;
    },
    updateDoctorFail(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },


    
    deleteDoctorRequest(state, action: PayloadAction<DoctorDeleteRequest>) {
      state.loading = true;
      state.error = null;
      state.lastReq = action.payload;
      state.deleteSuccess = false;
    },
    deleteDoctorSuccess(state) {
      state.loading = false;
      state.doctor = null;
      state.deleteSuccess = true;
    },
    deleteDoctorFail(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
      state.deleteSuccess = false;
    },
  },
},
)

export const {
  DoctorProfileListRequest,
  DoctorProfileListSuccess,
  DoctorProfileListFailure,

  DoctorProfileByIdRequest,
  DoctorProfileSuccess,
  DoctorProfileFail,





  createDoctorRequest,
  createDoctorSuccess,
  createDoctorFail,

  uploadFileRequest,
  uploadFileSuccess,
  uploadFileFailure,
  clearUploadstate,
  clearUploadMetaData,


  // DoctorByIdRequest,
  // DoctorSuccess,
  // DoctorFail,

  updateDoctorRequest,
  updateDoctorSuccess,
  updateDoctorFail,

  deleteDoctorRequest,
  deleteDoctorSuccess,
  deleteDoctorFail,



} = doctorSlice.actions;

export default doctorSlice.reducer;
