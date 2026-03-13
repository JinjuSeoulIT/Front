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

type SearchRecordPayload = {
  searchType: string;
  searchValue?: string;
  startDate?: string;
  endDate?: string;
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

    fetchRecordRequest(state, action: PayloadAction<FetchRecordPayload>) {
      void action;
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

    createRecordRequest(state, action: PayloadAction<RecordCreatePayload>) {
      void action;
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

    updateRecordRequest(state, action: PayloadAction<UpdateRecordPayload>) {
      void action;
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

    deleteRecordRequest(state, action: PayloadAction<string>) {
      void action;
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

    searchRecordRequest(state, action: PayloadAction<SearchRecordPayload>) {
      void action;
      state.loading = true;
      state.error = null;
    },
    searchRecordSuccess(state, action: PayloadAction<RecordItem[]>) {
      state.loading = false;
      state.list = action.payload;
    },
    searchRecordFailure(state, action: PayloadAction<string>) {
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
  searchRecordRequest,
  searchRecordSuccess,
  searchRecordFailure,
} = recordSlice.actions;

export default recordSlice.reducer;
