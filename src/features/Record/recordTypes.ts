export interface RecordFormType {
  name?: string
  recordId?: string;
  nursingId: string;
  visitId: string;
  recordedAt: string;
  systolicBp: string;
  diastolicBp: string;
  pulse: string;
  respiration: string;
  temperature: string;
  spo2: string;
  observation: string;
  painScore: string;
  consciousnessLevel: string;
  initialAssessment: string;
  status: "ACTIVE" | "INACTIVE" | "";
  createdAt: string;
  updatedAt: string;
}
