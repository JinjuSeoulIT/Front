"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import { Alert, Box, Stack } from "@mui/material";
import { fetchPatientsApi } from "@/lib/patient/patientApi";
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
import type { ClinicalRes } from "./types";
import {
  fetchClinicalApi,
  fetchReceptionQueueApi,
  startVisitApi,
  isNetworkError,
  clinicalConnectionMessage,
  type ReceptionQueueItem,
} from "@/lib/visitApi";
import { resolveClinicalStatus } from "./clinicalDocumentation";
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
  const [receptions, setReceptions] = React.useState<ReceptionQueueItem[]>([]);
  const [receptionLoading, setReceptionLoading] = React.useState(false);
  const [selectedReception, setSelectedReception] = React.useState<ReceptionQueueItem | null>(null);
  const [query, setQuery] = React.useState("");
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

  const [department, setDepartment] = React.useState("");
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

  const toDateKey = React.useCallback((d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }, []);

  const loadReceptionQueue = React.useCallback(async () => {
    setReceptionLoading(true);
    setErrorMessage(null);
    try {
      const today = toDateKey(new Date());
      let list = await fetchReceptionQueueApi({ date: today });
      if (list.length === 0) {
        try {
          const anyList = await fetchReceptionQueueApi({});
          const todayPrefix = today.replace(/-/g, "");
          list = anyList.filter(
            (r) =>
              (r.receptionNo && r.receptionNo.startsWith(todayPrefix)) ||
              (r as { arrivedAt?: string; createdAt?: string }).arrivedAt?.startsWith?.(today) ||
              (r as { arrivedAt?: string; createdAt?: string }).createdAt?.startsWith?.(today)
          );
        } catch {
          list = [];
        }
      }
      setReceptions(list);
    } catch (err) {
      setReceptions([]);
      setErrorMessage(err instanceof Error ? err.message : "접수 대기열을 불러오지 못했습니다.");
    } finally {
      setReceptionLoading(false);
    }
  }, [toDateKey]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  React.useEffect(() => {
    loadReceptionQueue();
  }, [loadReceptionQueue]);

  React.useEffect(() => {
    if (!queryPatientId) return;
    const r = receptions.find((x) => x.patientId === queryPatientId);
    if (r) {
      setTab("ALL");
      setSelectedReception(r);
      setSelectedPatientId(queryPatientId);
    }
  }, [queryPatientId, receptions]);

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
    let filtered = receptions.filter(
      (r) =>
        r.status !== "CANCELLED" &&
        (!k || [r.patientName, r.receptionNo].some((v) => (v ?? "").toLowerCase().includes(k)))
    );
    if (department) {
      filtered = filtered.filter(
        (r) => (r.departmentName ?? "").includes(department)
      );
    }
    return filtered.filter(
      (r) =>
        r.status === "WAITING" ||
        r.status === "CALLED" ||
        r.status === "IN_PROGRESS"
    );
  }, [receptions, query, department]);

  const selectedPatient = React.useMemo((): Patient | null => {
    if (!selectedReception) return null;
    const p = patientMap.get(selectedReception.patientId);
    if (p) return p;
    return {
      patientId: selectedReception.patientId,
      name: selectedReception.patientName?.trim() ?? `환자 ${selectedReception.patientId}`,
    } as Patient;
  }, [selectedReception, patientMap]);

  React.useEffect(() => {
    if (listForLeft.length === 0) return;
    const currentInList =
      selectedReception &&
      listForLeft.some((r) => r.receptionId === selectedReception.receptionId);
    if (!currentInList) {
      setSelectedReception(listForLeft[0]);
      setSelectedPatientId(listForLeft[0].patientId);
    }
  }, [listForLeft, selectedReception]);

  const totalLeftPages = Math.max(1, Math.ceil(listForLeft.length / LEFT_LIST_PAGE_SIZE));
  const paginatedLeftList = React.useMemo(() => {
    const start = (leftPage - 1) * LEFT_LIST_PAGE_SIZE;
    return listForLeft.slice(start, start + LEFT_LIST_PAGE_SIZE);
  }, [listForLeft, leftPage, LEFT_LIST_PAGE_SIZE]);

  const handleSelectReception = React.useCallback((r: ReceptionQueueItem) => {
    setSelectedReception(r);
    setSelectedPatientId(r.patientId);
  }, []);

  const selectedClinical = selectedPatient
    ? clinicalByPatientId.get(selectedPatient.patientId) ?? null
    : null;
  const activeVisitClinical = React.useMemo(() => {
    if (!selectedReception || selectedReception.status !== "IN_PROGRESS") return null;
    const byReception = clinicals
      .filter(
        (c) =>
          c.receptionId === selectedReception.receptionId &&
          resolveClinicalStatus(c) === "IN_PROGRESS"
      )
      .sort((a, b) => (b.clinicalId ?? b.id ?? 0) - (a.clinicalId ?? a.id ?? 0))[0];
    if (byReception) return byReception;
    return (
      clinicals
        .filter(
          (c) =>
            c.patientId === selectedReception.patientId &&
            resolveClinicalStatus(c) === "IN_PROGRESS"
        )
        .sort((a, b) => (b.clinicalId ?? b.id ?? 0) - (a.clinicalId ?? a.id ?? 0))[0] ?? null
    );
  }, [clinicals, selectedReception]);
  const currentClinicalId = activeVisitClinical?.clinicalId ?? activeVisitClinical?.id ?? null;

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
  }, [query]);

  React.useEffect(() => {
    if (leftPage > totalLeftPages) setLeftPage(totalLeftPages);
  }, [leftPage, totalLeftPages]);

  const handleStartNewClinical = React.useCallback(async () => {
    if (!selectedReception) {
      window.alert("접수 환자를 먼저 선택해 주세요.");
      return;
    }
    if (creatingClinicalRef.current) return;
    creatingClinicalRef.current = true;
    setCreatingClinical(true);
    try {
      setErrorMessage(null);
      await startVisitApi(selectedReception.receptionId);
      const currentReceptionId = selectedReception.receptionId;
      await Promise.all([loadData(), loadReceptionQueue()]);
      setSelectedPatientId(selectedReception.patientId);
      setSelectedReception((prev) => {
        if (!prev) return prev;
        return { ...prev, status: "IN_PROGRESS" };
      });
      window.alert("진료가 시작되었습니다.");
    } catch (err) {
      const message =
        err instanceof Error
          ? isNetworkError(err)
            ? clinicalConnectionMessage()
            : err.message
          : "진료 시작에 실패했습니다.";
      setErrorMessage(message);
      window.alert(message);
    } finally {
      creatingClinicalRef.current = false;
      setCreatingClinical(false);
    }
  }, [selectedReception, loadData, loadReceptionQueue]);

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
          selectedPatient={selectedReception ? selectedPatient : null}
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
            paginatedLeftList={paginatedLeftList}
            listForLeft={listForLeft}
            leftPage={leftPage}
            totalLeftPages={totalLeftPages}
            onLeftPageChange={setLeftPage}
            clinicalByPatientId={clinicalByPatientId}
            selectedReception={selectedReception}
            onSelectReception={handleSelectReception}
            receptionLoading={receptionLoading}
          />

          <ClinicalChartCenter
            selectedPatient={selectedPatient}
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
