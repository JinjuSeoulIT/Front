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
  baseURL: process.env.NEXT_PUBLIC_RECEPTION_API_BASE_URL ?? "http://192.168.1.55:8283",
});

const endpointBuilders = [
  (visitId: number) => `/api/receptions/${visitId}/reservation`,
  (visitId: number) => `/api/receptions/${visitId}/reservations`,
  () => "/api/reservations",
];

function resolveErrorMessage(err: unknown, fallback: string) {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as
      | { message?: string; error?: string; detail?: string }
      | undefined;
    if (data?.message) return data.message;
    if (data?.error) return data.error;
    if (data?.detail) return data.detail;
    if (err.message) return err.message;
  }
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

function isNotFoundError(err: unknown) {
  return axios.isAxiosError(err) && err.response?.status === 404;
}

export const saveVisitReservationApi = async (
  visitId: number,
  payload: SaveVisitReservationReq
): Promise<void> => {
  const body = {
    ...payload,
    visitId,
    receptionId: visitId,
  };

  let lastError: unknown = null;
  for (const toEndpoint of endpointBuilders) {
    try {
      const endpoint = toEndpoint(visitId);
      const res = await api.post<ApiResponse<unknown> | unknown>(endpoint, body);
      const wrapped = res.data as ApiResponse<unknown>;
      if (typeof wrapped !== "object" || wrapped === null || wrapped.success !== false) {
        return;
      }
      throw new Error(wrapped.message || "예약 저장에 실패했습니다.");
    } catch (err) {
      lastError = err;
      if (!isNotFoundError(err)) {
        break;
      }
      // Try next endpoint when backend path differs by environment.
    }
  }

  throw new Error(resolveErrorMessage(lastError, "예약 저장 API 호출에 실패했습니다."));
};
