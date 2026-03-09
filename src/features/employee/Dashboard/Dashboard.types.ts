export type PatientSummary = {
  total: number;
  waiting: number;
  treating: number;
  done: number;
};


export type PatientItem = {
  patientId: number;
  patientName: string;
  department?: string;
  status?: string;
};

export type MedicalCommonDashboardProps = {
  summary?: PatientSummary;
  patients?: PatientItem[];
};





