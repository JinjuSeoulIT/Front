"use client";

import * as React from "react";
import MainLayout from "@/components/layout/MainLayout";
import {
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
  Pagination,
  Stack,
  Tab,
  Tabs,
  Typography,
  IconButton,
  TextField,
  MenuItem,
  Menu,
  Autocomplete,
} from "@mui/material";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import KeyboardDoubleArrowLeftRoundedIcon from "@mui/icons-material/KeyboardDoubleArrowLeftRounded";
import KeyboardDoubleArrowRightRoundedIcon from "@mui/icons-material/KeyboardDoubleArrowRightRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import {
  createPatientApi,
  fetchPatientsApi,
  fetchPatientApi,
} from "@/lib/patientApi";
import type { Patient, PatientForm } from "@/features/patients/patientTypes";
import {
  createPatientMemoApi,
  deletePatientMemoApi,
  fetchPatientMemosApi,
  type PatientMemo,
} from "@/lib/memoApi";
import {
  createPatientFlagApi,
  fetchPatientFlagsApi,
  updatePatientFlagApi,
  type PatientFlag,
} from "@/lib/flagApi";
import { getSessionUser } from "@/lib/session";
import PatientRegisterModal from "./register/PatientRegisterModal";
import PatientSearchModal from "./register/PatientSearchModal";
import ReceptionModal from "./register/ReceptionModal";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import { fetchPatientsPage } from "@/lib/patientPagingApi";
import {
  fetchVisitsApi,
  getPatientReceptionDetailApi,
  type PatientReceptionDetail,
  type VisitRes,
  updateVisitApi,
} from "@/lib/receptionApi";
import { usePathname, useRouter } from "next/navigation";
import { fetchDepartmentsApi, fetchStaffListApi } from "@/lib/staffApi";
import { fetchApprovedLeavesApi } from "@/lib/leaveApi";
import { fetchShiftAssignmentsApi } from "@/lib/shiftApi";
import type { DepartmentOption, StaffListItem } from "@/features/staff/staffTypes";
import { VISIT_PURPOSES, getDetailOptionsByPurpose, getVisitPurposeOption } from "./register/visitPurposeConfig";

export default function NursePage() {
  const router = useRouter();
  const pathname = usePathname();
  const user = React.useMemo(() => getSessionUser(), []);
  const [liveNow, setLiveNow] = React.useState(() => new Date());

  const [tab, setTab] = React.useState<"WAITING" | "RESERVATION" | "VISIT">("WAITING");
  const [reservationFilterDate, setReservationFilterDate] = React.useState("");
  const [visitPageByTab, setVisitPageByTab] = React.useState<Record<"WAITING" | "RESERVATION" | "VISIT", number>>({
    WAITING: 1,
    RESERVATION: 1,
    VISIT: 1,
  });
  const [isQueuePanelCollapsed, setIsQueuePanelCollapsed] = React.useState(false);
  const [patients, setPatients] = React.useState<Patient[]>([]);
  const [visits, setVisits] = React.useState<VisitRes[]>([]);
  const [loadingVisits, setLoadingVisits] = React.useState(false);
  const [visitPatientMap, setVisitPatientMap] = React.useState<Record<number, Patient>>({});

  // 상세 모달 상태
  const [detailModalOpen, setDetailModalOpen] = React.useState(false);
  const [selectedVisit, setSelectedVisit] = React.useState<VisitRes | null>(null);
  const [selectedPatientId, setSelectedPatientId] = React.useState<number | null>(null);
  const [requestDialogOpen, setRequestDialogOpen] = React.useState(false);
  const [requestDialogPage, setRequestDialogPage] = React.useState(1);
  const [requestListTab, setRequestListTab] = React.useState<"REQUEST" | "RESERVATION">("REQUEST");
  const [requestActionVisitId, setRequestActionVisitId] = React.useState<number | null>(null);
  const [requestConfirmVisit, setRequestConfirmVisit] = React.useState<VisitRes | null>(null);
  const [requestConfirmDetail, setRequestConfirmDetail] = React.useState<PatientReceptionDetail | null>(null);
  const [roomVisitListType, setRoomVisitListType] = React.useState<"WAITING" | "RESERVATION" | "IN_PROGRESS" | null>(null);
  const [roomPatientModalVisit, setRoomPatientModalVisit] = React.useState<VisitRes | null>(null);
  const [contextActionVisitId, setContextActionVisitId] = React.useState<number | null>(null);
  const [contextMenu, setContextMenu] = React.useState<{ mouseX: number; mouseY: number; visit: VisitRes } | null>(null);
  const [currentRoomIndex, setCurrentRoomIndex] = React.useState(0);
  const [roomInputValue, setRoomInputValue] = React.useState("");
  const [isRoomPickerActive, setIsRoomPickerActive] = React.useState(false);
  const [searchInput, setSearchInput] = React.useState("");
  const [loadingPatients, setLoadingPatients] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(false);
  const PAGE_SIZE = 50;

  const [patientForm, setPatientForm] = React.useState<PatientForm>({
    name: "",
    gender: "F",
    birthDate: "",
    phone: "",
    guardianName: "",
    guardianPhone: "",
    note: "",
    isForeigner: false,
    contactPriority: "PATIENT",
  });

  // 환자 검색 모달
  const [isSearchModalOpen, setIsSearchModalOpen] = React.useState(false);
  const [searchModalPatients, setSearchModalPatients] = React.useState<Patient[]>([]);
  const [searchModalPage, setSearchModalPage] = React.useState(1);
  const [searchModalHasMore, setSearchModalHasMore] = React.useState(false);
  const [departmentOptions, setDepartmentOptions] = React.useState<DepartmentOption[]>([]);
  const [availableDoctors, setAvailableDoctors] = React.useState<StaffListItem[]>([]);
  const [loadingAssignees, setLoadingAssignees] = React.useState(false);
  const reservationDateInputRef = React.useRef<HTMLInputElement | null>(null);

  const [memos, setMemos] = React.useState<PatientMemo[]>([]);
  const [memoInput, setMemoInput] = React.useState("");
  const [loadingMemos, setLoadingMemos] = React.useState(false);

  const [flags, setFlags] = React.useState<PatientFlag[]>([]);
  const [flagType, setFlagType] = React.useState("FALL_RISK");
  const [flagNote, setFlagNote] = React.useState("");
  const [loadingFlags, setLoadingFlags] = React.useState(false);

  React.useEffect(() => {
    const timer = window.setInterval(() => {
      setLiveNow(new Date());
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const safePatients = Array.isArray(patients) ? patients : [];
  const selectedPatient = React.useMemo(
    () => (selectedPatientId != null ? safePatients.find((p) => p.patientId === selectedPatientId) ?? null : null),
    [safePatients, selectedPatientId]
  );

  // visit 목록을 탭에 따라 필터링
  const filteredVisits = React.useMemo(() => {
    const isSameDate = (value?: string | null, dateStr?: string) => {
      if (!value || !dateStr) return true;
      const d = new Date(value);
      if (Number.isNaN(d.getTime())) return false;
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}` === dateStr;
    };

    const byQueueOrder = (a: VisitRes, b: VisitRes) => {
      const aq = a.queueNo ?? Number.MAX_SAFE_INTEGER;
      const bq = b.queueNo ?? Number.MAX_SAFE_INTEGER;
      if (aq !== bq) return aq - bq;
      const ta = new Date(a.createdAt || a.updatedAt || 0).getTime();
      const tb = new Date(b.createdAt || b.updatedAt || 0).getTime();
      return ta - tb;
    };

    const dedupeByPatient = (
      rows: VisitRes[],
      sorter: (a: VisitRes, b: VisitRes) => number = byQueueOrder
    ) => {
      const sorted = [...rows].sort(sorter);
      const seen = new Set<number>();
      const next: VisitRes[] = [];
      for (const row of sorted) {
        if (seen.has(row.patientId)) continue;
        seen.add(row.patientId);
        next.push(row);
      }
      return next;
    };

    if (tab === "WAITING") {
      return dedupeByPatient(
        visits.filter((v) => (v.visitType || "").toUpperCase() === "OUTPATIENT" && (v.status || "").toUpperCase() === "WAITING")
      );
    } else if (tab === "RESERVATION") {
      const weekStart = new Date();
      weekStart.setHours(0, 0, 0, 0);
      const day = weekStart.getDay();
      const mondayShift = day === 0 ? -6 : 1 - day;
      weekStart.setDate(weekStart.getDate() + mondayShift);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      return dedupeByPatient(
        visits
          .filter((v) => {
            if ((v.visitType || "").toUpperCase() !== "RESERVATION") return false;
            if ((v.status || "").toUpperCase() !== "WAITING") return false;
            const base = v.scheduledAt || v.createdAt;
            if (!base) return false;
            const d = new Date(base);
            if (Number.isNaN(d.getTime())) return false;
            if (!(d >= weekStart && d < weekEnd)) return false;
            return isSameDate(v.scheduledAt || v.createdAt, reservationFilterDate);
          })
          .sort((a, b) => {
            const ta = new Date(a.scheduledAt || a.createdAt || 0).getTime();
            const tb = new Date(b.scheduledAt || b.createdAt || 0).getTime();
            return ta - tb;
          }),
        (a, b) => {
          const ta = new Date(a.scheduledAt || a.createdAt || 0).getTime();
          const tb = new Date(b.scheduledAt || b.createdAt || 0).getTime();
          return ta - tb;
        }
      );
    } else if (tab === "VISIT") {
      const rows = visits.filter((v) => {
        const status = (v.status || "").toUpperCase();
        const isActiveStatus = status === "IN_PROGRESS" || status === "WAITING";
        const isTreatmentFlow = v.visitType === "VISIT" || Boolean(v.startedAt && !v.finishedAt);
        return isTreatmentFlow && isActiveStatus;
      });

      return dedupeByPatient(rows).sort((a, b) => {
        const sa = (a.status || "").toUpperCase();
        const sb = (b.status || "").toUpperCase();
        if (sa !== sb) {
          if (sa === "IN_PROGRESS") return -1;
          if (sb === "IN_PROGRESS") return 1;
        }
        const ta = new Date(a.updatedAt || a.createdAt || 0).getTime();
        const tb = new Date(b.updatedAt || b.createdAt || 0).getTime();
        return ta - tb;
      });
    }
    return [];
  }, [visits, tab, reservationFilterDate]);

  const VISIT_ROWS_PER_PAGE = 10;
  const visitPage = visitPageByTab[tab] ?? 1;
  const visitPageCount = Math.max(1, Math.ceil(filteredVisits.length / VISIT_ROWS_PER_PAGE));
  const pagedVisits = React.useMemo(() => {
    const start = (visitPage - 1) * VISIT_ROWS_PER_PAGE;
    return filteredVisits.slice(start, start + VISIT_ROWS_PER_PAGE);
  }, [filteredVisits, visitPage]);

  React.useEffect(() => {
    if (visitPage > visitPageCount) {
      setVisitPageByTab((prev) => ({ ...prev, [tab]: visitPageCount }));
    }
  }, [tab, visitPage, visitPageCount]);

  React.useEffect(() => {
    const requestRows = visits.filter((v) => {
      const status = (v.status || "").toUpperCase();
      const visitType = (v.visitType || "").toUpperCase();
      return status === "WAITING" && visitType !== "VISIT";
    });
    const sourceRows = [...filteredVisits, ...requestRows];
    if (!sourceRows.length) return;
    const missingIds = sourceRows
      .map((v) => v.patientId)
      .filter((id) => id != null && !visitPatientMap[id]);
    if (!missingIds.length) return;

    let mounted = true;
    (async () => {
      const entries = await Promise.all(
        Array.from(new Set(missingIds)).map(async (id) => {
          try {
            const patient = await fetchPatientApi(id);
            return [id, patient] as const;
          } catch {
            return null;
          }
        })
      );

      if (!mounted) return;
      setVisitPatientMap((prev) => {
        const next = { ...prev };
        for (const entry of entries) {
          if (!entry) continue;
          const [id, patient] = entry;
          next[id] = patient;
        }
        return next;
      });
    })();

    return () => {
      mounted = false;
    };
  }, [filteredVisits, visits, visitPatientMap]);

  const getAgeText = (birthDate?: string | null) => {
    if (!birthDate) return "-";
    const d = new Date(birthDate);
    if (Number.isNaN(d.getTime())) return "-";
    const now = new Date();
    let age = now.getFullYear() - d.getFullYear();
    const m = now.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age -= 1;
    return `${age}세`;
  };

  const getGenderText = (gender?: string | null) => {
    if (!gender) return "-";
    return gender.toUpperCase() === "M" ? "남" : gender.toUpperCase() === "F" ? "여" : "-";
  };

  const isTodayDate = React.useCallback((value?: string | null) => {
    if (!value) return false;
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return false;
    const now = new Date();
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
  }, []);

  const getVisitPatientInfo = React.useCallback(
    (visit: VisitRes) => {
      return visitPatientMap[visit.patientId] ?? safePatients.find((p) => p.patientId === visit.patientId) ?? null;
    },
    [visitPatientMap, safePatients]
  );

  // 서버 페이징 중심으로: 클라이언트 쪽 필터 제거
  const filteredPatients = React.useMemo(() => patients, [patients]);

  // 1) 첫 페이지 불러오기
  const loadFirstPage = React.useCallback(async () => {
    setLoadingPatients(true);
    try {
      const data = await fetchPatientsPage(searchInput, 1, PAGE_SIZE);
      const items = Array.isArray(data?.items) ? data.items : [];
      setPatients(items);
      setHasMore(Boolean(data?.hasMore));
      setPage(1);
      if (!selectedPatientId && items.length) setSelectedPatientId(items[0].patientId);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "환자 목록 조회 실패");
    } finally {
      setLoadingPatients(false);
    }
  }, [searchInput, selectedPatientId]);

  // visit 목록 로드 (대기/예약/방문)
  const loadVisits = React.useCallback(async () => {
    setLoadingVisits(true);
    try {
      const allVisits = await fetchVisitsApi();
      setVisits(allVisits);
    } catch (error) {
      console.error("방문 목록 조회 실패:", error);
      setVisits([]);
    } finally {
      setLoadingVisits(false);
    }
  }, []);

  // 페이지 로드 시 대기 목록 자동 조회
  React.useEffect(() => {
    void loadVisits();
  }, [loadVisits]);

  React.useEffect(() => {
    let mounted = true;
    const loadAssignees = async () => {
      setLoadingAssignees(true);
      try {
        const today = new Date();
        const y = String(today.getFullYear());
        const m = String(today.getMonth() + 1).padStart(2, "0");
        const d = String(today.getDate()).padStart(2, "0");
        const todayStr = `${y}-${m}-${d}`;

        const [deptRows, staffRows, leaveRows, shiftRows] = await Promise.all([
          fetchDepartmentsApi(true).catch(() => []),
          fetchStaffListApi(true, 0, 300).catch(() => []),
          fetchApprovedLeavesApi().catch(() => []),
          fetchShiftAssignmentsApi({ fromDate: todayStr, toDate: todayStr }).catch(() => []),
        ]);

        const leaveSet = new Set(
          leaveRows
            .filter((leave) => leave.fromDate <= todayStr && leave.toDate >= todayStr)
            .map((leave) => String(leave.requesterId || "").trim())
        );
        const shiftSet = new Set(shiftRows.map((shift) => String(shift.staffId || "").trim()));
        const hasShiftData = shiftSet.size > 0;

        const doctors = staffRows.filter((staff) => {
          const status = (staff.statusCode || staff.status || "ACTIVE").toUpperCase();
          if (status !== "ACTIVE") return false;
          const role = (staff.domainRole || "").toUpperCase();
          const isDoctorRole = role === "DOCTOR";
          const position = (staff.positionName || "").toUpperCase();
          const isDoctorByPosition = position.includes("의사") || position.includes("전문의");
          if (!isDoctorRole && !isDoctorByPosition) return false;
          const staffKey = String(staff.username || "").trim();
          if (staffKey && leaveSet.has(staffKey)) return false;
          if (staffKey && hasShiftData && !shiftSet.has(staffKey)) return false;
          return true;
        });

        if (!mounted) return;
        setDepartmentOptions(Array.isArray(deptRows) ? deptRows : []);
        setAvailableDoctors(doctors);
      } finally {
        if (mounted) setLoadingAssignees(false);
      }
    };

    void loadAssignees();
    return () => {
      mounted = false;
    };
  }, []);

  // 2) 다음 페이지 불러오기
  const loadMore = React.useCallback(async () => {
    if (!hasMore || loadingPatients) return;
    setLoadingPatients(true);
    try {
      const next = page + 1;
      const data = await fetchPatientsPage(searchInput, next, PAGE_SIZE);
      const items = Array.isArray(data?.items) ? data.items : [];
      setPatients((prev) => [...prev, ...items]);
      setHasMore(Boolean(data?.hasMore));
      setPage(next);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "추가 조회 실패");
    } finally {
      setLoadingPatients(false);
    }
  }, [hasMore, loadingPatients, page, searchInput]);

  // 검색 모달: 첫 페이지 로드
  const loadSearchModalFirstPage = React.useCallback(async (query: string) => {
    setLoadingPatients(true);
    try {
      setSearchInput(query);
      const data = await fetchPatientsPage(query, 1, PAGE_SIZE);
      const items = Array.isArray(data?.items) ? data.items : [];
      setSearchModalPatients(items);
      setSearchModalHasMore(Boolean(data?.hasMore));
      setSearchModalPage(1);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "검색 실패");
    } finally {
      setLoadingPatients(false);
    }
  }, []);

  // 검색 모달: 더 보기
  const loadSearchModalMore = React.useCallback(async () => {
    if (!searchModalHasMore || loadingPatients) return;
    setLoadingPatients(true);
    try {
      const next = searchModalPage + 1;
      const data = await fetchPatientsPage(searchInput, next, PAGE_SIZE);
      const items = Array.isArray(data?.items) ? data.items : [];
      setSearchModalPatients((prev) => [...prev, ...items]);
      setSearchModalHasMore(Boolean(data?.hasMore));
      setSearchModalPage(next);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "추가 검색 실패");
    } finally {
      setLoadingPatients(false);
    }
  }, [searchModalHasMore, loadingPatients, searchModalPage, searchInput]);

  // 검색 모달에서 환자 선택
  const handleSearchModalSelect = (patient: Patient) => {
    setSelectedPatientId(patient.patientId);
    setIsSearchModalOpen(false);
  };

  const loadMemos = React.useCallback(async () => {
    if (!selectedPatientId) return;
    setLoadingMemos(true);
    try {
      setMemos(await fetchPatientMemosApi(selectedPatientId));
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "간호 메모 조회 실패");
      setMemos([]);
    } finally {
      setLoadingMemos(false);
    }
  }, [selectedPatientId]);

  const loadFlags = React.useCallback(async () => {
    if (!selectedPatientId) return;
    setLoadingFlags(true);
    try {
      setFlags(await fetchPatientFlagsApi(selectedPatientId));
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "플래그 조회 실패");
      setFlags([]);
    } finally {
      setLoadingFlags(false);
    }
  }, [selectedPatientId]);

  // 초기 자동 로딩은 하지 않음(학원 발표용 초안)

  // 신규 환자 등록 모달 제어
  const [isRegisterOpen, setIsRegisterOpen] = React.useState(false);
  const [registerReceptionOpen, setRegisterReceptionOpen] = React.useState(false);
  const [registerReceptionPatient, setRegisterReceptionPatient] = React.useState<Patient | null>(null);

  const handleModalSubmit = async (payload: PatientForm) => {
    try {
      await createPatientApi(payload);
      setIsRegisterOpen(false);
      await loadFirstPage();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "환자 등록 실패");
    }
  };

  const handleModalSubmitAndReception = async (payload: PatientForm) => {
    try {
      const saved = await createPatientApi(payload);
      setIsRegisterOpen(false);
      setRegisterReceptionPatient(saved);
      setRegisterReceptionOpen(true);
      await loadFirstPage();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "환자 등록 실패");
    }
  };

  React.useEffect(() => {
    if (!selectedPatientId) return;
    void loadMemos();
    void loadFlags();
  }, [selectedPatientId, loadFlags, loadMemos]);

  const submitPatient = async () => {
    if (!patientForm.name?.trim()) return window.alert("환자명을 입력하세요.");
    try {
      await createPatientApi(patientForm);
      setPatientForm({
        name: "",
        gender: "F",
        birthDate: "",
        phone: "",
        guardianName: "",
        guardianPhone: "",
        note: "",
        isForeigner: false,
        contactPriority: "PATIENT",
      });
      await loadFirstPage();
      window.alert("환자 등록 완료");
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "환자 등록 실패");
    }
  };

  const submitMemo = async () => {
    if (!selectedPatientId) return window.alert("환자를 먼저 선택하세요.");
    if (!memoInput.trim()) return;
    try {
      await createPatientMemoApi({
        patientId: selectedPatientId,
        memo: memoInput.trim(),
        createdBy: user?.fullName || user?.username || "nurse",
      });
      setMemoInput("");
      await loadMemos();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "메모 저장 실패");
    }
  };

  const removeMemo = async (memoId: number) => {
    if (!window.confirm("메모를 삭제할까요?")) return;
    try {
      await deletePatientMemoApi(memoId);
      await loadMemos();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "메모 삭제 실패");
    }
  };

  const submitFlag = async () => {
    if (!selectedPatientId) return window.alert("환자를 먼저 선택하세요.");
    try {
      await createPatientFlagApi({
        patientId: selectedPatientId,
        flagType,
        note: flagNote.trim() || null,
      });
      setFlagNote("");
      await loadFlags();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "플래그 추가 실패");
    }
  };

  const toggleFlag = async (flag: PatientFlag) => {
    try {
      await updatePatientFlagApi(flag.flagId, {
        activeYn: !flag.activeYn,
        note: flag.note || null,
        flagType: flag.flagType,
      });
      await loadFlags();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "플래그 상태 변경 실패");
    }
  };

  // 카드 클릭 시 상세 모달 열기
  const handleVisitClick = (visit: VisitRes) => {
    setSelectedVisit(visit);
    setSelectedPatientId(visit.patientId);
  };

  const openContextMenu = (event: React.MouseEvent, visit: VisitRes) => {
    event.preventDefault();
    handleVisitClick(visit);
    setContextMenu({
      mouseX: event.clientX + 2,
      mouseY: event.clientY - 6,
      visit,
    });
  };

  const closeContextMenu = () => setContextMenu(null);

  const applyQuickAction = async (visit: VisitRes, payload: Parameters<typeof updateVisitApi>[1]) => {
    try {
      setContextActionVisitId(visit.id);
      await updateVisitApi(visit.id, {
        ...payload,
        updatedBy: user?.username || "nurse-dashboard",
      });
      await loadVisits();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "처리 중 오류가 발생했습니다.");
    } finally {
      setContextActionVisitId(null);
      closeContextMenu();
    }
  };

  const moveToTreatmentRoom = async (visit: VisitRes) => {
    await applyQuickAction(visit, {
      visitType: "VISIT",
      status: "WAITING",
      startedAt: null,
    });
    setTab("VISIT");
  };

  const convertToReservation = async (visit: VisitRes) => {
    const next = new Date();
    next.setDate(next.getDate() + 1);
    next.setHours(9, 0, 0, 0);
    await applyQuickAction(visit, {
      visitType: "RESERVATION",
      status: "WAITING",
      scheduledAt: next.toISOString(),
      reservationNote: "대기 목록에서 예약 전환",
    });
    setTab("RESERVATION");
  };

  const cancelVisit = async (visit: VisitRes) => {
    await applyQuickAction(visit, {
      status: "CANCELLED",
      cancelledAt: new Date().toISOString(),
      cancelReasonCode: "MANUAL",
      cancelMemo: "간호 대기목록 취소 처리",
    });
  };

  const markPriority = async (visit: VisitRes) => {
    await applyQuickAction(visit, {
      priorityYn: true,
      memo: `${visit.memo ? `${visit.memo} | ` : ""}우선진료 지정`,
    });
  };

  const callPatient = async (visit: VisitRes) => {
    await applyQuickAction(visit, {
      status: "CALLED",
      calledAt: new Date().toISOString(),
    });
  };

  const markNoShow = async (visit: VisitRes) => {
    await applyQuickAction(visit, {
      status: "CANCELLED",
      cancelledAt: new Date().toISOString(),
      cancelReasonCode: "NO_SHOW",
      cancelMemo: "노쇼 처리",
    });
  };

  const [visitDraft, setVisitDraft] = React.useState({
    deptCode: "",
    doctorId: "",
    purpose: "OUTPATIENT_FIRST",
    detailPurpose: "",
    memo: "",
  });

  const availableDetailOptions = React.useMemo(
    () => getDetailOptionsByPurpose(visitDraft.purpose),
    [visitDraft.purpose]
  );

  const selectedPurpose = React.useMemo(
    () => getVisitPurposeOption(visitDraft.purpose),
    [visitDraft.purpose]
  );

  const doctorOptions = React.useMemo(() => {
    if (!visitDraft.deptCode) return availableDoctors;
    return availableDoctors.filter((doc) => (doc.departmentName || "") === visitDraft.deptCode);
  }, [availableDoctors, visitDraft.deptCode]);

  const eligibleDepartments = React.useMemo(() => {
    const includeKeywords = [
      "원무", "내과", "외과", "소아", "응급", "입원", "가정의학", "정형", "신경", "피부", "이비인후", "산부인", "재활", "영상", "진단", "검사", "진료",
    ];
    const excludeKeywords = [
      "행정", "시설", "총무", "인사", "재무", "회계", "전산", "정보", "관리팀", "경영", "홍보", "감사", "원장실", "구매", "자산",
    ];

    const fromMaster = (departmentOptions || []).filter((dept) => {
      const name = String(dept.name || "").trim();
      if (!name) return false;
      const hasInclude = includeKeywords.some((k) => name.includes(k));
      const hasExclude = excludeKeywords.some((k) => name.includes(k));
      return hasInclude && !hasExclude;
    });

    const fromVisits = Array.from(new Set(visits.map((v) => String(v.deptCode || "").trim()).filter(Boolean)))
      .filter((name) => {
        const hasInclude = includeKeywords.some((k) => name.includes(k));
        const hasExclude = excludeKeywords.some((k) => name.includes(k));
        return hasInclude && !hasExclude;
      })
      .map((name) => ({ id: -1, name } as DepartmentOption));

    const merged = [...fromMaster, ...fromVisits];
    const unique = new Map<string, DepartmentOption>();
    for (const row of merged) {
      if (!unique.has(row.name)) unique.set(row.name, row);
    }
    return Array.from(unique.values());
  }, [departmentOptions, visits]);

  const doctorNameOptions = React.useMemo(
    () => Array.from(new Set(doctorOptions.map((doc) => String(doc.fullName || doc.username || "").trim()).filter(Boolean))),
    [doctorOptions]
  );

  React.useEffect(() => {
    if (!selectedVisit) {
      setVisitDraft({ deptCode: "", doctorId: "", purpose: "OUTPATIENT_FIRST", detailPurpose: "", memo: "" });
      return;
    }
    setVisitDraft({
      deptCode: selectedVisit.deptCode || "",
      doctorId: selectedVisit.doctorId || "",
      purpose: "OUTPATIENT_FIRST",
      detailPurpose: "",
      memo: selectedVisit.memo || "",
    });
  }, [selectedVisit]);

  const saveVisitDraft = async (visit: VisitRes) => {
    try {
      await updateVisitApi(visit.id, {
        deptCode: visitDraft.deptCode || null,
        doctorId: visitDraft.doctorId || null,
        memo: visitDraft.memo || null,
        updatedBy: user?.username || "nurse-dashboard",
      });
      await loadVisits();
      window.alert("접수 정보를 저장했어요.");
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "접수 정보 저장 실패");
    }
  };

  const registerVisitFromPanel = async (visit: VisitRes) => {
    if (!visitDraft.deptCode.trim()) return window.alert("진료과를 선택하세요.");
    if (!visitDraft.doctorId.trim()) return window.alert("담당의를 선택하세요.");
    if (selectedPurpose?.detailMode === "required" && !visitDraft.detailPurpose.trim()) {
      return window.alert("세부목적을 선택하세요.");
    }
    const combinedMemo = `${visitDraft.purpose}${visitDraft.detailPurpose ? ` - ${visitDraft.detailPurpose}` : ""}${visitDraft.memo ? ` | ${visitDraft.memo}` : ""}`;
    try {
      await updateVisitApi(visit.id, {
        visitType: "VISIT",
        status: "WAITING",
        deptCode: visitDraft.deptCode,
        doctorId: visitDraft.doctorId,
        startedAt: null,
        memo: combinedMemo,
        updatedBy: user?.username || "nurse-dashboard",
      });
      await loadVisits();
      setTab("VISIT");
      window.alert("접수 처리되었습니다.");
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "접수 실패");
    }
  };

  const renderVisitEditPanel = () => (
    <Card sx={{ border: "1px solid var(--line)" }}>
      <CardContent>
        {!selectedVisit ? (
          <Typography sx={{ color: 'text.secondary', mt: 1, fontSize: 14 }}>
            좌측에서 환자를 선택하세요.
          </Typography>
        ) : (
          <Stack spacing={1.2} sx={{ mt: 1.2 }}>
            <Typography sx={{ fontWeight: 700, fontSize: 15 }}>
              {selectedVisit.patientName || "-"} ({selectedVisit.patientNo || "-"})
            </Typography>
            <Typography sx={{ color: 'text.secondary', fontSize: 12 }}>
              접수시간: {formatDateTime(selectedVisit.createdAt)}
              {(selectedVisit.visitType || "").toUpperCase() === "RESERVATION" ? ` · 예약시간: ${formatDateTime(selectedVisit.scheduledAt || selectedVisit.createdAt)}` : ""}
            </Typography>
            <Autocomplete
              size="small"
              options={eligibleDepartments.map((d) => d.name)}
              value={visitDraft.deptCode || null}
              onChange={(_, value) => {
                setVisitDraft((prev) => ({ ...prev, deptCode: value || "", doctorId: "" }));
              }}
              onInputChange={(_, value) => {
                setVisitDraft((prev) => ({ ...prev, deptCode: value || "", doctorId: "" }));
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="진료과"
                  helperText={loadingAssignees ? "진료과를 불러오는 중..." : undefined}
                />
              )}
            />
            <Autocomplete
              size="small"
              options={doctorNameOptions}
              value={visitDraft.doctorId || null}
              onChange={(_, value) => {
                setVisitDraft((prev) => ({ ...prev, doctorId: value || "" }));
              }}
              onInputChange={(_, value) => {
                setVisitDraft((prev) => ({ ...prev, doctorId: value || "" }));
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="담당의"
                  helperText={
                    loadingAssignees
                      ? "의료진 정보를 불러오는 중..."
                      : doctorNameOptions.length
                      ? undefined
                      : "휴가/비번 제외 결과 배정 가능한 담당의가 없습니다."
                  }
                />
              )}
            />
            <TextField
              select
              size="small"
              label="방문목적"
              value={visitDraft.purpose}
              onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                setVisitDraft((prev) => ({ ...prev, purpose: e.target.value, detailPurpose: "" }))
              }
            >
              {VISIT_PURPOSES.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
              ))}
            </TextField>
            {selectedPurpose?.detailMode !== "none" ? (
              <TextField
                select
                size="small"
                label="세부목적"
                value={visitDraft.detailPurpose}
                onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                  setVisitDraft((prev) => ({ ...prev, detailPurpose: e.target.value }))
                }
              >
                {availableDetailOptions.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                ))}
              </TextField>
            ) : null}
            <TextField
              size="small"
              label="접수 메모"
              value={visitDraft.memo}
              onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                setVisitDraft((prev) => ({ ...prev, memo: e.target.value }))
              }
              multiline
              minRows={3}
            />
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" onClick={() => void saveVisitDraft(selectedVisit)}>저장</Button>
              {(selectedVisit.visitType || "").toUpperCase() !== "VISIT" ? (
                <Button variant="contained" onClick={() => void registerVisitFromPanel(selectedVisit)}>접수 처리</Button>
              ) : null}
            </Stack>
          </Stack>
        )}
      </CardContent>
    </Card>
  );

  const handleRegisterFromRequest = async (visit: VisitRes) => {
    try {
      setRequestActionVisitId(visit.id);
      const baseMemo = visit.memo ? `${visit.memo} | ` : "";
      await updateVisitApi(visit.id, {
        visitType: "VISIT",
        status: "WAITING",
        startedAt: null,
        memo: `${baseMemo}간호 대시보드에서 접수 처리`,
        updatedBy: user?.username || "nurse-dashboard",
      });
      await loadVisits();
      setTab("VISIT");
      setRequestConfirmVisit(null);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "접수 처리 실패");
    } finally {
      setRequestActionVisitId(null);
    }
  };

  const openRequestConfirmModal = (visit: VisitRes) => {
    setRequestConfirmVisit(visit);
  };

  const closeRequestConfirmModal = () => {
    if (requestActionVisitId != null) return;
    setRequestConfirmVisit(null);
    setRequestConfirmDetail(null);
  };

  React.useEffect(() => {
    if (!requestConfirmVisit?.patientId) {
      setRequestConfirmDetail(null);
      return;
    }
    let mounted = true;
    void getPatientReceptionDetailApi(requestConfirmVisit.patientId)
      .then((detail) => {
        if (!mounted) return;
        setRequestConfirmDetail(detail);
      })
      .catch(() => {
        if (!mounted) return;
        setRequestConfirmDetail(null);
      });
    return () => {
      mounted = false;
    };
  }, [requestConfirmVisit]);

  const isDashboardRoute = pathname === "/nurse";

  const roomDashboardRows = React.useMemo(() => {
    const map = new Map<string, {
      key: string;
      roomName: string;
      waitingCount: number;
      reservationCount: number;
      inProgressCount: number;
      lastUpdated: number;
      currentPatient: string;
      waitingPatients: string[];
    }>();

    for (const row of visits) {
      const status = (row.status || "").toUpperCase();
      if (status === "CANCELLED" || status === "DONE") continue;
      const visitType = (row.visitType || "").toUpperCase();
      if (visitType === "RESERVATION" && !isTodayDate(row.scheduledAt || row.createdAt)) continue;
      const key = `${row.deptCode || "미지정"}__${row.doctorId || "미배정"}`;
      const roomName = `${row.deptCode || "미지정"} / ${row.doctorId || "미배정"}`;
      const prev = map.get(key) || {
        key,
        roomName,
        waitingCount: 0,
        reservationCount: 0,
        inProgressCount: 0,
        lastUpdated: 0,
        currentPatient: "-",
        waitingPatients: [],
      };

      if (visitType === "RESERVATION" && status === "WAITING") {
        prev.reservationCount += 1;
      } else if (status === "IN_PROGRESS") {
        prev.inProgressCount += 1;
      } else if (status === "WAITING") {
        prev.waitingCount += 1;
      }

      const ts = new Date(row.updatedAt || row.createdAt || 0).getTime();
      if (ts > prev.lastUpdated) prev.lastUpdated = ts;

      if (status === "IN_PROGRESS" && row.patientName) {
        prev.currentPatient = row.patientName;
      }
      if (status === "WAITING" && visitType !== "RESERVATION" && row.patientName && !prev.waitingPatients.includes(row.patientName)) {
        prev.waitingPatients.push(row.patientName);
      }

      map.set(key, prev);
    }

    return Array.from(map.values())
      .sort((a, b) => b.lastUpdated - a.lastUpdated || a.roomName.localeCompare(b.roomName));
  }, [visits, isTodayDate]);

  const currentRoom = roomDashboardRows.length ? roomDashboardRows[currentRoomIndex] : null;
  const currentRoomVisitRows = React.useMemo(() => {
    if (!currentRoom || !roomVisitListType) return [] as VisitRes[];

    const rows = visits.filter((row) => {
      const roomKey = `${row.deptCode || "미지정"}__${row.doctorId || "미배정"}`;
      if (roomKey !== currentRoom.key) return false;

      const status = (row.status || "").toUpperCase();
      const visitType = (row.visitType || "").toUpperCase();
      if (roomVisitListType === "WAITING") {
        return status === "WAITING" && visitType !== "RESERVATION";
      }
      if (roomVisitListType === "RESERVATION") {
        return status === "WAITING" && visitType === "RESERVATION" && isTodayDate(row.scheduledAt || row.createdAt);
      }
      return status === "IN_PROGRESS";
    });

    if (roomVisitListType === "RESERVATION") {
      return rows.sort((a, b) => new Date(a.scheduledAt || a.createdAt || 0).getTime() - new Date(b.scheduledAt || b.createdAt || 0).getTime());
    }
    if (roomVisitListType === "IN_PROGRESS") {
      return rows.sort((a, b) => new Date(b.startedAt || b.updatedAt || b.createdAt || 0).getTime() - new Date(a.startedAt || a.updatedAt || a.createdAt || 0).getTime());
    }
    return rows.sort((a, b) => {
      const aq = a.queueNo ?? Number.MAX_SAFE_INTEGER;
      const bq = b.queueNo ?? Number.MAX_SAFE_INTEGER;
      if (aq !== bq) return aq - bq;
      return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
    });
  }, [currentRoom, roomVisitListType, visits, isTodayDate]);
  const roomOptions = React.useMemo(
    () => roomDashboardRows.map((room, idx) => ({ key: room.key, label: room.roomName, idx })),
    [roomDashboardRows]
  );
  const selectedRoomOption = roomOptions[currentRoomIndex] ?? null;

  React.useEffect(() => {
    if (!roomDashboardRows.length) {
      setCurrentRoomIndex(0);
      return;
    }
    if (currentRoomIndex >= roomDashboardRows.length) {
      setCurrentRoomIndex(0);
    }
  }, [roomDashboardRows.length, currentRoomIndex]);

  React.useEffect(() => {
    setRoomInputValue(selectedRoomOption?.label ?? "");
  }, [selectedRoomOption]);

  React.useEffect(() => {
    if (!roomPatientModalVisit?.patientId) return;
    if (visitPatientMap[roomPatientModalVisit.patientId]) return;
    let mounted = true;
    void fetchPatientApi(roomPatientModalVisit.patientId)
      .then((patient) => {
        if (!mounted) return;
        setVisitPatientMap((prev) => ({ ...prev, [roomPatientModalVisit.patientId]: patient }));
      })
      .catch(() => undefined);
    return () => {
      mounted = false;
    };
  }, [roomPatientModalVisit, visitPatientMap]);

  const moveRoom = (direction: 1 | -1) => {
    if (!roomDashboardRows.length) return;
    setCurrentRoomIndex((prev) => (prev + direction + roomDashboardRows.length) % roomDashboardRows.length);
  };

  const receptionRequestRows = React.useMemo(() => {
    return [...visits]
      .filter((v) => {
        const status = (v.status || "").toUpperCase();
        const visitType = (v.visitType || "").toUpperCase();
        return status === "WAITING" && visitType !== "VISIT" && visitType !== "RESERVATION";
      })
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }, [visits]);

  const reservationRequestRows = React.useMemo(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const todayStr = `${yyyy}-${mm}-${dd}`;

    const isToday = (value?: string | null) => {
      if (!value) return false;
      const d = new Date(value);
      if (Number.isNaN(d.getTime())) return false;
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}` === todayStr;
    };

    return [...visits]
      .filter((v) => {
        const status = (v.status || "").toUpperCase();
        const visitType = (v.visitType || "").toUpperCase();
        if (!(status === "WAITING" && visitType === "RESERVATION")) return false;
        return isToday(v.scheduledAt || v.createdAt);
      })
      .sort((a, b) => {
        const ta = new Date(a.scheduledAt || a.createdAt || 0).getTime();
        const tb = new Date(b.scheduledAt || b.createdAt || 0).getTime();
        return ta - tb;
      });
  }, [visits]);

  const requestConfirmPatient = React.useMemo(
    () => (requestConfirmVisit ? getVisitPatientInfo(requestConfirmVisit) : null),
    [requestConfirmVisit, getVisitPatientInfo]
  );
  const roomPatientModalPatient = React.useMemo(
    () => (roomPatientModalVisit ? getVisitPatientInfo(roomPatientModalVisit) : null),
    [roomPatientModalVisit, getVisitPatientInfo]
  );
  const requestConfirmRecentRows = React.useMemo(() => {
    if (!requestConfirmVisit?.patientId) return [] as VisitRes[];
    return [...visits]
      .filter((v) => {
        if (v.patientId !== requestConfirmVisit.patientId) return false;
        const status = (v.status || "").toUpperCase();
        return status === "DONE" || status === "CANCELLED";
      })
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 3);
  }, [requestConfirmVisit, visits]);

  const activeRequestRows = requestListTab === "REQUEST" ? receptionRequestRows : reservationRequestRows;
  const REQUEST_PREVIEW_ROWS = 3;
  const previewReceptionRequests = React.useMemo(
    () => activeRequestRows.slice(0, REQUEST_PREVIEW_ROWS),
    [activeRequestRows]
  );

  const REQUEST_DIALOG_ROWS_PER_PAGE = 8;
  const requestDialogPageCount = Math.max(
    1,
    Math.ceil(activeRequestRows.length / REQUEST_DIALOG_ROWS_PER_PAGE)
  );
  const pagedReceptionRequestRows = React.useMemo(() => {
    const start = (requestDialogPage - 1) * REQUEST_DIALOG_ROWS_PER_PAGE;
    return activeRequestRows.slice(start, start + REQUEST_DIALOG_ROWS_PER_PAGE);
  }, [activeRequestRows, requestDialogPage]);

  React.useEffect(() => {
    if (!requestDialogOpen) {
      setRequestDialogPage(1);
      return;
    }
    if (requestDialogPage > requestDialogPageCount) {
      setRequestDialogPage(requestDialogPageCount);
    }
  }, [requestDialogOpen, requestDialogPage, requestDialogPageCount]);

  React.useEffect(() => {
    setRequestDialogPage(1);
  }, [requestListTab]);

  const formatDateTime = (value?: string | null) => {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const mi = String(d.getMinutes()).padStart(2, "0");
    return `${mm}-${dd} ${hh}:${mi}`;
  };

  const formatLiveTime = (value: Date) => {
    const hh = String(value.getHours()).padStart(2, "0");
    const mi = String(value.getMinutes()).padStart(2, "0");
    const ss = String(value.getSeconds()).padStart(2, "0");
    return `${hh}:${mi}:${ss}`;
  };

  const formatLiveDateTime = (value: Date) => {
    const yyyy = value.getFullYear();
    const mm = String(value.getMonth() + 1).padStart(2, "0");
    const dd = String(value.getDate()).padStart(2, "0");
    const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
    const ww = weekdays[value.getDay()] || "-";
    return `${yyyy}-${mm}-${dd} (${ww}) ${formatLiveTime(value)}`;
  };

  const formatVisitHistoryDate = (value?: string | null) => {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
    const ww = weekdays[d.getDay()] || "-";
    return `${mm}-${dd} (${ww})`;
  };

  return (
    <MainLayout>
      <Stack spacing={2.2}>
        {isDashboardRoute ? (
          <Box
            sx={{
              width: "100%",
              minHeight: { xs: "calc(100vh - 120px)", md: "calc(100vh - 140px)" },
              boxSizing: "border-box",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "#E7EDF6",
              borderRadius: 0,
              border: "1px solid #d8e2ef",
              px: { xs: 1.5, md: 2.5 },
            }}
          >
            <Stack spacing={2.2} alignItems="center" sx={{ width: "100%", maxWidth: 1080 }}>
              <Card sx={{ width: { xs: "100%", md: 932 }, height: 328, border: "1px solid #dbe4f0", borderRadius: 3 }}>
                <CardContent sx={{ p: 2, height: "100%", position: "relative" }}>
                  {currentRoom ? (
                    <Stack sx={{ height: "100%", pt: 3.5 }}>
                      <IconButton
                        size="small"
                        onClick={() => moveRoom(-1)}
                        aria-label="이전 진료실"
                        sx={{
                          position: "absolute",
                          left: 10,
                          top: "50%",
                          transform: "translateY(-50%)",
                          bgcolor: "rgba(255,255,255,0.9)",
                          border: "1px solid #d8e2ef",
                        }}
                      >
                        <ChevronLeftRoundedIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => moveRoom(1)}
                        aria-label="다음 진료실"
                        sx={{
                          position: "absolute",
                          right: 10,
                          top: "50%",
                          transform: "translateY(-50%)",
                          bgcolor: "rgba(255,255,255,0.9)",
                          border: "1px solid #d8e2ef",
                        }}
                      >
                        <ChevronRightRoundedIcon />
                      </IconButton>
                      <Box
                        sx={{ mt: 2, mx: "auto", width: { xs: "100%", sm: 420 }, maxWidth: 420 }}
                      >
                        {isRoomPickerActive ? (
                          <Autocomplete
                            size="small"
                            openOnFocus
                            open
                            disableClearable
                            options={roomOptions}
                            value={selectedRoomOption}
                            inputValue={roomInputValue}
                            getOptionLabel={(option) => option.label}
                            onInputChange={(_, value) => setRoomInputValue(value)}
                            onChange={(_, value) => {
                              if (!value) return;
                              setCurrentRoomIndex(value.idx);
                              setIsRoomPickerActive(false);
                            }}
                            onClose={() => setIsRoomPickerActive(false)}
                            isOptionEqualToValue={(option, value) => option.key === value.key}
                            ListboxProps={{
                              sx: {
                                maxHeight: 240,
                                "& .MuiAutocomplete-option": {
                                  justifyContent: "center",
                                  textAlign: "center",
                                },
                              },
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                placeholder="진료과/담당의 검색"
                                autoFocus
                                inputProps={{
                                  ...params.inputProps,
                                  style: { textAlign: "center" },
                                }}
                                onBlur={() => setIsRoomPickerActive(false)}
                              />
                            )}
                          />
                        ) : (
                          <Typography
                            onClick={() => setIsRoomPickerActive(true)}
                            sx={{
                              fontWeight: 700,
                              fontSize: 16,
                              textAlign: "center",
                              px: 1.5,
                              py: 1,
                              border: "1px solid #d8e2ef",
                              borderRadius: 1.5,
                              bgcolor: "#fff",
                              cursor: "pointer",
                            }}
                          >
                            {currentRoom.roomName}
                          </Typography>
                        )}
                      </Box>
                      <Stack direction="row" spacing={1.2} sx={{ mt: 2, justifyContent: "center", flexWrap: "wrap", rowGap: 0.8 }}>
                        <Chip
                          size="medium"
                          label={`진료 대기 ${currentRoom.waitingCount}`}
                          onClick={() => setRoomVisitListType("WAITING")}
                          clickable
                        />
                        <Chip
                          size="medium"
                          label={`진료 예약 ${currentRoom.reservationCount}`}
                          onClick={() => setRoomVisitListType("RESERVATION")}
                          clickable
                        />
                        <Chip
                          size="medium"
                          color="success"
                          label={`진료 진행중 ${currentRoom.inProgressCount}`}
                          onClick={() => setRoomVisitListType("IN_PROGRESS")}
                          clickable
                        />
                      </Stack>
                      <Stack spacing={0.45} sx={{ mt: 2 }}>
                        <Typography sx={{ color: "var(--muted)", fontSize: 14, textAlign: "center" }}>
                          현재 환자: {currentRoom.currentPatient}
                        </Typography>
                        <Typography sx={{ color: "var(--muted)", fontSize: 14, textAlign: "center" }}>
                          대기 환자: {currentRoom.waitingPatients.slice(0, 3).join(", ") || "-"}
                        </Typography>
                      </Stack>
                      <Stack direction="row" spacing={0.9} justifyContent="center" sx={{ mt: "auto", pt: 2 }}>
                        {roomDashboardRows.map((room, idx) => (
                          <Box
                            key={room.key}
                            component="button"
                            type="button"
                            onClick={() => setCurrentRoomIndex(idx)}
                            sx={{
                              width: 10,
                              height: 10,
                              borderRadius: "50%",
                              border: 0,
                              p: 0,
                              cursor: "pointer",
                              bgcolor: idx === currentRoomIndex ? "var(--brand-strong)" : "#b7c7de",
                            }}
                          />
                        ))}
                      </Stack>
                    </Stack>
                  ) : (
                    <Typography sx={{ color: "var(--muted)", fontSize: 14, mt: 1.2 }}>
                      활성 진료실 정보가 없습니다.
                    </Typography>
                  )}
                </CardContent>
              </Card>

              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, justifyContent: "center" }}>
                <Card
                  onClick={() => setIsRegisterOpen(true)}
                  sx={{
                    border: "1px solid #dbe4f0",
                    width: 460,
                    height: 328,
                    borderRadius: 3,
                    cursor: "pointer",
                    display: "flex",
                    transition: "transform .12s ease, box-shadow .12s ease",
                    "&:hover": { transform: "translateY(-2px)", boxShadow: "var(--shadow-2)" },
                  }}
                >
                  <CardContent
                    sx={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      textAlign: "center",
                      py: 0,
                    }}
                  >
                    <Typography sx={{ fontWeight: 800, fontSize: 20 }}>신규환자를 등록하시겠습니까?</Typography>
                  </CardContent>
                </Card>

                <Card sx={{ border: "1px solid #dbe4f0", width: 460, minHeight: 210, height: 328, borderRadius: 3 }}>
                  <CardContent sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                      <Typography sx={{ color: "#4b5f7a", fontSize: 14, fontWeight: 800 }}>
                        접수신청 대기 {receptionRequestRows.length}명
                      </Typography>
                      <Typography sx={{ color: "var(--muted)", fontSize: 12 }}>
                        {formatLiveDateTime(liveNow)}
                      </Typography>
                    </Stack>
                    <Tabs
                      value={requestListTab}
                      onChange={(_, value) => setRequestListTab(value)}
                      sx={{ minHeight: 34, mb: 0.6, "& .MuiTab-root": { minHeight: 34, py: 0, fontSize: 12 } }}
                    >
                      <Tab value="REQUEST" label={`일반 ${receptionRequestRows.length}`} />
                      <Tab value="RESERVATION" label={`예약 ${reservationRequestRows.length}`} />
                    </Tabs>
                    <Stack spacing={1} sx={{ minHeight: 216, flex: 1 }}>
                    {!previewReceptionRequests.length ? (
                      <Typography sx={{ fontSize: 14, color: "var(--muted)" }}>
                        {requestListTab === "REQUEST" ? "현재 접수신청건이 없습니다." : "현재 예약 접수건이 없습니다."}
                      </Typography>
                    ) : previewReceptionRequests.map((v) => {
                      const patient = getVisitPatientInfo(v);
                      const compactMeta = `${getAgeText(patient?.birthDate)} · ${getGenderText(patient?.gender)}`;
                      return (
                        <Box
                          key={v.id}
                          sx={{
                            border: "1px solid var(--line)",
                            borderRadius: 2,
                            px: 1.1,
                            cursor: "pointer",
                            minHeight: 56,
                            display: "flex",
                            alignItems: "center",
                            transition: "border-color .14s ease",
                            "&:hover": {
                              borderColor: "#b9c9df",
                            },
                          }}
                          onClick={() => openRequestConfirmModal(v)}
                        >
                          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ width: "100%" }}>
                            <Typography sx={{ fontWeight: 700 }} noWrap>
                              {(v.patientName || patient?.name || "-") + ` (${compactMeta})`}
                            </Typography>
                            {(v.visitType || "").toUpperCase() === "RESERVATION" ? (
                              <CalendarMonthRoundedIcon sx={{ fontSize: 18, color: "#3b82f6" }} />
                            ) : null}
                          </Stack>
                        </Box>
                      );
                    })}
                      <Box sx={{ minHeight: 40, display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
                        {activeRequestRows.length > REQUEST_PREVIEW_ROWS ? (
                          <IconButton size="small" sx={{ p: 0.5 }} onClick={() => setRequestDialogOpen(true)}>
                            <MoreHorizRoundedIcon fontSize="small" />
                          </IconButton>
                        ) : null}
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Box>
            </Stack>
          </Box>
        ) : null}

        {!isDashboardRoute ? (
        <>

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={1.5}
          sx={{ flexWrap: "wrap" }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              overflow: "hidden",
              maxWidth: isQueuePanelCollapsed ? 0 : 360,
              opacity: isQueuePanelCollapsed ? 0 : 1,
              transform: isQueuePanelCollapsed
                ? "translate3d(-10px,0,0) rotateY(12deg)"
                : "translate3d(0,0,0) rotateY(0deg)",
              transformOrigin: "left center",
              transition: "max-width .28s cubic-bezier(.2,.8,.2,1), opacity .22s ease, transform .28s ease",
            }}
          >
            {!isQueuePanelCollapsed ? (
              <Stack direction="row" alignItems="center" spacing={0.25}>
                <Tabs value={tab} onChange={(_, v) => { setTab(v); void loadVisits(); }}>
                  <Tab value="WAITING" label="대기" />
                  <Tab value="RESERVATION" label="예약" />
                  <Tab value="VISIT" label="진료" />
                </Tabs>
                <IconButton size="small" onClick={() => setIsQueuePanelCollapsed(true)}>
                  <KeyboardDoubleArrowLeftRoundedIcon fontSize="small" />
                </IconButton>
              </Stack>
            ) : null}
          </Box>

          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              onClick={() => {
                setSearchInput("");
                setSearchModalPatients([]);
                setSearchModalHasMore(false);
                setSearchModalPage(1);
                setIsSearchModalOpen(true);
              }}
              disabled={loadingPatients}
              sx={{ minWidth: 100 }}
            >
              환자 조회
            </Button>
            <Button variant="outlined" onClick={() => setIsRegisterOpen(true)} sx={{ minWidth: 120 }}>
              신규환자 등록
            </Button>
          </Stack>
        </Stack>

        {/* 환자 선택 카드 제거 - 사이드바 목록으로 대체되었습니다 */}

        {tab === "WAITING" ? (
          <Box sx={{ display: "flex", gap: 1.2 }}>
            <Box
              sx={{
                width: isQueuePanelCollapsed ? 44 : 320,
                borderRight: "1px solid var(--line)",
                pr: isQueuePanelCollapsed ? 0 : 1.5,
                transform: isQueuePanelCollapsed
                  ? "translate3d(-12px,0,0) scale3d(0.92,1,1)"
                  : "translate3d(0,0,0) scale3d(1,1,1)",
                transformOrigin: "left center",
                opacity: isQueuePanelCollapsed ? 0.92 : 1,
                transition: "width .28s cubic-bezier(.2,.8,.2,1), transform .26s ease, opacity .2s ease",
                animation: isQueuePanelCollapsed
                  ? "queuePanelFold .24s ease both"
                  : "queuePanelUnfold .24s ease both",
                '@keyframes queuePanelFold': {
                  from: { transform: "translate3d(0,0,0) scale3d(1,1,1)", opacity: 1 },
                  to: { transform: "translate3d(-12px,0,0) scale3d(0.92,1,1)", opacity: 0.92 },
                },
                '@keyframes queuePanelUnfold': {
                  from: { transform: "translate3d(-12px,0,0) scale3d(0.92,1,1)", opacity: 0.92 },
                  to: { transform: "translate3d(0,0,0) scale3d(1,1,1)", opacity: 1 },
                },
              }}
            >
              {isQueuePanelCollapsed ? (
                <Stack
                  alignItems="center"
                  justifyContent="center"
                  sx={{
                    height: { xs: "48vh", lg: "calc(100vh - 320px)" },
                    animation: "queueRailPulse .4s ease",
                    '@keyframes queueRailPulse': {
                      from: { transform: "translate3d(-4px,0,0)", opacity: 0.75 },
                      to: { transform: "translate3d(0,0,0)", opacity: 1 },
                    },
                  }}
                >
                  <IconButton size="small" onClick={() => setIsQueuePanelCollapsed(false)}>
                    <KeyboardDoubleArrowRightRoundedIcon fontSize="small" />
                  </IconButton>
                </Stack>
              ) : (
                <Box sx={{ display: "flex", flexDirection: "column", height: { xs: "48vh", lg: "calc(100vh - 320px)" } }}>
                  <Box
                    sx={{
                      flex: 1,
                      overflowY: "auto",
                      '&::-webkit-scrollbar': { width: 6 },
                      '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
                      '&::-webkit-scrollbar-thumb': { bgcolor: 'divider', borderRadius: 3 },
                      '&::-webkit-scrollbar-thumb:hover': { bgcolor: 'grey.400' }
                    }}
                  >
                    <List component="nav" aria-label="환자 목록" sx={{ width: '100%' }}>
                      {pagedVisits.map((v) => {
                        const p = visitPatientMap[v.patientId];
                        return (
                        <ListItemButton
                          key={v.id}
                          selected={selectedPatientId === v.patientId}
                          onClick={() => handleVisitClick(v)}
                          onContextMenu={(e) => openContextMenu(e, v)}
                          sx={{
                            py: 0.8,
                            mb: 0.45,
                            borderRadius: 1,
                            border: '1px solid',
                            borderColor: selectedPatientId === v.patientId ? 'primary.main' : 'divider',
                            bgcolor: selectedPatientId === v.patientId ? 'action.selected' : 'background.paper',
                            '&:hover': { bgcolor: 'action.hover' }
                          }}
                        >
                          <ListItemText
                            primary={
                              <Box>
                                <Typography sx={{ fontWeight: 700, fontSize: 14 }}>{v.patientName}</Typography>
                                <Stack direction="row" spacing={2} sx={{ mt: 0.5 }}>
                                  <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
                                    {getGenderText(p?.gender)} {getAgeText(p?.birthDate)}
                                  </Typography>
                                  <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
                                    📱 {v.patientPhone || '-'}
                                  </Typography>
                                </Stack>
                              </Box>
                            }
                          />
                        </ListItemButton>
                        );
                      })}
                      {!pagedVisits.length ? (
                        <ListItemButton disabled>
                          <ListItemText primary="대기 환자가 없습니다." />
                        </ListItemButton>
                      ) : null}
                    </List>
                  </Box>
                  {filteredVisits.length > VISIT_ROWS_PER_PAGE ? (
                    <Stack direction="row" justifyContent="center" sx={{ pt: 0.8 }}>
                      <Pagination
                        size="small"
                        count={visitPageCount}
                        page={visitPage}
                        onChange={(_, next) => setVisitPageByTab((prev) => ({ ...prev, [tab]: next }))}
                      />
                    </Stack>
                  ) : null}
                </Box>
              )}
            </Box>

            {/* 오른쪽: 선택된 환자의 상세 정보 또는 안내 */}
            <Box sx={{ flex: 1, minHeight: 320 }}>
              {renderVisitEditPanel()}
            </Box>
          </Box>
        ) : null}

        {tab === "RESERVATION" ? (
          <Box sx={{ display: "flex", gap: 1.2 }}>
            <Box
              sx={{
                width: isQueuePanelCollapsed ? 44 : 320,
                borderRight: "1px solid var(--line)",
                pr: isQueuePanelCollapsed ? 0 : 1.5,
                transition: "width .18s ease",
              }}
            >
              {isQueuePanelCollapsed ? (
                <Stack alignItems="center" justifyContent="center" sx={{ height: { xs: "48vh", lg: "calc(100vh - 320px)" } }}>
                  <IconButton size="small" onClick={() => setIsQueuePanelCollapsed(false)}>
                    <KeyboardDoubleArrowRightRoundedIcon fontSize="small" />
                  </IconButton>
                </Stack>
              ) : (
                <Box sx={{ display: "flex", flexDirection: "column", height: { xs: "48vh", lg: "calc(100vh - 320px)" } }}>
                  <Stack direction="row" justifyContent="flex-start" alignItems="center" sx={{ px: 0.5, pb: 0.4 }}>
                    <Stack direction="row" spacing={0.6} alignItems="center">
                      <IconButton
                        size="small"
                        onClick={() => {
                          const el = reservationDateInputRef.current;
                          if (!el) return;
                          if (typeof (el as HTMLInputElement & { showPicker?: () => void }).showPicker === "function") {
                            (el as HTMLInputElement & { showPicker?: () => void }).showPicker?.();
                          } else {
                            el.focus();
                            el.click();
                          }
                        }}
                      >
                        <CalendarMonthRoundedIcon fontSize="small" />
                      </IconButton>
                      <input
                        ref={reservationDateInputRef}
                        type="date"
                        value={reservationFilterDate}
                        onChange={(e) => {
                          setReservationFilterDate(e.target.value);
                          setVisitPageByTab((prev) => ({ ...prev, RESERVATION: 1 }));
                        }}
                        style={{ position: "absolute", width: 0, height: 0, opacity: 0, pointerEvents: "none" }}
                        aria-label="예약 날짜 선택"
                      />
                      {reservationFilterDate ? (
                        <Button
                          size="small"
                          variant="text"
                          onClick={() => {
                            setReservationFilterDate("");
                            setVisitPageByTab((prev) => ({ ...prev, RESERVATION: 1 }));
                          }}
                      >
                        전체
                      </Button>
                    ) : null}
                    </Stack>
                  </Stack>
                  <Box
                    sx={{
                      flex: 1,
                      overflowY: "auto",
                      '&::-webkit-scrollbar': { width: 6 },
                      '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
                      '&::-webkit-scrollbar-thumb': { bgcolor: 'divider', borderRadius: 3 },
                      '&::-webkit-scrollbar-thumb:hover': { bgcolor: 'grey.400' }
                    }}
                  >
                    <List component="nav" aria-label="환자 목록" sx={{ width: '100%' }}>
                      {pagedVisits.map((v) => {
                        const p = visitPatientMap[v.patientId];
                        return (
                        <ListItemButton
                          key={v.id}
                          selected={selectedPatientId === v.patientId}
                          onClick={() => handleVisitClick(v)}
                          onContextMenu={(e) => openContextMenu(e, v)}
                          sx={{
                            py: 0.8,
                            mb: 0.45,
                            borderRadius: 1,
                            border: '1px solid',
                            borderColor: selectedPatientId === v.patientId ? 'primary.main' : 'divider',
                            bgcolor: selectedPatientId === v.patientId ? 'action.selected' : 'background.paper',
                            '&:hover': { bgcolor: 'action.hover' }
                          }}
                        >
                          <ListItemText
                            primary={
                              <Box>
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <Typography sx={{ fontWeight: 700, fontSize: 14 }}>{v.patientName}</Typography>
                                  <Chip label="예약" size="small" sx={{ height: 16, fontSize: 10 }} color="warning" />
                                </Stack>
                                <Stack direction="row" spacing={2} sx={{ mt: 0.5 }}>
                                  <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
                                    {getGenderText(p?.gender)} {getAgeText(p?.birthDate)}
                                  </Typography>
                                  <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
                                    📅 {formatDateTime(v.scheduledAt || v.createdAt)}
                                  </Typography>
                                </Stack>
                              </Box>
                            }
                          />
                        </ListItemButton>
                        );
                      })}
                      {!pagedVisits.length ? (
                        <ListItemButton disabled>
                          <ListItemText primary="예약 환자가 없습니다." />
                        </ListItemButton>
                      ) : null}
                    </List>
                  </Box>
                  {filteredVisits.length > VISIT_ROWS_PER_PAGE ? (
                    <Stack direction="row" justifyContent="center" sx={{ pt: 0.8 }}>
                      <Pagination
                        size="small"
                        count={visitPageCount}
                        page={visitPage}
                        onChange={(_, next) => setVisitPageByTab((prev) => ({ ...prev, [tab]: next }))}
                      />
                    </Stack>
                  ) : null}
                </Box>
              )}
            </Box>

            {/* 오른쪽: 선택된 환자의 상세 정보 또는 안내 */}
            <Box sx={{ flex: 1, minHeight: 320 }}>
              {renderVisitEditPanel()}
            </Box>
          </Box>
        ) : null}

        {tab === "VISIT" ? (
          <Box sx={{ display: "flex", gap: 1.2 }}>
            <Box
              sx={{
                width: isQueuePanelCollapsed ? 44 : 320,
                borderRight: "1px solid var(--line)",
                pr: isQueuePanelCollapsed ? 0 : 1.5,
                transition: "width .18s ease",
              }}
            >
              {isQueuePanelCollapsed ? (
                <Stack alignItems="center" justifyContent="center" sx={{ height: { xs: "48vh", lg: "calc(100vh - 320px)" } }}>
                  <IconButton size="small" onClick={() => setIsQueuePanelCollapsed(false)}>
                    <KeyboardDoubleArrowRightRoundedIcon fontSize="small" />
                  </IconButton>
                </Stack>
              ) : (
                <Box sx={{ display: "flex", flexDirection: "column", height: { xs: "48vh", lg: "calc(100vh - 320px)" } }}>
                  <Box
                    sx={{
                      flex: 1,
                      overflowY: "auto",
                      '&::-webkit-scrollbar': { width: 6 },
                      '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
                      '&::-webkit-scrollbar-thumb': { bgcolor: 'divider', borderRadius: 3 },
                      '&::-webkit-scrollbar-thumb:hover': { bgcolor: 'grey.400' }
                    }}
                  >
                    <List component="nav" aria-label="환자 목록" sx={{ width: '100%' }}>
                      {pagedVisits.map((v) => {
                        const p = visitPatientMap[v.patientId];
                        return (
                        <ListItemButton
                          key={v.id}
                          selected={selectedPatientId === v.patientId}
                          onClick={() => handleVisitClick(v)}
                          onContextMenu={(e) => openContextMenu(e, v)}
                          sx={{
                            py: 0.8,
                            mb: 0.45,
                            borderRadius: 1,
                            border: '1px solid',
                            borderColor: selectedPatientId === v.patientId ? 'primary.main' : 'divider',
                            bgcolor: selectedPatientId === v.patientId ? 'action.selected' : 'background.paper',
                            '&:hover': { bgcolor: 'action.hover' }
                          }}
                        >
                          <ListItemText
                            primary={
                              <Box>
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <Typography sx={{ fontWeight: 700, fontSize: 14 }}>{v.patientName}</Typography>
                                  <Chip
                                    label={(v.status || "").toUpperCase() === "IN_PROGRESS" ? "진료중" : "진료대기"}
                                    size="small"
                                    sx={{ height: 16, fontSize: 10 }}
                                    color={(v.status || "").toUpperCase() === "IN_PROGRESS" ? "success" : "default"}
                                  />
                                </Stack>
                                <Stack direction="row" spacing={2} sx={{ mt: 0.5 }}>
                                  <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
                                    {getGenderText(p?.gender)} {getAgeText(p?.birthDate)}
                                  </Typography>
                                  <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
                                    📱 {v.patientPhone || '-'}
                                  </Typography>
                                </Stack>
                              </Box>
                            }
                          />
                        </ListItemButton>
                        );
                      })}
                      {!pagedVisits.length ? (
                        <ListItemButton disabled>
                          <ListItemText primary="진료 중인 환자가 없습니다." />
                        </ListItemButton>
                      ) : null}
                    </List>
                  </Box>
                  {filteredVisits.length > VISIT_ROWS_PER_PAGE ? (
                    <Stack direction="row" justifyContent="center" sx={{ pt: 0.8 }}>
                      <Pagination
                        size="small"
                        count={visitPageCount}
                        page={visitPage}
                        onChange={(_, next) => setVisitPageByTab((prev) => ({ ...prev, [tab]: next }))}
                      />
                    </Stack>
                  ) : null}
                </Box>
              )}
            </Box>

            {/* 오른쪽: 선택된 환자의 상세 정보 또는 안내 */}
            <Box sx={{ flex: 1, minHeight: 320 }}>
              {renderVisitEditPanel()}
            </Box>
          </Box>
        ) : null}
        </>
        ) : null}
      </Stack>

      <Menu
        open={Boolean(contextMenu)}
        onClose={closeContextMenu}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        <MenuItem
          disabled={!contextMenu || contextActionVisitId === contextMenu.visit.id}
          onClick={() => contextMenu && void moveToTreatmentRoom(contextMenu.visit)}
        >
          진료실로 이동
        </MenuItem>
        <MenuItem
          disabled={!contextMenu || contextActionVisitId === contextMenu.visit.id}
          onClick={() => contextMenu && void convertToReservation(contextMenu.visit)}
        >
          예약하기
        </MenuItem>
        <MenuItem
          disabled={!contextMenu || contextActionVisitId === contextMenu.visit.id}
          onClick={() => contextMenu && void cancelVisit(contextMenu.visit)}
        >
          취소하기
        </MenuItem>

        <Divider />

        <MenuItem
          disabled={!contextMenu || contextActionVisitId === contextMenu.visit.id}
          onClick={() => contextMenu && void markPriority(contextMenu.visit)}
        >
          우선진료로 올리기
        </MenuItem>
        <MenuItem
          disabled={!contextMenu}
          onClick={() => {
            if (!contextMenu) return;
            handleVisitClick(contextMenu.visit);
            closeContextMenu();
          }}
        >
          접수정보 수정
        </MenuItem>
        <MenuItem
          disabled={!contextMenu}
          onClick={() => {
            if (!contextMenu) return;
            router.push(`/patients/${contextMenu.visit.patientId}`);
            closeContextMenu();
          }}
        >
          환자정보 보기
        </MenuItem>

        <Divider />

        <MenuItem
          disabled={!contextMenu || contextActionVisitId === contextMenu.visit.id}
          onClick={() => contextMenu && void callPatient(contextMenu.visit)}
        >
          호출처리
        </MenuItem>
        <MenuItem
          disabled={!contextMenu || contextActionVisitId === contextMenu.visit.id}
          onClick={() => contextMenu && void markNoShow(contextMenu.visit)}
        >
          노쇼처리
        </MenuItem>
      </Menu>

      <Dialog open={Boolean(roomVisitListType && currentRoom)} onClose={() => setRoomVisitListType(null)} fullWidth maxWidth="sm">
        <DialogTitle>
          {currentRoom?.roomName || "진료실"} · {roomVisitListType === "WAITING" ? "진료 대기" : roomVisitListType === "RESERVATION" ? "진료 예약" : "진료 진행중"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={1} sx={{ mt: 0.6 }}>
            {!currentRoomVisitRows.length ? (
              <Typography sx={{ fontSize: 14, color: "var(--muted)" }}>해당 목록의 환자가 없습니다.</Typography>
            ) : (
              currentRoomVisitRows.map((v) => {
                const p = getVisitPatientInfo(v);
                return (
                  <Box
                    key={v.id}
                    sx={{ border: "1px solid var(--line)", borderRadius: 2, px: 1.1, py: 0.9, cursor: "pointer" }}
                    onClick={() => setRoomPatientModalVisit(v)}
                  >
                    <Typography sx={{ fontWeight: 700 }}>
                      {(v.patientName || p?.name || "-") + ` (${getAgeText(p?.birthDate)} · ${getGenderText(p?.gender)})`}
                    </Typography>
                    {roomVisitListType === "RESERVATION" ? (
                      <Typography sx={{ fontSize: 12, color: "var(--muted)", mt: 0.2 }}>
                        예약: {formatDateTime(v.scheduledAt || v.createdAt)}
                      </Typography>
                    ) : null}
                  </Box>
                );
              })
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRoomVisitListType(null)}>닫기</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(roomPatientModalVisit)} onClose={() => setRoomPatientModalVisit(null)} fullWidth maxWidth="xs">
        <DialogTitle>환자 정보</DialogTitle>
        <DialogContent>
          {roomPatientModalVisit ? (
            <Stack spacing={0.7} sx={{ mt: 0.6 }}>
              <Typography sx={{ fontWeight: 700 }}>{roomPatientModalVisit.patientName || roomPatientModalPatient?.name || "-"}</Typography>
              <Typography sx={{ fontSize: 13, color: "var(--muted)" }}>
                {getAgeText(roomPatientModalPatient?.birthDate)} · {getGenderText(roomPatientModalPatient?.gender)}
              </Typography>
              <Typography sx={{ fontSize: 13, color: "var(--muted)" }}>
                환자번호: {roomPatientModalVisit.patientNo || roomPatientModalPatient?.patientNo || "-"}
              </Typography>
              <Typography sx={{ fontSize: 13, color: "var(--muted)" }}>
                연락처: {roomPatientModalVisit.patientPhone || roomPatientModalPatient?.phone || "-"}
              </Typography>
              <Typography sx={{ fontSize: 13, color: "var(--muted)" }}>
                주소: {roomPatientModalPatient?.address || "-"}
              </Typography>
              <Typography sx={{ fontSize: 13, color: "var(--muted)" }}>
                메모: {roomPatientModalVisit.memo || roomPatientModalPatient?.note || "-"}
              </Typography>
              {(roomPatientModalVisit.visitType || "").toUpperCase() === "RESERVATION" ? (
                <>
                  <Divider sx={{ my: 0.4 }} />
                  <Typography sx={{ fontSize: 12, color: "var(--muted)", fontWeight: 700 }}>예약 정보</Typography>
                  <Typography sx={{ fontSize: 13, color: "var(--muted)" }}>
                    예약일시: {formatDateTime(roomPatientModalVisit.scheduledAt || roomPatientModalVisit.createdAt)}
                  </Typography>
                  <Typography sx={{ fontSize: 13, color: "var(--muted)" }}>
                    예약메모: {roomPatientModalVisit.reservationNote || "-"}
                  </Typography>
                </>
              ) : null}
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRoomPatientModalVisit(null)}>닫기</Button>
        </DialogActions>
      </Dialog>

      <PatientRegisterModal
        open={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSubmit={handleModalSubmit}
        onSubmitAndReception={handleModalSubmitAndReception}
      />
      <PatientSearchModal 
        open={isSearchModalOpen} 
        onClose={() => setIsSearchModalOpen(false)}
        onSelect={handleSearchModalSelect}
        patients={searchModalPatients}
        loading={loadingPatients}
        onLoadMore={loadSearchModalMore}
        hasMore={searchModalHasMore}
        onSearch={loadSearchModalFirstPage}
        onSuccess={loadVisits}
      />
      <ReceptionModal
        open={registerReceptionOpen}
        onClose={() => {
          setRegisterReceptionOpen(false);
          setRegisterReceptionPatient(null);
        }}
        patient={registerReceptionPatient}
        onSuccess={loadVisits}
      />
      <Dialog open={requestDialogOpen} onClose={() => setRequestDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>접수신청 목록</DialogTitle>
        <DialogContent>
          <Tabs
            value={requestListTab}
            onChange={(_, value) => setRequestListTab(value)}
            sx={{ minHeight: 36, mb: 1, "& .MuiTab-root": { minHeight: 36, py: 0, fontSize: 12 } }}
          >
            <Tab value="REQUEST" label={`일반 ${receptionRequestRows.length}`} />
            <Tab value="RESERVATION" label={`예약 ${reservationRequestRows.length}`} />
          </Tabs>
          <Stack spacing={1} sx={{ mt: 0.5 }}>
            {pagedReceptionRequestRows.map((v) => {
              const patient = getVisitPatientInfo(v);
              const compactMeta = `${getAgeText(patient?.birthDate)} · ${getGenderText(patient?.gender)}`;
              return (
                <Box
                  key={v.id}
                  sx={{
                    border: "1px solid var(--line)",
                    borderRadius: 2,
                    px: 1.2,
                    cursor: "pointer",
                    minHeight: 58,
                    display: "flex",
                    alignItems: "center",
                    transition: "border-color .14s ease",
                    "&:hover": {
                      borderColor: "#b9c9df",
                    },
                  }}
                  onClick={() => openRequestConfirmModal(v)}
                >
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ width: "100%" }}>
                    <Typography sx={{ fontWeight: 700 }} noWrap>
                      {(v.patientName || patient?.name || "-") + ` (${compactMeta})`}
                    </Typography>
                    {(v.visitType || "").toUpperCase() === "RESERVATION" ? (
                      <CalendarMonthRoundedIcon sx={{ fontSize: 18, color: "#3b82f6" }} />
                    ) : null}
                  </Stack>
                </Box>
              );
            })}
            {!activeRequestRows.length ? (
              <Typography sx={{ fontSize: 14, color: "var(--muted)" }}>
                {requestListTab === "REQUEST" ? "현재 접수신청건이 없습니다." : "현재 예약 접수건이 없습니다."}
              </Typography>
            ) : null}
            {activeRequestRows.length > REQUEST_DIALOG_ROWS_PER_PAGE ? (
              <Stack direction="row" justifyContent="center" sx={{ pt: 0.5 }}>
                <Pagination
                  size="small"
                  count={requestDialogPageCount}
                  page={requestDialogPage}
                  onChange={(_, nextPage) => setRequestDialogPage(nextPage)}
                />
              </Stack>
            ) : null}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRequestDialogOpen(false)}>닫기</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(requestConfirmVisit)} onClose={closeRequestConfirmModal} fullWidth maxWidth="sm">
        <DialogTitle>접수 진행</DialogTitle>
        <DialogContent>
          {requestConfirmVisit ? (
            <Stack spacing={0.9} sx={{ mt: 0.6 }}>
              <Typography sx={{ fontWeight: 700 }}>
                {requestConfirmVisit.patientName || requestConfirmPatient?.name || "-"}
              </Typography>
              <Typography sx={{ fontSize: 13, color: "var(--muted)" }}>
                {getAgeText(requestConfirmPatient?.birthDate)} · {getGenderText(requestConfirmPatient?.gender)}
              </Typography>
              <Divider sx={{ my: 0.4 }} />
              <Typography sx={{ fontSize: 12, color: "var(--muted)", fontWeight: 700 }}>환자 인적 정보</Typography>
              <Typography sx={{ fontSize: 13, color: "var(--muted)" }}>
                생년월일: {requestConfirmPatient?.birthDate || requestConfirmDetail?.birthDate || "-"}
              </Typography>
              <Typography sx={{ fontSize: 13, color: "var(--muted)" }}>
                연락처: {requestConfirmPatient?.phone || requestConfirmDetail?.phone || "-"} · 보호자: {requestConfirmDetail?.guardianPhone || "-"}
              </Typography>
              <Typography sx={{ fontSize: 13, color: "var(--muted)" }}>
                주소: {requestConfirmDetail?.address || requestConfirmPatient?.address || "-"}
              </Typography>

              <Divider sx={{ my: 0.4 }} />
              <Typography sx={{ fontSize: 12, color: "var(--muted)", fontWeight: 700 }}>최근 방문 이력</Typography>
              {!requestConfirmRecentRows.length ? (
                <Typography sx={{ fontSize: 13, color: "var(--muted)" }}>최근 방문 이력 없음</Typography>
              ) : (
                <Stack spacing={0.8}>
                  {requestConfirmRecentRows.map((v) => (
                    <Box key={v.id} sx={{ border: "1px solid var(--line)", borderRadius: 1.5, px: 1, py: 0.8 }}>
                      <Typography sx={{ fontSize: 12.5, color: "var(--muted)", fontWeight: 700 }}>
                        {formatVisitHistoryDate(v.createdAt)}
                      </Typography>
                      <Typography sx={{ fontSize: 12.5, color: "var(--muted)", mt: 0.2 }}>
                        증상: {v.memo || "증상 메모 없음"}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              )}
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeRequestConfirmModal} disabled={requestActionVisitId === requestConfirmVisit?.id}>취소</Button>
          <Button
            variant="contained"
            onClick={() => requestConfirmVisit && void handleRegisterFromRequest(requestConfirmVisit)}
            disabled={!requestConfirmVisit || requestActionVisitId === requestConfirmVisit.id}
          >
            {requestActionVisitId === requestConfirmVisit?.id ? "처리중" : "접수 처리"}
          </Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
}
