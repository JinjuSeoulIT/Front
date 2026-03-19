export type ClinicalRes = {
  id?: number;
  clinicalId?: number;
  patientId: number;
  clinicalType?: string | null;
  status?: string | null;
  clinicalStatus?: string | null;
  priorityYn?: boolean;
  clinicalAt?: string | null;
  createdAt?: string | null;
};

export type ClinicalTab = "WAIT" | "RESERVATION" | "ALL";

export type ApiEnvelope<T> = {
  success?: boolean;
  message?: string | null;
  data?: T;
  result?: T;
};
