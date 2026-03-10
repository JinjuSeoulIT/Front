import type {
  NursingRecord,
  NursingRecordCreatePayload,
  NursingRecordUpdatePayload,
} from "@/lib/medical-support/recordApi";

export type RecordItem = NursingRecord;

export type RecordForm = {
  visitId: string;
  recordedAt: string | null;
  systolicBp: string;
  diastolicBp: string;
  pulse: string;
  respiration: string;
  temperature: string;
  spo2: string;
  painScore: string;
  consciousnessLevel: string;
  observation: string;
  initialAssessment: string;
  status: string;
};
// 입력창 상태값

export type RecordState = {
  list: RecordItem[];
  selected: RecordItem | null;
  loading: boolean;
  error: string | null;
};

export type RecordCreatePayload = NursingRecordCreatePayload;
export type RecordUpdatePayload = NursingRecordUpdatePayload;

export const emptyRecordForm: RecordForm = {
  visitId: "",
  recordedAt: "",
  systolicBp: "",
  diastolicBp: "",
  pulse: "",
  respiration: "",
  temperature: "",
  spo2: "",
  painScore: "",
  consciousnessLevel: "",
  observation: "",
  initialAssessment: "",
  status: "ACTIVE",
};
