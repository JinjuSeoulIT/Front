import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { VisitRes } from "@/lib/receptionApi";
import type { VisitEmergency } from "@/lib/emergencyApi";
import type { VisitInpatient } from "@/lib/inpatientApi";
import type { VisitReservation } from "@/lib/reservationApi";
import type { ReceptionState } from "./receptionTypes";

const initialState: ReceptionState = {
  list: [],
  loading: false,
  error: null,
  reservation: {
    byVisitId: {},
    loading: false,
    error: null,
  },
  emergency: {
    byVisitId: {},
    loading: false,
    error: null,
  },
  inpatient: {
    byVisitId: {},
    loading: false,
    error: null,
  },
};

const receptionSlice = createSlice({
  name: "reception",
  initialState,
  reducers: {
    fetchVisitsRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchVisitsSuccess: (state, action: PayloadAction<VisitRes[]>) => {
      state.loading = false;
      state.list = action.payload;
    },
    fetchVisitsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    upsertVisit: (state, action: PayloadAction<VisitRes>) => {
      const idx = state.list.findIndex((v) => v.id === action.payload.id);
      if (idx === -1) {
        state.list = [action.payload, ...state.list];
      } else {
        state.list[idx] = action.payload;
      }
    },
    removeVisit: (state, action: PayloadAction<number>) => {
      state.list = state.list.filter((v) => v.id !== action.payload);
    },
    clearReceptionError: (state) => {
      state.error = null;
    },

    fetchReservationRequest: (state, _action: PayloadAction<{ visitId: number }>) => {
      state.reservation.loading = true;
      state.reservation.error = null;
    },
    fetchReservationSuccess: (
      state,
      action: PayloadAction<{ visitId: number; data: VisitReservation | null }>
    ) => {
      state.reservation.loading = false;
      state.reservation.byVisitId[action.payload.visitId] = action.payload.data;
    },
    fetchReservationFailure: (
      state,
      action: PayloadAction<{ visitId: number; error: string }>
    ) => {
      state.reservation.loading = false;
      state.reservation.error = action.payload.error;
    },
    saveReservationRequest: (
      state,
      _action: PayloadAction<{ visitId: number; payload: Partial<VisitReservation> }>
    ) => {
      state.reservation.loading = true;
      state.reservation.error = null;
    },
    saveReservationSuccess: (
      state,
      action: PayloadAction<{ visitId: number; data: VisitReservation }>
    ) => {
      state.reservation.loading = false;
      state.reservation.byVisitId[action.payload.visitId] = action.payload.data;
    },
    saveReservationFailure: (
      state,
      action: PayloadAction<{ visitId: number; error: string }>
    ) => {
      state.reservation.loading = false;
      state.reservation.error = action.payload.error;
    },
    deleteReservationRequest: (state, _action: PayloadAction<{ visitId: number }>) => {
      state.reservation.loading = true;
      state.reservation.error = null;
    },
    deleteReservationSuccess: (state, action: PayloadAction<{ visitId: number }>) => {
      state.reservation.loading = false;
      state.reservation.byVisitId[action.payload.visitId] = null;
    },
    deleteReservationFailure: (
      state,
      action: PayloadAction<{ visitId: number; error: string }>
    ) => {
      state.reservation.loading = false;
      state.reservation.error = action.payload.error;
    },

    fetchEmergencyRequest: (state, _action: PayloadAction<{ visitId: number }>) => {
      state.emergency.loading = true;
      state.emergency.error = null;
    },
    fetchEmergencySuccess: (
      state,
      action: PayloadAction<{ visitId: number; data: VisitEmergency | null }>
    ) => {
      state.emergency.loading = false;
      state.emergency.byVisitId[action.payload.visitId] = action.payload.data;
    },
    fetchEmergencyFailure: (
      state,
      action: PayloadAction<{ visitId: number; error: string }>
    ) => {
      state.emergency.loading = false;
      state.emergency.error = action.payload.error;
    },
    saveEmergencyRequest: (
      state,
      _action: PayloadAction<{ visitId: number; payload: Partial<VisitEmergency> }>
    ) => {
      state.emergency.loading = true;
      state.emergency.error = null;
    },
    saveEmergencySuccess: (
      state,
      action: PayloadAction<{ visitId: number; data: VisitEmergency }>
    ) => {
      state.emergency.loading = false;
      state.emergency.byVisitId[action.payload.visitId] = action.payload.data;
    },
    saveEmergencyFailure: (
      state,
      action: PayloadAction<{ visitId: number; error: string }>
    ) => {
      state.emergency.loading = false;
      state.emergency.error = action.payload.error;
    },
    deleteEmergencyRequest: (state, _action: PayloadAction<{ visitId: number }>) => {
      state.emergency.loading = true;
      state.emergency.error = null;
    },
    deleteEmergencySuccess: (state, action: PayloadAction<{ visitId: number }>) => {
      state.emergency.loading = false;
      state.emergency.byVisitId[action.payload.visitId] = null;
    },
    deleteEmergencyFailure: (
      state,
      action: PayloadAction<{ visitId: number; error: string }>
    ) => {
      state.emergency.loading = false;
      state.emergency.error = action.payload.error;
    },

    fetchInpatientRequest: (state, _action: PayloadAction<{ visitId: number }>) => {
      state.inpatient.loading = true;
      state.inpatient.error = null;
    },
    fetchInpatientSuccess: (
      state,
      action: PayloadAction<{ visitId: number; data: VisitInpatient | null }>
    ) => {
      state.inpatient.loading = false;
      state.inpatient.byVisitId[action.payload.visitId] = action.payload.data;
    },
    fetchInpatientFailure: (
      state,
      action: PayloadAction<{ visitId: number; error: string }>
    ) => {
      state.inpatient.loading = false;
      state.inpatient.error = action.payload.error;
    },
    saveInpatientRequest: (
      state,
      _action: PayloadAction<{ visitId: number; payload: Partial<VisitInpatient> }>
    ) => {
      state.inpatient.loading = true;
      state.inpatient.error = null;
    },
    saveInpatientSuccess: (
      state,
      action: PayloadAction<{ visitId: number; data: VisitInpatient }>
    ) => {
      state.inpatient.loading = false;
      state.inpatient.byVisitId[action.payload.visitId] = action.payload.data;
    },
    saveInpatientFailure: (
      state,
      action: PayloadAction<{ visitId: number; error: string }>
    ) => {
      state.inpatient.loading = false;
      state.inpatient.error = action.payload.error;
    },
    deleteInpatientRequest: (state, _action: PayloadAction<{ visitId: number }>) => {
      state.inpatient.loading = true;
      state.inpatient.error = null;
    },
    deleteInpatientSuccess: (state, action: PayloadAction<{ visitId: number }>) => {
      state.inpatient.loading = false;
      state.inpatient.byVisitId[action.payload.visitId] = null;
    },
    deleteInpatientFailure: (
      state,
      action: PayloadAction<{ visitId: number; error: string }>
    ) => {
      state.inpatient.loading = false;
      state.inpatient.error = action.payload.error;
    },
  },
});

export const receptionActions = receptionSlice.actions;
export default receptionSlice.reducer;
