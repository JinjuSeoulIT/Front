"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
  Pagination,
  Stack,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import AddIcon from "@mui/icons-material/Add";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/store/store";
import { patientActions } from "@/features/patients/patientSlice";
import type {
  Patient,
  PatientMultiSearchPayload,
  PatientSearchPayload,
} from "@/features/patients/patientTypes";
import PatientRegistrationModal from "@/components/patient/PatientRegistrationModal";

const ROWS_PER_PAGE = 10;

const SEARCH_OPTIONS: { label: string; value: PatientSearchPayload["type"] }[] = [
  { label: "환자번호", value: "patientNo" },
  { label: "이름", value: "name" },
  { label: "연락처", value: "phone" },
  { label: "생년월일", value: "birthDate" },
  { label: "환자ID", value: "patientId" },
];

const DETAIL_TABS = ["기본", "보호자", "메모", "바로가기"];

const API_BASE =
  process.env.NEXT_PUBLIC_PATIENTS_API_BASE_URL ?? "http://192.168.1.60:8181";

function resolvePhotoUrl(url?: string | null) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${API_BASE}${url.startsWith("/") ? "" : "/"}${url}`;
}

function sexLabel(g?: Patient["gender"]) {
  if (g === "M") return "남";
  if (g === "F") return "여";
  return "-";
}

function safe(v?: string | null) {
  return v && String(v).trim() ? v : "-";
}

function statusChipLabel(statusCode?: string | null) {
  return statusCode || "ACTIVE";
}

export default function PatientList() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { list, loading, error, selected } = useSelector((s: RootState) => s.patients);

  const [searchType, setSearchType] = React.useState<PatientSearchPayload["type"]>("patientNo");
  const [keyword, setKeyword] = React.useState("");

  const [multiName, setMultiName] = React.useState("");
  const [multiBirthDate, setMultiBirthDate] = React.useState("");
  const [multiPhone, setMultiPhone] = React.useState("");

  const [detailTab, setDetailTab] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [registrationModalOpen, setRegistrationModalOpen] = React.useState(false);

  const searchParams = useSearchParams();

  React.useEffect(() => {
    dispatch(patientActions.fetchPatientsRequest());
  }, [dispatch]);

  React.useEffect(() => {
    if (searchParams.get("new") === "1") {
      setRegistrationModalOpen(true);
      router.replace("/patients", { scroll: false });
    }
  }, [searchParams, router]);

  React.useEffect(() => {
    if (!list.length) return;
    if (selected && list.some((p) => p.patientId === selected.patientId)) return;
    dispatch(patientActions.fetchPatientSuccess(list[0]));
  }, [list, selected, dispatch]);

  React.useEffect(() => {
    setPage(1);
  }, [list.length]);

  const onSelect = (p: Patient) => {
    dispatch(patientActions.fetchPatientSuccess(p));
  };

  const onSearch = () => {
    const kw = keyword.trim();
    if (!kw) {
      alert("검색어를 입력하세요.");
      return;
    }
    dispatch(patientActions.searchPatientsRequest({ type: searchType, keyword: kw }));
  };

  const onReset = () => {
    setKeyword("");
    setSearchType("patientNo");
    dispatch(patientActions.fetchPatientsRequest());
  };

  const onMultiSearch = () => {
    const payload: PatientMultiSearchPayload = {
      name: multiName.trim() || undefined,
      birthDate: multiBirthDate.trim() || undefined,
      phone: multiPhone.trim() || undefined,
    };

    if (!payload.name && !payload.birthDate && !payload.phone) {
      alert("검색 조건을 하나 이상 입력하세요.");
      return;
    }

    dispatch(patientActions.searchPatientsMultiRequest(payload));
  };

  const onMultiReset = () => {
    setMultiName("");
    setMultiBirthDate("");
    setMultiPhone("");
    dispatch(patientActions.fetchPatientsRequest());
  };

  const onDeactivate = (patientId: number) => {
    if (!confirm("이 환자를 비활성 처리하시겠습니까?")) return;
    dispatch(patientActions.deletePatientRequest(patientId));
  };

  const primary = selected ?? list[0] ?? null;
  const totalPages = Math.max(1, Math.ceil(list.length / ROWS_PER_PAGE));
  const pagedPatients = React.useMemo(() => {
    const start = (page - 1) * ROWS_PER_PAGE;
    return list.slice(start, start + ROWS_PER_PAGE);
  }, [list, page]);
  const emptyRowCount = Math.max(0, ROWS_PER_PAGE - pagedPatients.length);

  const totalCount = list.length;
  const vipCount = list.filter((p) => p.isVip).length;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: 20 }}>환자 관리</Typography>
          <Typography sx={{ color: "text.secondary", fontSize: 13, mt: 0.25 }}>
            환자 검색, 목록, 상세를 한 화면에서 처리합니다.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setRegistrationModalOpen(true)}
          >
            신규 등록
          </Button>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={onReset} disabled={loading}>
            새로고침
          </Button>
        </Stack>
      </Stack>

      <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
        <Chip label={`전체 ${totalCount}`} color="primary" />
        <Chip label={`VIP ${vipCount}`} variant="outlined" />
        {error && <Chip label={`에러: ${error}`} color="error" variant="outlined" />}
        {loading && <Chip label="조회 중" variant="outlined" />}
      </Stack>

      <Box
        sx={{
          display: "grid",
          gap: 2,
          alignItems: "start",
          gridTemplateColumns: {
            xs: "1fr",
            lg: "320px minmax(0, 1fr) 380px",
          },
        }}
      >
        <Card variant="outlined" sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 2 }}>
            <Typography sx={{ fontWeight: 800, mb: 1 }}>검색</Typography>

            <Stack spacing={1.25}>
              <Stack spacing={1} direction="row">
                <TextField
                  id="patient-search-type"
                  select
                  size="small"
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value as PatientSearchPayload["type"])}
                  sx={{ width: 130 }}
                >
                  {SEARCH_OPTIONS.map((o) => (
                    <MenuItem key={o.value} value={o.value}>
                      {o.label}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  id="patient-search-keyword"
                  size="small"
                  placeholder="검색어"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && onSearch()}
                  fullWidth
                />

                <Tooltip title="검색">
                  <span>
                    <IconButton onClick={onSearch} disabled={loading}>
                      <SearchIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              </Stack>

              <Divider />

              <Typography sx={{ fontWeight: 800, fontSize: 13 }}>다중 검색</Typography>

              <TextField
                id="patient-multi-name"
                label="이름"
                size="small"
                value={multiName}
                onChange={(e) => setMultiName(e.target.value)}
              />
              <DatePicker
                label="생년월일"
                value={multiBirthDate ? dayjs(multiBirthDate) : null}
                onChange={(date) =>
                  setMultiBirthDate(date ? dayjs(date).format("YYYY-MM-DD") : "")
                }
                slotProps={{
                  textField: {
                    id: "patient-multi-birth-date",
                    size: "small" as const,
                  },
                }}
              />
              <TextField
                id="patient-multi-phone"
                label="연락처"
                size="small"
                value={multiPhone}
                onChange={(e) => setMultiPhone(e.target.value)}
              />

              <Stack direction="row" spacing={1}>
                <Button variant="contained" onClick={onMultiSearch} disabled={loading} fullWidth>
                  검색
                </Button>
                <Button variant="outlined" onClick={onMultiReset} disabled={loading} fullWidth>
                  초기화
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        <Card variant="outlined" sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 0, display: "flex", flexDirection: "column", height: "100%" }}>
            <Box sx={{ p: 2, pb: 1.25 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography sx={{ fontWeight: 800 }}>환자 목록</Typography>
                <Chip label={`총 ${totalCount}`} size="small" />
              </Stack>
            </Box>

            <Divider />

            <TableContainer sx={{ height: { xs: 420, lg: 640 }, flex: 1, overflowY: "auto" }}>
              <Table stickyHeader size="small" aria-label="patient list">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ width: 56 }}>사진</TableCell>
                    <TableCell sx={{ width: 120 }}>환자번호</TableCell>
                    <TableCell sx={{ width: 110 }}>이름</TableCell>
                    <TableCell sx={{ width: 70 }}>성별</TableCell>
                    <TableCell sx={{ width: 120 }}>생년월일</TableCell>
                    <TableCell sx={{ width: 140 }}>연락처</TableCell>
                    <TableCell sx={{ width: 110 }}>상태</TableCell>
                    <TableCell sx={{ width: 110 }}>구분</TableCell>
                    <TableCell align="right" sx={{ width: 120 }}>
                      액션
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {pagedPatients.map((p) => {
                    const isSelected = primary?.patientId === p.patientId;
                    return (
                      <TableRow
                        key={p.patientId}
                        hover
                        selected={isSelected}
                        sx={{
                          cursor: "pointer",
                          "&.Mui-selected": {
                            backgroundColor: "rgba(25, 118, 210, 0.08)",
                          },
                        }}
                        onClick={() => onSelect(p)}
                        onDoubleClick={() => router.push(`/patients/${p.patientId}`)}
                      >
                        <TableCell>
                          <Avatar src={resolvePhotoUrl(p.photoUrl) || undefined} sx={{ width: 28, height: 28 }}>
                            {p.name?.slice(0, 1) ?? "?"}
                          </Avatar>
                        </TableCell>
                        <TableCell>{safe(p.patientNo)}</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>{p.name}</TableCell>
                        <TableCell>{sexLabel(p.gender)}</TableCell>
                        <TableCell>{safe(p.birthDate)}</TableCell>
                        <TableCell>{safe(p.phone)}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={statusChipLabel(p.statusCode)}
                            variant={p.statusCode === "ACTIVE" || !p.statusCode ? "filled" : "outlined"}
                            color={p.statusCode === "INACTIVE" ? "warning" : "default"}
                          />
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={0.5} sx={{ flexWrap: "wrap" }}>
                            {p.isVip && <Chip size="small" label="VIP" color="primary" />}
                            {p.isForeigner && <Chip size="small" label="외국인" variant="outlined" />}
                          </Stack>
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="상세 열기">
                            <IconButton
                              size="small"
                              component={Link}
                              href={`/patients/${p.patientId}`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <OpenInNewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="비활성 처리">
                            <IconButton
                              size="small"
                              color="warning"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeactivate(p.patientId);
                              }}
                            >
                              <BlockOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })}

                  {list.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9}>
                        <Typography sx={{ color: "text.secondary" }}>조회 결과가 없습니다.</Typography>
                      </TableCell>
                    </TableRow>
                  )}

                  {list.length > 0 &&
                    Array.from({ length: emptyRowCount }).map((_, idx) => (
                      <TableRow key={`empty-row-${idx}`} sx={{ height: 53 }}>
                        <TableCell colSpan={9} sx={{ py: 0 }} />
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Divider />
            <Box
              sx={{
                position: "sticky",
                bottom: 0,
                bgcolor: "background.paper",
                borderTop: "1px solid",
                borderColor: "divider",
                px: 2,
                py: 1.25,
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, value) => setPage(value)}
                color="primary"
                size="small"
                showFirstButton
                showLastButton
                disabled={list.length === 0}
              />
            </Box>
          </CardContent>
        </Card>

        <Card variant="outlined" sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 2 }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Avatar src={resolvePhotoUrl(primary?.photoUrl) || undefined} sx={{ width: 64, height: 64 }}>
                {primary?.name?.slice(0, 1) ?? "P"}
              </Avatar>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography sx={{ fontWeight: 900, fontSize: 18 }} noWrap>
                  {primary?.name ?? "환자를 선택하세요"}
                </Typography>
                <Typography sx={{ color: "text.secondary", fontSize: 12 }} noWrap>
                  {primary?.patientNo ? `환자번호 ${primary.patientNo}` : "환자번호 -"} / {primary ? `ID ${primary.patientId}` : "ID -"}
                </Typography>
                <Stack direction="row" spacing={0.5} sx={{ mt: 0.75, flexWrap: "wrap" }}>
                  {primary?.isVip && <Chip size="small" label="VIP" color="primary" />}
                  {primary?.statusCode && <Chip size="small" label={statusChipLabel(primary.statusCode)} variant="outlined" />}
                  {primary?.isForeigner && <Chip size="small" label="외국인" variant="outlined" />}
                </Stack>
              </Box>

              {primary && (
                <Button
                  variant="outlined"
                  size="small"
                  component={Link}
                  href={`/patients/${primary.patientId}`}
                  startIcon={<OpenInNewIcon />}
                >
                  상세
                </Button>
              )}
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Tabs
              value={detailTab}
              onChange={(_, v) => setDetailTab(v)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                minHeight: 34,
                "& .MuiTab-root": { minHeight: 34, fontSize: 13 },
              }}
            >
              {DETAIL_TABS.map((t) => (
                <Tab key={t} label={t} />
              ))}
            </Tabs>

            <Box sx={{ mt: 2 }}>
              {detailTab === 0 && (
                <Stack spacing={1.2}>
                  <Row label="성별" value={primary ? sexLabel(primary.gender) : "-"} />
                  <Row label="생년월일" value={safe(primary?.birthDate)} />
                  <Row label="연락처" value={safe(primary?.phone)} />
                  <Row label="이메일" value={safe(primary?.email)} />
                  <Row label="주소" value={formatAddress(primary)} />
                </Stack>
              )}

              {detailTab === 1 && (
                <Typography variant="body2" color="text.secondary">
                  가족 연락처는 환자 상세 페이지에서 확인할 수 있습니다.
                </Typography>
              )}

              {detailTab === 2 && (
                <Box
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                    p: 1.5,
                    minHeight: 140,
                    bgcolor: "background.default",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                    {primary?.note?.trim() ? primary.note : "메모가 없습니다."}
                  </Typography>
                </Box>
              )}

              {detailTab === 3 && (
                <Stack spacing={1}>
                  <Button
                    variant="outlined"
                    component={Link}
                    href={primary ? `/patients/${primary.patientId}` : "#"}
                    disabled={!primary}
                  >
                    환자 상세
                  </Button>
                  <Button variant="outlined" component={Link} href="/insurances">
                    보험 관리
                  </Button>
                  <Button variant="outlined" component={Link} href="/consents">
                    동의서 관리
                  </Button>
                </Stack>
              )}
            </Box>
          </CardContent>
        </Card>
      </Box>

      <PatientRegistrationModal
        open={registrationModalOpen}
        onClose={() => setRegistrationModalOpen(false)}
      />
    </Box>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Stack direction="row" justifyContent="space-between" spacing={2}>
      <Typography sx={{ color: "text.secondary", fontSize: 13 }}>{label}</Typography>
      <Typography sx={{ fontWeight: 700, fontSize: 13, textAlign: "right" }}>{value}</Typography>
    </Stack>
  );
}

function formatAddress(p?: Patient | null) {
  if (!p) return "-";
  const a = p.address?.trim();
  const d = p.addressDetail?.trim();
  if (!a && !d) return "-";
  if (a && d) return `${a} ${d}`;
  return a || d || "-";
}
