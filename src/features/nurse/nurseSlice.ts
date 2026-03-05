
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type {
  NurseCreateRequest,

 
  NurseIdnNumber,

 
  NurseResponse,
  NurseUpdateRequest,
} from "./nurseTypes";
import { NursingRecordUpdatePayload } from "@/lib/recordApi";

/**
 * ✅ Nurse Feature State
 * - loading/error/done 을 "액션별"로 분리 (컴포넌트 붙일 때 안정적)
 */
export interface NurseState {
  nurselist:NurseResponse[];
  selected: NurseResponse | null;

  nurseDetail : NurseResponse | null;
  nursecreated: NurseResponse | null;
  nurseupdated: NurseCreateRequest | null;

  loading:  boolean;
  
  updateSuccess: boolean;
  createdSuccess: boolean;
  deleteSuccess: boolean;

  error: string | null;

}

const initialState: NurseState = {
  nurselist:[],
  selected: null,

  nurseDetail : null,
  nursecreated: null,
  nurseupdated: null,

  loading:  false,

  updateSuccess: false,
  createdSuccess: false,
  deleteSuccess: false,
  error: null,


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
    DetailNurseRequest: (state, action: PayloadAction<number>) => {
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
      state.createdSuccess = true;          // ✅ 성공시 액션
      state.nursecreated = action.payload;
    
    },
    createNurseFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;

    },



    // 수정
    //“컴포넌트에서  디스패치하면서 실어 보내는 요청 데이터”(있음)
    updateNursedRequest: (state, action: PayloadAction<NursingRecordUpdatePayload>) => {
      state.loading = true;
      state.error = null;
      
    },
    //“서버에서 응답으로 받을 데이터”
    updateNurseSuccess: (state, action: PayloadAction<NurseResponse>) => {
      state.loading = false;
      state.updateSuccess = true;          // ✅ 성공시 액션
      state.nurseupdated = action.payload;
    },
    updateNurseFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },


    // 삭제
    //“컴포넌트에서  디스패치하면서 실어 보내는 요청 데이터”(없음)
    deleteNurseRequest: (state, action: PayloadAction<number>) => {
      state.loading = true;
      state.error = null;
    },
    //“서버에서 응답으로 받을 데이터”
    deleteNurseSuccess: (state) => {
      
      state.loading = false;
      state.error = null;
      state.deleteSuccess = true;  // ✅ 성공시 액션 

    },

    deleteNurseFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
      state.deleteSuccess = false;
    },

    //끄기용 액션용
    resetCreateSuccess: (state) => {
      state.createdSuccess = false;
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

  resetCreateSuccess
} = nurseSlice.actions;

export default nurseSlice.reducer;
