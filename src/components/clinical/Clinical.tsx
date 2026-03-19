"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
<<<<<<< HEAD
import {
  Alert,
  Autocomplete,
  Box,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
  Button,
  Divider,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Avatar,
  Pagination,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import LocalHospitalOutlinedIcon from "@mui/icons-material/LocalHospitalOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import PhotoLibraryOutlinedIcon from "@mui/icons-material/PhotoLibraryOutlined";
import ChecklistOutlinedIcon from "@mui/icons-material/ChecklistOutlined";
import ChatOutlinedIcon from "@mui/icons-material/ChatOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import { fetchPatientsApi } from "@/lib/patient/patientApi";
import type { Patient } from "@/features/patients/patientTypes";
import {
  fetchClinicalOrdersApi,
  createClinicalOrderApi,
  updateClinicalOrderStatusApi,
  ORDER_STATUSES,
  type ClinicalOrder,
  type LabOrderType,
  type OrderStatus,
} from "@/lib/clinicalOrderApi";
import {
  fetchVitalsApi,
  saveVitalsApi,
  fetchAssessmentApi,
  saveAssessmentApi,
=======
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
>>>>>>> feature/clinical
  type VitalSignsRes,
  type AssessmentRes,
} from "@/lib/clinicalVitalsApi";
import {
<<<<<<< HEAD
  fetchDoctorNoteApi,
  createDoctorNoteApi,
  updateDoctorNoteApi,
  fetchDiagnosesApi,
  addDiagnosisApi,
  removeDiagnosisApi,
  fetchPrescriptionsApi,
  addPrescriptionApi,
  removePrescriptionApi,
  type DoctorNoteRes,
  type DiagnosisRes,
  type PrescriptionRes,
} from "@/lib/clinicalRecordApi";

type ClinicalRes = {
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

type ApiEnvelope<T> = {
  success?: boolean;
  message?: string | null;
  data?: T;
  result?: T;
};

const CLINICAL_API_BASE =
  process.env.NEXT_PUBLIC_CLINICAL_API_BASE_URL ?? "http://192.168.1.70:8090";

function normalizeClinical(c: ClinicalRes & { receptionId?: number }): ClinicalRes {
  return { ...c, patientId: c.patientId ?? c.receptionId ?? 0 };
}

async function fetchClinicalApi(): Promise<ClinicalRes[]> {
  const res = await fetch(`${CLINICAL_API_BASE}/api/clinicals`, { cache: "no-store" });
  if (!res.ok) throw new Error(`진료 조회 실패 (${res.status})`);
  const body = (await res.json()) as ApiEnvelope<ClinicalRes[]> | ClinicalRes[];
  const raw = Array.isArray(body) ? body : (body.data ?? body.result ?? []);
  const list = Array.isArray(raw) ? raw : [];
  return list.map((c: ClinicalRes & { receptionId?: number }) => normalizeClinical(c));
}

function isNetworkError(e: unknown): boolean {
  if (e instanceof TypeError && (e.message === "Failed to fetch" || e.message.includes("fetch"))) return true;
  if (e instanceof Error && e.message.includes("ERR_CONNECTION_REFUSED")) return true;
  return false;
}

function clinicalConnectionMessage(): string {
  const base = process.env.NEXT_PUBLIC_CLINICAL_API_BASE_URL ?? "http://localhost:8090";
  return `진료 서버에 연결할 수 없습니다. hospital-clinical 백엔드(${base})가 실행 중인지 확인해 주세요.`;
}

async function createClinicalApi(patientId: number): Promise<ClinicalRes> {
  let res: Response;
  try {
    res = await fetch(`${CLINICAL_API_BASE}/api/clinicals`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ patientId, clinicalType: "OUT" }),
    });
  } catch (e) {
    if (isNetworkError(e)) throw new Error(clinicalConnectionMessage());
    throw e;
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { message?: string };
    const msg = body?.message ?? `신규 진료 생성 실패 (${res.status})`;
    throw new Error(msg);
  }
  const body = (await res.json()) as ApiEnvelope<ClinicalRes> | ClinicalRes;
  const raw =
    body && typeof body === "object" && ("data" in body || "result" in body)
      ? (body as ApiEnvelope<ClinicalRes>).data ?? (body as ApiEnvelope<ClinicalRes>).result
      : (body as ClinicalRes);
  const created = raw ? normalizeClinical({ ...raw, patientId }) : null;
  if (!created || (created.clinicalId == null && created.id == null))
    throw new Error("신규 진료 생성 응답이 올바르지 않습니다.");
  return created;
}


const ORDER_TYPE_LABELS: Record<LabOrderType, string> = {
  BLOOD: "혈액검사",
  IMAGING: "영상검사",
  PROCEDURE: "처치",
};

function formatDateTime(iso?: string | null) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function calcAge(dateStr?: string | null) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "-";
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age -= 1;
  return `${age}세`;
}

function sexLabel(g?: string | null) {
  if (g === "M") return "남";
  if (g === "F") return "여";
  return "-";
}

function formatBirth(dateStr?: string | null) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "-";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

function formatClinicalDate(iso?: string | null) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

function clinicalStatusView(status?: string | null) {
  switch (status) {
    case "WAITING":
    case "READY":
      return { label: "대기", color: "warning" as const };
    case "CALLED":
      return { label: "호출", color: "info" as const };
    case "IN_PROGRESS":
      return { label: "진료중", color: "success" as const };
    case "DONE":
    case "COMPLETED":
      return { label: "완료", color: "default" as const };
    case "CANCELLED":
      return { label: "취소", color: "error" as const };
    default:
      return { label: "미분류", color: "default" as const };
  }
}

function resolveClinicalStatus(v?: ClinicalRes | null) {
  return v?.status ?? v?.clinicalStatus ?? null;
}

const ORDER_STATUS_LABELS: Record<string, string> = {
  REQUESTED: "요청",
  REQUEST: "요청",
  IN_PROGRESS: "진행",
  COMPLETED: "완료",
  CANCELLED: "취소",
};

function orderStatusLabel(status?: string | null) {
  if (!status) return "미분류";
  return ORDER_STATUS_LABELS[status] ?? status;
}

const MEDICATION_OPTIONS: { code: string; name: string }[] = [
  { code: "B00012345", name: "타이레놀정" },
  { code: "B00012346", name: "타이레놀에스정" },
  { code: "B00012347", name: "베타히스틴메실산염정 6mg" },
  { code: "B00012348", name: "이가탄정" },
  { code: "B00012349", name: "로키소펜정 400mg" },
  { code: "B00012350", name: "어린이타이레놀현탁액" },
  { code: "B00012351", name: "우루사캡슐 100mg" },
  { code: "B00012352", name: "가스디알정" },
  { code: "B00012353", name: "모드콜캡슐" },
  { code: "B00012354", name: "락트엘정" },
  { code: "B00012355", name: "메가마그정" },
  { code: "B00012356", name: "센시아민정" },
  { code: "B00012357", name: "베나코티연고 0.1%" },
  { code: "B00012358", name: "레보플록사신정 500mg" },
  { code: "B00012359", name: "아로나민골드캡슐" },
  { code: "B00012360", name: "게보린정" },
  { code: "B00012361", name: "쎄레콕스캡슐 200mg" },
  { code: "B00012362", name: "뉴론틴캡슐 300mg" },
  { code: "B00012363", name: "타베길정" },
  { code: "B00012364", name: "콘서타서방정 18mg" },
];

export default function ClinicalPage() {
  const searchParams = useSearchParams();
  const LEFT_LIST_PAGE_SIZE = 5;
  const theme = useTheme();
  const isCompact = useMediaQuery(theme.breakpoints.down("xl"));
  const [patients, setPatients] = React.useState<Patient[]>([]);
  const [clinicals, setClinicals] = React.useState<ClinicalRes[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [tab, setTab] = React.useState<"WAIT" | "RESERVATION" | "ALL">("WAIT");
=======
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
>>>>>>> feature/clinical
  const [leftPage, setLeftPage] = React.useState(1);
  const [selectedPatientId, setSelectedPatientId] = React.useState<number | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [creatingClinical, setCreatingClinical] = React.useState(false);
  const creatingClinicalRef = React.useRef(false);
<<<<<<< HEAD
  const [orders, setOrders] = React.useState<ClinicalOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = React.useState(false);
  const [orderDialogOpen, setOrderDialogOpen] = React.useState(false);
  const [newOrderType, setNewOrderType] = React.useState<LabOrderType>("BLOOD");
  const [newOrderName, setNewOrderName] = React.useState("");
  const [creatingOrder, setCreatingOrder] = React.useState(false);
  const [updatingOrderId, setUpdatingOrderId] = React.useState<number | null>(null);
=======

  const [orders, setOrders] = React.useState<ClinicalOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = React.useState(false);
  const [orderDialogOpen, setOrderDialogOpen] = React.useState(false);
  const [updatingOrderId, setUpdatingOrderId] = React.useState<number | null>(null);

>>>>>>> feature/clinical
  const [vitals, setVitals] = React.useState<VitalSignsRes | null>(null);
  const [assessment, setAssessment] = React.useState<AssessmentRes | null>(null);
  const [vitalsLoading, setVitalsLoading] = React.useState(false);
  const [assessmentLoading, setAssessmentLoading] = React.useState(false);
<<<<<<< HEAD
  const [vitalsDialogOpen, setVitalsDialogOpen] = React.useState(false);
  const [assessmentDialogOpen, setAssessmentDialogOpen] = React.useState(false);
  const [savingVitals, setSavingVitals] = React.useState(false);
  const [savingAssessment, setSavingAssessment] = React.useState(false);
  const [vitalsForm, setVitalsForm] = React.useState({
=======
  const [vitalAssessmentDialogOpen, setVitalAssessmentDialogOpen] = React.useState(false);
  const [vitalsForm, setVitalsForm] = React.useState<VitalsFormState>({
>>>>>>> feature/clinical
    temperature: "",
    pulse: "",
    bpSystolic: "",
    bpDiastolic: "",
    respiratoryRate: "",
    measuredAt: "",
  });
<<<<<<< HEAD
  const [assessmentForm, setAssessmentForm] = React.useState({
=======
  const [assessmentForm, setAssessmentForm] = React.useState<AssessmentFormState>({
>>>>>>> feature/clinical
    chiefComplaint: "",
    visitReason: "",
    historyPresentIllness: "",
    pastHistory: "",
    familyHistory: "",
    allergy: "",
    currentMedication: "",
  });
<<<<<<< HEAD
  const [department, setDepartment] = React.useState("내과1");
  const [doctorNote, setDoctorNote] = React.useState<DoctorNoteRes | null>(null);
  const [diagnoses, setDiagnoses] = React.useState<DiagnosisRes[]>([]);
  const [prescriptions, setPrescriptions] = React.useState<PrescriptionRes[]>([]);
=======

  const [department, setDepartment] = React.useState("내과1");
  const [doctorNote, setDoctorNote] = React.useState<DoctorNoteRes | null>(null);
  const [diagnoses, setDiagnoses] = React.useState<
    Awaited<ReturnType<typeof fetchDiagnosesApi>>
  >([]);
  const [prescriptions, setPrescriptions] = React.useState<
    Awaited<ReturnType<typeof fetchPrescriptionsApi>>
  >([]);
>>>>>>> feature/clinical
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
<<<<<<< HEAD
  const [pastClinicalSummaries, setPastClinicalSummaries] = React.useState<Record<number, string>>({});
  const [repeatingFromClinicalId, setRepeatingFromClinicalId] = React.useState<number | null>(null);
=======
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

>>>>>>> feature/clinical
  const queryPatientId = React.useMemo(() => {
    const raw = searchParams.get("patientId");
    if (!raw) return null;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : null;
  }, [searchParams]);

<<<<<<< HEAD
  const loadOrders = React.useCallback(async (clinicalId: number) => {
    setOrdersLoading(true);
    try {
      const list = await fetchClinicalOrdersApi(clinicalId);
      setOrders(list);
=======
  const loadOrders = React.useCallback(async (visitId: number) => {
    setOrdersLoading(true);
    try {
      setOrders(await fetchClinicalOrdersApi(visitId));
>>>>>>> feature/clinical
    } catch {
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  }, []);

<<<<<<< HEAD
  const loadVitals = React.useCallback(async (clinicalId: number) => {
    setVitalsLoading(true);
    try {
      const data = await fetchVitalsApi(clinicalId);
      setVitals(data ?? null);
=======
  const loadVitals = React.useCallback(async (visitId: number) => {
    setVitalsLoading(true);
    try {
      setVitals((await fetchVitalsApi(visitId)) ?? null);
>>>>>>> feature/clinical
    } catch {
      setVitals(null);
    } finally {
      setVitalsLoading(false);
    }
  }, []);

<<<<<<< HEAD
  const loadAssessment = React.useCallback(async (clinicalId: number) => {
    setAssessmentLoading(true);
    try {
      const data = await fetchAssessmentApi(clinicalId);
      setAssessment(data ?? null);
=======
  const loadAssessment = React.useCallback(async (visitId: number) => {
    setAssessmentLoading(true);
    try {
      setAssessment((await fetchAssessmentApi(visitId)) ?? null);
>>>>>>> feature/clinical
    } catch {
      setAssessment(null);
    } finally {
      setAssessmentLoading(false);
    }
  }, []);

<<<<<<< HEAD
  const loadDoctorNote = React.useCallback(async (clinicalId: number) => {
    try {
      const data = await fetchDoctorNoteApi(clinicalId);
=======
  const loadDoctorNote = React.useCallback(async (visitId: number) => {
    try {
      const data = await fetchDoctorNoteApi(visitId);
>>>>>>> feature/clinical
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

<<<<<<< HEAD
  const loadDiagnoses = React.useCallback(async (clinicalId: number) => {
    try {
      const list = await fetchDiagnosesApi(clinicalId);
      setDiagnoses(list);
=======
  const loadDiagnoses = React.useCallback(async (visitId: number) => {
    try {
      setDiagnoses(await fetchDiagnosesApi(visitId));
>>>>>>> feature/clinical
    } catch {
      setDiagnoses([]);
    }
  }, []);

<<<<<<< HEAD
  const loadPrescriptions = React.useCallback(async (clinicalId: number) => {
    try {
      const list = await fetchPrescriptionsApi(clinicalId);
      setPrescriptions(list);
=======
  const loadPrescriptions = React.useCallback(async (visitId: number) => {
    try {
      setPrescriptions(await fetchPrescriptionsApi(visitId));
>>>>>>> feature/clinical
    } catch {
      setPrescriptions([]);
    }
  }, []);

<<<<<<< HEAD
  const loadData = React.useCallback(async () => {
    try {
      setErrorMessage(null);
      setLoading(true);
=======
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
>>>>>>> feature/clinical
      const [patientsResult, clinicalsResult] = await Promise.allSettled([
        fetchPatientsApi(),
        fetchClinicalApi(),
      ]);
<<<<<<< HEAD

=======
>>>>>>> feature/clinical
      if (patientsResult.status === "fulfilled") {
        setPatients(patientsResult.value);
      } else {
        setPatients([]);
        setErrorMessage("환자 목록을 불러오지 못했습니다.");
      }
<<<<<<< HEAD

=======
>>>>>>> feature/clinical
      if (clinicalsResult.status === "fulfilled") {
        setClinicals(clinicalsResult.value);
      } else {
        setClinicals([]);
        setErrorMessage("진료 목록 연결에 실패했습니다. 환자 목록만 표시합니다.");
      }
    } catch (err) {
<<<<<<< HEAD
      const message = err instanceof Error ? err.message : "데이터를 불러오지 못했습니다.";
      setErrorMessage(message);
    } finally {
      setLoading(false);
=======
      setErrorMessage(err instanceof Error ? err.message : "데이터를 불러오지 못했습니다.");
>>>>>>> feature/clinical
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  React.useEffect(() => {
    if (!queryPatientId || patients.length === 0) return;
<<<<<<< HEAD
    const exists = patients.some((p) => p.patientId === queryPatientId);
    if (!exists) return;
=======
    if (!patients.some((p) => p.patientId === queryPatientId)) return;
>>>>>>> feature/clinical
    setTab("ALL");
    setSelectedPatientId(queryPatientId);
  }, [queryPatientId, patients]);

<<<<<<< HEAD
  const queue = React.useMemo(() => {
    if (!clinicals.length) return [];
    return clinicals.filter((v) => {
      const status = resolveClinicalStatus(v);
      if (tab === "WAIT") return status === "WAITING" || status === "CALLED" || status === "READY";
      if (tab === "RESERVATION") return v.clinicalType === "RESERVATION";
      return true;
    });
  }, [clinicals, tab]);

=======
>>>>>>> feature/clinical
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
<<<<<<< HEAD
    const base = queue.length
      ? (queue.map((v) => patientMap.get(v.patientId)).filter(Boolean) as Patient[])
      : patients;
    const filtered = k
      ? base.filter((p) =>
          [p.name, p.patientNo, p.phone].some((v) => (v ?? "").toLowerCase().includes(k))
        )
      : base;
    const unique = new Map<number, Patient>();
    for (const p of filtered) {
      unique.set(p.patientId, p);
    }
    return Array.from(unique.values());
  }, [queue, patients, patientMap, query]);
=======
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
>>>>>>> feature/clinical

  const selectedPatient = React.useMemo(() => {
    if (selectedPatientId) return patientMap.get(selectedPatientId) ?? null;
    if (listForLeft.length) return listForLeft[0];
    return patients[0] ?? null;
  }, [selectedPatientId, listForLeft, patients, patientMap]);

  const totalLeftPages = Math.max(1, Math.ceil(listForLeft.length / LEFT_LIST_PAGE_SIZE));
<<<<<<< HEAD

=======
>>>>>>> feature/clinical
  const paginatedLeftList = React.useMemo(() => {
    const start = (leftPage - 1) * LEFT_LIST_PAGE_SIZE;
    return listForLeft.slice(start, start + LEFT_LIST_PAGE_SIZE);
  }, [listForLeft, leftPage, LEFT_LIST_PAGE_SIZE]);

<<<<<<< HEAD
  const selectedClinical = selectedPatient ? clinicalByPatientId.get(selectedPatient.patientId) ?? null : null;
=======
  const selectedClinical = selectedPatient
    ? clinicalByPatientId.get(selectedPatient.patientId) ?? null
    : null;
>>>>>>> feature/clinical
  const selectedStatus = clinicalStatusView(resolveClinicalStatus(selectedClinical));
  const currentClinicalId = selectedClinical?.clinicalId ?? selectedClinical?.id ?? null;

  const pastClinicalsForPatient = React.useMemo(() => {
    if (!selectedPatient) return [];
    const id = currentClinicalId ?? undefined;
    return clinicals
      .filter((c) => c.patientId === selectedPatient.patientId && (c.clinicalId ?? c.id) !== id)
<<<<<<< HEAD
      .sort((a, b) => new Date(b.clinicalAt ?? b.createdAt ?? 0).getTime() - new Date(a.clinicalAt ?? a.createdAt ?? 0).getTime());
  }, [clinicals, selectedPatient, currentClinicalId]);

=======
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

>>>>>>> feature/clinical
  React.useEffect(() => {
    if (pastClinicalsForPatient.length === 0) {
      setPastClinicalSummaries({});
      return;
    }
    let cancelled = false;
<<<<<<< HEAD
    const ids = pastClinicalsForPatient.map((c) => c.clinicalId ?? c.id).filter((x): x is number => x != null);
    Promise.all(ids.map((clinicalId) => fetchDoctorNoteApi(clinicalId)))
      .then((notes) => {
        if (cancelled) return;
        const next: Record<number, string> = {};
        ids.forEach((clinicalId, i) => {
          const note = notes[i];
          next[clinicalId] = (note?.presentIllness ?? note?.chiefComplaint ?? "").trim() || "-";
        });
        setPastClinicalSummaries(next);
      })
      .catch(() => { if (!cancelled) setPastClinicalSummaries({}); });
    return () => { cancelled = true; };
  }, [pastClinicalsForPatient]);

  const ordersGrouped = React.useMemo(() => {
    const counts: Record<LabOrderType, number> = { BLOOD: 0, IMAGING: 0, PROCEDURE: 0 };
    for (const o of orders) {
      if (o.orderType in counts) counts[o.orderType as LabOrderType] += 1;
    }
    return (["BLOOD", "IMAGING", "PROCEDURE"] as const).map((type) => ({
      label: ORDER_TYPE_LABELS[type],
      count: counts[type],
    }));
  }, [orders]);

=======
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

>>>>>>> feature/clinical
  React.useEffect(() => {
    if (currentClinicalId != null) {
      loadOrders(currentClinicalId);
      loadVitals(currentClinicalId);
      loadAssessment(currentClinicalId);
      loadDoctorNote(currentClinicalId);
      loadDiagnoses(currentClinicalId);
      loadPrescriptions(currentClinicalId);
<<<<<<< HEAD
=======
      loadPastHistory(currentClinicalId);
>>>>>>> feature/clinical
    } else {
      setOrders([]);
      setVitals(null);
      setAssessment(null);
      setDoctorNote(null);
      setDiagnoses([]);
      setPrescriptions([]);
      setSymptomText("");
      setAdditionalMemo("");
<<<<<<< HEAD
    }
  }, [currentClinicalId, loadOrders, loadVitals, loadAssessment, loadDoctorNote, loadDiagnoses, loadPrescriptions]);
=======
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
>>>>>>> feature/clinical

  React.useEffect(() => {
    setLeftPage(1);
  }, [query, tab]);

  React.useEffect(() => {
<<<<<<< HEAD
    if (leftPage > totalLeftPages) {
      setLeftPage(totalLeftPages);
    }
=======
    if (leftPage > totalLeftPages) setLeftPage(totalLeftPages);
>>>>>>> feature/clinical
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
<<<<<<< HEAD
      const created = await createClinicalApi(selectedPatient.patientId);
      setClinicals((prev) => [...prev, normalizeClinical(created)]);
      await loadData();
=======
      await createClinicalApi(selectedPatient.patientId);
      await loadData();
      setTab("WAIT");
      setSelectedPatientId(selectedPatient.patientId);
>>>>>>> feature/clinical
      window.alert("신규 진료가 등록되었습니다.");
    } catch (err) {
      const message =
        err instanceof Error
<<<<<<< HEAD
          ? (isNetworkError(err) ? clinicalConnectionMessage() : err.message)
=======
          ? isNetworkError(err)
            ? clinicalConnectionMessage()
            : err.message
>>>>>>> feature/clinical
          : "신규 진료 생성에 실패했습니다.";
      setErrorMessage(message);
      window.alert(message);
    } finally {
      creatingClinicalRef.current = false;
      setCreatingClinical(false);
    }
  }, [selectedPatient, loadData]);

<<<<<<< HEAD
=======
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

>>>>>>> feature/clinical
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
<<<<<<< HEAD
        <Box
          sx={{
            px: 2,
            py: 1.5,
            display: "flex",
            alignItems: "center",
            gap: 2,
            borderBottom: "1px solid var(--line)",
            bgcolor: "rgba(255,255,255,0.9)",
          }}
        >
          <Typography sx={{ fontWeight: 800, fontSize: 18 }}>오늘의 현황 - 진료실</Typography>
          <TextField
            size="small"
            placeholder="환자검색 (이름/환자등록번호/생년월일/휴대폰번호)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchOutlinedIcon sx={{ color: "var(--muted)" }} />
                </InputAdornment>
              ),
            }}
            sx={{ flex: 1, maxWidth: 420, "& .MuiOutlinedInput-root": { bgcolor: "#fff" } }}
          />
          <Button
            size="small"
            variant="outlined"
            startIcon={<DescriptionOutlinedIcon />}
            onClick={() => window.alert("차트 화면 이동 예정")}
          >
            차트
          </Button>
          <Button
            variant="contained"
            sx={{ bgcolor: "var(--brand)" }}
            disabled={creatingClinical || !selectedPatient}
            onClick={() => void handleStartNewClinical()}
          >
            {creatingClinical ? "등록 중…" : "신규 진료 시작"}
          </Button>
        </Box>
=======
        <ClinicalToolbar
          query={query}
          onQueryChange={setQuery}
          creatingClinical={creatingClinical}
          selectedPatient={selectedPatient}
          onStartNewClinical={handleStartNewClinical}
        />
>>>>>>> feature/clinical

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "280px 1fr 260px" },
            minHeight: "calc(100vh - 120px)",
            alignItems: "stretch",
          }}
        >
<<<<<<< HEAD
          <Box
            sx={{
              borderRight: "1px solid var(--line)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <Box sx={{ p: 1.5, borderBottom: "1px solid var(--line)" }}>
              <FormControl size="small" fullWidth>
                <InputLabel>진료실</InputLabel>
                <Select
                  value={department}
                  label="진료실"
                  onChange={(e) => setDepartment(e.target.value)}
                >
                  <MenuItem value="내과1">내과1</MenuItem>
                  <MenuItem value="내과2">내과2</MenuItem>
                  <MenuItem value="외과">외과</MenuItem>
                </Select>
              </FormControl>
              <TextField
                size="small"
                fullWidth
                placeholder="환자검색 (F5)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchOutlinedIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                sx={{ mt: 1, "& .MuiOutlinedInput-root": { bgcolor: "#fff" } }}
              />
            </Box>
            <Typography sx={{ px: 1.5, py: 1, fontWeight: 700, fontSize: 13 }}>
              진료 대기/완료 환자목록
            </Typography>
            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ minHeight: 40, "& .MuiTab-root": { minHeight: 40 } }}>
              <Tab label="대기" value="WAIT" />
              <Tab label="완료" value="ALL" />
            </Tabs>
            <Stack spacing={0.5} sx={{ flex: 1, overflow: "auto", p: 1 }}>
              {paginatedLeftList.map((p) => {
                const status = clinicalStatusView(resolveClinicalStatus(clinicalByPatientId.get(p.patientId)));
                return (
                  <Box
                    key={`${p.patientId}-${p.patientNo ?? ""}`}
                    onClick={() => setSelectedPatientId(p.patientId)}
                    sx={{
                      p: 1.25,
                      borderRadius: 1.5,
                      border: "1px solid var(--line)",
                      bgcolor: selectedPatient?.patientId === p.patientId ? "rgba(11, 91, 143, 0.12)" : "#fff",
                      cursor: "pointer",
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography fontWeight={700} sx={{ fontSize: 14 }}>{p.name}</Typography>
                      <Chip label={status.label} color={status.color} size="small" sx={{ height: 22 }} />
                    </Stack>
                    <Typography sx={{ fontSize: 12, color: "var(--muted)", mt: 0.25 }}>
                      {p.patientNo ?? p.patientId} · {department}
                    </Typography>
                  </Box>
                );
              })}
              {!listForLeft.length && (
                <Typography color="text.secondary" sx={{ fontSize: 13 }}>대기 환자가 없습니다.</Typography>
              )}
            </Stack>
            <Stack sx={{ p: 1, borderTop: "1px solid var(--line)" }}>
              <Pagination
                page={leftPage}
                count={totalLeftPages}
                size="small"
                color="primary"
                disabled={listForLeft.length === 0}
                onChange={(_, page) => setLeftPage(page)}
              />
            </Stack>
          </Box>

          <Box sx={{ overflow: "auto", p: 2, bgcolor: "rgba(0,0,0,0.02)" }}>
          <Stack spacing={2}>
            <Card sx={{ borderRadius: 2, border: "1px solid var(--line)" }}>
              <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
                <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                  <Typography fontWeight={800} sx={{ fontSize: 16 }}>
                    {selectedPatient?.name ?? "환자 미선택"} ({selectedPatient?.patientNo ?? "-"}) {selectedPatient?.phone ?? ""}
                  </Typography>
                  <Stack direction="row" spacing={0.75}>
                    <Chip label="건강보험" size="small" />
                    <Chip label={selectedStatus.label} color={selectedStatus.color} size="small" />
                  </Stack>
                </Stack>
              </CardContent>
            </Card>

            <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ width: "100%" }}>
              <Stack spacing={2} sx={{ minWidth: 0, flex: "0 0 340px" }}>
            <Card sx={{ borderRadius: 2, border: "1px solid var(--line)" }}>
              <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
                <Typography fontWeight={800} sx={{ mb: 1, fontSize: 15 }}>신체계측/바이탈 기록</Typography>
                {selectedPatient ? (
                  vitals ? (
                    <>
                      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1 }}>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 700 }}>날짜</TableCell>
                              <TableCell sx={{ fontWeight: 700 }}>혈압(수축)</TableCell>
                              <TableCell sx={{ fontWeight: 700 }}>혈압(이완)</TableCell>
                              <TableCell sx={{ fontWeight: 700 }}>체온</TableCell>
                              <TableCell sx={{ fontWeight: 700 }}>맥박</TableCell>
                              <TableCell sx={{ fontWeight: 700 }}>호흡</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            <TableRow>
                              <TableCell>{formatDateTime(vitals.measuredAt ?? null)}</TableCell>
                              <TableCell>{vitals.bpSystolic ?? "-"}</TableCell>
                              <TableCell>{vitals.bpDiastolic ?? "-"}</TableCell>
                              <TableCell>{vitals.temperature ?? "-"}℃</TableCell>
                              <TableCell>{vitals.pulse ?? "-"}/분</TableCell>
                              <TableCell>{vitals.respiratoryRate ?? "-"}/분</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>
                      <Stack direction="row" spacing={1} sx={{ mt: 1 }} alignItems="center">
                        <Button
                          size="small"
                          variant="text"
                          onClick={() => {
                            if (vitals) {
                              setVitalsForm({
                                temperature: String(vitals.temperature ?? ""),
                                pulse: String(vitals.pulse ?? ""),
                                bpSystolic: String(vitals.bpSystolic ?? ""),
                                bpDiastolic: String(vitals.bpDiastolic ?? ""),
                                respiratoryRate: String(vitals.respiratoryRate ?? ""),
                                measuredAt: vitals.measuredAt ? new Date(vitals.measuredAt).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
                              });
                            }
                            setVitalsDialogOpen(true);
                          }}
                        >
                          자세히 보기
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          disabled={currentClinicalId == null || vitalsLoading}
                          onClick={() => {
                            setVitalsForm({
                              temperature: String(vitals.temperature ?? ""),
                              pulse: String(vitals.pulse ?? ""),
                              bpSystolic: String(vitals.bpSystolic ?? ""),
                              bpDiastolic: String(vitals.bpDiastolic ?? ""),
                              respiratoryRate: String(vitals.respiratoryRate ?? ""),
                              measuredAt: vitals.measuredAt ? new Date(vitals.measuredAt).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
                            });
                            setVitalsDialogOpen(true);
                          }}
                        >
                          바이탈 입력
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          disabled={currentClinicalId == null || assessmentLoading}
                          onClick={() => {
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
                              setAssessmentForm({ chiefComplaint: "", visitReason: "", historyPresentIllness: "", pastHistory: "", familyHistory: "", allergy: "", currentMedication: "" });
                            }
                            setAssessmentDialogOpen(true);
                          }}
                        >
                          문진 입력
                        </Button>
                      </Stack>
                    </>
                  ) : (
                    <Box sx={{ py: 2, textAlign: "center" }}>
                      <Typography color="text.secondary" sx={{ mb: 1 }}>바이탈 기록 없음</Typography>
                      <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap">
                        <Button
                          size="small"
                          variant="outlined"
                          disabled={currentClinicalId == null || vitalsLoading}
                          onClick={() => {
                            setVitalsForm({ temperature: "", pulse: "", bpSystolic: "", bpDiastolic: "", respiratoryRate: "", measuredAt: new Date().toISOString().slice(0, 16) });
                            setVitalsDialogOpen(true);
                          }}
                        >
                          바이탈 입력
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          disabled={currentClinicalId == null || assessmentLoading}
                          onClick={() => {
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
                              setAssessmentForm({ chiefComplaint: "", visitReason: "", historyPresentIllness: "", pastHistory: "", familyHistory: "", allergy: "", currentMedication: "" });
                            }
                            setAssessmentDialogOpen(true);
                          }}
                        >
                          문진 입력
                        </Button>
                      </Stack>
                    </Box>
                  )
                ) : (
                  <Typography color="text.secondary">환자를 선택하면 바이탈·문진을 표시합니다.</Typography>
                )}
              </CardContent>
            </Card>

            <Card sx={{ borderRadius: 2, border: "1px solid var(--line)" }}>
              <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
                <Typography fontWeight={800} sx={{ mb: 1, fontSize: 15 }}>과거 진료기록</Typography>
                {pastClinicalsForPatient.length === 0 ? (
                  <Typography sx={{ fontSize: 13, color: "var(--muted)", py: 0.5 }}>과거 진료가 없습니다.</Typography>
                ) : (
                  <Stack spacing={0.5}>
                    {pastClinicalsForPatient.map((c) => {
                      const cid = c.clinicalId ?? c.id;
                      if (cid == null) return null;
                      return (
                        <Stack key={cid} direction="row" alignItems="center" spacing={1} sx={{ py: 0.5, borderBottom: "1px solid var(--line)" }}>
                          <Typography sx={{ fontSize: 13, minWidth: 90 }}>{formatClinicalDate(c.clinicalAt ?? c.createdAt)}</Typography>
                          <Typography sx={{ fontSize: 13, flex: 1 }}>{pastClinicalSummaries[cid] ?? "-"}</Typography>
                          <Button
                            size="small"
                            variant="outlined"
                            disabled={currentClinicalId == null || repeatingFromClinicalId != null}
                            onClick={async () => {
                              if (currentClinicalId == null) return;
                              setRepeatingFromClinicalId(cid);
                              try {
                                const list = await fetchPrescriptionsApi(cid);
                                for (const p of list) {
                                  await addPrescriptionApi(currentClinicalId, {
                                    medicationName: p.medicationName ?? undefined,
                                    dosage: p.dosage ?? undefined,
                                    days: p.days ?? undefined,
                                  });
                                }
                                await loadPrescriptions(currentClinicalId);
                                if (list.length > 0) window.alert(`해당 진료의 처방 ${list.length}건을 현재 진료에 넣었습니다.`);
                                else window.alert("해당 진료에 등록된 처방이 없습니다.");
                              } catch (e) {
                                window.alert(e instanceof Error ? e.message : "반복처방 실패");
                              } finally {
                                setRepeatingFromClinicalId(null);
                              }
                            }}
                          >
                            {repeatingFromClinicalId === cid ? "처방 넣는 중…" : "반복처방"}
                          </Button>
                        </Stack>
                      );
                    })}
                  </Stack>
                )}
              </CardContent>
            </Card>
              </Stack>

              <Stack spacing={2} sx={{ minWidth: 0, flex: 1 }}>
            <Card sx={{ borderRadius: 2, border: "1px solid var(--line)" }}>
              <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
                <Typography fontWeight={800} sx={{ fontSize: 15, mb: 1.5 }}>진료기록 작성</Typography>
                <Typography sx={{ fontWeight: 700, fontSize: 13, color: "var(--muted)", mb: 0.5 }}>증상 (Subjective)</Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  size="small"
                  placeholder="증상을 입력하세요"
                  value={symptomText}
                  onChange={(e) => setSymptomText(e.target.value)}
                  sx={{ mb: 2, "& .MuiOutlinedInput-root": { bgcolor: "#fff" } }}
                />
                <Typography sx={{ fontWeight: 700, fontSize: 13, color: "var(--muted)", mb: 0.5 }}>Q 상병</Typography>
                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1, mb: 1 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>주</TableCell>
                        <TableCell>상병기호</TableCell>
                        <TableCell>상병명</TableCell>
                        <TableCell width={60}></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {diagnoses.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} sx={{ color: "var(--muted)", fontSize: 13 }}>
                            등록된 상병이 없습니다. +추가로 검색하여 등록하세요.
                          </TableCell>
                        </TableRow>
                      ) : (
                        diagnoses.map((d, i) => (
                          <TableRow key={d.diagnosisId}>
                            <TableCell>{d.mainYn === "Y" ? "주" : "부"}</TableCell>
                            <TableCell>{d.dxCode ?? "-"}</TableCell>
                            <TableCell>{d.dxName ?? "-"}</TableCell>
                            <TableCell>
                              {currentClinicalId != null && (
                                <Button size="small" color="error" onClick={async () => { try { await removeDiagnosisApi(currentClinicalId, d.diagnosisId); loadDiagnoses(currentClinicalId); } catch (e) { window.alert(e instanceof Error ? e.message : "삭제 실패"); } }}>삭제</Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }} flexWrap="wrap">
                  <Typography sx={{ fontSize: 12, color: "var(--muted)" }}>목록에 없으면 직접입력</Typography>
                  <TextField size="small" placeholder="코드" value={diagnosisCodeInput} onChange={(e) => setDiagnosisCodeInput(e.target.value)} sx={{ width: 80, "& .MuiOutlinedInput-root": { bgcolor: "#fff" } }} />
                  <TextField size="small" placeholder="상병명" value={diagnosisNameInput} onChange={(e) => setDiagnosisNameInput(e.target.value)} sx={{ width: 140, "& .MuiOutlinedInput-root": { bgcolor: "#fff" } }} />
                  <Button size="small" variant="outlined" disabled={currentClinicalId == null} onClick={async () => { if (currentClinicalId == null || (!diagnosisCodeInput.trim() && !diagnosisNameInput.trim())) return; try { await addDiagnosisApi(currentClinicalId, { dxCode: diagnosisCodeInput.trim() || null, dxName: diagnosisNameInput.trim() || null, main: diagnoses.length === 0 }); loadDiagnoses(currentClinicalId); setDiagnosisCodeInput(""); setDiagnosisNameInput(""); } catch (e) { window.alert(e instanceof Error ? e.message : "등록 실패"); } }}>추가</Button>
                </Stack>
                <Typography sx={{ fontWeight: 700, fontSize: 13, color: "var(--muted)", mb: 0.5 }}>처방 약품</Typography>
                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1, mb: 1 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>약품명</TableCell>
                        <TableCell>용량</TableCell>
                        <TableCell>일수</TableCell>
                        <TableCell width={60}></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {prescriptions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} sx={{ color: "var(--muted)", fontSize: 13 }}>등록된 처방이 없습니다.</TableCell>
                        </TableRow>
                      ) : (
                        prescriptions.map((p) => (
                          <TableRow key={p.prescriptionId}>
                            <TableCell>{p.medicationName ?? "-"}</TableCell>
                            <TableCell>{p.dosage ?? "-"}</TableCell>
                            <TableCell>{p.days ?? "-"}</TableCell>
                            <TableCell>
                              {currentClinicalId != null && (
                                <Button size="small" color="error" onClick={async () => { try { await removePrescriptionApi(currentClinicalId, p.prescriptionId); loadPrescriptions(currentClinicalId); } catch (e) { window.alert(e instanceof Error ? e.message : "삭제 실패"); } }}>삭제</Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }} flexWrap="wrap">
                  <Typography sx={{ fontSize: 12 }}>다음 추가할 약:</Typography>
                  <TextField size="small" placeholder="용량" value={prescriptionDosageInput} onChange={(e) => setPrescriptionDosageInput(e.target.value)} sx={{ width: 70, "& .MuiOutlinedInput-root": { bgcolor: "#fff" } }} />
                  <TextField size="small" placeholder="일수" value={prescriptionDaysInput} onChange={(e) => setPrescriptionDaysInput(e.target.value)} sx={{ width: 60, "& .MuiOutlinedInput-root": { bgcolor: "#fff" } }} />
                  <Autocomplete
                    size="small"
                    sx={{ minWidth: 220, "& .MuiOutlinedInput-root": { bgcolor: "#fff" } }}
                    options={MEDICATION_OPTIONS}
                    getOptionLabel={(opt) => (typeof opt === "string" ? opt : `${opt.code} ${opt.name}`)}
                    inputValue={prescriptionNameInput}
                    onInputChange={(_, value) => setPrescriptionNameInput(value)}
                    onChange={(_, value) => {
                      if (value && typeof value === "object" && "code" in value && "name" in value) {
                        setPrescriptionNameInput(`${value.code} ${value.name}`);
                      } else if (typeof value === "string") {
                        setPrescriptionNameInput(value);
                      } else {
                        setPrescriptionNameInput("");
                      }
                    }}
                    filterOptions={(options, { inputValue }) => {
                      const q = inputValue.trim().toLowerCase();
                      if (!q) return options;
                      return options.filter(
                        (opt) =>
                          opt.name.toLowerCase().includes(q) || opt.code.toLowerCase().includes(q)
                      );
                    }}
                    freeSolo
                    renderInput={(params) => (
                      <TextField {...params} placeholder="약품명 검색" />
                    )}
                  />
                  <Button size="small" variant="outlined" disabled={currentClinicalId == null} onClick={async () => { if (currentClinicalId == null || !prescriptionNameInput.trim()) return; try { await addPrescriptionApi(currentClinicalId, { medicationName: prescriptionNameInput.trim(), dosage: prescriptionDosageInput || null, days: prescriptionDaysInput || null }); loadPrescriptions(currentClinicalId); setPrescriptionNameInput(""); setPrescriptionDosageInput(""); setPrescriptionDaysInput(""); } catch (e) { window.alert(e instanceof Error ? e.message : "등록 실패"); } }}>추가</Button>
                </Stack>
                <Typography sx={{ fontWeight: 700, fontSize: 13, color: "var(--muted)", mb: 0.5 }}>추가 메모 (시술, 추후계획 등)</Typography>
                <TextField fullWidth multiline rows={2} size="small" value={additionalMemo} onChange={(e) => setAdditionalMemo(e.target.value)} sx={{ mb: 2, "& .MuiOutlinedInput-root": { bgcolor: "#fff" } }} />
                <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" flexWrap="wrap">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Button size="small" variant="outlined" onClick={() => window.alert("사전심사 예정")}>사전심사</Button>
                    <Button size="small" variant="contained" sx={{ bgcolor: "var(--brand)" }} disabled={currentClinicalId == null || savingRecord} onClick={async () => { if (currentClinicalId == null) return; setSavingRecord(true); try { if (doctorNote) { await updateDoctorNoteApi(currentClinicalId, { presentIllness: symptomText, clinicalMemo: additionalMemo }); } else { await createDoctorNoteApi(currentClinicalId, { presentIllness: symptomText, clinicalMemo: additionalMemo }); } await loadDoctorNote(currentClinicalId); window.alert("진료기록이 저장되었습니다."); } catch (e) { window.alert(e instanceof Error ? e.message : "저장 실패"); } finally { setSavingRecord(false); } }}>{savingRecord ? "저장 중…" : "진료 저장"}</Button>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <FormControl size="small" sx={{ minWidth: 100 }}>
                      <InputLabel>전달</InputLabel>
                      <Select label="전달" value="수납실">
                        <MenuItem value="수납실">수납실</MenuItem>
                      </Select>
                    </FormControl>
                    <Button size="small" variant="contained" color="success" onClick={() => window.alert("진료완료 처리 예정")}>진료완료</Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
              </Stack>
            </Stack>
          </Stack>

          </Box>

          <Box
            sx={{
              borderLeft: "1px solid var(--line)",
              p: 1.5,
              display: "flex",
              flexDirection: "column",
              gap: 2,
              bgcolor: "rgba(255,255,255,0.9)",
            }}
          >
            <Box>
              <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 1 }}>
                <CalendarMonthOutlinedIcon fontSize="small" />
                <Typography fontWeight={700} sx={{ fontSize: 14 }}>{calendarYear}.{String(calendarMonth + 1).padStart(2, "0")}</Typography>
              </Stack>
              <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 0.5, textAlign: "center", fontSize: 11 }}>
                {["일", "월", "화", "수", "목", "금", "토"].map((d) => (
                  <Typography key={d} sx={{ fontWeight: 700, color: "var(--muted)" }}>{d}</Typography>
                ))}
                {calendarDays.map((d, i) => (
                  <Box
                    key={i}
                    sx={{
                      py: 0.5,
                      borderRadius: 0.5,
                      bgcolor: d === now.getDate() ? "var(--brand)" : "transparent",
                      color: d === now.getDate() ? "#fff" : "inherit",
                      fontSize: 12,
                    }}
                  >
                    {d ?? ""}
                  </Box>
                ))}
              </Box>
            </Box>
            <Box>
              <Typography fontWeight={700} sx={{ fontSize: 13, mb: 0.5 }}>그룹오더</Typography>
              <TextField size="small" fullWidth placeholder="자주 쓰는 처방 묶음" value={groupOrderText} onChange={(e) => setGroupOrderText(e.target.value)} sx={{ "& .MuiOutlinedInput-root": { bgcolor: "#fff" } }} />
            </Box>
            <Box>
              <Typography fontWeight={700} sx={{ fontSize: 13, mb: 0.5 }}>차트템플릿</Typography>
              <TextField size="small" fullWidth multiline rows={3} placeholder="증상/진단/처방 템플릿" value={chartTemplateText} onChange={(e) => setChartTemplateText(e.target.value)} sx={{ "& .MuiOutlinedInput-root": { bgcolor: "#fff" } }} />
            </Box>
            <Box>
              <Typography fontWeight={700} sx={{ fontSize: 13, mb: 0.5 }}>오더</Typography>
              {ordersLoading ? (
                <Typography sx={{ fontSize: 12, color: "var(--muted)" }}>조회 중…</Typography>
              ) : orders.length === 0 ? (
                <Typography sx={{ fontSize: 12, color: "var(--muted)" }}>등록된 검사 오더가 없습니다.</Typography>
              ) : (
                <Stack spacing={1} sx={{ mt: 0.5 }}>
                  {orders.map((ord) => (
                    <Box
                      key={ord.id}
                      sx={{
                        p: 1,
                        borderRadius: 1,
                        border: "1px solid var(--line)",
                        bgcolor: "rgba(255,255,255,0.8)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 1,
                        flexWrap: "wrap",
                      }}
                    >
                      <Typography sx={{ fontSize: 12, fontWeight: 600 }}>
                        {ord.orderName && !["BLOOD", "IMAGING", "PROCEDURE"].includes(ord.orderName)
                          ? ord.orderName
                          : ORDER_TYPE_LABELS[ord.orderType]}
                      </Typography>
                      <FormControl size="small" sx={{ minWidth: 100 }}>
                        <Select
                          value={ord.status === "REQUEST" ? "REQUESTED" : (ord.status ?? "REQUESTED")}
                          onChange={async (e) => {
                            const next = e.target.value as OrderStatus;
                            if (currentClinicalId == null || next === (ord.status === "REQUEST" ? "REQUESTED" : ord.status)) return;
                            setUpdatingOrderId(ord.id);
                            try {
                              await updateClinicalOrderStatusApi(currentClinicalId, ord.id, next);
                              setOrders((prev) =>
                                prev.map((o) => (o.id === ord.id ? { ...o, status: next } : o))
                              );
                            } catch (err) {
                              window.alert(err instanceof Error ? err.message : "상태 변경에 실패했습니다.");
                              if (currentClinicalId != null) loadOrders(currentClinicalId);
                            } finally {
                              setUpdatingOrderId(null);
                            }
                          }}
                          disabled={updatingOrderId != null}
                          sx={{ fontSize: 11, height: 28 }}
                        >
                          <MenuItem value="REQUESTED">{orderStatusLabel("REQUESTED")}</MenuItem>
                          <MenuItem value="IN_PROGRESS">{orderStatusLabel("IN_PROGRESS")}</MenuItem>
                          <MenuItem value="COMPLETED">{orderStatusLabel("COMPLETED")}</MenuItem>
                          <MenuItem value="CANCELLED">{orderStatusLabel("CANCELLED")}</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                  ))}
                </Stack>
              )}
              <Button
                size="small"
                variant="outlined"
                fullWidth
                sx={{ mt: 1 }}
                onClick={() => { setNewOrderType("BLOOD"); setNewOrderName(""); setOrderDialogOpen(true); }}
                disabled={currentClinicalId == null}
              >
                검사 오더 등록
              </Button>
              <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
                <Button size="small" variant="outlined" fullWidth onClick={() => window.alert("처방 화면 예정")}>처방</Button>
              </Stack>
            </Box>
          </Box>
        </Box>
      </Stack>

      <Dialog open={orderDialogOpen} onClose={() => setOrderDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>검사 오더 등록</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormControl fullWidth size="small">
              <InputLabel>검사 유형</InputLabel>
              <Select
                value={newOrderType}
                label="검사 유형"
                onChange={(e) => setNewOrderType(e.target.value as LabOrderType)}
              >
                <MenuItem value="BLOOD">{ORDER_TYPE_LABELS.BLOOD}</MenuItem>
                <MenuItem value="IMAGING">{ORDER_TYPE_LABELS.IMAGING}</MenuItem>
                <MenuItem value="PROCEDURE">{ORDER_TYPE_LABELS.PROCEDURE}</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              size="small"
              label="검사/처치 명"
              value={newOrderName}
              onChange={(e) => setNewOrderName(e.target.value)}
              placeholder="예: CBC, 흉부 X-ray, 주사"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOrderDialogOpen(false)}>취소</Button>
          <Button
            variant="contained"
            sx={{ bgcolor: "var(--brand)" }}
            disabled={!newOrderName.trim() || creatingOrder || currentClinicalId == null}
            onClick={async () => {
              if (currentClinicalId == null || !newOrderName.trim()) return;
              setCreatingOrder(true);
              try {
                await createClinicalOrderApi(currentClinicalId, {
                  orderType: newOrderType,
                  orderName: newOrderName.trim(),
                });
                await loadOrders(currentClinicalId);
                setOrderDialogOpen(false);
                setNewOrderName("");
              } catch (err) {
                window.alert(err instanceof Error ? err.message : "검사 오더 등록에 실패했습니다.");
              } finally {
                setCreatingOrder(false);
              }
            }}
          >
            {creatingOrder ? "등록 중…" : "등록"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={vitalsDialogOpen} onClose={() => setVitalsDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>활력징후 입력</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              size="small"
              type="number"
              inputProps={{ step: 0.1, min: 30, max: 45 }}
              label="체온(℃)"
              value={vitalsForm.temperature}
              onChange={(e) => setVitalsForm((p) => ({ ...p, temperature: e.target.value }))}
            />
            <TextField
              fullWidth
              size="small"
              type="number"
              label="맥박(/분)"
              value={vitalsForm.pulse}
              onChange={(e) => setVitalsForm((p) => ({ ...p, pulse: e.target.value }))}
            />
            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="수축기 혈압"
                value={vitalsForm.bpSystolic}
                onChange={(e) => setVitalsForm((p) => ({ ...p, bpSystolic: e.target.value }))}
              />
              <TextField
                fullWidth
                size="small"
                type="number"
                label="이완기 혈압"
                value={vitalsForm.bpDiastolic}
                onChange={(e) => setVitalsForm((p) => ({ ...p, bpDiastolic: e.target.value }))}
              />
            </Stack>
            <TextField
              fullWidth
              size="small"
              type="number"
              label="호흡(/분)"
              value={vitalsForm.respiratoryRate}
              onChange={(e) => setVitalsForm((p) => ({ ...p, respiratoryRate: e.target.value }))}
            />
            <TextField
              fullWidth
              size="small"
              type="datetime-local"
              label="측정 시각"
              value={vitalsForm.measuredAt}
              onChange={(e) => setVitalsForm((p) => ({ ...p, measuredAt: e.target.value }))}
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVitalsDialogOpen(false)}>취소</Button>
          <Button
            variant="contained"
            sx={{ bgcolor: "var(--brand)" }}
            disabled={currentClinicalId == null || savingVitals}
            onClick={async () => {
              if (currentClinicalId == null) return;
              setSavingVitals(true);
              try {
                await saveVitalsApi(currentClinicalId, {
                  temperature: vitalsForm.temperature ? Number(vitalsForm.temperature) : null,
                  pulse: vitalsForm.pulse ? Number(vitalsForm.pulse) : null,
                  bpSystolic: vitalsForm.bpSystolic ? Number(vitalsForm.bpSystolic) : null,
                  bpDiastolic: vitalsForm.bpDiastolic ? Number(vitalsForm.bpDiastolic) : null,
                  respiratoryRate: vitalsForm.respiratoryRate ? Number(vitalsForm.respiratoryRate) : null,
                  measuredAt: vitalsForm.measuredAt || new Date().toISOString(),
                });
                await loadVitals(currentClinicalId);
                setVitalsDialogOpen(false);
              } catch (err) {
                window.alert(err instanceof Error ? err.message : "활력징후 저장에 실패했습니다.");
              } finally {
                setSavingVitals(false);
              }
            }}
          >
            {savingVitals ? "저장 중…" : "저장"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={assessmentDialogOpen} onClose={() => setAssessmentDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>문진 입력</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              size="small"
              label="주호소"
              value={assessmentForm.chiefComplaint}
              onChange={(e) => setAssessmentForm((p) => ({ ...p, chiefComplaint: e.target.value }))}
            />
            <TextField
              fullWidth
              size="small"
              label="내원 사유"
              value={assessmentForm.visitReason}
              onChange={(e) => setAssessmentForm((p) => ({ ...p, visitReason: e.target.value }))}
            />
            <TextField
              fullWidth
              size="small"
              multiline
              rows={2}
              label="현병력"
              value={assessmentForm.historyPresentIllness}
              onChange={(e) => setAssessmentForm((p) => ({ ...p, historyPresentIllness: e.target.value }))}
            />
            <TextField
              fullWidth
              size="small"
              multiline
              rows={2}
              label="과거력"
              value={assessmentForm.pastHistory}
              onChange={(e) => setAssessmentForm((p) => ({ ...p, pastHistory: e.target.value }))}
            />
            <TextField
              fullWidth
              size="small"
              multiline
              rows={2}
              label="가족력"
              value={assessmentForm.familyHistory}
              onChange={(e) => setAssessmentForm((p) => ({ ...p, familyHistory: e.target.value }))}
            />
            <TextField
              fullWidth
              size="small"
              label="알레르기"
              value={assessmentForm.allergy}
              onChange={(e) => setAssessmentForm((p) => ({ ...p, allergy: e.target.value }))}
            />
            <TextField
              fullWidth
              size="small"
              multiline
              rows={2}
              label="복용 약"
              value={assessmentForm.currentMedication}
              onChange={(e) => setAssessmentForm((p) => ({ ...p, currentMedication: e.target.value }))}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssessmentDialogOpen(false)}>취소</Button>
          <Button
            variant="contained"
            sx={{ bgcolor: "var(--brand)" }}
            disabled={currentClinicalId == null || savingAssessment}
            onClick={async () => {
              if (currentClinicalId == null) return;
              setSavingAssessment(true);
              try {
                await saveAssessmentApi(currentClinicalId, {
                  chiefComplaint: assessmentForm.chiefComplaint || null,
                  visitReason: assessmentForm.visitReason || null,
                  historyPresentIllness: assessmentForm.historyPresentIllness || null,
                  pastHistory: assessmentForm.pastHistory || null,
                  familyHistory: assessmentForm.familyHistory || null,
                  allergy: assessmentForm.allergy || null,
                  currentMedication: assessmentForm.currentMedication || null,
                  assessedAt: new Date().toISOString(),
                });
                await loadAssessment(currentClinicalId);
                setAssessmentDialogOpen(false);
              } catch (err) {
                window.alert(err instanceof Error ? err.message : "문진 저장에 실패했습니다.");
              } finally {
                setSavingAssessment(false);
              }
            }}
          >
            {savingAssessment ? "저장 중…" : "저장"}
          </Button>
        </DialogActions>
      </Dialog>
=======
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
>>>>>>> feature/clinical
    </MainLayout>
  );
}
