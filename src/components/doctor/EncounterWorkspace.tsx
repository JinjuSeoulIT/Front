"use client";

import * as React from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
  IconButton,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import BlockRoundedIcon from "@mui/icons-material/BlockRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import AutoFixHighRoundedIcon from "@mui/icons-material/AutoFixHighRounded";
import NoteAltRoundedIcon from "@mui/icons-material/NoteAltRounded";
import BrushRoundedIcon from "@mui/icons-material/BrushRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import ZoomInRoundedIcon from "@mui/icons-material/ZoomInRounded";
import AddPhotoAlternateRoundedIcon from "@mui/icons-material/AddPhotoAlternateRounded";
import {
  activateEncounterApi,
  createEncounterAssetApi,
  deleteEncounterAssetApi,
  deactivateEncounterApi,
  fetchEncounterAssetsApi,
  fetchDiagnosisCodeCandidatesApi,
  type DiagnosisCodeCandidate,
  type MedicalEncounterDiagnosis,
  fetchEncounterDetailApi,
  fetchEncounterHistoryApi,
  fetchEncountersApi,
  type MedicalEncounterAsset,
  type MedicalEncounter,
  type MedicalEncounterDetail,
  type MedicalEncounterHistory,
  updateEncounterApi,
} from "@/lib/medicalEncounterApi";
import { toHistoryEventLabel } from "@/lib/historyLabels";
import {
  getEncounterDraft,
  listFavoriteDiagnoses,
  removeEncounterDraft,
  upsertEncounterDraft,
  type EncounterDraft,
  type FavoriteDiagnosis,
} from "@/lib/doctorWorkspaceStore";
import PatientRegisterModal from "@/app/nurse/register/PatientRegisterModal";
import PatientSearchModal from "@/app/nurse/register/PatientSearchModal";
import ReceptionModal from "@/app/nurse/register/ReceptionModal";
import type { Patient, PatientForm } from "@/features/patients/patientTypes";
import { createPatientApi } from "@/lib/patientApi";
import { fetchPatientsPage } from "@/lib/patientPagingApi";

const panelSx = {
  borderRadius: 3,
  border: "1px solid var(--line)",
  boxShadow: "var(--shadow-1)",
} as const;

const fieldLabelMap: Record<string, string> = {
  doctorId: "담당의",
  deptCode: "진료과",
  status: "상태",
  chiefComplaint: "주호소",
  assessment: "평가",
  planNote: "계획",
  diagnosisCode: "진단코드",
  memo: "메모",
  isActive: "활성 여부",
};

const encounterTemplates = [
  {
    id: "INTERNAL_FIRST",
    label: "내과 초진",
    assessment: "증상 시작 시점/유발요인 확인. 활력징후 및 주요 신체진찰 소견 기반으로 감별진단 필요.",
    plan: "기본 혈액검사 및 필요 영상검사 시행. 증상 완화 약제 처방 후 3~7일 내 재평가.",
    memo: "환자에게 악화 징후(고열, 호흡곤란, 의식저하) 발생 시 즉시 내원 안내.",
  },
  {
    id: "URI_FOLLOWUP",
    label: "감기/호흡기",
    assessment: "상기도 감염 의심. 세균성 합병증 징후는 현재 뚜렷하지 않음.",
    plan: "대증치료 중심 처방. 수분 섭취/휴식 안내 및 48~72시간 경과 관찰.",
    memo: "고열 지속, 객혈, 흉통 동반 시 즉시 재내원 안내.",
  },
  {
    id: "CHRONIC_DISEASE",
    label: "만성질환 추적",
    assessment: "기저질환 경과 모니터링 필요. 복약 순응도 및 생활습관 점검 필요.",
    plan: "현재 약물 유지/조정 검토. 다음 외래 시 주요 수치 재확인.",
    memo: "식이/운동/수면 관리 계획을 환자와 함께 재확인.",
  },
] as const;

const quickPlanPhrases = [
  "필요 시 1주 내 외래 재진 권고",
  "복약 후 이상반응 발생 시 즉시 연락 안내",
  "수분 섭취 및 충분한 휴식 교육",
  "검사 결과 확인 후 치료계획 재조정",
  "보호자/환자에게 경과 관찰 포인트 설명",
] as const;

const mergeText = (base?: string | null, addition?: string | null) => {
  const left = (base || "").trim();
  const right = (addition || "").trim();
  if (!left) return right;
  if (!right) return left;
  return `${left}\n${right}`;
};

const dataUrlToFile = (dataUrl: string, filename: string) => {
  const [header, body] = dataUrl.split(",");
  const mimeMatch = /data:(.*?);base64/.exec(header || "");
  const mime = mimeMatch?.[1] || "image/png";
  const binary = window.atob(body || "");
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new File([bytes], filename, { type: mime });
};

const drawingTemplates = [
  { code: "FACE_PROFILE", label: "얼굴 측면", imagePath: "/medical-templates/face-profile.svg" },
  { code: "FACE_FRONT", label: "얼굴 정면", imagePath: "/medical-templates/face-front.svg" },
  { code: "UPPER_FRONT", label: "상체 정면", imagePath: "/medical-templates/upper-front.svg" },
  { code: "LOWER_FRONT", label: "하체 정면", imagePath: "/medical-templates/lower-front.svg" },
] as const;

const historyCoreFields = new Set(["diagnosisCode", "diagnoses", "planNote", "status", "memo", "assessment", "chiefComplaint"]);

const serializeDraftFields = (detail: MedicalEncounterDetail | null) => {
  if (!detail) return "";
  return JSON.stringify({
    diagnosisCode: detail.diagnosisCode ?? null,
    diagnoses: detail.diagnoses ?? [],
    chiefComplaint: detail.chiefComplaint ?? null,
    assessment: detail.assessment ?? null,
    planNote: detail.planNote ?? null,
    memo: detail.memo ?? null,
  });
};

const statusLabel = (value?: string | null) => {
  switch ((value || "").toUpperCase()) {
    case "WAITING":
      return "대기";
    case "IN_PROGRESS":
      return "진료중";
    case "DONE":
      return "완료";
    case "INACTIVE":
      return "비활성";
    default:
      return value || "-";
  }
};

const formatDateTime = (value?: string | null) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${yy}-${mm}-${dd} ${hh}:${mi}`;
};

type Props = {
  includeInactiveDefault?: boolean;
  initialEncounterId?: number | null;
  autoOpenInitialDetail?: boolean;
  restoreDraftOnOpen?: boolean;
};

export default function EncounterWorkspace({
  includeInactiveDefault = false,
  initialEncounterId = null,
  autoOpenInitialDetail = false,
  restoreDraftOnOpen = false,
}: Props) {
  const [rows, setRows] = React.useState<MedicalEncounter[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);
  const [keyword] = React.useState("");
  const [status, setStatus] = React.useState("WAITING");
  const [sortOrder] = React.useState<"LATEST" | "OLDEST">("LATEST");
  const showInactiveList = includeInactiveDefault;
  const [selectedId, setSelectedId] = React.useState<number | null>(null);
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [detail, setDetail] = React.useState<MedicalEncounterDetail | null>(null);
  const [history, setHistory] = React.useState<MedicalEncounterHistory[]>([]);
  const [saving, setSaving] = React.useState(false);
  const [deactivateOpen, setDeactivateOpen] = React.useState(false);
  const [deactivateReasonCode, setDeactivateReasonCode] = React.useState("MANUAL");
  const [deactivateReasonMemo, setDeactivateReasonMemo] = React.useState("");
  const [detailTab, setDetailTab] = React.useState<"DETAIL" | "HISTORY">("DETAIL");
  const [writerOpen, setWriterOpen] = React.useState(false);
  const [structuredWriter, setStructuredWriter] = React.useState({
    address: "",
    onsetDate: "",
    pastHistory: "",
    familyHistory: "",
    medications: "",
    vitals: "",
    objective: "",
    impression: "",
    plan: "",
  });
  const [assets, setAssets] = React.useState<MedicalEncounterAsset[]>([]);
  const [assetPreviewUrl, setAssetPreviewUrl] = React.useState<string | null>(null);
  const [penOpen, setPenOpen] = React.useState(false);
  const [assetSaving, setAssetSaving] = React.useState(false);
  const [diagnosisQuery, setDiagnosisQuery] = React.useState("");
  const [diagnosisLoading, setDiagnosisLoading] = React.useState(false);
  const [diagnosisOptions, setDiagnosisOptions] = React.useState<DiagnosisCodeCandidate[]>([]);
  const [favoriteDiagnoses, setFavoriteDiagnoses] = React.useState<FavoriteDiagnosis[]>([]);
  const [historyCoreOnly, setHistoryCoreOnly] = React.useState(true);
  const [penColor, setPenColor] = React.useState("#1f2937");
  const [penWidth, setPenWidth] = React.useState(2);
  const [selectedTemplateCode, setSelectedTemplateCode] = React.useState<(typeof drawingTemplates)[number]["code"]>("FACE_PROFILE");
  const [penHasStrokes, setPenHasStrokes] = React.useState(false);
  const [pendingTemplateCode, setPendingTemplateCode] = React.useState<(typeof drawingTemplates)[number]["code"] | null>(null);
  const [templateSwitchConfirmOpen, setTemplateSwitchConfirmOpen] = React.useState(false);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const drawingRef = React.useRef(false);
  const lastPointRef = React.useRef<{ x: number; y: number } | null>(null);
  const initialSelectionAppliedRef = React.useRef(false);
  const baselineByEncounterRef = React.useRef<Record<number, string>>({});
  const restoreDraftAppliedRef = React.useRef<Record<number, boolean>>({});
  const draftSaveTimerRef = React.useRef<number | null>(null);
  const [draftSuggestion, setDraftSuggestion] = React.useState<EncounterDraft | null>(null);
  const [isRegisterOpen, setIsRegisterOpen] = React.useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = React.useState(false);
  const [searchModalPatients, setSearchModalPatients] = React.useState<Patient[]>([]);
  const [searchModalPage, setSearchModalPage] = React.useState(1);
  const [searchModalHasMore, setSearchModalHasMore] = React.useState(false);
  const [loadingPatients, setLoadingPatients] = React.useState(false);
  const [searchInput, setSearchInput] = React.useState("");
  const [registerReceptionOpen, setRegisterReceptionOpen] = React.useState(false);
  const [registerReceptionPatient, setRegisterReceptionPatient] = React.useState<Patient | null>(null);
  const detailId = detail?.id ?? null;

  const loadList = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const page = await fetchEncountersApi({ keyword, includeInactive: true, page: 0, size: 100 });
      setRows(page.items);
      if (!selectedId && page.items.length) {
        setSelectedId(page.items[0].id);
      }
      if (selectedId && !page.items.some((x) => x.id === selectedId)) {
        setSelectedId(page.items[0]?.id ?? null);
      }
    } catch {
      setError("진료 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [keyword, selectedId]);

  const displayedRows = React.useMemo(() => {
    let filtered = rows.filter((r) => (showInactiveList ? r.isActive !== "Y" : r.isActive === "Y"));
    if (status.trim()) {
      filtered = filtered.filter((r) => (r.status || "").toUpperCase() === status.trim().toUpperCase());
    }
    const sorted = [...filtered].sort((a, b) => {
      const aTime = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const bTime = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return sortOrder === "LATEST" ? bTime - aTime : aTime - bTime;
    });
    return sorted;
  }, [rows, showInactiveList, status, sortOrder]);

  const loadSearchModalFirstPage = React.useCallback(async (query: string) => {
    setLoadingPatients(true);
    try {
      setSearchInput(query);
      const data = await fetchPatientsPage(query, 1, 50);
      const items = Array.isArray(data?.items) ? data.items : [];
      setSearchModalPatients(items);
      setSearchModalHasMore(Boolean(data?.hasMore));
      setSearchModalPage(1);
    } catch {
      setSearchModalPatients([]);
      setSearchModalHasMore(false);
      setSearchModalPage(1);
    } finally {
      setLoadingPatients(false);
    }
  }, []);

  const loadSearchModalMore = React.useCallback(async () => {
    if (!searchModalHasMore || loadingPatients) return;
    setLoadingPatients(true);
    try {
      const next = searchModalPage + 1;
      const data = await fetchPatientsPage(searchInput, next, 50);
      const items = Array.isArray(data?.items) ? data.items : [];
      setSearchModalPatients((prev) => [...prev, ...items]);
      setSearchModalHasMore(Boolean(data?.hasMore));
      setSearchModalPage(next);
    } catch {
      setSearchModalHasMore(false);
    } finally {
      setLoadingPatients(false);
    }
  }, [searchInput, searchModalHasMore, searchModalPage, loadingPatients]);

  const handleRegisterSubmit = async (payload: PatientForm) => {
    try {
      await createPatientApi(payload);
      setIsRegisterOpen(false);
      setNotice("신규 환자를 등록했습니다.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "환자 등록 실패");
    }
  };

  const handleRegisterSubmitAndReception = async (payload: PatientForm) => {
    try {
      const saved = await createPatientApi(payload);
      setIsRegisterOpen(false);
      setRegisterReceptionPatient(saved);
      setRegisterReceptionOpen(true);
      setNotice("신규 환자 등록 후 접수를 진행하세요.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "환자 등록 실패");
    }
  };

  const statusCounts = React.useMemo(() => {
    const base = rows.filter((r) => (showInactiveList ? r.isActive !== "Y" : r.isActive === "Y"));
    const map = new Map<string, number>();
    for (const r of base) {
      const key = (r.status || "-").toUpperCase();
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return Array.from(map.entries());
  }, [rows, showInactiveList]);

  const patientVisitHistory = React.useMemo(() => {
    if (!detail?.patientId) return [] as MedicalEncounter[];
    return rows
      .filter((r) => r.patientId === detail.patientId)
      .sort((a, b) => new Date(b.createdAt || b.updatedAt || 0).getTime() - new Date(a.createdAt || a.updatedAt || 0).getTime())
      .slice(0, 8);
  }, [rows, detail?.patientId]);

  const loadDetail = React.useCallback(async (id: number) => {
    try {
      const [d, h] = await Promise.all([
        fetchEncounterDetailApi(id),
        fetchEncounterHistoryApi(id),
      ]);
      baselineByEncounterRef.current[id] = serializeDraftFields(d);
      setDetail(d);
      setHistory(h);

      const draft = getEncounterDraft(id);
      if (draft && serializeDraftFields(d) !== JSON.stringify({
        diagnosisCode: draft.diagnosisCode ?? null,
        diagnoses: draft.diagnoses ?? [],
        chiefComplaint: draft.chiefComplaint ?? null,
        assessment: draft.assessment ?? null,
        planNote: draft.planNote ?? null,
        memo: draft.memo ?? null,
      })) {
        setDraftSuggestion(draft);
      } else {
        setDraftSuggestion(null);
      }

      if (restoreDraftOnOpen && draft && !restoreDraftAppliedRef.current[id]) {
        restoreDraftAppliedRef.current[id] = true;
        setDetail((prev) => {
          if (!prev || prev.id !== id) return prev;
          return {
            ...prev,
            diagnosisCode: draft.diagnosisCode ?? prev.diagnosisCode,
            diagnoses: draft.diagnoses ?? prev.diagnoses,
            chiefComplaint: draft.chiefComplaint ?? prev.chiefComplaint,
            assessment: draft.assessment ?? prev.assessment,
            planNote: draft.planNote ?? prev.planNote,
            memo: draft.memo ?? prev.memo,
          };
        });
        setNotice("임시저장된 진료 기록을 불러왔습니다.");
      }
    } catch {
      setError("진료 상세를 불러오지 못했습니다.");
    }
  }, [restoreDraftOnOpen]);

  React.useEffect(() => {
    loadList();
  }, [loadList]);

  React.useEffect(() => {
    if (!initialEncounterId || initialSelectionAppliedRef.current) return;
    initialSelectionAppliedRef.current = true;
    setSelectedId(initialEncounterId);
    if (autoOpenInitialDetail) {
      setDetailOpen(true);
      setDetailTab("DETAIL");
    }
  }, [initialEncounterId, autoOpenInitialDetail]);

  React.useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      setHistory([]);
      return;
    }
    loadDetail(selectedId);
  }, [selectedId, loadDetail]);

  React.useEffect(() => {
    if (!detailId) {
      setAssets([]);
      return;
    }
    const loadAssets = async () => {
      try {
        const list = await fetchEncounterAssetsApi(detailId);
        setAssets(list);
      } catch {
        setError("진료 첨부 이미지를 불러오지 못했습니다.");
      }
    };
    void loadAssets();
  }, [detailId]);

  React.useEffect(() => {
    if (!detailId) return;
    const q = diagnosisQuery.trim();
    const timer = window.setTimeout(async () => {
      try {
        setDiagnosisLoading(true);
        const list = await fetchDiagnosisCodeCandidatesApi(q || undefined, 20);
        setDiagnosisOptions(list);
      } catch {
        setDiagnosisOptions([]);
      } finally {
        setDiagnosisLoading(false);
      }
    }, 220);
    return () => window.clearTimeout(timer);
  }, [diagnosisQuery, detailId]);

  React.useEffect(() => {
    setFavoriteDiagnoses(listFavoriteDiagnoses());
  }, [detailOpen]);

  React.useEffect(() => {
    if (!detail) return;
    const current = serializeDraftFields(detail);
    const baseline = baselineByEncounterRef.current[detail.id];
    if (!baseline || current === baseline) {
      return;
    }

    if (draftSaveTimerRef.current) {
      window.clearTimeout(draftSaveTimerRef.current);
    }

    draftSaveTimerRef.current = window.setTimeout(() => {
      upsertEncounterDraft({
        encounterId: detail.id,
        patientName: detail.patientName,
        patientNo: detail.patientNo,
        diagnosisCode: detail.diagnosisCode ?? null,
        diagnoses: detail.diagnoses ?? [],
        chiefComplaint: detail.chiefComplaint ?? null,
        assessment: detail.assessment ?? null,
        planNote: detail.planNote ?? null,
        memo: detail.memo ?? null,
        updatedAt: new Date().toISOString(),
      });
    }, 550);

    return () => {
      if (draftSaveTimerRef.current) {
        window.clearTimeout(draftSaveTimerRef.current);
      }
    };
  }, [detail]);

  React.useEffect(() => {
    if (!penOpen) return;
    setPenHasStrokes(false);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const ratio = window.devicePixelRatio || 1;
    const width = 880;
    const height = 560;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(ratio, ratio);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    const selected = drawingTemplates.find((x) => x.code === selectedTemplateCode);
    if (!selected) return;

    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, width, height);
    };
    img.src = selected.imagePath;
  }, [penOpen, selectedTemplateCode]);

  const saveDetail = async (mode: "ALL" | "DIAGNOSIS" | "NOTE" = "ALL") => {
    if (!detail) return;
    try {
      setSaving(true);
      const updated = await updateEncounterApi(detail.id, {
        doctorId: detail.doctorId,
        deptCode: detail.deptCode,
        status: detail.status,
        chiefComplaint: detail.chiefComplaint,
        assessment: detail.assessment,
        planNote: detail.planNote,
        diagnosisCode: detail.diagnosisCode,
        diagnoses: detail.diagnoses,
        memo: detail.memo,
        updatedBy: "doctor-ui",
      });
      baselineByEncounterRef.current[updated.id] = serializeDraftFields(updated);
      removeEncounterDraft(updated.id);
      setDraftSuggestion(null);
      setDetail(updated);
      await loadList();
      await loadDetail(updated.id);
      setNotice(mode === "DIAGNOSIS" ? "진단 정보를 저장했습니다." : mode === "NOTE" ? "진료 기록을 저장했습니다." : "진료 수정 내용을 저장했습니다.");
    } catch {
      setError("진료 수정에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const deactivate = async () => {
    if (!detail) return;
    try {
      setSaving(true);
      const updated = await deactivateEncounterApi(detail.id, {
        reasonCode: deactivateReasonCode,
        reasonMemo: deactivateReasonMemo,
        updatedBy: "doctor-ui",
      });
      baselineByEncounterRef.current[updated.id] = serializeDraftFields(updated);
      removeEncounterDraft(updated.id);
      setDraftSuggestion(null);
      setDetail(updated);
      setDeactivateOpen(false);
      setDeactivateReasonMemo("");
      await loadList();
      await loadDetail(updated.id);
      setNotice("진료를 비활성 처리했습니다.");
    } catch {
      setError("진료 비활성 처리에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const activate = async () => {
    if (!detail) return;
    try {
      setSaving(true);
      const updated = await activateEncounterApi(detail.id, "doctor-ui");
      baselineByEncounterRef.current[updated.id] = serializeDraftFields(updated);
      removeEncounterDraft(updated.id);
      setDraftSuggestion(null);
      setDetail(updated);
      await loadList();
      await loadDetail(updated.id);
      setNotice("진료를 활성 복구했습니다.");
    } catch {
      setError("진료 활성화에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const applyTemplate = (templateId: (typeof encounterTemplates)[number]["id"]) => {
    if (!detail) return;
    const picked = encounterTemplates.find((x) => x.id === templateId);
    if (!picked) return;
    setDetail({
      ...detail,
      assessment: mergeText(detail.assessment, picked.assessment),
      planNote: mergeText(detail.planNote, picked.plan),
      memo: mergeText(detail.memo, picked.memo),
    });
  };

  const appendPlanPhrase = (phrase: string) => {
    if (!detail) return;
    setDetail({
      ...detail,
      planNote: mergeText(detail.planNote, `- ${phrase}`),
    });
  };

  const applyStructuredWriter = (mode: "APPEND" | "REPLACE") => {
    if (!detail) return;

    const assessmentLines = [
      structuredWriter.address ? `주소: ${structuredWriter.address}` : "",
      structuredWriter.onsetDate ? `발병일: ${structuredWriter.onsetDate}` : "",
      structuredWriter.pastHistory ? `과거력: ${structuredWriter.pastHistory}` : "",
      structuredWriter.familyHistory ? `가족력: ${structuredWriter.familyHistory}` : "",
      structuredWriter.medications ? `복용중인 약: ${structuredWriter.medications}` : "",
      structuredWriter.vitals ? `V/S: ${structuredWriter.vitals}` : "",
      structuredWriter.objective ? `진찰 소견: ${structuredWriter.objective}` : "",
      structuredWriter.impression ? `평가: ${structuredWriter.impression}` : "",
    ].filter(Boolean);

    const planLines = [
      structuredWriter.plan ? `진단 및 처방: ${structuredWriter.plan}` : "",
    ].filter(Boolean);

    const nextAssessment = assessmentLines.join("\n");
    const nextPlan = planLines.join("\n");

    setDetail({
      ...detail,
      assessment: mode === "REPLACE" ? nextAssessment : mergeText(detail.assessment, nextAssessment),
      planNote: mode === "REPLACE" ? nextPlan : mergeText(detail.planNote, nextPlan),
    });
    setWriterOpen(false);
  };

  const diagnosisList = React.useMemo<MedicalEncounterDiagnosis[]>(
    () => detail?.diagnoses ?? [],
    [detail?.diagnoses]
  );

  const applyDiagnoses = (next: MedicalEncounterDiagnosis[]) => {
    if (!detail) return;
    const normalized = next
      .map((row, idx) => ({
        ...row,
        diagnosisCode: (row.diagnosisCode || "").trim().toUpperCase(),
        diagnosisName: row.diagnosisName?.trim() || null,
        primary: Boolean(row.primary),
        sortOrder: idx + 1,
      }))
      .filter((row) => !!row.diagnosisCode);

    const hasPrimary = normalized.some((x) => x.primary);
    const withPrimary = normalized.map((row, idx) => ({
      ...row,
      primary: hasPrimary ? row.primary : idx === 0,
    }));
    const primaryCode = withPrimary.find((x) => x.primary)?.diagnosisCode ?? null;

    setDetail({
      ...detail,
      diagnoses: withPrimary,
      diagnosisCode: primaryCode,
    });
  };

  const addDiagnosis = (option: DiagnosisCodeCandidate) => {
    const code = (option.code || "").trim().toUpperCase();
    if (!code) return;
    if (diagnosisList.some((x) => x.diagnosisCode.toUpperCase() === code)) return;
    applyDiagnoses([
      ...diagnosisList,
      {
        diagnosisCode: code,
        diagnosisName: option.name?.trim() || null,
        primary: diagnosisList.length === 0,
      },
    ]);
    setDiagnosisQuery("");
  };

  const addDiagnosisByCode = (rawCode: string) => {
    const code = rawCode.trim().toUpperCase();
    if (!code) return;
    if (diagnosisList.some((x) => x.diagnosisCode.toUpperCase() === code)) return;
    applyDiagnoses([
      ...diagnosisList,
      {
        diagnosisCode: code,
        diagnosisName: null,
        primary: diagnosisList.length === 0,
      },
    ]);
    setDiagnosisQuery("");
  };

  const removeDiagnosis = (code: string) => {
    const upper = code.trim().toUpperCase();
    applyDiagnoses(diagnosisList.filter((x) => x.diagnosisCode.toUpperCase() !== upper));
  };

  const markPrimaryDiagnosis = (code: string) => {
    const upper = code.trim().toUpperCase();
    applyDiagnoses(
      diagnosisList.map((x) => ({
        ...x,
        primary: x.diagnosisCode.toUpperCase() === upper,
      }))
    );
  };

  const toCanvasPoint = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      const t = e.touches[0] ?? e.changedTouches[0];
      return { x: t.clientX - rect.left, y: t.clientY - rect.top };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const beginDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const p = toCanvasPoint(e);
    drawingRef.current = true;
    lastPointRef.current = p;
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth;
  };

  const drawMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const p = toCanvasPoint(e);
    const prev = lastPointRef.current;
    if (!prev) {
      lastPointRef.current = p;
      return;
    }
    ctx.beginPath();
    ctx.moveTo(prev.x, prev.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    setPenHasStrokes(true);
    lastPointRef.current = p;
  };

  const endDraw = () => {
    drawingRef.current = false;
    lastPointRef.current = null;
  };

  const clearPenCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const width = 880;
    const height = 560;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    const selected = drawingTemplates.find((x) => x.code === selectedTemplateCode);
    if (!selected) return;
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, width, height);
    };
    img.src = selected.imagePath;
    setPenHasStrokes(false);
  };

  const savePenChart = async () => {
    if (!detail?.id || !canvasRef.current) return;
    try {
      setAssetSaving(true);
      const dataUrl = canvasRef.current.toDataURL("image/png");
      const file = dataUrlToFile(dataUrl, `encounter-${detail.id}-pen.png`);
      const saved = await createEncounterAssetApi(
        detail.id,
        { assetType: "PEN", templateCode: selectedTemplateCode, createdBy: "doctor-ui" },
        file
      );
      setAssets((prev) => [saved, ...prev]);
      setPenOpen(false);
      setPenHasStrokes(false);
      setNotice("펜차트를 저장했습니다.");
    } catch {
      setError("펜차트 저장에 실패했습니다.");
    } finally {
      setAssetSaving(false);
    }
  };

  const handleUploadAsset = async (file?: File | null) => {
    if (!file || !detail?.id) return;
    try {
      setAssetSaving(true);
      const saved = await createEncounterAssetApi(
        detail.id,
        { assetType: "IMAGE", createdBy: "doctor-ui" },
        file
      );
      setAssets((prev) => [saved, ...prev]);
      setNotice("이미지를 첨부했습니다.");
    } catch {
      setError("이미지 업로드에 실패했습니다.");
    } finally {
      setAssetSaving(false);
    }
  };

  const removeAsset = async (assetId: number) => {
    if (!detail?.id) return;
    try {
      setAssetSaving(true);
      await deleteEncounterAssetApi(detail.id, assetId, "doctor-ui");
      setAssets((prev) => prev.filter((x) => x.id !== assetId));
      setNotice("첨부 이미지를 삭제했습니다.");
    } catch {
      setError("이미지 삭제에 실패했습니다.");
    } finally {
      setAssetSaving(false);
    }
  };

  const requestTemplateChange = (nextCode: (typeof drawingTemplates)[number]["code"]) => {
    if (nextCode === selectedTemplateCode) return;
    if (penHasStrokes) {
      setPendingTemplateCode(nextCode);
      setTemplateSwitchConfirmOpen(true);
      return;
    }
    setSelectedTemplateCode(nextCode);
  };

  const applyTemplateChange = () => {
    if (!pendingTemplateCode) return;
    setSelectedTemplateCode(pendingTemplateCode);
    setPenHasStrokes(false);
    setPendingTemplateCode(null);
    setTemplateSwitchConfirmOpen(false);
  };

  const applyDraftSuggestion = () => {
    if (!detail || !draftSuggestion || draftSuggestion.encounterId !== detail.id) return;
    setDetail({
      ...detail,
      diagnosisCode: draftSuggestion.diagnosisCode ?? detail.diagnosisCode,
      diagnoses: draftSuggestion.diagnoses ?? detail.diagnoses,
      chiefComplaint: draftSuggestion.chiefComplaint ?? detail.chiefComplaint,
      assessment: draftSuggestion.assessment ?? detail.assessment,
      planNote: draftSuggestion.planNote ?? detail.planNote,
      memo: draftSuggestion.memo ?? detail.memo,
    });
    setDraftSuggestion(null);
    setNotice("임시저장본을 진료 기록에 적용했습니다. 저장 버튼으로 최종 반영하세요.");
  };

  const discardDraftSuggestion = () => {
    if (!draftSuggestion) return;
    removeEncounterDraft(draftSuggestion.encounterId);
    setDraftSuggestion(null);
    setNotice("임시저장본을 삭제했습니다.");
  };

  return (
    <Stack spacing={2.5}>
      {error ? <Alert severity="error">{error}</Alert> : null}
      {notice ? <Alert severity="success" onClose={() => setNotice(null)}>{notice}</Alert> : null}

      <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: "1fr" }}>
        <Card sx={panelSx}>
          <CardContent sx={{ p: 2.5 }}>
            <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  setSearchInput("");
                  setSearchModalPatients([]);
                  setSearchModalHasMore(false);
                  setSearchModalPage(1);
                  setIsSearchModalOpen(true);
                }}
              >
                환자 조회
              </Button>
              <Button variant="outlined" size="small" onClick={() => setIsRegisterOpen(true)}>
                + 신규 환자 등록
              </Button>
            </Stack>

            <Divider sx={{ my: 2 }} />
            <Tabs value={status} onChange={(_, v) => setStatus(v)} sx={{ mb: 1 }}>
              <Tab value="WAITING" label={`대기(${statusCounts.find(([code]) => code === "WAITING")?.[1] ?? 0})`} />
              <Tab value="IN_PROGRESS" label={`진료중(${statusCounts.find(([code]) => code === "IN_PROGRESS")?.[1] ?? 0})`} />
              <Tab value="DONE" label={`완료(${statusCounts.find(([code]) => code === "DONE")?.[1] ?? 0})`} />
            </Tabs>
            <Box sx={{ display: "flex", gap: 2, minHeight: 460 }}>
              <Box sx={{ width: 320, borderRight: "1px solid var(--line)", pr: 1.5, overflowY: "auto" }}>
                <Stack spacing={1}>
                  {displayedRows.slice(0, 20).map((r) => (
                    <Box
                      key={r.id}
                      onClick={() => {
                        setSelectedId(r.id);
                        setDetailTab("DETAIL");
                      }}
                      sx={{
                        p: 1.2,
                        borderRadius: 1.5,
                        border: "1px solid",
                        borderColor: selectedId === r.id ? "primary.main" : "divider",
                        bgcolor: selectedId === r.id ? "action.selected" : "background.paper",
                        cursor: "pointer",
                      }}
                    >
                      <Stack direction="row" spacing={0.8} alignItems="center" justifyContent="space-between">
                        <Typography sx={{ fontWeight: 700, fontSize: 14 }}>{r.patientName ?? "-"}</Typography>
                        <Chip size="small" label={statusLabel(r.status)} color={r.isActive === "Y" ? "primary" : "default"} />
                      </Stack>
                      <Typography sx={{ mt: 0.35, fontSize: 12, color: "var(--muted)" }}>
                        #{r.visitId} · {r.patientNo ?? r.patientId}
                      </Typography>
                      <Typography sx={{ mt: 0.25, fontSize: 11.5, color: "var(--muted)" }}>
                        {r.doctorId ?? "담당의 미배정"} · {formatDateTime(r.updatedAt || r.createdAt)}
                      </Typography>
                    </Box>
                  ))}
                  {!displayedRows.length && !loading ? (
                    <Typography sx={{ py: 3, textAlign: "center", color: "text.secondary" }}>
                      조회 결과가 없습니다.
                    </Typography>
                  ) : null}
                </Stack>
              </Box>

              <Box sx={{ flex: 1 }}>
                <Card sx={{ ...panelSx, height: "100%" }}>
                  <CardContent sx={{ height: "100%", overflow: "auto" }}>
                    {!selectedId ? (
                      <>
                        <Typography sx={{ fontWeight: 800, mb: 0.5 }}>진료 차트 워크스페이스</Typography>
                        <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
                          왼쪽 환자 리스트에서 환자를 선택하면 상세 내용을 여기에서 바로 확인/수정할 수 있습니다.
                        </Typography>
                      </>
                    ) : !detail ? (
                      <Typography sx={{ color: "text.secondary", fontSize: 14 }}>진료 상세를 불러오는 중입니다...</Typography>
                    ) : (
                      <Stack spacing={1.5}>
                        <Box sx={{ p: 1.25, borderRadius: 1.5, border: "1px solid var(--line)", bgcolor: "rgba(11,91,143,0.05)" }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                            <Box>
                              <Typography sx={{ fontWeight: 800 }}>{detail.patientName} ({detail.patientNo ?? detail.patientId})</Typography>
                              <Typography sx={{ fontSize: 12, color: "var(--muted)" }}>접수 #{detail.visitId} · {formatDateTime(detail.updatedAt)}</Typography>
                            </Box>
                            <Chip size="small" label={statusLabel(detail.status)} color="primary" />
                          </Stack>
                        </Box>

                        <Tabs value={detailTab} onChange={(_, v) => setDetailTab(v)}>
                          <Tab value="DETAIL" label="진료 상세" />
                          <Tab value="HISTORY" label={`변경 이력(${history.length})`} />
                        </Tabs>

                        {detailTab === "DETAIL" ? (
                          <Stack spacing={1.25}>
                            <Box
                              sx={{
                                display: "grid",
                                gap: 1.25,
                                gridTemplateColumns: {
                                  xs: "1fr",
                                  xl: "320px minmax(680px, 1fr) 280px",
                                },
                              }}
                            >
                              <Box sx={{ p: 1.2, borderRadius: 1.5, border: "1px solid var(--line)", bgcolor: "rgba(255,255,255,0.88)", maxHeight: 420, overflow: "auto" }}>
                                <Typography sx={{ fontWeight: 800, fontSize: 13, mb: 0.8 }}>내원이력</Typography>
                                <Stack spacing={0.75}>
                                  {patientVisitHistory.map((v) => (
                                    <Box key={v.id} sx={{ p: 0.9, borderRadius: 1.25, border: "1px solid var(--line)" }}>
                                      <Typography sx={{ fontWeight: 700, fontSize: 12.5 }}>{formatDateTime(v.createdAt)}</Typography>
                                      <Typography sx={{ fontSize: 11.5, color: "var(--muted)" }}>
                                        {statusLabel(v.status)} · {v.deptCode || "OUTPATIENT"}
                                      </Typography>
                                      <Typography sx={{ fontSize: 11.5, color: "var(--muted)", mt: 0.25 }}>
                                        접수 #{v.visitId} · 담당의 {v.doctorId || "미배정"}
                                      </Typography>
                                    </Box>
                                  ))}
                                  {!patientVisitHistory.length ? (
                                    <Typography sx={{ color: "text.secondary", fontSize: 12.5 }}>내원이력이 없습니다.</Typography>
                                  ) : null}
                                </Stack>
                              </Box>

                              <Box sx={{ p: 1.2, borderRadius: 1.5, border: "1px solid var(--line)", bgcolor: "rgba(255,255,255,0.92)" }}>
                                <Typography sx={{ fontWeight: 800, fontSize: 13, mb: 0.8 }}>진료차트</Typography>
                                <TextField size="small" label="주 호소 증상" value={detail.chiefComplaint ?? ""} onChange={(e) => setDetail({ ...detail, chiefComplaint: e.target.value })} fullWidth multiline minRows={2} sx={{ mb: 1 }} />
                                <TextField size="small" label="진료 기록" value={detail.assessment ?? ""} onChange={(e) => setDetail({ ...detail, assessment: e.target.value })} fullWidth multiline minRows={4} sx={{ mb: 1 }} />
                                <TextField size="small" label="진료 메모" value={detail.memo ?? ""} onChange={(e) => setDetail({ ...detail, memo: e.target.value })} fullWidth multiline minRows={2} />
                              </Box>

                              <Box sx={{ p: 1.2, borderRadius: 1.5, border: "1px solid var(--line)", bgcolor: "rgba(255,255,255,0.92)" }}>
                                <Typography sx={{ fontWeight: 800, fontSize: 13, mb: 0.8 }}>오더세트</Typography>
                                <Stack spacing={0.75}>
                                  {encounterTemplates.map((tpl) => (
                                    <Button key={tpl.id} variant="outlined" size="small" onClick={() => applyTemplate(tpl.id)} sx={{ justifyContent: "flex-start" }}>
                                      {tpl.label}
                                    </Button>
                                  ))}
                                </Stack>
                              </Box>
                            </Box>

                            <Box sx={{ p: 1.2, borderRadius: 1.5, border: "1px solid var(--line)", bgcolor: "rgba(255,255,255,0.92)" }}>
                              <Typography sx={{ fontWeight: 800, fontSize: 13, mb: 0.8 }}>진단 및 처방</Typography>
                              <Stack direction="row" spacing={0.75} sx={{ flexWrap: "wrap", mb: 1 }}>
                                {(detail.diagnoses || []).map((d, idx) => (
                                  <Chip key={`${d.diagnosisCode}-${idx}`} size="small" label={`${d.diagnosisCode}${d.diagnosisName ? ` · ${d.diagnosisName}` : ""}`} color={d.primary ? "primary" : "default"} />
                                ))}
                                {!detail.diagnoses?.length ? <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>진단 코드가 없습니다.</Typography> : null}
                              </Stack>
                              <TextField size="small" label="처방/계획" value={detail.planNote ?? ""} onChange={(e) => setDetail({ ...detail, planNote: e.target.value })} fullWidth multiline minRows={3} />
                            </Box>

                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                              <Button variant="outlined" startIcon={<RefreshRoundedIcon fontSize="small" />} onClick={() => selectedId && loadDetail(selectedId)}>
                                상세 새로고침
                              </Button>
                              <Button variant="contained" onClick={() => void saveDetail("ALL")} disabled={saving}>
                                저장
                              </Button>
                            </Stack>
                          </Stack>
                        ) : (
                          <Stack spacing={1}>
                            {history.map((h) => (
                              <Box key={h.id} sx={{ p: 1.1, borderRadius: 1.5, border: "1px solid var(--line)" }}>
                                <Typography sx={{ fontSize: 12.5, fontWeight: 700 }}>
                                  {toHistoryEventLabel(h.eventType)} · {h.fieldName ? fieldLabelMap[h.fieldName] || h.fieldName : "전체"}
                                </Typography>
                                <Typography sx={{ fontSize: 12, color: "var(--muted)", mt: 0.4 }}>
                                  {formatDateTime(h.changedAt)} · {h.changedBy || "-"}
                                </Typography>
                              </Box>
                            ))}
                            {!history.length ? (
                              <Typography sx={{ color: "text.secondary", fontSize: 13 }}>변경 이력이 없습니다.</Typography>
                            ) : null}
                          </Stack>
                        )}
                      </Stack>
                    )}
                  </CardContent>
                </Card>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      <PatientRegisterModal
        open={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSubmit={handleRegisterSubmit}
        onSubmitAndReception={handleRegisterSubmitAndReception}
      />

      <PatientSearchModal
        open={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSelect={() => {
          // handled by inner modal flow
        }}
        patients={searchModalPatients}
        loading={loadingPatients}
        onLoadMore={loadSearchModalMore}
        hasMore={searchModalHasMore}
        onSearch={loadSearchModalFirstPage}
        onSuccess={loadList}
      />

      <ReceptionModal
        open={registerReceptionOpen}
        onClose={() => {
          setRegisterReceptionOpen(false);
          setRegisterReceptionPatient(null);
        }}
        patient={registerReceptionPatient}
        onSuccess={loadList}
      />

      <Drawer
        anchor="right"
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        ModalProps={{
          BackdropProps: {
            sx: {
              top: { xs: 64, md: 76 },
            },
          },
        }}
        PaperProps={{
          sx: {
            width: { xs: "100%", md: 560 },
            borderLeft: "1px solid var(--line)",
            bgcolor: "#fff",
            top: { xs: 64, md: 76 },
            height: { xs: "calc(100% - 64px)", md: "calc(100% - 76px)" },
          },
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid var(--line)",
              px: 2.5,
              py: 1.5,
            }}
          >
            <Box>
              <Typography sx={{ fontWeight: 900, fontSize: 18 }}>{`${detail?.patientName ?? "환자"} 진료 상세`}</Typography>
              <Typography sx={{ color: "var(--muted)", fontSize: 12 }}>
                {detail?.patientNo ? `등록번호 ${detail.patientNo}` : "진료 상세 정보"}
              </Typography>
            </Box>
            <IconButton onClick={() => setDetailOpen(false)} size="small">
              <CloseRoundedIcon fontSize="small" />
            </IconButton>
          </Box>

          <Box sx={{ p: 2.5, overflow: "auto", flex: 1 }}>
          {!detail ? (
            <Typography color="text.secondary" sx={{ mt: 1 }}>진료 정보를 불러오는 중입니다.</Typography>
          ) : (
            <Stack spacing={1.75}>
              <Tabs
                value={detailTab}
                onChange={(_, v) => setDetailTab(v)}
                sx={{
                  minHeight: 40,
                  "& .MuiTab-root": { minHeight: 40, fontWeight: 700, fontSize: 13 },
                }}
              >
                <Tab value="DETAIL" label="진료 상세" />
                <Tab value="HISTORY" label={`변경 이력(${history.length})`} />
              </Tabs>

              {detailTab === "DETAIL" ? (
                <>
                  {draftSuggestion && detail && draftSuggestion.encounterId === detail.id ? (
                    <Alert
                      severity="info"
                      action={(
                        <Stack direction="row" spacing={0.75}>
                          <Button size="small" color="inherit" onClick={applyDraftSuggestion}>임시본 적용</Button>
                          <Button size="small" color="inherit" onClick={discardDraftSuggestion}>임시본 삭제</Button>
                        </Stack>
                      )}
                    >
                      미저장된 임시기록이 있습니다. 최신 서버 기록에 덮어쓸지 선택하세요.
                    </Alert>
                  ) : null}

                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      border: "1px solid var(--line)",
                      bgcolor: "rgba(11,91,143,0.05)",
                    }}
                  >
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1} justifyContent="space-between">
                      <Stack spacing={0.25}>
                        <Typography sx={{ fontWeight: 800, fontSize: 15 }}>
                          {detail.patientName ?? "-"} ({detail.patientNo ?? detail.patientId})
                        </Typography>
                        <Typography sx={{ color: "var(--muted)", fontSize: 12 }}>
                          접수번호 {detail.visitId ?? "-"} · 진료구분 {detail.visitId && detail.visitId > 1 ? "재진" : "초진"} · 담당 원무 {detail.updatedBy ?? detail.createdBy ?? "-"}
                        </Typography>
                      </Stack>
                      <Stack direction="row" spacing={0.75} alignItems="center">
                        <Chip size="small" label={statusLabel(detail.status)} color="primary" />
                        <Chip size="small" label={detail.isActive === "Y" ? "활성" : "비활성"} color={detail.isActive === "Y" ? "success" : "default"} />
                        <Typography sx={{ fontSize: 11, color: "var(--muted)" }}>
                          수정 {formatDateTime(detail.updatedAt)}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Box>

                  <Box sx={{ display: "grid", gap: 1, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
                    {[
                      { label: "담당의", value: detail.doctorId || "-" },
                      { label: "진료과", value: detail.deptCode || "-" },
                      { label: "생성일시", value: formatDateTime(detail.createdAt) },
                      { label: "최종수정", value: formatDateTime(detail.updatedAt) },
                    ].map((meta) => (
                      <Box key={meta.label} sx={{ p: 1.25, borderRadius: 1.5, border: "1px solid var(--line)", bgcolor: "rgba(255,255,255,0.85)" }}>
                        <Typography sx={{ fontSize: 11, color: "var(--muted)" }}>{meta.label}</Typography>
                        <Typography sx={{ fontWeight: 700, fontSize: 13 }}>{meta.value}</Typography>
                      </Box>
                    ))}
                  </Box>

                  <Stack direction="row" spacing={0.75} justifyContent="flex-end">
                    <Tooltip title="상세 새로고침">
                      <IconButton size="small" onClick={() => selectedId && loadDetail(selectedId)}>
                        <RefreshRoundedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {detail.isActive === "Y" ? (
                      <Tooltip title="비활성 처리">
                        <IconButton size="small" color="warning" onClick={() => setDeactivateOpen(true)}>
                          <BlockRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Tooltip title="활성 복구">
                        <IconButton size="small" color="success" onClick={activate}>
                          <CheckCircleRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Stack>

                  <Box sx={{ p: 1.25, borderRadius: 1.5, border: "1px solid var(--line)", bgcolor: "rgba(11,91,143,0.04)" }}>
                    <Stack direction={{ xs: "column", md: "row" }} spacing={1} alignItems={{ xs: "stretch", md: "center" }} justifyContent="space-between">
                      <Typography sx={{ fontWeight: 800, fontSize: 13 }}>진료기록 작성 도우미</Typography>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<NoteAltRoundedIcon fontSize="small" />}
                        onClick={() => setWriterOpen(true)}
                      >
                        구조화 기록 작성
                      </Button>
                    </Stack>

                    <Typography sx={{ mt: 1, mb: 0.75, fontSize: 12, color: "var(--muted)" }}>
                      자주 쓰는 템플릿을 눌러 평가/계획/메모에 바로 추가하세요.
                    </Typography>
                    <Stack direction="row" spacing={0.75} sx={{ flexWrap: "wrap", mb: 0.75 }}>
                      {encounterTemplates.map((tpl) => (
                        <Chip
                          key={tpl.id}
                          size="small"
                          icon={<AutoFixHighRoundedIcon />}
                          label={tpl.label}
                          onClick={() => applyTemplate(tpl.id)}
                          sx={{ mb: 0.75 }}
                        />
                      ))}
                    </Stack>

                    <Typography sx={{ mt: 0.5, mb: 0.75, fontSize: 12, color: "var(--muted)" }}>
                      계획에 빠르게 붙여넣기
                    </Typography>
                    <Stack direction="row" spacing={0.75} sx={{ flexWrap: "wrap" }}>
                      {quickPlanPhrases.map((phrase) => (
                        <Chip key={phrase} size="small" variant="outlined" label={phrase} onClick={() => appendPlanPhrase(phrase)} sx={{ mb: 0.75 }} />
                      ))}
                    </Stack>
                  </Box>

                  <Box sx={{ p: 1.25, borderRadius: 1.5, border: "1px solid var(--line)", bgcolor: "rgba(255,255,255,0.92)" }}>
                    <Stack direction={{ xs: "column", md: "row" }} spacing={1} alignItems={{ xs: "stretch", md: "center" }} justifyContent="space-between" sx={{ mb: 1 }}>
                      <Typography sx={{ fontWeight: 800, fontSize: 13 }}>펜차트/참고 이미지</Typography>
                      <Stack direction="row" spacing={0.75}>
                        <Button size="small" startIcon={<BrushRoundedIcon />} variant="outlined" onClick={() => setPenOpen(true)} disabled={assetSaving}>
                          펜차트 작성
                        </Button>
                        <Button size="small" startIcon={<AddPhotoAlternateRoundedIcon />} variant="outlined" component="label" disabled={assetSaving}>
                          이미지 첨부
                          <input
                            hidden
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              void handleUploadAsset(file);
                              e.currentTarget.value = "";
                            }}
                          />
                        </Button>
                      </Stack>
                    </Stack>

                    <Typography sx={{ fontSize: 12, color: "var(--muted)", mb: 1 }}>
                      펜차트/이미지는 환자 진료기록에 저장되어 재접속 시 다시 확인할 수 있습니다.
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: "var(--muted)", mb: 1 }}>
                      마지막 펜차트 저장: {formatDateTime(assets.find((x) => x.assetType === "PEN")?.createdAt ?? null)}
                    </Typography>

                    <Box sx={{ display: "grid", gap: 1, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
                      {assets.map((asset) => (
                        <Box key={asset.id} sx={{ p: 1, borderRadius: 1.5, border: "1px solid var(--line)", bgcolor: "#fff" }}>
                          {(() => {
                            const fileProxyUrl = asset.objectKey
                              ? `/api/files/patient?key=${encodeURIComponent(asset.objectKey)}`
                              : "";
                            return asset.fileUrl ? (
                              <>
                                <Box
                                  component="img"
                                  src={fileProxyUrl || asset.fileUrl}
                                  alt="encounter-asset"
                                  onClick={() => setAssetPreviewUrl(fileProxyUrl || asset.fileUrl || null)}
                                  sx={{ width: "100%", height: 160, objectFit: "cover", borderRadius: 1, border: "1px solid var(--line)", cursor: "zoom-in" }}
                                />
                                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 0.75 }}>
                                  <Typography sx={{ fontSize: 11, color: "var(--muted)" }}>
                                    {asset.assetType === "PEN" ? "펜차트" : "첨부 이미지"} · {formatDateTime(asset.createdAt)}
                                  </Typography>
                                  <Stack direction="row" spacing={0.5}>
                                    <IconButton
                                      size="small"
                                      onClick={() => setAssetPreviewUrl(fileProxyUrl || asset.fileUrl || null)}
                                      disabled={!asset.fileUrl}
                                    >
                                      <ZoomInRoundedIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton size="small" color="error" onClick={() => void removeAsset(asset.id)} disabled={assetSaving}>
                                      <DeleteOutlineRoundedIcon fontSize="small" />
                                    </IconButton>
                                  </Stack>
                                </Stack>
                              </>
                            ) : (
                              <>
                                <Box sx={{ width: "100%", height: 160, display: "grid", placeItems: "center", borderRadius: 1, border: "1px dashed var(--line)", color: "var(--muted)", fontSize: 12 }}>
                                  이미지 URL 생성 중
                                </Box>
                                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 0.75 }}>
                                  <Typography sx={{ fontSize: 11, color: "var(--muted)" }}>
                                    {asset.assetType === "PEN" ? "펜차트" : "첨부 이미지"} · {formatDateTime(asset.createdAt)}
                                  </Typography>
                                  <Stack direction="row" spacing={0.5}>
                                    <IconButton size="small" color="error" onClick={() => void removeAsset(asset.id)} disabled={assetSaving}>
                                      <DeleteOutlineRoundedIcon fontSize="small" />
                                    </IconButton>
                                  </Stack>
                                </Stack>
                              </>
                            );
                          })()}
                        </Box>
                      ))}
                      {!assets.length ? (
                        <Box sx={{ p: 1.25, borderRadius: 1.5, border: "1px dashed var(--line)", color: "var(--muted)", fontSize: 12 }}>
                          첨부된 펜차트/이미지가 없습니다.
                        </Box>
                      ) : null}
                    </Box>
                  </Box>

                  <TextField size="small" label="주호소" value={detail.chiefComplaint ?? ""} onChange={(e) => setDetail({ ...detail, chiefComplaint: e.target.value })} fullWidth multiline minRows={2} placeholder="주증상과 시작 시점, 지속기간을 입력하세요." />
                  <TextField size="small" label="평가" value={detail.assessment ?? ""} onChange={(e) => setDetail({ ...detail, assessment: e.target.value })} fullWidth multiline minRows={2} placeholder="의학적 평가/판단을 입력하세요." />
                  <TextField size="small" label="계획" value={detail.planNote ?? ""} onChange={(e) => setDetail({ ...detail, planNote: e.target.value })} fullWidth multiline minRows={2} placeholder="치료 계획, 추적 계획을 입력하세요." />
                  <Box sx={{ p: 1.25, borderRadius: 1.5, border: "1px solid var(--line)", bgcolor: "rgba(255,255,255,0.92)" }}>
                    <Typography sx={{ fontWeight: 800, fontSize: 13, mb: 1 }}>진단코드 (복수 선택)</Typography>
                    {favoriteDiagnoses.length ? (
                      <>
                        <Typography sx={{ fontSize: 12, color: "var(--muted)", mb: 0.6 }}>즐겨찾기 진단 빠른 추가</Typography>
                        <Stack direction="row" spacing={0.75} sx={{ flexWrap: "wrap", mb: 1 }}>
                          {favoriteDiagnoses.map((item) => (
                            <Chip
                              key={item.code}
                              size="small"
                              variant="outlined"
                              label={`${item.code} · ${item.label}`}
                              onClick={() => addDiagnosisByCode(item.code)}
                              sx={{ mb: 0.75 }}
                            />
                          ))}
                        </Stack>
                      </>
                    ) : null}
                    <Autocomplete
                      freeSolo
                      options={diagnosisOptions}
                      loading={diagnosisLoading}
                      getOptionLabel={(opt) => (typeof opt === "string" ? opt : (opt.name ? `${opt.code} · ${opt.name}` : opt.code))}
                      noOptionsText={diagnosisQuery.trim() ? `"${diagnosisQuery.trim()}" 검색 결과가 없습니다.` : "진단코드 또는 진단명을 입력하세요."}
                      onInputChange={(_, v) => setDiagnosisQuery(v)}
                      inputValue={diagnosisQuery}
                      onChange={(_, v) => {
                        if (!v) return;
                        if (typeof v === "string") {
                          addDiagnosisByCode(v);
                        } else {
                          addDiagnosis(v);
                        }
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          size="small"
                          label="진단 검색"
                          placeholder="진단코드 또는 진단명 입력"
                        />
                      )}
                    />
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 0.75 }}>
                      <Typography sx={{ fontSize: 12, color: "var(--muted)" }}>
                        주진단으로 지정하려면 해당 진단 칩을 클릭하세요.
                      </Typography>
                      <Button
                        size="small"
                        variant="text"
                        disabled={!diagnosisQuery.trim() || diagnosisList.some((x) => x.diagnosisCode.toUpperCase() === diagnosisQuery.trim().toUpperCase())}
                        onClick={() => addDiagnosisByCode(diagnosisQuery)}
                      >
                        직접 코드 추가
                      </Button>
                    </Stack>
                    <Stack direction="row" spacing={0.75} sx={{ mt: 1, flexWrap: "wrap" }}>
                      {diagnosisList.map((d) => (
                        <Chip
                          key={d.diagnosisCode}
                          color={d.primary ? "primary" : "default"}
                          label={d.diagnosisName ? `${d.diagnosisCode} · ${d.diagnosisName}` : d.diagnosisCode}
                          onClick={() => markPrimaryDiagnosis(d.diagnosisCode)}
                          onDelete={() => removeDiagnosis(d.diagnosisCode)}
                          sx={{ mb: 0.75 }}
                        />
                      ))}
                      {!diagnosisList.length ? (
                        <Typography sx={{ fontSize: 12, color: "var(--muted)" }}>등록된 진단이 없습니다.</Typography>
                      ) : null}
                    </Stack>
                  </Box>
                  <TextField size="small" label="메모" value={detail.memo ?? ""} onChange={(e) => setDetail({ ...detail, memo: e.target.value })} fullWidth placeholder="추가 메모를 입력하세요." />

                  <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 0.5 }}>
                    <Button variant="outlined" onClick={() => void saveDetail("DIAGNOSIS")} disabled={saving || !detail.diagnoses?.length}>진단만 저장</Button>
                    <Button variant="outlined" onClick={() => void saveDetail("NOTE")} disabled={saving}>기록만 저장</Button>
                    <Button variant="contained" onClick={() => void saveDetail("ALL")} disabled={saving}>수정 저장</Button>
                    {detail.isActive === "Y" ? (
                      <Button variant="outlined" color="warning" onClick={() => setDeactivateOpen(true)} disabled={saving}>
                        비활성 처리
                      </Button>
                    ) : (
                      <Button variant="outlined" color="success" onClick={activate} disabled={saving}>
                        활성 복구
                      </Button>
                    )}
                  </Stack>
                </>
              ) : (
                <Stack spacing={0.75} sx={{ maxHeight: 320, overflow: "auto", pr: 0.5 }}>
                  <Stack direction="row" spacing={0.75} sx={{ mb: 0.5 }}>
                    <Chip size="small" label="핵심 변경" color={historyCoreOnly ? "primary" : "default"} onClick={() => setHistoryCoreOnly(true)} />
                    <Chip size="small" label="전체" color={!historyCoreOnly ? "primary" : "default"} onClick={() => setHistoryCoreOnly(false)} />
                  </Stack>
                  {history.filter((h) => !historyCoreOnly || historyCoreFields.has(h.fieldName || "")).map((h) => (
                    <Box key={h.id} sx={{ p: 1.25, borderRadius: 1.5, bgcolor: "rgba(0,0,0,0.03)", border: "1px solid rgba(15, 23, 42, 0.06)" }}>
                      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                        <Typography sx={{ fontSize: 12, color: "var(--muted)" }}>
                          {formatDateTime(h.changedAt)}
                        </Typography>
                        <Typography sx={{ fontSize: 12, color: "var(--muted)" }}>
                          {h.changedBy ?? "-"}
                        </Typography>
                      </Stack>
                      <Typography sx={{ fontSize: 13, fontWeight: 700 }}>
                        {fieldLabelMap[h.fieldName || ""] ?? h.fieldName ?? "-"}
                      </Typography>
                      <Typography sx={{ fontSize: 12 }}>
                        [{toHistoryEventLabel(h.eventType)}] {h.oldValue ?? "-"} {"->"} {h.newValue ?? "-"}
                      </Typography>
                    </Box>
                  ))}
                  {!history.filter((h) => !historyCoreOnly || historyCoreFields.has(h.fieldName || "")).length ? <Typography color="text.secondary">이력이 없습니다.</Typography> : null}
                </Stack>
              )}
            </Stack>
          )}
          </Box>
        </Box>
      </Drawer>

      <Dialog open={Boolean(assetPreviewUrl)} onClose={() => setAssetPreviewUrl(null)} fullWidth maxWidth="md">
        <DialogTitle>이미지 크게 보기</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          {assetPreviewUrl ? (
            <Box
              component="img"
              src={assetPreviewUrl}
              alt="encounter-asset-preview"
              sx={{ width: "100%", maxHeight: "70vh", objectFit: "contain", borderRadius: 1, border: "1px solid var(--line)", bgcolor: "#fff" }}
            />
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssetPreviewUrl(null)}>닫기</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deactivateOpen} onClose={() => setDeactivateOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>진료 비활성 처리</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ mt: 1 }}>
            <TextField
              size="small"
              label="사유 코드"
              value={deactivateReasonCode}
              onChange={(e) => setDeactivateReasonCode(e.target.value)}
              fullWidth
            />
            <TextField
              size="small"
              label="사유 메모"
              value={deactivateReasonMemo}
              onChange={(e) => setDeactivateReasonMemo(e.target.value)}
              fullWidth
              multiline
              minRows={3}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeactivateOpen(false)}>취소</Button>
          <Button onClick={deactivate} color="warning" variant="contained" disabled={saving || !deactivateReasonCode.trim()}>
            비활성 처리
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={writerOpen} onClose={() => setWriterOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>구조화 진료기록 작성</DialogTitle>
        <DialogContent>
          <Stack spacing={1.25} sx={{ mt: 1 }}>
            <TextField size="small" label="주소" value={structuredWriter.address} onChange={(e) => setStructuredWriter((p) => ({ ...p, address: e.target.value }))} fullWidth placeholder="예: 인후통, 발열" />
            <TextField size="small" label="발병일" value={structuredWriter.onsetDate} onChange={(e) => setStructuredWriter((p) => ({ ...p, onsetDate: e.target.value }))} fullWidth placeholder="예: 3일 전부터" />
            <TextField size="small" label="과거력" value={structuredWriter.pastHistory} onChange={(e) => setStructuredWriter((p) => ({ ...p, pastHistory: e.target.value }))} fullWidth placeholder="예: 고혈압, 당뇨" />
            <TextField size="small" label="가족력" value={structuredWriter.familyHistory} onChange={(e) => setStructuredWriter((p) => ({ ...p, familyHistory: e.target.value }))} fullWidth placeholder="예: 특이소견 없음" />
            <TextField size="small" label="복용중인 약" value={structuredWriter.medications} onChange={(e) => setStructuredWriter((p) => ({ ...p, medications: e.target.value }))} fullWidth placeholder="예: 혈압약 1T qd" />
            <TextField size="small" label="V/S" value={structuredWriter.vitals} onChange={(e) => setStructuredWriter((p) => ({ ...p, vitals: e.target.value }))} fullWidth placeholder="예: BP 130/80, BT 37.2" />
            <TextField size="small" label="진찰 소견" value={structuredWriter.objective} onChange={(e) => setStructuredWriter((p) => ({ ...p, objective: e.target.value }))} fullWidth multiline minRows={2} placeholder="신체진찰 소견 입력" />
            <TextField size="small" label="평가" value={structuredWriter.impression} onChange={(e) => setStructuredWriter((p) => ({ ...p, impression: e.target.value }))} fullWidth multiline minRows={2} placeholder="의학적 판단 입력" />
            <TextField size="small" label="진단 및 처방" value={structuredWriter.plan} onChange={(e) => setStructuredWriter((p) => ({ ...p, plan: e.target.value }))} fullWidth multiline minRows={2} placeholder="예: 급성 상기도염, 대증치료" />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWriterOpen(false)}>닫기</Button>
          <Button onClick={() => applyStructuredWriter("APPEND")} variant="outlined">기존 기록에 추가</Button>
          <Button onClick={() => applyStructuredWriter("REPLACE")} variant="contained">작성 내용으로 교체</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={penOpen} onClose={() => setPenOpen(false)} fullWidth maxWidth="lg">
        <DialogTitle>펜차트 작성</DialogTitle>
        <DialogContent>
          <Stack spacing={1.25} sx={{ mt: 1 }}>
            <Box>
              <Typography sx={{ fontSize: 12, color: "var(--muted)", mb: 0.75 }}>기본 템플릿</Typography>
              <Stack direction="row" spacing={0.75} sx={{ flexWrap: "wrap" }}>
                {drawingTemplates.map((tpl) => (
                  <Chip
                    key={tpl.code}
                    size="small"
                    label={tpl.label}
                    color={selectedTemplateCode === tpl.code ? "primary" : "default"}
                    onClick={() => requestTemplateChange(tpl.code)}
                    sx={{ mb: 0.75 }}
                  />
                ))}
              </Stack>
            </Box>

            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flexWrap: "wrap" }}>
              <TextField
                size="small"
                label="펜 굵기"
                type="number"
                value={penWidth}
                onChange={(e) => setPenWidth(Math.max(1, Math.min(12, Number(e.target.value) || 2)))}
                sx={{ width: 120 }}
              />
              <TextField
                size="small"
                label="펜 색상"
                value={penColor}
                onChange={(e) => setPenColor(e.target.value)}
                sx={{ width: 160 }}
              />
              <Button size="small" variant="outlined" onClick={clearPenCanvas}>전체 지우기</Button>
            </Stack>

            <Box sx={{ borderRadius: 2, border: "1px solid var(--line)", overflow: "auto", bgcolor: "#fff" }}>
              <Box sx={{ minWidth: 900, p: 1 }}>
                <canvas
                  ref={canvasRef}
                  onMouseDown={beginDraw}
                  onMouseMove={drawMove}
                  onMouseUp={endDraw}
                  onMouseLeave={endDraw}
                  onTouchStart={beginDraw}
                  onTouchMove={(e) => {
                    e.preventDefault();
                    drawMove(e);
                  }}
                  onTouchEnd={endDraw}
                  style={{ border: "1px solid #e2e8f0", borderRadius: 8, touchAction: "none", display: "block" }}
                />
              </Box>
            </Box>
          </Stack>
        </DialogContent>
      <DialogActions>
        <Button onClick={() => setPenOpen(false)}>닫기</Button>
        <Button onClick={() => void savePenChart()} variant="contained" disabled={assetSaving}>펜차트 저장</Button>
      </DialogActions>
    </Dialog>

    <Dialog open={templateSwitchConfirmOpen} onClose={() => setTemplateSwitchConfirmOpen(false)} fullWidth maxWidth="xs">
      <DialogTitle>템플릿 변경</DialogTitle>
      <DialogContent>
        <Typography sx={{ color: "var(--muted)", fontSize: 14 }}>
          템플릿을 변경하면 현재 그린 내용이 초기화됩니다. 계속할까요?
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setTemplateSwitchConfirmOpen(false)}>취소</Button>
        <Button color="warning" variant="contained" onClick={applyTemplateChange}>변경</Button>
      </DialogActions>
    </Dialog>
  </Stack>
);
}
