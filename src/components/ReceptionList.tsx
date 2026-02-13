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
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/store/store";
import { receptionActions } from "@/features/Receptions/ReceptionSlice";
import type { Reception, ReceptionSearchPayload } from "@/features/Receptions/ReceptionTypes";
import { formatDepartmentName } from "@/lib/departmentLabel";

const SEARCH_OPTIONS: { label: string; value: ReceptionSearchPayload["type"] }[] = [
  { label: "접수번호", value: "receptionNo" },
  { label: "환자ID", value: "patientId" },
  { label: "상태", value: "status" },
];

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

const statusLabel = (value?: string | null) => {
  switch (value) {
    case "WAITING":
      return "대기";
    case "CALLED":
      return "호출";
    case "IN_PROGRESS":
      return "진행중";
    case "COMPLETED":
      return "완료";
    case "PAYMENT_WAIT":
      return "수납대기";
    case "ON_HOLD":
      return "보류";
    case "CANCELED":
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
      return "CANCELED";
    case "비활성":
      return "INACTIVE";
    default:
      return trimmed;
  }
};

type ReceptionListProps = {
  initialSearchType?: ReceptionSearchPayload["type"];
  initialKeyword?: string;
  autoSearch?: boolean;
};

export default function ReceptionList({
  initialSearchType = "receptionNo",
  initialKeyword = "",
  autoSearch = false,
}: ReceptionListProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { list, loading, error, selected } = useSelector(
    (s: RootState) => s.receptions
  );

  const [searchType, setSearchType] = React.useState<
    ReceptionSearchPayload["type"]
  >(initialSearchType);
  const [keyword, setKeyword] = React.useState(initialKeyword);
  const [tab, setTab] = React.useState(0);
  const isCanceledView = initialSearchType === "status" && initialKeyword === "CANCELED";
  const filteredList = React.useMemo(
    () =>
      isCanceledView
        ? list
        : list.filter((p) => normalizeStatus(p.status) !== "CANCELED"),
    [isCanceledView, list]
  );

  React.useEffect(() => {
    if (autoSearch && initialKeyword.trim()) {
      dispatch(
        receptionActions.searchReceptionsRequest({
          type: initialSearchType,
          keyword: initialKeyword.trim(),
        })
      );
      return;
    }
    dispatch(receptionActions.fetchReceptionsRequest());
  }, [dispatch, autoSearch, initialKeyword, initialSearchType]);


  React.useEffect(() => {
    if (!filteredList.length) return;
    const first = filteredList[0];
    if (!selected || !filteredList.some((p) => p.receptionId === selected.receptionId)) {
      dispatch(receptionActions.fetchReceptionSuccess(first));
      dispatch(receptionActions.fetchReceptionRequest({ receptionId: String(first.receptionId) }));
      return;
    }
    if (!selected.patientName && !selected.departmentName && !selected.doctorName) {
      dispatch(
        receptionActions.fetchReceptionRequest({
          receptionId: String(selected.receptionId),
        })
      );
    }
  }, [filteredList, selected, dispatch]);

  const onSearch = () => {
    const kw = keyword.trim();
    if (!kw) return alert("검색어는 필수입니다.");
    dispatch(receptionActions.searchReceptionsRequest({ type: searchType, keyword: kw }));
  };

  const onReset = () => {
    setKeyword("");
    setSearchType("receptionNo");
    dispatch(receptionActions.fetchReceptionsRequest());
  };

  const onSelect = (p: Reception) => {
    dispatch(receptionActions.fetchReceptionSuccess(p));
    dispatch(receptionActions.fetchReceptionRequest({ receptionId: String(p.receptionId) }));
  };

  const onCancel = (receptionId: string) => {
    if (!confirm("접수를 취소 처리하시겠습니까?")) return;
    dispatch(receptionActions.cancelReceptionRequest({ receptionId }));
  };

  const primary =
    selected && filteredList.some((p) => p.receptionId === selected.receptionId)
      ? selected
      : filteredList[0];
  const primaryName = primary?.patientName?.trim() || "";
  const primaryDepartment = formatDepartmentName(
    primary?.departmentName,
    primary?.departmentId
  );
  const primaryDoctor = primary?.doctorName?.trim() || "";
  const avatarLabel = primaryName
    ? primaryName.slice(0, 1)
    : primary?.patientId
    ? String(primary.patientId).slice(-2)
    : "R";
  const totalCount = filteredList.length;

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
              접수 검색
            </Typography>
            <TextField
              select
              size="small"
              value={searchType}
              onChange={(e) => setSearchType(e.target.value as any)}
              sx={{ width: { xs: "100%", md: 180 } }}
            >
              {SEARCH_OPTIONS.map((o) => (
                <MenuItem key={o.value} value={o.value}>
                  {o.label}
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
            <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
              <Chip label={`전체 ${totalCount}`} color="primary" />
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
                  <Typography sx={{ color: "#7b8aa9", fontSize: 13 }}>
                    {primary?.receptionNo ?? "-"}
                  </Typography>
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
                  href={primary ? `/receptions/${primary.receptionId}` : "#"}
                  disabled={!primary}
                >
                  상세 보기
                </Button>
                <Button
                  variant="outlined"
                  sx={{ color: "#2b5aa9" }}
                  component={Link}
                  href="/reservations"
                >
                  예약 관리
                </Button>
                <Button variant="outlined" sx={{ color: "#2b5aa9" }}>
                  검사 기록
                </Button>
                <Button variant="outlined" sx={{ color: "#2b5aa9" }}>
                  처방 이력
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
                  <Typography fontWeight={800}>접수 목록</Typography>
                  <Chip label={`총 ${totalCount}`} size="small" color="primary" />
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
                  {filteredList.map((p) => {
                    const isSelected = selected?.receptionId === p.receptionId;
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
                          {p.patientName?.trim()
                            ? p.patientName.trim().slice(0, 1)
                            : String(p.patientId ?? "?").slice(-2)}
                        </Avatar>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography fontWeight={700} noWrap>
                            {p.receptionNo}
                          </Typography>
                          <Typography sx={{ color: "#7b8aa9", fontSize: 12 }} noWrap>
                            {p.patientName?.trim() || `환자 ${p.patientId ?? "-"}`} ·{" "}
                            {formatDepartmentName(p.departmentName, p.departmentId)} ·{" "}
                            {statusLabel(p.status)}
                          </Typography>
                        </Box>
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
                      </Box>
                    );
                  })}

                  {filteredList.length === 0 && (
                    <Typography color="#7b8aa9">조회된 접수가 없습니다.</Typography>
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


