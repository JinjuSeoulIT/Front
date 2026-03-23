import type { VisitRes } from "@/lib/receptionApi";
import type { VisitEmergency } from "@/lib/emergencyApi";
import type { VisitInpatient } from "@/lib/inpatientApi";
import type { VisitReservation } from "@/lib/reservationApi";

export type ReceptionState = {
  list: VisitRes[];
  loading: boolean;
  error: string | null;
  reservation: {
    byVisitId: Record<number, VisitReservation | null>;
    loading: boolean;
    error: string | null;
  };
  emergency: {
    byVisitId: Record<number, VisitEmergency | null>;
    loading: boolean;
    error: string | null;
  };
  inpatient: {
    byVisitId: Record<number, VisitInpatient | null>;
    loading: boolean;
    error: string | null;
  };
};
