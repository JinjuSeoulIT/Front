import axios from "axios";
import type {
  ApiResponse,
  Reservation,
  ReservationForm,
  ReservationSearchPayload,
} from "@/features/Reservations/ReservationTypes";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE ?? "",
});

export const fetchReservationsApi = async (): Promise<Reservation[]> => {
  const res = await api.get<ApiResponse<Reservation[]>>("/api/reservations");
  if (!res.data.success) {
    throw new Error(res.data.message || "Fetch failed");
  }
  return res.data.result;
};

export const fetchReservationApi = async (reservationId: string): Promise<Reservation> => {
  const res = await api.get<ApiResponse<Reservation>>(
    `/api/reservations/${reservationId}`
  );
  if (!res.data.success) {
    throw new Error(res.data.message || "Fetch failed");
  }
  return res.data.result;
};

export const createReservationApi = async (form: ReservationForm): Promise<void> => {
  const res = await api.post<ApiResponse<void>>("/api/reservations", form);
  if (!res.data.success) {
    throw new Error(res.data.message || "Create failed");
  }
};

export const updateReservationApi = async (
  reservationId: string,
  form: ReservationForm
): Promise<void> => {
  const res = await api.put<ApiResponse<void>>(
    `/api/reservations/${reservationId}`,
    form
  );
  if (!res.data.success) {
    throw new Error(res.data.message || "Update failed");
  }
};

export const searchReservationsApi = async (
  type: ReservationSearchPayload["type"],
  keyword: string
): Promise<Reservation[]> => {
  const res = await api.get<ApiResponse<Reservation[]>>("/api/reservations", {
    params: { searchType: type, searchValue: keyword },
  });

  if (!res.data.success) {
    return [];
  }
  return res.data.result;
};



