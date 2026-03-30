export interface ImagingExam {
  IMAGING_EXAM_ID: string | number;
  TEST_EXECUTION_ID?: string | number | null;
  IMAGING_TYPE?: string | null;
  EXAM_STATUS_YN?: string | null;
  EXAM_AT?: string | null;
  CREATED_AT?: string | null;
  UPDATED_AT?: string | null;
}

export interface ImagingExamCreatePayload {
  TEST_EXECUTION_ID?: string | number | null;
  IMAGING_TYPE?: string | null;
  EXAM_STATUS_YN?: string | null;
  EXAM_AT?: string | null;
}

export interface ImagingExamUpdatePayload {
  TEST_EXECUTION_ID?: string | number | null;
  IMAGING_TYPE?: string | null;
  EXAM_STATUS_YN?: string | null;
  EXAM_AT?: string | null;
}