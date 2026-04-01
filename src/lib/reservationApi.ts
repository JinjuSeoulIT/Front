import axios from "axios";

type ApiResponse<T> = {
  success?: boolean;
  message?: string;
  result?: T;
};

export type SaveVisitReservationReq = {
  reservationId?: string | null;
  scheduledAt?: string;
  arrivalAt?: string;
  note?: string | null;
};

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE ?? "",
});

const endpointBuilders = [
  (visitId: number) => `/api/receptions/${visitId}/reservation`,
  (visitId: number) => `/api/receptions/${visitId}/reservations`,
  () => "/api/reservations",
];

export const saveVisitReservationApi = async (
  visitId: number,
  payload: SaveVisitReservationReq
): Promise<void> => {
  const body = {
    ...payload,
    visitId,
    receptionId: visitId,
  };

  for (const toEndpoint of endpointBuilders) {
    try {
      const endpoint = toEndpoint(visitId);
      const res = await api.post<ApiResponse<unknown> | unknown>(endpoint, body);
      const wrapped = res.data as ApiResponse<unknown>;
      if (typeof wrapped !== "object" || wrapped === null || wrapped.success !== false) {
        return;
      }
    } catch {
      // Try next endpoint when backend path differs by environment.
    }
  }

  throw new Error("예약 저장 API 호출에 실패했습니다.");
};

