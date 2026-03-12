export type PatientSummary = {
  total: number;
  waiting: number;
  treating: number;
  done: number;
};



export type MedicalCommonDashboardProps = {
  summary?: PatientSummary;
  patients?: PatientItem[];
};




//의료진 집계
export type PatientItem = {
  receptionId: number; //접수인
  receptionNo: string; //접수넘버
  patientName: string | null | undefined;
  visitType : string;
  status: string;
};
