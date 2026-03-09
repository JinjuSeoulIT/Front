import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { staffIdnNumber, staffResponse } from "./StaffType";


type StaffState = {
  
  Stafflist: staffResponse[],
  
  
  Staffcreate: staffResponse | null;
  StaffUpdate: staffResponse | null;
  StaffDetail: staffResponse | null;
  
  

  createSuccess: boolean;
  deleteSuccess: boolean;
  updateSuccess: boolean;

  createdSuccess: boolean;
  loading: boolean;
  error: string | null;
  
};

const initialState: StaffState = {
  
  Stafflist: [],
  
  
  Staffcreate:  null,
  StaffUpdate:  null,
  StaffDetail:  null,
  
  

  createSuccess:   false,
  deleteSuccess:   false,
  updateSuccess:   false,

  createdSuccess: false,
  loading: false,
  error:  null,
};

const StaffSlice = createSlice({
  name: "Staff",
  initialState,
  reducers: {

    //✅ 목록
    //“컴포넌트에서  디스패치하면서 실어 보내는 요청 데이터”(없음)
    StafflistRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    //“서버에서 응답으로 받을 데이터”
    StafflistSuccess: (state, action: PayloadAction<staffResponse[]>) => {
      state.loading= false;
      state.Stafflist = action.payload;
    },
    StafflistFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },


    //✅ 상세
    DetailStaffRequest: (state, action: PayloadAction<number>) => {
      state.loading = true;
      state.error = null;
    },
    //“서버에서 응답으로 받을 데이터”
    DetailStaffSuccess: (state, action: PayloadAction<staffResponse>) => {
      state.loading = false;
      state.StaffDetail = action.payload;

    },
    DetailStaffFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },




    //✅ 추가
    createStaffRequest(state, action: PayloadAction<staffResponse>) {
    state.loading = true;
    state.error = null; 

    },
    createStaffSuccess(state, action: PayloadAction<staffResponse>) {
    state.loading = false;
    state.createSuccess = true;
    state.Staffcreate = action.payload;

    },
    createStaffFail(state, action: PayloadAction<string>) {
    state.loading = false;
    state.error = action.payload;
    },


    //✅ 수정
    //“컴포넌트에서  디스패치하면서 실어 보내는 요청 데이터”(있음)
    updateStaffRequest: (state, action: PayloadAction<staffIdnNumber>) => {
      state.loading = true;
      state.error = null;
    },
    //“서버에서 응답으로 받을 데이터”
    updateStaffSuccess: (state, action: PayloadAction<staffResponse>) => {
      state.loading = false;
      state.updateSuccess = true;          // ✅ 성공시 액션
      state.StaffUpdate = action.payload;
    },
    updateStaffFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },


    //✅ 삭제
    //“컴포넌트에서  디스패치하면서 실어 보내는 요청 데이터”(없음)
    deleteStaffRequest: (state, action: PayloadAction<number>) => {
      state.loading = true;
      state.error = null;
    },
    //“서버에서 응답으로 받을 데이터”
    deleteStaffSuccess: (state) => {
      state.loading = false;
      state.error = null;
      state.deleteSuccess = true;  // ✅ 성공시 액션 
    },

    deleteStaffFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
      state.deleteSuccess = true;
    },

    //끄기 액션
    resetCreateSuccess: (state) => {
      state.createdSuccess = false;

    }
}
});


export const {
StafflistRequest,
StafflistSuccess,
StafflistFailure,

DetailStaffRequest,
DetailStaffSuccess,
DetailStaffFailure,

createStaffRequest,
createStaffSuccess,
createStaffFail,

updateStaffRequest,
updateStaffSuccess,
updateStaffFailure,

deleteStaffRequest,
deleteStaffSuccess,
deleteStaffFailure,

resetCreateSuccess,


} = StaffSlice.actions;

export default StaffSlice.reducer;
