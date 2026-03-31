"use client";

import * as React from "react";
import { Box, Card, CardContent, Chip, Stack, Typography } from "@mui/material";
import type { Patient } from "@/features/patients/patientTypes";
import type { VitalSignsRes, AssessmentRes } from "@/lib/clinicalVitalsApi";
import type { PastHistoryItem } from "@/lib/clinicalPastHistoryApi";
import type { DoctorNoteRes, DiagnosisRes, PrescriptionRes } from "@/lib/clinicalRecordApi";
import type { ClinicalRes } from "../types";
import { ClinicalVitalsCard } from "./ClinicalVitalsCard";
import { ClinicalPastHistoryCard } from "./ClinicalPastHistoryCard";
import { ClinicalPastVisitsCard, type PriorSubjectiveApplyMode } from "./ClinicalPastVisitsCard";
import { ClinicalSoapCard } from "./ClinicalSoapCard";

type Props = {
  selectedPatient: Patient | null;
  visitId: number | null;
  vitals: VitalSignsRes | null;
  assessment: AssessmentRes | null;
  vitalsLoading: boolean;
  assessmentLoading: boolean;
  onOpenVitalDialog: (mode: "new" | "edit") => void;
  pastHistoryList: PastHistoryItem[];
  pastHistoryLoading: boolean;
  onAddPhx: () => void;
  onEditPhx: (row: PastHistoryItem) => void;
  onDeletePhx: (rowId: number) => Promise<void>;
  pastClinicalsForPatient: ClinicalRes[];
  paginatedPastClinicals: ClinicalRes[];
  pastClinicalSummaries: Record<number, string>;
  pastVisitNotesById: Record<number, DoctorNoteRes | null>;
  pastVisitNotesLoading: boolean;
  pastClinicalPageSafe: number;
  totalPastClinicalPages: number;
  onPastClinicalPageChange: (page: number) => void;
  repeatingFromClinicalId: number | null;
  onRepeatPrescription: (fromVisitId: number) => Promise<void>;
  onApplyPriorSubjective: (fromVisitId: number, mode: PriorSubjectiveApplyMode) => Promise<boolean>;
  doctorNote: DoctorNoteRes | null;
  diagnoses: DiagnosisRes[];
  prescriptions: PrescriptionRes[];
  chiefComplaintText: string;
  onChiefComplaintTextChange: (v: string) => void;
  presentIllnessText: string;
  onPresentIllnessTextChange: (v: string) => void;
  prescriptionNameInput: string;
  onPrescriptionNameInputChange: (v: string) => void;
  prescriptionDosageInput: string;
  onPrescriptionDosageInputChange: (v: string) => void;
  prescriptionDaysInput: string;
  onPrescriptionDaysInputChange: (v: string) => void;
  additionalMemo: string;
  onAdditionalMemoChange: (v: string) => void;
  savingRecord: boolean;
  onSavingRecordChange: (v: boolean) => void;
  onDoctorNoteReload: () => void;
  onDiagnosesReload: () => void;
  onPrescriptionsReload: () => void;
  onVisitCompleted: () => Promise<void>;
};

export function ClinicalChartCenter(p: Props) {
  return (
    <Box sx={{ overflow: "auto", p: 2, bgcolor: "rgba(0,0,0,0.02)" }}>
      <Stack spacing={2}>
        <Card sx={{ borderRadius: 2, border: "1px solid var(--line)" }}>
          <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
            <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
              <Typography fontWeight={800} sx={{ fontSize: 16 }}>
                {p.selectedPatient?.name ?? "환자 미선택"} ({p.selectedPatient?.patientNo ?? "-"}){" "}
                {p.selectedPatient?.phone ?? ""}
              </Typography>
              <Stack direction="row" spacing={0.75}>
                <Chip label="건강보험" size="small" />
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ width: "100%" }}>
          <Stack spacing={2} sx={{ minWidth: 0, flex: "0 0 340px" }}>
            <ClinicalVitalsCard
              selectedPatient={p.selectedPatient}
              vitals={p.vitals}
              assessment={p.assessment}
              vitalsLoading={p.vitalsLoading}
              assessmentLoading={p.assessmentLoading}
              visitId={p.visitId}
              onOpenVitalDialog={p.onOpenVitalDialog}
            />
            <ClinicalPastHistoryCard
              selectedPatient={p.selectedPatient}
              visitId={p.visitId}
              vitals={p.vitals}
              assessment={p.assessment}
              assessmentLoading={p.assessmentLoading}
              pastHistoryList={p.pastHistoryList}
              pastHistoryLoading={p.pastHistoryLoading}
              onAddPhx={p.onAddPhx}
              onEditPhx={p.onEditPhx}
              onDeletePhx={p.onDeletePhx}
            />
            <ClinicalPastVisitsCard
              pastClinicalsForPatient={p.pastClinicalsForPatient}
              paginatedPastClinicals={p.paginatedPastClinicals}
              pastClinicalSummaries={p.pastClinicalSummaries}
              pastVisitNotesById={p.pastVisitNotesById}
              pastVisitNotesLoading={p.pastVisitNotesLoading}
              visitId={p.visitId}
              pastClinicalPageSafe={p.pastClinicalPageSafe}
              totalPastClinicalPages={p.totalPastClinicalPages}
              onPastClinicalPageChange={p.onPastClinicalPageChange}
              repeatingFromClinicalId={p.repeatingFromClinicalId}
              onRepeatPrescription={p.onRepeatPrescription}
              onApplyPriorSubjective={p.onApplyPriorSubjective}
            />
          </Stack>

          <Stack spacing={2} sx={{ minWidth: 0, flex: 1 }}>
            <ClinicalSoapCard
              visitId={p.visitId}
              doctorNote={p.doctorNote}
              diagnoses={p.diagnoses}
              prescriptions={p.prescriptions}
              chiefComplaintText={p.chiefComplaintText}
              onChiefComplaintTextChange={p.onChiefComplaintTextChange}
              presentIllnessText={p.presentIllnessText}
              onPresentIllnessTextChange={p.onPresentIllnessTextChange}
              prescriptionNameInput={p.prescriptionNameInput}
              onPrescriptionNameInputChange={p.onPrescriptionNameInputChange}
              prescriptionDosageInput={p.prescriptionDosageInput}
              onPrescriptionDosageInputChange={p.onPrescriptionDosageInputChange}
              prescriptionDaysInput={p.prescriptionDaysInput}
              onPrescriptionDaysInputChange={p.onPrescriptionDaysInputChange}
              additionalMemo={p.additionalMemo}
              onAdditionalMemoChange={p.onAdditionalMemoChange}
              savingRecord={p.savingRecord}
              onSavingRecordChange={p.onSavingRecordChange}
              onDoctorNoteReload={p.onDoctorNoteReload}
              onDiagnosesReload={p.onDiagnosesReload}
              onPrescriptionsReload={p.onPrescriptionsReload}
              onVisitCompleted={p.onVisitCompleted}
            />
          </Stack>
        </Stack>
      </Stack>
    </Box>
  );
}
