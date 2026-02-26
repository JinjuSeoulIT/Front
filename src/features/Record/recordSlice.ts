import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  RecordCreatePayload,
  RecordItem,
  RecordState,
  RecordUpdatePayload,
} from "./recordTypes";

type FetchRecordPayload = {
  nursingId: string;
};

type UpdateRecordPayload = {
  nursingId: string;
  form: RecordUpdatePayload;
};

const initialState: RecordState = {
  list: [],
  selected: null,
  loading: false,
  error: null,
};

const recordSlice = createSlice({
  name: "records",
  initialState,
  reducers: {
    fetchRecordsRequest(state) {
      state.loading = true;
      state.error = null;
    },
    fetchRecordsSuccess(state, action: PayloadAction<RecordItem[]>) {
      state.loading = false;
      state.list = action.payload;
    },
    fetchRecordsFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

    fetchRecordRequest(state, _action: PayloadAction<FetchRecordPayload>) {
      state.loading = true;
      state.error = null;
      state.selected = null;
    },
    fetchRecordSuccess(state, action: PayloadAction<RecordItem>) {
      state.loading = false;
      state.selected = action.payload;
    },
    fetchRecordFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

    createRecordRequest(state, _action: PayloadAction<RecordCreatePayload>) {
      state.loading = true;
      state.error = null;
    },
    createRecordSuccess(state) {
      state.loading = false;
    },
    createRecordFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

    updateRecordRequest(state, _action: PayloadAction<UpdateRecordPayload>) {
      state.loading = true;
      state.error = null;
    },
    updateRecordSuccess(state) {
      state.loading = false;
    },
    updateRecordFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

    deleteRecordRequest(state, _action: PayloadAction<string>) {
      state.loading = true;
      state.error = null;
    },
    deleteRecordSuccess(state, action: PayloadAction<string>) {
      state.loading = false;
      state.list = state.list.filter((item) => item.nursingId !== action.payload);
      if (state.selected?.nursingId === action.payload) {
        state.selected = null;
      }
    },
    deleteRecordFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

  },
});

export const {

  fetchRecordsRequest,
  fetchRecordsSuccess,
  fetchRecordsFailure,
  fetchRecordRequest,
  fetchRecordSuccess,
  fetchRecordFailure,
  createRecordRequest,
  createRecordSuccess,
  createRecordFailure,
  updateRecordRequest,
  updateRecordSuccess,
  updateRecordFailure,
  deleteRecordRequest,
  deleteRecordSuccess,
  deleteRecordFailure,
}

= recordSlice.actions;
export default recordSlice.reducer;
