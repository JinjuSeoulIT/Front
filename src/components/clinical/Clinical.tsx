"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import { Alert, Box, Stack } from "@mui/material";
import { fetchPatientsApi } from "@/lib/patientApi";
import type { Patient } from "@/features/patients/patientTypes";
import {
  fetchDoctorNoteApi,
  fetchDiagnosesApi,
  fetchPrescriptionsApi,
  addPrescriptionApi,
  type DoctorNoteRes,
} from "@/lib/clinicalRecordApi";
import { deletePastHistoryApi } from "@/lib/clinicalPastHistoryApi";
import { fetchClinicalOrdersApi, type ClinicalOrder } from "@/lib/clinicalOrderApi";
import {
  fetchVitalsApi,
  fetchAssessmentApi,
  type VitalSignsRes,
  type AssessmentRes,
} from "@/lib/clinicalVitalsApi";
import {
  fetchPastHistoryApi,
  type PastHistoryItem,
} from "@/lib/clinicalPastHistoryApi";
import type { ClinicalRes, ClinicalTab } from "./types";
import {
  fetchClinicalApi,
  createClinicalApi,
  isNetworkError,
  clinicalConnectionMessage,
} from "./visitApi";
import { clinicalStatusView, resolveClinicalStatus } from "./clinicalDocumentation";
import { ClinicalToolbar } from "./ClinicalEncounter";
import { ClinicalPatientList } from "./ClinicalList";
import { ClinicalRightPanel } from "./ClinicalOrder";
import { ClinicalChartCenter } from "./chart/ClinicalChartCenter";
import { ClinicalOrderDialog } from "./dialogs/ClinicalOrderDialog";
import {
  ClinicalPastHistoryDialog,
  type PastHistoryFormState,
} from "./dialogs/ClinicalPastHistoryDialog";
import {
  ClinicalVitalAssessmentDialog,
  type VitalsFormState,
  type AssessmentFormState,
} from "./dialogs/ClinicalVitalAssessmentDialog";

export default function ClinicalPage() {
  const searchParams = useSearchParams();
  const LEFT_LIST_PAGE_SIZE = 10;
  const PAST_CLINICAL_PAGE_SIZE = 10;

  const [patients, setPatients] = React.useState<Patient[]>([]);
  const [clinicals, setClinicals] = React.useState<ClinicalRes[]>([]);
  const [query, setQuery] = React.useState("");
  const [tab, setTab] = React.useState<ClinicalTab>("ALL");
  const [leftPage, setLeftPage] = React.useState(1);
  const [selectedPatientId, setSelectedPatientId] = React.useState<number | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [creatingClinical, setCreatingClinical] = React.useState(false);
  const creatingClinicalRef = React.useRef(false);

  const [orders, setOrders] = React.useState<ClinicalOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = React.useState(false);
  const [orderDialogOpen, setOrderDialogOpen] = React.useState(false);
  const [updatingOrderId, setUpdatingOrderId] = React.useState<number | null>(null);

  const [vitals, setVitals] = React.useState<VitalSignsRes | null>(null);
  const [assessment, setAssessment] = React.useState<AssessmentRes | null>(null);
  const [vitalsLoading, setVitalsLoading] = React.useState(false);
  const [assessmentLoading, setAssessmentLoading] = React.useState(false);
  const [vitalAssessmentDialogOpen, setVitalAssessmentDialogOpen] = React.useState(false);
  const [vitalsForm, setVitalsForm] = React.useState<VitalsFormState>({
    temperature: "",
    pulse: "",
    bpSystolic: "",
    bpDiastolic: "",
    respiratoryRate: "",
    measuredAt: "",
  });
  const [assessmentForm, setAssessmentForm] = React.useState<AssessmentFormState>({
    chiefComplaint: "",
    visitReason: "",
    historyPresentIllness: "",
    pastHistory: "",
    familyHistory: "",
    allergy: "",
    currentMedication: "",
  });

  const [department, setDepartment] = React.useState("내과1");
  const [doctorNote, setDoctorNote] = React.useState<DoctorNoteRes | null>(null);
  const [diagnoses, setDiagnoses] = React.useState<
    Awaited<ReturnType<typeof fetchDiagnosesApi>>
  >([]);
  const [prescriptions, setPrescriptions] = React.useState<
    Awaited<ReturnType<typeof fetchPrescriptionsApi>>
  >([]);
  const [symptomText, setSymptomText] = React.useState("");
  const [diagnosisCodeInput, setDiagnosisCodeInput] = React.useState("");
  const [diagnosisNameInput, setDiagnosisNameInput] = React.useState("");
  const [prescriptionNameInput, setPrescriptionNameInput] = React.useState("");
  const [prescriptionDosageInput, setPrescriptionDosageInput] = React.useState("");
  const [prescriptionDaysInput, setPrescriptionDaysInput] = React.useState("");
  const [additionalMemo, setAdditionalMemo] = React.useState("");
  const [groupOrderText, setGroupOrderText] = React.useState("");
  const [chartTemplateText, setChartTemplateText] = React.useState("");
  const [savingRecord, setSavingRecord] = React.useState(false);
  const [pastClinicalSummaries, setPastClinicalSummaries] = React.useState<Record<number, string>>(
    {}
  );
  const [pastClinicalPage, setPastClinicalPage] = React.useState(1);
  const [repeatingFromClinicalId, setRepeatingFromClinicalId] = React.useState<number | null>(
    null
  );
  const [pastHistoryList, setPastHistoryList] = React.useState<PastHistoryItem[]>([]);
  const [pastHistoryLoading, setPastHistoryLoading] = React.useState(false);
  const [pastHistoryDialogOpen, setPastHistoryDialogOpen] = React.useState(false);
  const [pastHistoryEditingId, setPastHistoryEditingId] = React.useState<number | null>(null);
  const [pastHistoryForm, setPastHistoryForm] = React.useState<PastHistoryFormState>({
    historyType: "DISEASE",
    name: "",
    memo: "",
  });

  const queryPatientId = React.useMemo(() => {
    const raw = searchParams.get("patientId");
    if (!raw) return null;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : null;
  }, [searchParams]);

  const loadOrders = React.useCallback(async (visitId: number) => {
    setOrdersLoading(true);
    try {
      setOrders(await fetchClinicalOrdersApi(visitId));
    } catch {
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  const loadVitals = React.useCallback(async (visitId: number) => {
    setVitalsLoading(true);
    try {
      setVitals((await fetchVitalsApi(visitId)) ?? null);
    } catch {
      setVitals(null);
    } finally {
      setVitalsLoading(false);
    }
  }, []);

  const loadAssessment = React.useCallback(async (visitId: number) => {
    setAssessmentLoading(true);
    try {
      setAssessment((await fetchAssessmentApi(visitId)) ?? null);
    } catch {
      setAssessment(null);
    } finally {
      setAssessmentLoading(false);
    }
  }, []);

  const loadDoctorNote = React.useCallback(async (visitId: number) => {
    try {
      const data = await fetchDoctorNoteApi(visitId);
      setDoctorNote(data ?? null);
      if (data) {
        setSymptomText(data.presentIllness ?? data.chiefComplaint ?? "");
        setAdditionalMemo(data.clinicalMemo ?? "");
      } else {
        setSymptomText("");
        setAdditionalMemo("");
      }
    } catch {
      setDoctorNote(null);
      setSymptomText("");
      setAdditionalMemo("");
    }
  }, []);

  const loadDiagnoses = React.useCallback(async (visitId: number) => {
    try {
      setDiagnoses(await fetchDiagnosesApi(visitId));
    } catch {
      setDiagnoses([]);
    }
  }, []);

  const loadPrescriptions = React.useCallback(async (visitId: number) => {
    try {
      setPrescriptions(await fetchPrescriptionsApi(visitId));
    } catch {
      setPrescriptions([]);
    }
  }, []);

  const loadPastHistory = React.useCallback(async (visitId: number) => {
    setPastHistoryLoading(true);
    try {
      setPastHistoryList(await fetchPastHistoryApi(visitId));
    } catch {
      setPastHistoryList([]);
    } finally {
      setPastHistoryLoading(false);
    }
  }, []);

  const loadData = React.useCallback(async () => {
    try {
      setErrorMessage(null);
      const [patientsResult, clinicalsResult] = await Promise.allSettled([
        fetchPatientsApi(),
        fetchClinicalApi(),
      ]);
      if (patientsResult.status === "fulfilled") {
        setPatients(patientsResult.value);
      } else {
        setPatients([]);
        setErrorMessage("환자 목록을 불러오지 못했습니다.");
      }
      if (clinicalsResult.status === "fulfilled") {
        setClinicals(clinicalsResult.value);
      } else {
        setClinicals([]);
        setErrorMessage("진료 목록 연결에 실패했습니다. 환자 목록만 표시합니다.");
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "데이터를 불러오지 못했습니다.");
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  React.useEffect(() => {
    if (!queryPatientId || patients.length === 0) return;
    if (!patients.some((p) => p.patientId === queryPatientId)) return;
    setTab("ALL");
    setSelectedPatientId(queryPatientId);
  }, [queryPatientId, patients]);

  const clinicalByPatientId = React.useMemo(() => {
    const sorted = [...clinicals].sort(
      (a, b) => (b.clinicalId ?? b.id ?? 0) - (a.clinicalId ?? a.id ?? 0)
    );
    const m = new Map<number, ClinicalRes>();
    for (const v of sorted) {
      if (!m.has(v.patientId)) m.set(v.patientId, v);
    }
    return m;
  }, [clinicals]);

  const patientMap = React.useMemo(() => {
    const m = new Map<number, Patient>();
    for (const p of patients) m.set(p.patientId, p);
    return m;
  }, [patients]);

  const listForLeft = React.useMemo(() => {
    const k = query.trim().toLowerCase();
    const match = (p: Patient) =>
      !k || [p.name, p.patientNo, p.phone].some((v) => (v ?? "").toLowerCase().includes(k));
    if (tab === "ALL") return patients.filter(match);
    if (tab === "WAIT") {
      const waitPids = new Set(
        clinicals
          .filter((v) => {
            const s = resolveClinicalStatus(v);
            return s === "WAITING" || s === "CALLED" || s === "READY";
          })
          .map((c) => c.patientId)
      );
      const waiting = patients.filter((p) => waitPids.has(p.patientId) && match(p));
      const rest = patients.filter((p) => !waitPids.has(p.patientId) && match(p));
      return [...waiting, ...rest];
    }
    return patients.filter((p) => {
      const c = clinicalByPatientId.get(p.patientId);
      return c?.clinicalType === "RESERVATION" && match(p);
    });
  }, [patients, clinicals, clinicalByPatientId, query, tab]);

  const selectedPatient = React.useMemo(() => {
    if (selectedPatientId) return patientMap.get(selectedPatientId) ?? null;
    if (listForLeft.length) return listForLeft[0];
    return patients[0] ?? null;
  }, [selectedPatientId, listForLeft, patients, patientMap]);

  const totalLeftPages = Math.max(1, Math.ceil(listForLeft.length / LEFT_LIST_PAGE_SIZE));
  const paginatedLeftList = React.useMemo(() => {
    const start = (leftPage - 1) * LEFT_LIST_PAGE_SIZE;
    return listForLeft.slice(start, start + LEFT_LIST_PAGE_SIZE);
  }, [listForLeft, leftPage, LEFT_LIST_PAGE_SIZE]);

  const selectedClinical = selectedPatient
    ? clinicalByPatientId.get(selectedPatient.patientId) ?? null
    : null;
  const selectedStatus = clinicalStatusView(resolveClinicalStatus(selectedClinical));
  const currentClinicalId = selectedClinical?.clinicalId ?? selectedClinical?.id ?? null;

  const pastClinicalsForPatient = React.useMemo(() => {
    if (!selectedPatient) return [];
    const id = currentClinicalId ?? undefined;
    return clinicals
      .filter((c) => c.patientId === selectedPatient.patientId && (c.clinicalId ?? c.id) !== id)
      .sort(
        (a, b) =>
          new Date(b.clinicalAt ?? b.createdAt ?? 0).getTime() -
          new Date(a.clinicalAt ?? a.createdAt ?? 0).getTime()
      );
  }, [clinicals, selectedPatient, currentClinicalId]);

  const totalPastClinicalPages = Math.max(
    1,
    Math.ceil(pastClinicalsForPatient.length / PAST_CLINICAL_PAGE_SIZE)
  );
  const pastClinicalPageSafe = Math.min(pastClinicalPage, totalPastClinicalPages);
  const paginatedPastClinicals = React.useMemo(() => {
    const start = (pastClinicalPageSafe - 1) * PAST_CLINICAL_PAGE_SIZE;
    return pastClinicalsForPatient.slice(start, start + PAST_CLINICAL_PAGE_SIZE);
  }, [pastClinicalsForPatient, pastClinicalPageSafe, PAST_CLINICAL_PAGE_SIZE]);

  React.useEffect(() => {
    setPastClinicalPage(1);
  }, [selectedPatientId]);

  React.useEffect(() => {
    if (pastClinicalsForPatient.length === 0) {
      setPastClinicalSummaries({});
      return;
    }
    let cancelled = false;
    const ids = pastClinicalsForPatient
      .map((c) => c.clinicalId ?? c.id)
      .filter((x): x is number => x != null);
    Promise.all(ids.map((id) => fetchDoctorNoteApi(id)))
      .then((notes) => {
        if (cancelled) return;
        const next: Record<number, string> = {};
        ids.forEach((id, i) => {
          const note = notes[i];
          next[id] = (note?.presentIllness ?? note?.chiefComplaint ?? "").trim() || "-";
        });
        setPastClinicalSummaries(next);
      })
      .catch(() => {
        if (!cancelled) setPastClinicalSummaries({});
      });
    return () => {
      cancelled = true;
    };
  }, [pastClinicalsForPatient]);

  React.useEffect(() => {
    if (currentClinicalId != null) {
      loadOrders(currentClinicalId);
      loadVitals(currentClinicalId);
      loadAssessment(currentClinicalId);
      loadDoctorNote(currentClinicalId);
      loadDiagnoses(currentClinicalId);
      loadPrescriptions(currentClinicalId);
      loadPastHistory(currentClinicalId);
    } else {
      setOrders([]);
      setVitals(null);
      setAssessment(null);
      setDoctorNote(null);
      setDiagnoses([]);
      setPrescriptions([]);
      setSymptomText("");
      setAdditionalMemo("");
      setPastHistoryList([]);
    }
  }, [
    currentClinicalId,
    loadOrders,
    loadVitals,
    loadAssessment,
    loadDoctorNote,
    loadDiagnoses,
    loadPrescriptions,
    loadPastHistory,
  ]);

  React.useEffect(() => {
    setLeftPage(1);
  }, [query, tab]);

  React.useEffect(() => {
    if (leftPage > totalLeftPages) setLeftPage(totalLeftPages);
  }, [leftPage, totalLeftPages]);

  const handleStartNewClinical = React.useCallback(async () => {
    if (!selectedPatient) {
      window.alert("환자를 먼저 선택해 주세요.");
      return;
    }
    if (creatingClinicalRef.current) return;
    creatingClinicalRef.current = true;
    setCreatingClinical(true);
    try {
      setErrorMessage(null);
      await createClinicalApi(selectedPatient.patientId);
      await loadData();
      setTab("WAIT");
      setSelectedPatientId(selectedPatient.patientId);
      window.alert("신규 진료가 등록되었습니다.");
    } catch (err) {
      const message =
        err instanceof Error
          ? isNetworkError(err)
            ? clinicalConnectionMessage()
            : err.message
          : "신규 진료 생성에 실패했습니다.";
      setErrorMessage(message);
      window.alert(message);
    } finally {
      creatingClinicalRef.current = false;
      setCreatingClinical(false);
    }
  }, [selectedPatient, loadData]);

  const openVitalDialog = React.useCallback(
    (mode: "new" | "edit") => {
      if (mode === "edit" && vitals) {
        setVitalsForm({
          temperature: String(vitals.temperature ?? ""),
          pulse: String(vitals.pulse ?? ""),
          bpSystolic: String(vitals.bpSystolic ?? ""),
          bpDiastolic: String(vitals.bpDiastolic ?? ""),
          respiratoryRate: String(vitals.respiratoryRate ?? ""),
          measuredAt: vitals.measuredAt
            ? new Date(vitals.measuredAt).toISOString().slice(0, 16)
            : new Date().toISOString().slice(0, 16),
        });
      } else {
        setVitalsForm({
          temperature: "",
          pulse: "",
          bpSystolic: "",
          bpDiastolic: "",
          respiratoryRate: "",
          measuredAt: new Date().toISOString().slice(0, 16),
        });
      }
      if (assessment) {
        setAssessmentForm({
          chiefComplaint: assessment.chiefComplaint ?? "",
          visitReason: assessment.visitReason ?? "",
          historyPresentIllness: assessment.historyPresentIllness ?? "",
          pastHistory: assessment.pastHistory ?? "",
          familyHistory: assessment.familyHistory ?? "",
          allergy: assessment.allergy ?? "",
          currentMedication: assessment.currentMedication ?? "",
        });
      } else {
        setAssessmentForm({
          chiefComplaint: "",
          visitReason: "",
          historyPresentIllness: "",
          pastHistory: "",
          familyHistory: "",
          allergy: "",
          currentMedication: "",
        });
      }
      setVitalAssessmentDialogOpen(true);
    },
    [vitals, assessment]
  );

  const handleRepeatPrescription = React.useCallback(
    async (fromVisitId: number) => {
      if (currentClinicalId == null) return;
      setRepeatingFromClinicalId(fromVisitId);
      try {
        const list = await fetchPrescriptionsApi(fromVisitId);
        for (const rx of list) {
          await addPrescriptionApi(currentClinicalId, {
            medicationName: rx.medicationName ?? undefined,
            dosage: rx.dosage ?? undefined,
            days: rx.days ?? undefined,
          });
        }
        await loadPrescriptions(currentClinicalId);
        if (list.length > 0)
          window.alert(`해당 진료의 처방 ${list.length}건을 현재 진료에 넣었습니다.`);
        else window.alert("해당 진료에 등록된 처방이 없습니다.");
      } catch (e) {
        window.alert(e instanceof Error ? e.message : "반복처방 실패");
      } finally {
        setRepeatingFromClinicalId(null);
      }
    },
    [currentClinicalId, loadPrescriptions]
  );

  const now = new Date();
  const calendarYear = now.getFullYear();
  const calendarMonth = now.getMonth();
  const firstDay = new Date(calendarYear, calendarMonth, 1).getDay();
  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const calendarDays = Array.from({ length: firstDay + daysInMonth }, (_, i) =>
    i < firstDay ? null : i - firstDay + 1
  );

  return (
    <MainLayout showSidebar={true}>
      <Stack spacing={0}>
        {errorMessage && (
          <Alert severity="error" sx={{ borderRadius: 0 }}>
            {errorMessage}
          </Alert>
        )}
        <ClinicalToolbar
          query={query}
          onQueryChange={setQuery}
          creatingClinical={creatingClinical}
          selectedPatient={selectedPatient}
          onStartNewClinical={handleStartNewClinical}
        />

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "280px 1fr 260px" },
            minHeight: "calc(100vh - 120px)",
            alignItems: "stretch",
          }}
        >
          <ClinicalPatientList
            department={department}
            onDepartmentChange={setDepartment}
            query={query}
            onQueryChange={setQuery}
            tab={tab}
            onTabChange={setTab}
            paginatedLeftList={paginatedLeftList}
            listForLeft={listForLeft}
            leftPage={leftPage}
            totalLeftPages={totalLeftPages}
            onLeftPageChange={setLeftPage}
            clinicalByPatientId={clinicalByPatientId}
            selectedPatient={selectedPatient}
            onSelectPatient={setSelectedPatientId}
          />

          <ClinicalChartCenter
            selectedPatient={selectedPatient}
            selectedStatus={selectedStatus}
            visitId={currentClinicalId}
            vitals={vitals}
            assessment={assessment}
            vitalsLoading={vitalsLoading}
            assessmentLoading={assessmentLoading}
            onOpenVitalDialog={openVitalDialog}
            pastHistoryList={pastHistoryList}
            pastHistoryLoading={pastHistoryLoading}
            onAddPhx={() => {
              setPastHistoryEditingId(null);
              setPastHistoryForm({ historyType: "DISEASE", name: "", memo: "" });
              setPastHistoryDialogOpen(true);
            }}
            onEditPhx={(row) => {
              setPastHistoryEditingId(row.id ?? null);
              setPastHistoryForm({
                historyType: row.historyType,
                name: row.name ?? "",
                memo: row.memo ?? "",
              });
              setPastHistoryDialogOpen(true);
            }}
            onDeletePhx={async (rowId) => {
              if (currentClinicalId == null) return;
              await deletePastHistoryApi(currentClinicalId, rowId);
              await loadPastHistory(currentClinicalId);
            }}
            pastClinicalsForPatient={pastClinicalsForPatient}
            paginatedPastClinicals={paginatedPastClinicals}
            pastClinicalSummaries={pastClinicalSummaries}
            pastClinicalPageSafe={pastClinicalPageSafe}
            totalPastClinicalPages={totalPastClinicalPages}
            onPastClinicalPageChange={setPastClinicalPage}
            repeatingFromClinicalId={repeatingFromClinicalId}
            onRepeatPrescription={handleRepeatPrescription}
            doctorNote={doctorNote}
            diagnoses={diagnoses}
            prescriptions={prescriptions}
            symptomText={symptomText}
            onSymptomTextChange={setSymptomText}
            diagnosisCodeInput={diagnosisCodeInput}
            onDiagnosisCodeInputChange={setDiagnosisCodeInput}
            diagnosisNameInput={diagnosisNameInput}
            onDiagnosisNameInputChange={setDiagnosisNameInput}
            prescriptionNameInput={prescriptionNameInput}
            onPrescriptionNameInputChange={setPrescriptionNameInput}
            prescriptionDosageInput={prescriptionDosageInput}
            onPrescriptionDosageInputChange={setPrescriptionDosageInput}
            prescriptionDaysInput={prescriptionDaysInput}
            onPrescriptionDaysInputChange={setPrescriptionDaysInput}
            additionalMemo={additionalMemo}
            onAdditionalMemoChange={setAdditionalMemo}
            savingRecord={savingRecord}
            onSavingRecordChange={setSavingRecord}
            onDoctorNoteReload={() =>
              currentClinicalId != null ? loadDoctorNote(currentClinicalId) : Promise.resolve()
            }
            onDiagnosesReload={() =>
              currentClinicalId != null ? loadDiagnoses(currentClinicalId) : Promise.resolve()
            }
            onPrescriptionsReload={() =>
              currentClinicalId != null ? loadPrescriptions(currentClinicalId) : Promise.resolve()
            }
          />

          <ClinicalRightPanel
            now={now}
            calendarYear={calendarYear}
            calendarMonth={calendarMonth}
            calendarDays={calendarDays}
            groupOrderText={groupOrderText}
            onGroupOrderTextChange={setGroupOrderText}
            chartTemplateText={chartTemplateText}
            onChartTemplateTextChange={setChartTemplateText}
            orders={orders}
            ordersLoading={ordersLoading}
            visitId={currentClinicalId}
            updatingOrderId={updatingOrderId}
            onUpdatingOrderId={setUpdatingOrderId}
            onOrdersRefresh={() =>
              currentClinicalId != null ? void loadOrders(currentClinicalId) : undefined
            }
            onOrdersReplace={setOrders}
            onOpenOrderDialog={() => setOrderDialogOpen(true)}
          />
        </Box>
      </Stack>

      <ClinicalOrderDialog
        open={orderDialogOpen}
        onClose={() => setOrderDialogOpen(false)}
        visitId={currentClinicalId}
        onCreated={async () => {
          if (currentClinicalId != null) await loadOrders(currentClinicalId);
        }}
      />

      <ClinicalPastHistoryDialog
        open={pastHistoryDialogOpen}
        onClose={() => setPastHistoryDialogOpen(false)}
        visitId={currentClinicalId}
        editingId={pastHistoryEditingId}
        form={pastHistoryForm}
        onFormChange={setPastHistoryForm}
        onSaved={async () => {
          if (currentClinicalId != null) await loadPastHistory(currentClinicalId);
        }}
      />

      <ClinicalVitalAssessmentDialog
        open={vitalAssessmentDialogOpen}
        onClose={() => setVitalAssessmentDialogOpen(false)}
        visitId={currentClinicalId}
        vitalsForm={vitalsForm}
        onVitalsFormChange={setVitalsForm}
        assessmentForm={assessmentForm}
        onAssessmentFormChange={setAssessmentForm}
        onSaved={async () => {
          if (currentClinicalId != null) {
            await Promise.all([
              loadVitals(currentClinicalId),
              loadAssessment(currentClinicalId),
            ]);
          }
        }}
      />
    </MainLayout>
  );
}
