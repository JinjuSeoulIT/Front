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
  Divider,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/store/store";
import { emergencyReceptionActions } from "@/features/EmergencyReception/EmergencyReceptionSlice";
import type {
  EmergencyReception,
  EmergencyReceptionForm,
  EmergencyReceptionSearchPayload,
} from "@/features/EmergencyReception/EmergencyReceptionTypes";
import type { Patient } from "@/features/patients/patientTypes";
import { fetchPatientsApi } from "@/lib/patient/patientApi";

const SEARCH_OPTIONS: { label: string; value: EmergencyReceptionSearchPayload["type"] }[] = [
  { label: "환자ID", value: "patientId" },
  { label: "상태", value: "status" },
  { label: "중증도", value: "triageLevel" },
];

const statusLabel = (value?: string | null) => {
  switch ((value ?? "").toUpperCase()) {
    case "REGISTERED":
      return "접수 완료";
    case "WAITING":
      return "대기";
    case "CALLED":
      return "호출";
    case "TRIAGE":
      return "중증도분류";
    case "IN_PROGRESS":
      return "진행중";
    case "COMPLETED":
      return "완료";
    case "PAYMENT_WAIT":
      return "수납대기";
    case "OBSERVATION":
      return "관찰중";
    case "ON_HOLD":
      return "보류";
    case "CANCELED":
      return "취소";
    case "INACTIVE":
      return "비활성";
    case "TRANSFERRED":
      return "전원";
    default:
      return value ?? "-";
  }
};

const normalizeEmergencyStatus = (value?: string | null) => {
  if (!value) return value;
  const raw = value.trim();
  const upper = raw.toUpperCase();

  const map: Record<string, string> = {
    REGISTERED: "REGISTERED",
    WAITING: "WAITING",
    CALLED: "CALLED",
    TRIAGE: "TRIAGE",
    IN_PROGRESS: "IN_PROGRESS",
    COMPLETED: "COMPLETED",
    PAYMENT_WAIT: "PAYMENT_WAIT",
    OBSERVATION: "OBSERVATION",
    ON_HOLD: "ON_HOLD",
    CANCELED: "CANCELED",
    CANCELLED: "CANCELED",
    INACTIVE: "INACTIVE",
    TRANSFERRED: "TRANSFERRED",
    "접수완료": "REGISTERED",
    "접수 완료": "REGISTERED",
    "대기": "WAITING",
    "호출": "CALLED",
    "중증도분류": "TRIAGE",
    "진행중": "IN_PROGRESS",
    "완료": "COMPLETED",
    "취소": "CANCELED",
    "비활성": "INACTIVE",
    "전원": "TRANSFERRED",
  };

  return map[upper] ?? map[raw] ?? raw;
};

const formatDateTime = (value?: string | null) => {
  if (!value) return "-";
  return value.replace("T", " ").slice(0, 16);
};

const summarizeOneLine = (value?: string | null, max = 18) => {
  const text = (value ?? "").replace(/\s+/g, " ").trim();
  if (!text) return "-";
  if (text.length <= max) return text;
  return `${text.slice(0, max)}...`;
};

type EmergencyReceptionListProps = {
  initialSearchType?: EmergencyReceptionSearchPayload["type"];
  initialKeyword?: string;
  autoSearch?: boolean;
};

export default function EmergencyReceptionList({
  initialSearchType = "patientId",
  initialKeyword = "",
  autoSearch = false,
}: EmergencyReceptionListProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { list, loading, error, selected } = useSelector(
    (s: RootState) => s.emergencyReceptions
  );

  const [searchType, setSearchType] = React.useState<
    EmergencyReceptionSearchPayload["type"]
  >(initialSearchType);
  const [keyword, setKeyword] = React.useState(initialKeyword);
  const [patientNameById, setPatientNameById] = React.useState<Record<number, string>>({});
  const [hiddenReceptionIds, setHiddenReceptionIds] = React.useState<number[]>([]);

  React.useEffect(() => {
    if (autoSearch && initialKeyword.trim()) {
      dispatch(
        emergencyReceptionActions.searchEmergencyReceptionsRequest({
          type: initialSearchType,
          keyword: initialKeyword.trim(),
        })
      );
      return;
    }
    dispatch(emergencyReceptionActions.fetchEmergencyReceptionsRequest());
  }, [dispatch, autoSearch, initialKeyword, initialSearchType]);

  React.useEffect(() => {
    if (!list.length) return;
    if (selected) {
      const still = list.find((item) => item.receptionId === selected.receptionId);
      if (still) return;
    }
    dispatch(emergencyReceptionActions.fetchEmergencyReceptionSuccess(list[0]));
  }, [list, selected, dispatch]);

  React.useEffect(() => {
    let active = true;
    const loadPatients = async () => {
      try {
        const patients = await fetchPatientsApi();
        if (!active) return;

        const byId = patients.reduce<Record<number, string>>((acc, item: Patient) => {
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

    void loadPatients();
    return () => {
      active = false;
    };
  }, []);

  const onSearch = () => {
    const kw = keyword.trim();
    if (!kw) return alert("검색어를 입력해주세요.");

    dispatch(
      emergencyReceptionActions.searchEmergencyReceptionsRequest({
        type: searchType,
        keyword: kw,
      })
    );
  };

  const onReset = () => {
    setKeyword("");
    setSearchType("patientId");
    dispatch(emergencyReceptionActions.fetchEmergencyReceptionsRequest());
  };

  const onSelect = (item: EmergencyReception) => {
    dispatch(emergencyReceptionActions.fetchEmergencyReceptionSuccess(item));
  };

  const onCancelEmergencyReceptionItem = (item: EmergencyReception) => {
    if (normalizeEmergencyStatus(item.status) === "CANCELED") return;
    const ok = window.confirm("응급 접수를 취소하시겠습니까?");
    if (!ok) return;

    setHiddenReceptionIds((prev) =>
      prev.includes(item.receptionId) ? prev : [...prev, item.receptionId]
    );

    const payload: EmergencyReceptionForm = {
      receptionNo: item.receptionNo,
      patientId: item.patientId,
      departmentId: item.departmentId,
      doctorId: item.doctorId ?? null,
      scheduledAt: item.scheduledAt ?? null,
      arrivedAt: item.arrivedAt ?? null,
      status: "CANCELED",
      note: item.note ?? null,
      triageLevel: item.triageLevel,
      chiefComplaint: item.chiefComplaint,
      vitalTemp: item.vitalTemp ?? null,
      vitalBpSystolic: item.vitalBpSystolic ?? null,
      vitalBpDiastolic: item.vitalBpDiastolic ?? null,
      vitalHr: item.vitalHr ?? null,
      vitalRr: item.vitalRr ?? null,
      vitalSpo2: item.vitalSpo2 ?? null,
      arrivalMode: item.arrivalMode ?? null,
      triageNote: item.triageNote ?? null,
    };

    dispatch(
      emergencyReceptionActions.updateEmergencyReceptionRequest({
        receptionId: String(item.receptionId),
        form: payload,
      })
    );
  };

  const visibleList = React.useMemo(
    () =>
      list.filter(
        (item) =>
          normalizeEmergencyStatus(item.status) !== "CANCELED" &&
          !hiddenReceptionIds.includes(item.receptionId)
      ),
    [list, hiddenReceptionIds]
  );

  const primary =
    (selected && visibleList.find((item) => item.receptionId === selected.receptionId)) ||
    visibleList[0] ||
    null;

  React.useEffect(() => {
    if (!visibleList.length) return;
    if (!selected || !visibleList.some((item) => item.receptionId === selected.receptionId)) {
      dispatch(emergencyReceptionActions.fetchEmergencyReceptionSuccess(visibleList[0]));
    }
  }, [visibleList, selected, dispatch]);

  const resolvePatientName = React.useCallback(
    (item?: EmergencyReception | null) => {
      if (!item) return "-";

      const withName = item as EmergencyReception & {
        patientName?: string | null;
        name?: string | null;
        patient?: { name?: string | null } | null;
      };
      const directName =
        withName.patientName ??
        withName.name ??
        withName.patient?.name ??
        "";

      if (typeof directName === "string" && directName.trim()) {
        return directName.trim();
      }

      const mappedName = item.patientId ? patientNameById[item.patientId] : "";
      if (mappedName?.trim()) return mappedName.trim();

      return `환자 ${item.patientId ?? "-"}`;
    },
    [patientNameById]
  );
  const primaryPatientName = resolvePatientName(primary);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Card
        sx={{
          borderRadius: 3,
          border: "1px solid #dbe5f5",
          boxShadow: "0 12px 24px rgba(23, 52, 97, 0.12)",
        }}
      >
        <CardContent sx={{ p: 2.5 }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "center" }}>
            <Typography fontWeight={800} sx={{ color: "#2b5aa9", minWidth: 110 }}>
              응급 접수 검색
            </Typography>
            <TextField
              select
              size="small"
              value={searchType}
              onChange={(e) =>
                setSearchType(e.target.value as EmergencyReceptionSearchPayload["type"])
              }
              sx={{ width: { xs: "100%", md: 180 } }}
            >
              {SEARCH_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              size="small"
              placeholder="검색어 입력"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSearch()}
              sx={{ width: { xs: "100%", md: 360 } }}
            />
            <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
              <Button
                variant="contained"
                startIcon={<SearchIcon />}
                onClick={onSearch}
                disabled={loading}
                sx={{ bgcolor: "#2b5aa9" }}
              >
                검색
              </Button>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={onReset}
                disabled={loading}
                sx={{ color: "#2b5aa9" }}
              >
                초기화
              </Button>
            </Stack>
            <Box sx={{ flex: 1 }} />
            <Chip label={`전체 ${visibleList.length}`} color="primary" />
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
                    bgcolor: "#ffe4e4",
                    color: "#b42318",
                    fontSize: 28,
                    fontWeight: 700,
                  }}
                >
                  {primary?.triageLevel ? `T${primary.triageLevel}` : "ER"}
                </Avatar>
                <Box textAlign="center">
                  <Typography variant="h6" fontWeight={700}>
                    {primary ? primaryPatientName : "응급 접수 미선택"}
                  </Typography>
                  <Typography sx={{ color: "#7b8aa9", fontSize: 13 }}>
                    {primary?.receptionNo ?? "-"}
                  </Typography>
                </Box>
              </Stack>

              <Divider sx={{ my: 2 }} />

              <Stack spacing={1.4}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography sx={{ color: "#7b8aa9", fontSize: 13 }}>중증도</Typography>
                  <Typography fontWeight={600}>{primary?.triageLevel ?? "-"}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography sx={{ color: "#7b8aa9", fontSize: 13 }}>상태</Typography>
                  <Typography fontWeight={600}>{statusLabel(primary?.status)}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography sx={{ color: "#7b8aa9", fontSize: 13 }}>내원 시각</Typography>
                  <Typography fontWeight={600}>{formatDateTime(primary?.arrivedAt)}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography sx={{ color: "#7b8aa9", fontSize: 13 }}>주호소</Typography>
                  <Typography
                    fontWeight={600}
                    sx={{ maxWidth: 160 }}
                    noWrap
                    title={primary?.chiefComplaint ?? "-"}
                  >
                    {summarizeOneLine(primary?.chiefComplaint)}
                  </Typography>
                </Stack>
              </Stack>

              <Divider sx={{ my: 2 }} />

              <Stack spacing={1}>
                <Button
                  variant="outlined"
                  sx={{ color: "#2b5aa9" }}
                  component={Link}
                  href={primary ? `/reception/emergency/detail/${primary.receptionId}` : "#"}
                  disabled={!primary}
                >
                  상세 보기
                </Button>
                <Button
                  variant="contained"
                  sx={{ bgcolor: "#2b5aa9" }}
                  component={Link}
                  href={primary ? `/reception/emergency/edit/${primary.receptionId}` : "#"}
                  disabled={!primary}
                >
                  응급 접수 수정
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
                  <Typography fontWeight={800}>응급 접수 목록</Typography>
                  <Chip label={`총 ${visibleList.length}`} size="small" color="primary" />
                </Stack>

                <Stack spacing={1}>
                  {visibleList.map((item) => {
                    const isSelected = selected?.receptionId === item.receptionId;
                    const patientName = resolvePatientName(item);

                    return (
                      <Box
                        key={item.receptionId}
                        onClick={() => onSelect(item)}
                        sx={{
                          display: "grid",
                          gridTemplateColumns: "48px minmax(0, 1fr)",
                          alignItems: "center",
                          gap: 1.5,
                          px: 1.5,
                          py: 1.2,
                          borderRadius: 2,
                          bgcolor: isSelected ? "rgba(180,35,24,0.08)" : "transparent",
                          cursor: "pointer",
                          "&:hover": { bgcolor: "#fff4f3" },
                        }}
                      >
                        <Avatar sx={{ width: 40, height: 40, bgcolor: "#ffe4e4", color: "#b42318" }}>
                          {`T${item.triageLevel}`}
                        </Avatar>
                        <Box
                          sx={{
                            minWidth: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 1,
                          }}
                        >
                          <Box sx={{ minWidth: 0 }}>
                            <Typography fontWeight={700} noWrap>
                              {item.receptionNo}
                            </Typography>
                            <Typography sx={{ color: "#7b8aa9", fontSize: 12 }} noWrap>
                              {patientName} · {statusLabel(item.status)} · {item.chiefComplaint ?? "-"}
                            </Typography>
                          </Box>
                          <IconButton
                            size="small"
                            color="warning"
                            disabled={loading || normalizeEmergencyStatus(item.status) === "CANCELED"}
                            onClick={(e) => {
                              e.stopPropagation();
                              onCancelEmergencyReceptionItem(item);
                            }}
                          >
                            <BlockOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                    );
                  })}

                  {visibleList.length === 0 && (
                    <Typography color="#7b8aa9">조회된 응급 접수가 없습니다.</Typography>
                  )}
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {error && (
        <Typography color="error" fontWeight={800}>
          {error}
        </Typography>
      )}
    </Box>
  );
}
