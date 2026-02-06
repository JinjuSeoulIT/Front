"use client";
import { createSlice, PayloadAction, CaseReducer } from "@reduxjs/toolkit";
export interface Position {
  id: number;
  name: string;
  code?: string;
  rankLevel?: number | null;
  description?: string;
  status?: string;
}
export type PositionInput = Omit<Position, "id">;

export interface SearchCondition {
  condition: "name" | "code" | "description";
  value: string;
}
export type ApiResponse<T> = {
  success: boolean;
  message: string;
  result?: T;
};
interface PositionState {
  items: Position[];
  apiresponse: ApiResponse<Position[] | Position | void>;
  loading: boolean;
  error?: string;
  lastAction?: "create" | "update" | "delete";
  lastActionStatus?: "success" | "error";
  lastActionMessage?: string;
}
const initialState: PositionState = {
  items: [],
  apiresponse: { success: false, message: "", result: undefined },
  loading: false,
  error: undefined,
  lastAction: undefined,
  lastActionStatus: undefined,
  lastActionMessage: undefined,
};
const fetchPositionsRequestReducer: CaseReducer<PositionState> = (state) => {
  state.loading = true;
  state.error = undefined;
};
const fetchPositionsSuccessReducer: CaseReducer<
  PositionState,
  PayloadAction<Position[]>
> = (state, action) => {
  state.loading = false;
  state.items = action.payload;
};
const fetchPositionsFailureReducer: CaseReducer<
  PositionState,
  PayloadAction<string>
> = (state, action) => {
  state.loading = false;
  state.error = action.payload;
};

const fetchPositionsByConditionRequestReducer: CaseReducer<
  PositionState,
  PayloadAction<SearchCondition>
> = (state) => {
  state.loading = true;
  state.error = undefined;
};

const fetchPositionsByConditionSuccessReducer: CaseReducer<
  PositionState,
  PayloadAction<Position[]>
> = (state, action) => {
  state.loading = false;
  state.items = action.payload;
};

const fetchPositionsByConditionFailureReducer: CaseReducer<
  PositionState,
  PayloadAction<string>
> = (state, action) => {
  state.loading = false;
  state.error = action.payload;
};
const createPositionRequestReducer: CaseReducer<
  PositionState,
  PayloadAction<PositionInput>
> = (state) => {
  state.loading = true;
  state.error = undefined;
};
const createPositionSuccessReducer: CaseReducer<
  PositionState,
  PayloadAction<Position>
> = (state, action) => {
  state.loading = false;
  state.items.push(action.payload);
  state.lastAction = "create";
  state.lastActionStatus = "success";
  state.lastActionMessage = "직책이 등록되었습니다.";
};
const createPositionFailureReducer: CaseReducer<
  PositionState,
  PayloadAction<string>
> = (state, action) => {
  state.loading = false;
  state.error = action.payload;
  state.lastAction = "create";
  state.lastActionStatus = "error";
  state.lastActionMessage = action.payload || "직책 등록에 실패했습니다.";
};
const updatePositionRequestReducer: CaseReducer<
  PositionState,
  PayloadAction<{ id: number; data: PositionInput }>
> = (state) => {
  state.loading = true;
  state.error = undefined;
};
const updatePositionSuccessReducer: CaseReducer<
  PositionState,
  PayloadAction<Position>
> = (state, action) => {
  state.loading = false;
  state.items = state.items.map((item) =>
    item.id === action.payload.id ? action.payload : item
  );
  state.lastAction = "update";
  state.lastActionStatus = "success";
  state.lastActionMessage = "직책 정보가 수정되었습니다.";
};
const updatePositionFailureReducer: CaseReducer<
  PositionState,
  PayloadAction<string>
> = (state, action) => {
  state.loading = false;
  state.error = action.payload;
  state.lastAction = "update";
  state.lastActionStatus = "error";
  state.lastActionMessage = action.payload || "직책 수정에 실패했습니다.";
};
const deletePositionRequestReducer: CaseReducer<
  PositionState,
  PayloadAction<number>
> = (state) => {
  state.loading = true;
  state.error = undefined;
};
const deletePositionSuccessReducer: CaseReducer<
  PositionState,
  PayloadAction<number>
> = (state, action) => {
  state.loading = false;
  state.items = state.items.filter((item) => item.id !== action.payload);
  state.lastAction = "delete";
  state.lastActionStatus = "success";
  state.lastActionMessage = "직책이 삭제되었습니다.";
};
const deletePositionFailureReducer: CaseReducer<
  PositionState,
  PayloadAction<string>
> = (state, action) => {
  state.loading = false;
  state.error = action.payload;
  state.lastAction = "delete";
  state.lastActionStatus = "error";
  state.lastActionMessage = action.payload || "직책 삭제에 실패했습니다.";
};
const clearPositionStatusReducer: CaseReducer<PositionState> = (state) => {
  state.lastAction = undefined;
  state.lastActionStatus = undefined;
  state.lastActionMessage = undefined;
};
const positionSlice = createSlice({
  name: "position",
  initialState,
  reducers: {
    fetchPositionsRequest: fetchPositionsRequestReducer,
    fetchPositionsSuccess: fetchPositionsSuccessReducer,
    fetchPositionsFailure: fetchPositionsFailureReducer,
    fetchPositionsByConditionRequest: fetchPositionsByConditionRequestReducer,
    fetchPositionsByConditionSuccess: fetchPositionsByConditionSuccessReducer,
    fetchPositionsByConditionFailure: fetchPositionsByConditionFailureReducer,
    createPositionRequest: createPositionRequestReducer,
    createPositionSuccess: createPositionSuccessReducer,
    createPositionFailure: createPositionFailureReducer,
    updatePositionRequest: updatePositionRequestReducer,
    updatePositionSuccess: updatePositionSuccessReducer,
    updatePositionFailure: updatePositionFailureReducer,
    deletePositionRequest: deletePositionRequestReducer,
    deletePositionSuccess: deletePositionSuccessReducer,
    deletePositionFailure: deletePositionFailureReducer,
    clearPositionStatus: clearPositionStatusReducer,
  },
});
export const {
  fetchPositionsRequest,
  fetchPositionsSuccess,
  fetchPositionsFailure,
  fetchPositionsByConditionRequest,
  fetchPositionsByConditionSuccess,
  fetchPositionsByConditionFailure,
  createPositionRequest,
  createPositionSuccess,
  createPositionFailure,
  updatePositionRequest,
  updatePositionSuccess,
  updatePositionFailure,
  deletePositionRequest,
  deletePositionSuccess,
  deletePositionFailure,
  clearPositionStatus,
} = positionSlice.actions;
export default positionSlice.reducer;
