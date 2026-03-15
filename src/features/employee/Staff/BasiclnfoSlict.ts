import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  staffCreateRequest,
  staffIdnNumber,
  staffResponse,
} from "./BasiclnfoType";

type StaffState = {
  Stafflist: staffResponse[];
  Staffcreate: staffResponse | null;
  StaffUpdate: staffResponse | null;
  StaffDetail: staffResponse | null;
  createSuccess: boolean;
  deleteSuccess: boolean;
  updateSuccess: boolean;
  loading: boolean;
  error: string | null;
};

const initialState: StaffState = {
  Stafflist: [],
  Staffcreate: null,
  StaffUpdate: null,
  StaffDetail: null,
  createSuccess: false,
  deleteSuccess: false,
  updateSuccess: false,
  loading: false,
  error: null,
};

const StaffSlice = createSlice({
  name: "staff",
  initialState,
  reducers: {
    StafflistRequest(state) {
      state.loading = true;
      state.error = null;
    },
    StafflistSuccess(state, action: PayloadAction<staffResponse[]>) {
      state.loading = false;
      state.Stafflist = action.payload;
    },
    StafflistFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

    DetailStaffRequest(state, _action: PayloadAction<string>) {
      state.loading = true;
      state.error = null;
      state.StaffDetail = null;
    },
    DetailStaffSuccess(state, action: PayloadAction<staffResponse>) {
      state.loading = false;
      state.StaffDetail = action.payload;
    },
    DetailStaffFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

    createStaffRequest(state, _action: PayloadAction<staffCreateRequest>) {
      state.loading = true;
      state.error = null;
      state.createSuccess = false;
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

    updateStaffRequest(state, _action: PayloadAction<staffIdnNumber>) {
      state.loading = true;
      state.error = null;
      state.updateSuccess = false;
    },
    updateStaffSuccess(state, action: PayloadAction<staffResponse>) {
      state.loading = false;
      state.updateSuccess = true;
      state.StaffUpdate = action.payload;
    },
    updateStaffFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

    deleteStaffRequest(state, _action: PayloadAction<string>) {
      state.loading = true;
      state.error = null;
      state.deleteSuccess = false;
    },
    deleteStaffSuccess(state) {
      state.loading = false;
      state.deleteSuccess = true;
    },
    deleteStaffFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
      state.deleteSuccess = false;
    },

    //초기화용
    resetCreateSuccess(state) {
      state.createSuccess = false;
      state.updateSuccess = false;
      state.deleteSuccess = false;
    },
  },
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
