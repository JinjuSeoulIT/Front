export type PositionResponse = {
  positionId: number;
  positionType: string;
  positionCode: string;
  positionLevel?: number | string;
  positionName: string;
  managerYn?: string;
  rmk?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type PositionIdParam = {
  positionId: number;
};

export type PositionRequest = {
  positionId: number | string;
  positionType: string;
  positionCode: string;
  positionLevel: string;
  positionName: string;
  managerYn: string;
  rmk: string;
};

export const initialPositionForm: PositionRequest = {
  positionId: 0,
  positionType: "",
  positionCode: "",
  positionLevel: "",
  positionName: "",
  managerYn: "N",
  rmk: "",
};

export type PositionUpdatePayload = {
  positionId: number;
  positionReq: PositionRequest;
};

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};
