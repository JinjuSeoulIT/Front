"use client";

import * as React from "react";
import Link from "next/link";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogContent,
  Divider,
  IconButton,
  InputAdornment,
  MenuItem,
  Pagination,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import ListAltIcon from "@mui/icons-material/ListAlt";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/store/store";
import { receptionActions } from "@/features/Reception/ReceptionSlice";
import type {
  Reception,
  ReceptionSearchPayload,
} from "@/features/Reception/ReceptionTypes";
import { formatDepartmentName } from "@/lib/common/departmentLabel";
import type { Patient } from "@/features/patients/patientTypes";
import { fetchPatientsApi, searchPatientsApi } from "@/lib/patient/patientApi";
import { fetchReservationsApi, updateReservationApi } from "@/lib/reception/reservationAdminApi";
import {
  cancelReceptionApi,
  createReceptionApi,
  fetchReceptionsApi,
} from "@/lib/reception/receptionApi";

const TAB_LABELS = ["기본정보", "진료기록", "검사", "처방", "입원"];

const visitTypeLabel = (value?: string | null) => {
  switch (value) {
    case "OUTPATIENT":
      return "외래";
    case "EMERGENCY":
      return "응급";
    case "INPATIENT":
      return "입원";
    default:
      return value ?? "-";
  }
};

const ITEMS_PER_PAGE = 10;
const PATIENT_LIST_ITEMS_PER_PAGE = 8;
const RECEPTION_LIST_REFRESH_INTERVAL_MS = 5000;
const OUTPATIENT_DEPARTMENTS = [
  { id: 1, name: "내과" },
  { id: 2, name: "정형외과" },
  { id: 3, name: "소아과" },
  { id: 4, name: "이비인후과" },
  { id: 5, name: "피부과" },
];

const OUTPATIENT_DOCTORS = [
  { id: 1, name: "송태민", departmentId: 1 },
  { id: 2, name: "이현석", departmentId: 2 },
  { id: 3, name: "성숙희", departmentId: 3 },
  { id: 4, name: "최효정", departmentId: 4 },
  { id: 5, name: "홍예진", departmentId: 5 },
];

const statusLabel = (value?: string | null) => {
  switch (value) {
    case "WAITING":
      return "대기";
    case "CALLED":
      return "호출";
    case "IN_PROGRESS":
      return "진료중";
    case "COMPLETED":
      return "완료";
    case "PAYMENT_WAIT":
      return "수납대기";
    case "ON_HOLD":
      return "보류";
    case "CANCELED":
    case "CANCELLED":
      return "취소";
    case "INACTIVE":
      return "비활성";
    default:
      return value ?? "-";
  }
};

const normalizeStatus = (value?: string | null) => {
  if (!value) return value;
  const trimmed = value.trim();
  switch (trimmed) {
    case "대기":
      return "WAITING";
    case "호출":
      return "CALLED";
    case "진료중":
      return "IN_PROGRESS";
    case "완료":
      return "COMPLETED";
    case "수납대기":
      return "PAYMENT_WAIT";
    case "보류":
      return "ON_HOLD";
    case "취소":
    case "CANCELLED":
      return "CANCELED";
    case "비활성":
      return "INACTIVE";
    default:
      return trimmed;
  }
};

const statusChipSx = (value?: string | null) => {
  switch (normalizeStatus(value)) {
    case "WAITING":
      return {
        color: "#ffffff",
        bgcolor: "#1f5fb8",
      };
    case "IN_PROGRESS":
      return {
        color: "#ffffff",
        bgcolor: "#2e7d32",
      };
    case "CALLED":
      return {
        color: "#ffffff",
        bgcolor: "#8e24aa",
      };
    case "COMPLETED":
      return {
        color: "#ffffff",
        bgcolor: "#455a64",
      };
    case "PAYMENT_WAIT":
      return {
        color: "#ffffff",
        bgcolor: "#ef6c00",
      };
    case "ON_HOLD":
      return {
        color: "#ffffff",
        bgcolor: "#6d4c41",
      };
    case "CANCELED":
      return {
        color: "#ffffff",
        bgcolor: "#c62828",
      };
    case "INACTIVE":
      return {
        color: "#ffffff",
        bgcolor: "#607d8b",
      };
    default:
      return {
        color: "#ffffff",
        bgcolor: "#546e7a",
      };
  }
};

const genderLabel = (value?: string | null) => {
  if (!value) return "-";
  if (value === "M") return "남";
  if (value === "F") return "여";
  return value;
};

const resolveErrorMessage = (err: unknown, fallback: string) => {
  if (err instanceof Error && err.message) return err.message;
  return fallback;
};

const toLocalDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const extractDateKeyFromDateTime = (value?: string | null) => {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const head = trimmed.slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(head)) return head;
  return null;
};

const parseDateTimeToMillis = (value?: string | null) => {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const normalized = trimmed.includes("T") ? trimmed : trimmed.replace(" ", "T");
  const parsed = Date.parse(normalized);
  if (Number.isNaN(parsed)) return null;
  return parsed;
};

const toLocalTimeValue = (date: Date) => {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

const normalizeReservationStatus = (value?: string | null) => {
  if (!value) return value;
  const trimmed = value.trim();
  switch (trimmed) {
    case "예약":
      return "RESERVED";
    case "완료":
      return "COMPLETED";
    case "취소":
      return "CANCELED";
    case "비활성":
      return "INACTIVE";
    default:
      return trimmed;
  }
};

const isClosedReceptionStatus = (value?: string | null) => {
  const normalized = normalizeStatus(value);
  return normalized === "CANCELED" || normalized === "INACTIVE";
};

const extractDateKeyFromReceptionNo = (value?: string | null) => {
  if (!value) return null;
  const match = value.trim().match(/^(\d{4})(\d{2})(\d{2})-/);
  if (!match) return null;
  return `${match[1]}-${match[2]}-${match[3]}`;
};

const isTodayReception = (item: Reception, todayKey: string) => {
  const candidates = [
    // 접수 생성 기준 날짜만 사용하고, 수정일(updatedAt)은 제외한다.
    // updatedAt을 포함하면 과거 접수도 오늘 수정 시 오늘 목록으로 재노출될 수 있다.
    extractDateKeyFromReceptionNo(item.receptionNo),
    extractDateKeyFromDateTime(item.arrivedAt),
    extractDateKeyFromDateTime(item.scheduledAt),
    extractDateKeyFromDateTime(item.createdAt),
  ];
  return candidates.some((dateKey) => dateKey === todayKey);
};

const resolvePatientDisplayName = (
  item: Reception,
  patientNameById: Record<number, string>
) => {
  const fromMap = item.patientId ? patientNameById[item.patientId] : "";
  const fromReception = item.patientName?.trim() ?? "";
  if (fromMap) return fromMap;
  if (fromReception) return fromReception;
  if (item.patientId) return `환자 ${item.patientId}`;
  return "환자";
};

const resolveOutpatientDepartmentName = (item: Reception) => {
  const byId =
    item.departmentId != null
      ? OUTPATIENT_DEPARTMENTS.find((department) => department.id === item.departmentId)?.name
      : undefined;
  if (byId) return byId;
  return formatDepartmentName(item.departmentName, item.departmentId);
};

const resolveOutpatientDoctorName = (item: Reception) => {
  const byId =
    item.doctorId != null
      ? OUTPATIENT_DOCTORS.find((doctor) => doctor.id === item.doctorId)?.name
      : undefined;
  if (byId) return byId;
  return item.doctorName?.trim() || "";
};

const compareReceptionsByLatest = (a: Reception, b: Reception) => {
  const aCreatedAt = parseDateTimeToMillis(a.createdAt);
  const bCreatedAt = parseDateTimeToMillis(b.createdAt);
  if (aCreatedAt !== bCreatedAt) {
    if (aCreatedAt == null) return 1;
    if (bCreatedAt == null) return -1;
    return bCreatedAt - aCreatedAt;
  }

  const aArrivedAt = parseDateTimeToMillis(a.arrivedAt);
  const bArrivedAt = parseDateTimeToMillis(b.arrivedAt);
  if (aArrivedAt !== bArrivedAt) {
    if (aArrivedAt == null) return 1;
    if (bArrivedAt == null) return -1;
    return bArrivedAt - aArrivedAt;
  }

  return b.receptionId - a.receptionId;
};

type ReceptionListProps = {
  initialSearchType?: ReceptionSearchPayload["type"];
  initialKeyword?: string;
  autoSearch?: boolean;
};

export default function ReceptionList({
  initialSearchType = "patientName",
  initialKeyword = "",
  autoSearch = false,
}: ReceptionListProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { list, loading, error, selected } = useSelector(
    (s: RootState) => s.receptions
  );

  const [keyword, setKeyword] = React.useState(initialKeyword);
  const [tab, setTab] = React.useState(0);
  const [patientSuggestions, setPatientSuggestions] = React.useState<Patient[]>([]);
  const [openSuggestion, setOpenSuggestion] = React.useState(false);
  const [patientSearchResultCount, setPatientSearchResultCount] = React.useState<number | null>(null);
  const [createModalOpen, setCreateModalOpen] = React.useState(false);
  const [patientListModalOpen, setPatientListModalOpen] = React.useState(false);
  const [patientListKeyword, setPatientListKeyword] = React.useState("");
  const [patientListPage, setPatientListPage] = React.useState(1);
  const [patientCatalog, setPatientCatalog] = React.useState<Patient[]>([]);
  const [patientCatalogLoading, setPatientCatalogLoading] = React.useState(false);
  const [patientCatalogError, setPatientCatalogError] = React.useState<string | null>(null);
  const [createTargetPatient, setCreateTargetPatient] = React.useState<{
    patientId: number | null;
    patientName: string;
  }>({
    patientId: null,
    patientName: "",
  });
  const [createModalForm, setCreateModalForm] = React.useState<{
    departmentId: number;
    doctorId: number | null;
    arrivedTime: string;
    note: string;
  }>({
    departmentId: 0,
    doctorId: null,
    arrivedTime: toLocalTimeValue(new Date()),
    note: "",
  });
  const [patientNameById, setPatientNameById] = React.useState<Record<number, string>>({});
  const [todayKey, setTodayKey] = React.useState(() => toLocalDateKey(new Date()));
  const [page, setPage] = React.useState(1);
  const syncingReservationRef = React.useRef(false);

  const syncTodayReservationsToWaitingReceptions = React.useCallback(async () => {
    if (syncingReservationRef.current) return;
    syncingReservationRef.current = true;

    try {
    const [reservations, receptions] = await Promise.all([
      fetchReservationsApi(),
      fetchReceptionsApi(),
    ]);
    const today = toLocalDateKey(new Date());
    const receptionsToday = receptions.filter((item) => isTodayReception(item, today));
    const linkedReservationIds = new Set(
      receptionsToday
        .map((item) => item.reservationId)
        .filter((value): value is number => typeof value === "number")
    );
    const completeReservation = async (reservation: (typeof reservations)[number]) => {
      await updateReservationApi(String(reservation.reservationId), {
        reservationNo: reservation.reservationNo,
        patientId: reservation.patientId,
        patientName: reservation.patientName ?? null,
        departmentId: reservation.departmentId,
        departmentName: reservation.departmentName ?? null,
        doctorId: reservation.doctorId ?? null,
        doctorName: reservation.doctorName ?? null,
        reservedAt: reservation.reservedAt,
        status: "COMPLETED",
        note: reservation.note ?? "예약 당일 자동 접수 연계 완료",
      });
    };
    const activeReceptionsByReservation = new Map<number, Reception[]>();
    for (const item of receptionsToday) {
      if (typeof item.reservationId !== "number") continue;
      if (isClosedReceptionStatus(item.status)) continue;
      const current = activeReceptionsByReservation.get(item.reservationId) ?? [];
      current.push(item);
      activeReceptionsByReservation.set(item.reservationId, current);
    }

    for (const group of activeReceptionsByReservation.values()) {
      if (group.length <= 1) continue;
      const keeper = [...group].sort((a, b) => a.receptionId - b.receptionId)[0];

      for (const item of group) {
        if (item.receptionId === keeper.receptionId) continue;
        await cancelReceptionApi(
          String(item.receptionId),
          "예약 자동연계 중복 데이터 자동 정리"
        );
      }
    }

    const alreadyLinkedTargets = reservations
      .filter((item) => normalizeReservationStatus(item.status) === "RESERVED")
      .filter((item) => extractDateKeyFromDateTime(item.reservedAt) === today)
      .filter((item) => linkedReservationIds.has(item.reservationId));

    for (const reservation of alreadyLinkedTargets) {
      await completeReservation(reservation);
    }

    const targets = reservations
      .filter((item) => normalizeReservationStatus(item.status) === "RESERVED")
      .filter((item) => extractDateKeyFromDateTime(item.reservedAt) === today)
      .filter((item) => !linkedReservationIds.has(item.reservationId))
      .sort((a, b) => a.reservationId - b.reservationId);

    if (targets.length === 0) return;

    for (const reservation of targets) {
      if (linkedReservationIds.has(reservation.reservationId)) {
        await completeReservation(reservation);
        continue;
      }

      await createReceptionApi({
        receptionNo: "",
        patientId: reservation.patientId,
        patientName: reservation.patientName ?? null,
        visitType: "OUTPATIENT",
        departmentId: reservation.departmentId,
        departmentName: reservation.departmentName ?? null,
        doctorId: reservation.doctorId ?? null,
        doctorName: reservation.doctorName ?? null,
        reservationId: reservation.reservationId,
        scheduledAt: reservation.reservedAt,
        arrivedAt: null,
        status: "WAITING",
        note: reservation.note ?? "예약 당일 자동 접수 생성",
      });
      linkedReservationIds.add(reservation.reservationId);

      await completeReservation(reservation);
    }
    } finally {
      syncingReservationRef.current = false;
    }
  }, []);
  const isCanceledView = initialSearchType === "status" && initialKeyword === "CANCELED";
  const filteredList = React.useMemo(() => {
    const baseList = (isCanceledView
      ? list
      : list.filter((p) => normalizeStatus(p.status) !== "CANCELED")
    ).filter((p) => isTodayReception(p, todayKey));
    return [...baseList].sort(compareReceptionsByLatest);
  }, [isCanceledView, list, todayKey]);

  const refreshReceptionsByCurrentMode = React.useCallback(() => {
    const trimmedKeyword = initialKeyword.trim();
    if (autoSearch && trimmedKeyword) {
      dispatch(
        receptionActions.searchReceptionsRequest({
          type: initialSearchType,
          keyword: trimmedKeyword,
        })
      );
      return;
    }
    dispatch(receptionActions.fetchReceptionsRequest());
  }, [dispatch, autoSearch, initialKeyword, initialSearchType]);

  React.useEffect(() => {
    const initialize = async () => {
      if (autoSearch && initialKeyword.trim()) {
        refreshReceptionsByCurrentMode();
        return;
      }
      try {
        await syncTodayReservationsToWaitingReceptions();
      } catch (err: unknown) {
        dispatch(
          receptionActions.fetchReceptionsFailure(
            resolveErrorMessage(err, "예약 당일 자동 접수 생성 실패")
          )
        );
      }
      refreshReceptionsByCurrentMode();
    };

    void initialize();
  }, [
    dispatch,
    autoSearch,
    initialKeyword,
    initialSearchType,
    refreshReceptionsByCurrentMode,
    syncTodayReservationsToWaitingReceptions,
  ]);

  React.useEffect(() => {
    const now = new Date();
    const nextMidnight = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      0,
      0,
      1
    );
    const delay = Math.max(1000, nextMidnight.getTime() - now.getTime());

    const timer = window.setTimeout(() => {
      const runAtMidnight = async () => {
        setTodayKey(toLocalDateKey(new Date()));
        try {
          await syncTodayReservationsToWaitingReceptions();
        } catch (err: unknown) {
          dispatch(
            receptionActions.fetchReceptionsFailure(
              resolveErrorMessage(err, "예약 당일 자동 접수 생성 실패")
            )
          );
        }
        refreshReceptionsByCurrentMode();
      };
      void runAtMidnight();
    }, delay);

    return () => window.clearTimeout(timer);
  }, [
    todayKey,
    dispatch,
    refreshReceptionsByCurrentMode,
    syncTodayReservationsToWaitingReceptions,
  ]);

  React.useEffect(() => {
    const timer = window.setInterval(() => {
      refreshReceptionsByCurrentMode();
    }, RECEPTION_LIST_REFRESH_INTERVAL_MS);

    return () => {
      window.clearInterval(timer);
    };
  }, [refreshReceptionsByCurrentMode]);

  React.useEffect(() => {
    let active = true;
    const loadPatients = async () => {
      try {
        const patients = await fetchPatientsApi();
        if (!active) return;
        const byId = patients.reduce<Record<number, string>>((acc, item) => {
          if (item.patientId && item.name?.trim()) {
            acc[item.patientId] = item.name.trim();
          }
          return acc;
        }, {});
        setPatientNameById(byId);
      } catch {
        if (!active) return;
        setPatientNameById({});
      }
    };
    loadPatients();
    return () => {
      active = false;
    };
  }, []);

  React.useEffect(() => {
    if (!createModalOpen) return;
    const defaultDepartmentId = OUTPATIENT_DEPARTMENTS[0]?.id ?? 0;
    const defaultDoctorId =
      OUTPATIENT_DOCTORS.find((doctor) => doctor.departmentId === defaultDepartmentId)?.id ??
      null;
    setCreateModalForm({
      departmentId: defaultDepartmentId,
      doctorId: defaultDoctorId,
      arrivedTime: toLocalTimeValue(new Date()),
      note: "",
    });
  }, [createModalOpen]);

  const openCreateWithPatient = React.useCallback((patient: Patient, nextKeyword?: string) => {
    if (!patient.patientId) return;
    const name = (nextKeyword ?? patient.name ?? "").trim();
    setKeyword(name);
    setPatientSuggestions([]);
    setOpenSuggestion(false);
    setPatientSearchResultCount(1);
    setCreateTargetPatient({
      patientId: patient.patientId,
      patientName: name,
    });
    setCreateModalOpen(true);
  }, []);

  const onOpenPatientListModal = () => {
    setPatientListKeyword("");
    setPatientListPage(1);
    setPatientCatalogError(null);
    setPatientListModalOpen(true);
  };

  const onClosePatientListModal = () => {
    setPatientListModalOpen(false);
  };

  const onSearch = () => {
    const kw = keyword.trim();
    if (!kw) return alert("\uAC80\uC0C9\uC5B4\uB294 \uD544\uC218\uC785\uB2C8\uB2E4.");
    const run = async () => {
      try {
        const patients = await searchPatientsApi("name", kw);
        setPatientSearchResultCount(patients.length);

        if (patients.length === 0) {
          setPatientSuggestions([]);
          setOpenSuggestion(false);
          return;
        }

        if (patients.length === 1 && patients[0]?.patientId) {
          const single = patients[0];
          const nextKeyword = single.name?.trim() ?? kw;
          openCreateWithPatient(single, nextKeyword);
          return;
        }

        const suggestions = patients.slice(0, 8);
        setPatientSuggestions(suggestions);
        setOpenSuggestion(suggestions.length > 0);
      } catch {
        setPatientSearchResultCount(null);
        setPatientSuggestions([]);
        setOpenSuggestion(false);
      }
    };
    void run();
  };

  const onReset = () => {
    setKeyword("");
    setPatientSuggestions([]);
    setOpenSuggestion(false);
    setPatientSearchResultCount(null);
  };

  const onSelect = (p: Reception) => {
    dispatch(receptionActions.fetchReceptionSuccess(p));
    dispatch(receptionActions.fetchReceptionRequest({ receptionId: String(p.receptionId) }));
  };

  const onCancel = (receptionId: string) => {
    if (!confirm("접수를 취소 처리하시겠습니까?")) return;
    dispatch(receptionActions.cancelReceptionRequest({ receptionId }));
  };

  React.useEffect(() => {
    const kw = keyword.trim();
    if (!kw) {
      setPatientSuggestions([]);
      setOpenSuggestion(false);
      return;
    }

    let active = true;
    const timer = setTimeout(async () => {
      try {
        const byName = await searchPatientsApi("name", kw);
        if (!active) return;
        setPatientSuggestions(byName.slice(0, 8));
        setOpenSuggestion(byName.length > 0);
      } catch {
        if (!active) return;
        setPatientSuggestions([]);
        setOpenSuggestion(false);
      }
    }, 250);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [keyword]);

  const onPickPatientSuggestion = (patient: Patient) => {
    const nextKeyword = patient.name?.trim() ?? "";
    openCreateWithPatient(patient, nextKeyword);
  };

  React.useEffect(() => {
    if (!patientListModalOpen) return;
    let active = true;
    const loadPatients = async () => {
      try {
        setPatientCatalogLoading(true);
        setPatientCatalogError(null);
        const patients = await fetchPatientsApi();
        if (!active) return;
        setPatientCatalog(patients);
      } catch (err: unknown) {
        if (!active) return;
        setPatientCatalogError(resolveErrorMessage(err, "환자 목록 조회 실패"));
      } finally {
        if (!active) return;
        setPatientCatalogLoading(false);
      }
    };
    loadPatients();
    return () => {
      active = false;
    };
  }, [patientListModalOpen]);

  const filteredPatientCatalog = React.useMemo(() => {
    const kw = patientListKeyword.trim().toLowerCase();
    if (!kw) return patientCatalog;
    return patientCatalog.filter((patient) => {
      const fields = [
        patient.name,
        patient.patientNo,
        patient.phone,
        patient.birthDate,
        patient.patientId ? String(patient.patientId) : "",
      ];
      return fields.some((value) => (value ?? "").toLowerCase().includes(kw));
    });
  }, [patientCatalog, patientListKeyword]);

  const patientListTotalPages = Math.max(
    1,
    Math.ceil(filteredPatientCatalog.length / PATIENT_LIST_ITEMS_PER_PAGE)
  );
  const pagedPatientCatalog = React.useMemo(() => {
    const start = (patientListPage - 1) * PATIENT_LIST_ITEMS_PER_PAGE;
    return filteredPatientCatalog.slice(start, start + PATIENT_LIST_ITEMS_PER_PAGE);
  }, [filteredPatientCatalog, patientListPage]);

  React.useEffect(() => {
    setPatientListPage((prev) => Math.min(prev, patientListTotalPages));
  }, [patientListTotalPages]);

  const onSelectPatientFromListModal = (patient: Patient) => {
    onClosePatientListModal();
    openCreateWithPatient(patient);
  };

  const doctorsForSelectedDepartment = React.useMemo(() => {
    if (!createModalForm.departmentId) return OUTPATIENT_DOCTORS;
    return OUTPATIENT_DOCTORS.filter(
      (doctor) => (doctor.departmentId ?? null) === createModalForm.departmentId
    );
  }, [createModalForm.departmentId]);

  const onCreateModalSubmit = () => {
    if (!createTargetPatient.patientId) {
      alert("\uD658\uC790\uB97C \uBA3C\uC800 \uC120\uD0DD\uD574\uC8FC\uC138\uC694.");
      return;
    }

    const department = OUTPATIENT_DEPARTMENTS.find((item) => item.id === createModalForm.departmentId);
    if (!department) return;

    const doctor =
      OUTPATIENT_DOCTORS.find((item) => item.id === createModalForm.doctorId) ??
      OUTPATIENT_DOCTORS.find((item) => item.departmentId === department.id) ??
      null;
    const arrivedTime = createModalForm.arrivedTime || "00:00";
    const arrivedAt = `${todayKey}T${arrivedTime}`;

    dispatch(
      receptionActions.createReceptionRequest({
        receptionNo: "",
        patientId: createTargetPatient.patientId,
        patientName: createTargetPatient.patientName || null,
        visitType: "OUTPATIENT",
        departmentId: department.id,
        departmentName: department.name,
        doctorId: doctor?.id ?? null,
        doctorName: doctor?.name ?? null,
        scheduledAt: null,
        arrivedAt,
        status: "WAITING",
        note: createModalForm.note.trim() ? createModalForm.note.trim() : null,
      })
    );

    setPage(1);
    setCreateModalOpen(false);
    setPatientSuggestions([]);
    setOpenSuggestion(false);
  };

  const onCreateModalClose = () => {
    setCreateModalOpen(false);
  };

  const totalCount = filteredList.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));
  const pagedList = React.useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filteredList.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredList, page]);
  React.useEffect(() => {
    setPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);
  React.useEffect(() => {
    if (!pagedList.length) return;
    const first = pagedList[0];
    if (!selected || !pagedList.some((p) => p.receptionId === selected.receptionId)) {
      dispatch(receptionActions.fetchReceptionSuccess(first));
      dispatch(
        receptionActions.fetchReceptionRequest({ receptionId: String(first.receptionId) })
      );
      return;
    }
    const selectedInPage = pagedList.find((p) => p.receptionId === selected.receptionId);
    if (
      selectedInPage &&
      (normalizeStatus(selected.status) !== normalizeStatus(selectedInPage.status) ||
        selected.patientName !== selectedInPage.patientName ||
        selected.departmentName !== selectedInPage.departmentName ||
        selected.doctorName !== selectedInPage.doctorName)
    ) {
      dispatch(
        receptionActions.fetchReceptionSuccess({
          ...selected,
          ...selectedInPage,
        })
      );
    }
    if (!selected.patientName && !selected.departmentName && !selected.doctorName) {
      dispatch(
        receptionActions.fetchReceptionRequest({
          receptionId: String(selected.receptionId),
        })
      );
    }
  }, [pagedList, selected, dispatch]);
  const primary =
    selected && pagedList.some((p) => p.receptionId === selected.receptionId)
      ? selected
      : pagedList[0] ?? filteredList[0];
  const primaryName = primary ? resolvePatientDisplayName(primary, patientNameById) : "";
  const primaryDepartment = primary
    ? resolveOutpatientDepartmentName(primary)
    : "-";
  const primaryDoctor = primary
    ? resolveOutpatientDoctorName(primary)
    : "";
  const avatarLabel = primaryName
    ? primaryName.slice(0, 1)
    : primary?.patientId
    ? String(primary.patientId).slice(-2)
    : "R";

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Card
        sx={{
          borderRadius: 3.5,
          border: "1px solid rgba(123, 146, 183, 0.25)",
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.98), rgba(243,248,255,0.95) 58%, rgba(235,244,255,0.95))",
          boxShadow: "0 14px 26px rgba(23, 52, 97, 0.12)",
          overflow: "visible",
        }}
      >
        <CardContent sx={{ p: { xs: 2, md: 2.5 }, overflow: "visible" }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "center" }}>
            <Stack spacing={0.35} sx={{ minWidth: 120 }}>
              <Typography fontWeight={900} sx={{ color: "#1f4f95", letterSpacing: -0.1 }}>
                {"\uD658\uC790 \uAC80\uC0C9"}
              </Typography>
              <Typography sx={{ color: "#6f819f", fontSize: 12, fontWeight: 600 }}>
                {"\uC774\uB984 \uC870\uD68C \uD6C4 \uBC14\uB85C \uC811\uC218 \uB4F1\uB85D"}
              </Typography>
            </Stack>
            <Box sx={{ width: { xs: "100%", md: 380 }, position: "relative" }}>
              <TextField
                size="small"
                placeholder={"\uD658\uC790 \uC774\uB984 \uC785\uB825"}
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value);
                  setPatientSearchResultCount(null);
                }}
                onKeyDown={(e) => e.key === "Enter" && onSearch()}
                onFocus={() => {
                  if (patientSuggestions.length > 0) {
                    setOpenSuggestion(true);
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ fontSize: 19, color: "#7f93b5" }} />
                    </InputAdornment>
                  ),
                }}
                helperText={
                  patientSearchResultCount === null
                    ? " "
                    : patientSearchResultCount === 0
                    ? "\uC77C\uCE58 \uD658\uC790 \uC5C6\uC74C"
                    : `\uAC80\uC0C9 \uACB0\uACFC ${patientSearchResultCount}\uBA85`
                }
                FormHelperTextProps={{
                  sx: {
                    mt: 0.65,
                    ml: 0.25,
                    fontWeight: 700,
                    fontSize: 12,
                    color:
                      patientSearchResultCount === 0
                        ? "#d32f2f"
                        : "#6b7a96",
                  },
                }}
                sx={{
                  width: "100%",
                  "& .MuiInputBase-root": {
                    bgcolor: "rgba(255,255,255,0.9)",
                    borderRadius: 2.25,
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.75)",
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(79, 111, 163, 0.28)",
                  },
                  "& .MuiInputBase-root:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(43, 90, 169, 0.48)",
                  },
                  "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#2b5aa9",
                    borderWidth: 2,
                  },
                }}
              />
              {openSuggestion && patientSuggestions.length > 0 && (
                <Card
                  sx={{
                    position: "absolute",
                    top: "calc(100% + 8px)",
                    left: 0,
                    right: 0,
                    zIndex: 1400,
                    borderRadius: 2,
                    border: "1px solid rgba(90, 121, 174, 0.24)",
                    boxShadow: "0 14px 28px rgba(23, 52, 97, 0.2)",
                    maxHeight: 280,
                    overflowY: "auto",
                  }}
                >
                  <Stack spacing={0}>
                    {patientSuggestions.map((p) => (
                      <Button
                        key={p.patientId}
                        onClick={() => onPickPatientSuggestion(p)}
                        sx={{
                          justifyContent: "flex-start",
                          textTransform: "none",
                          px: 1.7,
                          py: 1.1,
                          borderRadius: 0,
                          color: "#1f2a44",
                          borderBottom: "1px solid #edf2fb",
                          "&:hover": {
                            bgcolor: "rgba(43, 90, 169, 0.08)",
                          },
                        }}
                      >
                        <Box sx={{ textAlign: "left", width: "100%" }}>
                          <Typography fontWeight={700} noWrap>
                            {p.name} · {p.gender ?? "-"} · {p.birthDate ?? "-"}
                          </Typography>
                          <Typography sx={{ color: "#7b8aa9", fontSize: 12 }} noWrap>
                            환자ID {p.patientId} · {p.phone ?? "-"} · {p.patientNo ?? "-"}
                          </Typography>
                        </Box>
                      </Button>
                    ))}
                  </Stack>
                </Card>
              )}
            </Box>
            <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
              <Button
                variant="contained"
                startIcon={<SearchIcon />}
                onClick={onSearch}
                disabled={loading}
                sx={{
                  px: 2.1,
                  borderRadius: 2,
                  bgcolor: "#2b5aa9",
                  boxShadow: "0 8px 18px rgba(43,90,169,0.28)",
                  "&:hover": { bgcolor: "#244e95" },
                }}
              >
                검색
              </Button>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={onReset}
                disabled={loading}
                sx={{
                  px: 1.8,
                  borderRadius: 2,
                  color: "#2b5aa9",
                  borderColor: "rgba(43,90,169,0.4)",
                  bgcolor: "rgba(255,255,255,0.85)",
                  "&:hover": {
                    borderColor: "#2b5aa9",
                    bgcolor: "rgba(43,90,169,0.07)",
                  },
                }}
              >
                초기화
              </Button>
              <Button
                variant="outlined"
                startIcon={<ListAltIcon />}
                onClick={onOpenPatientListModal}
                disabled={loading}
                sx={{
                  px: 1.8,
                  borderRadius: 2,
                  color: "#1f4f95",
                  borderColor: "rgba(31,79,149,0.38)",
                  bgcolor: "rgba(255,255,255,0.9)",
                  "&:hover": {
                    borderColor: "#1f4f95",
                    bgcolor: "rgba(31,79,149,0.08)",
                  },
                }}
              >
                환자목록
              </Button>
            </Stack>
            <Box sx={{ flex: 1 }} />
            <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
              <Chip label={`오늘 ${totalCount}`} color="primary" />
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Box
        sx={{
          display: "grid",
          gap: 3,
          alignItems: "start",
          gridTemplateColumns: {
            xs: "1fr",
            md: "260px minmax(0, 1fr)",
          },
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Card
            sx={{
              borderRadius: 3,
              border: "1px solid #dbe5f5",
              boxShadow: "0 12px 24px rgba(23, 52, 97, 0.12)",
            }}
          >
            <CardContent>
              <Stack spacing={2} alignItems="center">
                <Avatar
                  sx={{
                    width: 110,
                    height: 110,
                    bgcolor: "#d7e6ff",
                    color: "#2b5aa9",
                    fontSize: 34,
                    fontWeight: 700,
                  }}
                >
                  {avatarLabel}
                </Avatar>
                <Box textAlign="center">
                  <Typography variant="h6" fontWeight={700}>
                    {primary
                      ? primaryName || `환자 ${primary.patientId ?? "-"}`
                      : "접수 미선택"}
                  </Typography>
                  <Box sx={{ color: "#7b8aa9", fontSize: 13 }}>
                    {primary ? (
                      <Typography
                        component={Link}
                        href={`/reception/outpatient/detail/${primary.receptionId}`}
                        onClick={(e) => e.stopPropagation()}
                        sx={{
                          color: "#2b5aa9",
                          textDecoration: "none",
                          fontWeight: 700,
                          "&:hover": { textDecoration: "underline" },
                        }}
                      >
                        {primary.receptionNo}
                      </Typography>
                    ) : (
                      "-"
                    )}
                  </Box>
                </Box>
              </Stack>

              <Divider sx={{ my: 2 }} />

              <Stack spacing={1.4}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography sx={{ color: "#7b8aa9", fontSize: 13 }}>
                    환자 이름
                  </Typography>
                  <Typography fontWeight={600}>
                    {primaryName || "-"}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography sx={{ color: "#7b8aa9", fontSize: 13 }}>
                    진료과
                  </Typography>
                  <Typography fontWeight={600}>
                    {primaryDepartment}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography sx={{ color: "#7b8aa9", fontSize: 13 }}>
                    의사 이름
                  </Typography>
                  <Typography fontWeight={600}>
                    {primaryDoctor || "-"}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography sx={{ color: "#7b8aa9", fontSize: 13 }}>
                    내원유형
                  </Typography>
                  <Typography fontWeight={600}>
                    {visitTypeLabel(primary?.visitType)}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography sx={{ color: "#7b8aa9", fontSize: 13 }}>
                    상태
                  </Typography>
                  <Typography fontWeight={600}>
                    {statusLabel(primary?.status)}
                  </Typography>
                </Stack>
              </Stack>

              <Divider sx={{ my: 2 }} />

              <Stack spacing={1}>
                <Button
                  variant="outlined"
                  sx={{ color: "#2b5aa9" }}
                  component={Link}
                  href={primary ? `/reception/outpatient/detail/${primary.receptionId}` : "#"}
                  disabled={!primary}
                >
                  상세 보기
                </Button>
                <Button
                  variant="contained"
                  sx={{ bgcolor: "#2b5aa9" }}
                  component={Link}
                  href={primary ? `/reception/outpatient/edit/${primary.receptionId}` : "#"}
                  disabled={!primary}
                >
                  접수 수정
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <Card
            sx={{
              borderRadius: 3,
              border: "1px solid #dbe5f5",
              boxShadow: "0 14px 28px rgba(23, 52, 97, 0.15)",
            }}
          >
            <CardContent sx={{ p: 3 }}>
                <Stack spacing={2}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography fontWeight={800}>환자리스트</Typography>
                  <Chip label={`오늘 ${totalCount}`} size="small" color="primary" />
                  </Stack>

                <Tabs
                  value={tab}
                  onChange={(_, value) => setTab(value)}
                  textColor="primary"
                  indicatorColor="primary"
                  sx={{
                    "& .MuiTab-root": {
                      minHeight: 32,
                      fontSize: 13,
                      color: "#5f6f93",
                    },
                    "& .Mui-selected": { color: "#2b5aa9" },
                  }}
                >
                  {TAB_LABELS.map((label) => (
                    <Tab key={label} label={label} />
                  ))}
                </Tabs>

                <Stack spacing={1}>
                  {pagedList.map((p) => {
                    const isSelected = selected?.receptionId === p.receptionId;
                    const displayPatientName = resolvePatientDisplayName(
                      p,
                      patientNameById
                    );
                    const rowStatusLabel = statusLabel(p.status);
                    return (
                      <Box
                        key={p.receptionId}
                        onClick={() => onSelect(p)}
                        sx={{
                          display: "grid",
                          gridTemplateColumns: "48px minmax(0, 1fr) auto",
                          alignItems: "center",
                          gap: 1.5,
                          px: 1.5,
                          py: 1.2,
                          borderRadius: 2,
                          bgcolor: isSelected ? "rgba(43,90,169,0.08)" : "transparent",
                          cursor: "pointer",
                          "&:hover": { bgcolor: "#f1f6ff" },
                        }}
                      >
                        <Avatar sx={{ width: 40, height: 40, bgcolor: "#d7e6ff", color: "#2b5aa9" }}>
                          {displayPatientName
                            ? displayPatientName.slice(0, 1)
                            : String(p.patientId ?? "?").slice(-2)}
                        </Avatar>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography
                            component={Link}
                            href={`/reception/outpatient/detail/${p.receptionId}`}
                            onClick={(e) => e.stopPropagation()}
                            fontWeight={700}
                            noWrap
                            sx={{
                              color: "#2b5aa9",
                              textDecoration: "none",
                              "&:hover": { textDecoration: "underline" },
                            }}
                          >
                            {p.receptionNo}
                          </Typography>
                            <Typography sx={{ color: "#7b8aa9", fontSize: 12 }} noWrap>
                            {displayPatientName} ·{" "}
                            {resolveOutpatientDepartmentName(p)} ·{" "}
                            {statusLabel(p.status)}
                          </Typography>
                        </Box>
                        <Stack direction="row" spacing={0.75} alignItems="center">
                          <Chip
                            label={rowStatusLabel}
                            size="small"
                            variant="filled"
                            sx={{
                              height: 24,
                              borderRadius: 999,
                              fontWeight: 800,
                              fontSize: 11,
                              minWidth: 58,
                              "& .MuiChip-label": { px: 1.15 },
                              boxShadow: "0 2px 6px rgba(16, 38, 72, 0.25)",
                              ...statusChipSx(p.status),
                            }}
                          />
                          <IconButton
                            size="small"
                            color="warning"
                            onClick={(e) => {
                              e.stopPropagation();
                              onCancel(String(p.receptionId));
                            }}
                          >
                            <BlockOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      </Box>
                    );
                  })}

                  {filteredList.length === 0 && (
                    <Typography color="#7b8aa9">조회된 접수가 없습니다.</Typography>
                  )}
                </Stack>
                {filteredList.length > 0 && totalPages > 1 && (
                  <Stack direction="row" justifyContent="center" sx={{ pt: 1 }}>
                    <Pagination
                      page={page}
                      count={totalPages}
                      onChange={(_, value) => setPage(value)}
                      color="primary"
                      size="small"
                    />
                  </Stack>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Box>

      </Box>

      <Dialog
        open={patientListModalOpen}
        onClose={onClosePatientListModal}
        fullWidth
        maxWidth="md"
      >
        <DialogContent sx={{ p: 3 }}>
          <Stack spacing={1.5}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h5" fontWeight={900}>
                환자목록
              </Typography>
              <Chip label={`총 ${filteredPatientCatalog.length}`} color="primary" />
            </Stack>

            <TextField
              size="small"
              placeholder="이름/환자번호/연락처로 검색"
              value={patientListKeyword}
              onChange={(e) => {
                setPatientListKeyword(e.target.value);
                setPatientListPage(1);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 19, color: "#7f93b5" }} />
                  </InputAdornment>
                ),
              }}
            />

            {patientCatalogLoading ? (
              <Typography sx={{ color: "#7b8aa9" }}>환자 목록 불러오는 중...</Typography>
            ) : (
              <Stack spacing={1}>
                {pagedPatientCatalog.map((patient) => (
                  <Button
                    key={patient.patientId}
                    onClick={() => onSelectPatientFromListModal(patient)}
                    sx={{
                      justifyContent: "flex-start",
                      textTransform: "none",
                      px: 1.6,
                      py: 1.25,
                      borderRadius: 2,
                      color: "#1f2a44",
                      border: "1px solid #e3ebf8",
                      bgcolor: "#fff",
                      "&:hover": {
                        borderColor: "#9cb5de",
                        bgcolor: "rgba(43,90,169,0.06)",
                      },
                    }}
                  >
                    <Box sx={{ textAlign: "left", width: "100%", minWidth: 0 }}>
                      <Typography fontWeight={800} noWrap>
                        {patient.name} · {genderLabel(patient.gender)} · {patient.birthDate ?? "-"}
                      </Typography>
                      <Typography sx={{ color: "#7b8aa9", fontSize: 12 }} noWrap>
                        환자ID {patient.patientId} · {patient.patientNo ?? "-"} · {patient.phone ?? "-"}
                      </Typography>
                    </Box>
                  </Button>
                ))}
                {!pagedPatientCatalog.length && (
                  <Typography sx={{ color: "#7b8aa9" }}>조회된 환자가 없습니다.</Typography>
                )}
              </Stack>
            )}

            {filteredPatientCatalog.length > 0 && patientListTotalPages > 1 && (
              <Stack direction="row" justifyContent="center">
                <Pagination
                  page={patientListPage}
                  count={patientListTotalPages}
                  onChange={(_, value) => setPatientListPage(value)}
                  color="primary"
                  size="small"
                />
              </Stack>
            )}

            {patientCatalogError && (
              <Typography color="error" fontWeight={700}>
                {patientCatalogError}
              </Typography>
            )}

            <Stack direction="row" justifyContent="flex-end">
              <Button variant="text" onClick={onClosePatientListModal}>
                닫기
              </Button>
            </Stack>
          </Stack>
        </DialogContent>
      </Dialog>

      <Dialog
        open={createModalOpen}
        onClose={onCreateModalClose}
        fullWidth
        maxWidth="sm"
      >
        <DialogContent sx={{ p: 3 }}>
          <Stack spacing={1.75}>
            <Typography variant="h5" fontWeight={900}>
              {"\uC811\uC218 \uB4F1\uB85D"}
            </Typography>

            <TextField
              select
              size="small"
              label={"\uC9C4\uB8CC\uACFC"}
              value={createModalForm.departmentId}
              onChange={(e) => {
                const departmentId = Number(e.target.value);
                const nextDoctorId =
                  OUTPATIENT_DOCTORS.find((doctor) => doctor.departmentId === departmentId)?.id ??
                  null;
                setCreateModalForm((prev) => ({
                  ...prev,
                  departmentId,
                  doctorId: nextDoctorId,
                }));
              }}
              fullWidth
            >
              {OUTPATIENT_DEPARTMENTS.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              size="small"
              label={"\uB2F4\uB2F9\uC758"}
              value={createModalForm.doctorId ?? ""}
              onChange={(e) => {
                const doctorId = Number(e.target.value);
                const doctor = OUTPATIENT_DOCTORS.find((item) => item.id === doctorId);
                setCreateModalForm((prev) => ({
                  ...prev,
                  doctorId,
                  departmentId: doctor?.departmentId ?? prev.departmentId,
                }));
              }}
              fullWidth
            >
              {doctorsForSelectedDepartment.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.name}
                </MenuItem>
              ))}
              {!doctorsForSelectedDepartment.length && (
                <MenuItem disabled value="">
                  담당의 없음
                </MenuItem>
              )}
            </TextField>

            <TextField
              size="small"
              label={"\uB0B4\uC6D0\uC720\uD615"}
              value={"\uC678\uB798"}
              InputProps={{ readOnly: true }}
              fullWidth
            />

            <Typography sx={{ color: "#7b8aa9", fontSize: 13 }}>
              {"\uC811\uC218 \uB4F1\uB85D\uC740 \uC678\uB798 \uC811\uC218\uB9CC \uC9C0\uC6D0\uD569\uB2C8\uB2E4."}
            </Typography>

            <TextField
              size="small"
              type="time"
              label={"\uB0B4\uC6D0 \uC2DC\uAC04(\uC120\uD0DD)"}
              value={createModalForm.arrivedTime}
              onChange={(e) =>
                setCreateModalForm((prev) => ({
                  ...prev,
                  arrivedTime: e.target.value,
                }))
              }
              fullWidth
              InputLabelProps={{ shrink: true }}
            />

            <Typography sx={{ color: "#7b8aa9", fontSize: 13 }}>
              {`\uC801\uC6A9 \uB0A0\uC9DC: ${todayKey} (\uC624\uB298)`}
            </Typography>

            <TextField
              size="small"
              label={"\uC811\uC218 \uBA54\uBAA8(\uC120\uD0DD)"}
              value={createModalForm.note}
              onChange={(e) =>
                setCreateModalForm((prev) => ({
                  ...prev,
                  note: e.target.value,
                }))
              }
              fullWidth
            />

            <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ pt: 1 }}>
              <Button variant="text" onClick={onCreateModalClose} disabled={loading}>
                {"\uCDE8\uC18C"}
              </Button>
              <Button
                variant="contained"
                onClick={onCreateModalSubmit}
                disabled={
                  loading ||
                  !createTargetPatient.patientId ||
                  !createModalForm.departmentId
                }
                sx={{ bgcolor: "#2b5aa9" }}
              >
                {"\uC800\uC7A5"}
              </Button>
            </Stack>
          </Stack>
        </DialogContent>
      </Dialog>

      {error && (
        <Typography color="error" fontWeight={800}>
          {error}
        </Typography>
      )}
    </Box>
  );
}
