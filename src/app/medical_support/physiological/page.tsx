"use client";

import * as React from "react";
import Link from "next/link";
import MainLayout from "@/components/layout/MainLayout";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";

type PhysiologicalExam = {
  physiologicalExamId: string;
  testExecutionId: string;
  examEquipmentId: string;
  rawData: string;
  reportDocId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

const mockItems: PhysiologicalExam[] = [
  {
    physiologicalExamId: "PHY_001",
    testExecutionId: "TE_3001",
    examEquipmentId: "EQ_001",
    rawData: "ECG_RAW_001",
    reportDocId: "RPT_001",
    status: "COMPLETED",
    createdAt: "2026-03-26T09:00:00",
    updatedAt: "2026-03-26T10:00:00",
  },
  {
    physiologicalExamId: "PHY_002",
    testExecutionId: "TE_3002",
    examEquipmentId: "EQ_002",
    rawData: "PFT_RAW_002",
    reportDocId: "RPT_002",
    status: "IN_PROGRESS",
    createdAt: "2026-03-26T09:30:00",
    updatedAt: "2026-03-26T10:10:00",
  },
  {
    physiologicalExamId: "PHY_003",
    testExecutionId: "TE_3003",
    examEquipmentId: "EQ_003",
    rawData: "EEG_RAW_003",
    reportDocId: "RPT_003",
    status: "WAITING",
    createdAt: "2026-03-26T10:00:00",
    updatedAt: "2026-03-26T10:00:00",
  },
];

const DONE_STATUSES = ["COMPLETED"];
const ACTIVE_STATUSES = ["IN_PROGRESS"];

const formatDateTime = (value?: string | null) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
};

const normalizeStatus = (value?: string | null) =>
  value?.trim().toUpperCase() ?? "";

const safeValue = (value?: string | number | null) => {
  if (value === null || value === undefined) return "-";
  const text = String(value).trim();
  return text ? text : "-";
};

const getStatusColor = (
  status?: string | null
): "default" | "info" | "success" => {
  const normalized = normalizeStatus(status);

  if (DONE_STATUSES.includes(normalized)) return "success";
  if (ACTIVE_STATUSES.includes(normalized)) return "info";

  return "default";
};

const getStatusSx = (status?: string | null) => {
  const normalized = normalizeStatus(status);

  if (normalized === "WAITING") {
    return {
      backgroundColor: "#616161",
      color: "#ffffff",
      fontWeight: 600,
    };
  }

  if (normalized === "CANCELLED") {
    return {
      backgroundColor: "#eeeeee",
      color: "#757575",
      fontWeight: 500,
    };
  }

  return {
    fontWeight: 600,
  };
};

export default function PhysiologicalPage() {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  const items = mockItems;
  const loading = false;
  const error = "";

  const completedCount = React.useMemo(
    () =>
      items.filter((item) => DONE_STATUSES.includes(normalizeStatus(item.status)))
        .length,
    [items]
  );

  const inProgressCount = React.useMemo(
    () =>
      items.filter((item) =>
        ACTIVE_STATUSES.includes(normalizeStatus(item.status))
      ).length,
    [items]
  );

  const maxPage = Math.max(0, Math.ceil(items.length / rowsPerPage) - 1);
  const currentPage = Math.min(page, maxPage);

  const paginatedItems = React.useMemo(
    () =>
      items.slice(
        currentPage * rowsPerPage,
        currentPage * rowsPerPage + rowsPerPage
      ),
    [currentPage, items, rowsPerPage]
  );

  const selected = React.useMemo(
    () =>
      items.find(
        (item) =>
          String(item.physiologicalExamId) === String(selectedId)
      ) ?? null,
    [items, selectedId]
  );

  const activeSelected = selected ?? paginatedItems[0] ?? items[0] ?? null;

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setRowsPerPage(Number(event.target.value));
    setPage(0);
  };

  const handleSelect = (item: PhysiologicalExam) => {
    setSelectedId(String(item.physiologicalExamId));
  };

  return (
    <MainLayout showSidebar={false}>
      <Stack spacing={2}>
        <Card
          sx={{
            borderRadius: 3,
            border: "1px solid var(--line)",
            boxShadow: "var(--shadow-1)",
            background:
              "linear-gradient(120deg, rgba(11, 91, 143, 0.2) 0%, rgba(11, 91, 143, 0) 55%)",
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2}
              alignItems="center"
            >
              <Stack spacing={0.5} sx={{ flexGrow: 1 }}>
                <Typography sx={{ fontSize: 22, fontWeight: 900 }}>
                  생리 기능 검사 워크스테이션
                </Typography>
                <Typography sx={{ color: "var(--muted)" }}>
                  생리 기능 검사 목록을 조회하고 선택한 항목의 상세 정보를 확인하는 화면입니다.
                </Typography>
              </Stack>

              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  disabled={loading}
                >
                  새로고침
                </Button>
                <Button
                  component={Link}
                  href="/medical_support/physiological/create"
                  variant="contained"
                  startIcon={<AddIcon />}
                >
                  신규 작성
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
          <Chip label={`전체 ${items.length}`} color="primary" />
          <Chip
            label={`진행 중 ${inProgressCount}`}
            color="info"
            variant="outlined"
          />
          <Chip
            label={`완료 ${completedCount}`}
            color="success"
            variant="outlined"
          />
          {loading && <Chip label="불러오는 중" variant="outlined" />}
          {error && <Chip label={`오류: ${error}`} color="error" />}
        </Stack>

        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: { xs: "1fr", lg: "2.2fr 1.2fr" },
            alignItems: "stretch",
          }}
        >
          <Card sx={{ borderRadius: 3, border: "1px solid var(--line)" }}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                justifyContent="space-between"
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <ScienceOutlinedIcon sx={{ color: "var(--brand)" }} />
                  <Typography fontWeight={800}>생리 기능 검사 목록</Typography>
                </Stack>
                <Chip label={`표시 ${items.length}`} size="small" />
              </Stack>

              {loading && (
                <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
                  <CircularProgress size={28} />
                </Box>
              )}

              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}

              {!loading && !error && (
                <Paper
                  elevation={0}
                  sx={{
                    mt: 2,
                    borderRadius: 2,
                    border: "1px solid var(--line)",
                    overflow: "hidden",
                  }}
                >
                  <TableContainer>
                    <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell align="center">번호</TableCell>
                          <TableCell align="center">생리기능검사 ID</TableCell>
                          <TableCell align="center">검사수행 ID</TableCell>
                          <TableCell align="center">검사장비 ID</TableCell>
                          <TableCell align="center">리포트문서 ID</TableCell>
                          <TableCell align="center">상태</TableCell>
                          <TableCell align="center">생성일시</TableCell>
                        </TableRow>
                      </TableHead>

                      <TableBody>
                        {paginatedItems.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                              생리 기능 검사 데이터가 없습니다.
                            </TableCell>
                          </TableRow>
                        )}

                        {paginatedItems.map((item, index) => (
                          <TableRow
                            key={String(item.physiologicalExamId)}
                            hover
                            onClick={() => handleSelect(item)}
                            sx={{
                              cursor: "pointer",
                              "& td": { py: 1.25, whiteSpace: "nowrap" },
                              "&:hover": { backgroundColor: "#f9fbff" },
                              backgroundColor:
                                String(activeSelected?.physiologicalExamId) ===
                                String(item.physiologicalExamId)
                                  ? "rgba(11, 91, 143, 0.08)"
                                  : "transparent",
                            }}
                          >
                            <TableCell align="center">
                              {currentPage * rowsPerPage + index + 1}
                            </TableCell>
                            <TableCell align="center">
                              {safeValue(item.physiologicalExamId)}
                            </TableCell>
                            <TableCell align="center">
                              {safeValue(item.testExecutionId)}
                            </TableCell>
                            <TableCell align="center">
                              {safeValue(item.examEquipmentId)}
                            </TableCell>
                            <TableCell align="center">
                              {safeValue(item.reportDocId)}
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                label={safeValue(item.status)}
                                color={getStatusColor(item.status)}
                                size="small"
                                sx={getStatusSx(item.status)}
                              />
                            </TableCell>
                            <TableCell align="center">
                              {formatDateTime(item.createdAt)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <TablePagination
                    component="div"
                    count={items.length}
                    page={currentPage}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[10, 20, 50]}
                    labelRowsPerPage="페이지당 행 수"
                    labelDisplayedRows={({ from, to, count }) =>
                      `${from}-${to} / 총 ${count}`
                    }
                  />
                </Paper>
              )}
            </CardContent>
          </Card>

          <Stack spacing={2}>
            <Card sx={{ borderRadius: 3, border: "1px solid var(--line)" }}>
              <CardContent sx={{ p: 2.5 }}>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <ScienceOutlinedIcon sx={{ color: "var(--brand-strong)" }} />
                    <Typography fontWeight={800}>선택 생리 기능 검사</Typography>
                  </Stack>

                  {activeSelected && (
                    <Stack direction="row" spacing={1}>
                      <Chip
                        label={safeValue(activeSelected.status)}
                        size="small"
                        color={getStatusColor(activeSelected.status)}
                        sx={getStatusSx(activeSelected.status)}
                      />
                      <Button
                        component={Link}
                        href={`/medical_support/physiological/edit/${activeSelected.physiologicalExamId}`}
                        variant="outlined"
                        size="small"
                        startIcon={<EditOutlinedIcon />}
                      >
                        수정
                      </Button>
                    </Stack>
                  )}
                </Stack>

                <Box
                  sx={{
                    mt: 2,
                    p: 2,
                    borderRadius: 2,
                    bgcolor: "rgba(255,255,255,0.7)",
                  }}
                >
                  <Row
                    label="생리기능검사 ID"
                    value={safeValue(activeSelected?.physiologicalExamId)}
                  />
                  <Row
                    label="검사수행 ID"
                    value={safeValue(activeSelected?.testExecutionId)}
                  />
                  <Row
                    label="검사장비 ID"
                    value={safeValue(activeSelected?.examEquipmentId)}
                  />
                  <Row
                    label="원본데이터"
                    value={safeValue(activeSelected?.rawData)}
                  />
                  <Row
                    label="리포트문서 ID"
                    value={safeValue(activeSelected?.reportDocId)}
                  />
                  <Row
                    label="상태"
                    value={safeValue(activeSelected?.status)}
                  />
                  <Row
                    label="생성일시"
                    value={formatDateTime(activeSelected?.createdAt)}
                  />
                  <Row
                    label="수정일시"
                    value={formatDateTime(activeSelected?.updatedAt)}
                  />
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ borderRadius: 3, border: "1px solid var(--line)" }}>
              <CardContent sx={{ p: 2.5 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <FactCheckOutlinedIcon sx={{ color: "var(--accent)" }} />
                  <Typography fontWeight={800}>상태 요약</Typography>
                </Stack>
                <Stack spacing={1.25} sx={{ mt: 2 }}>
                  <SummaryRow label="전체 항목" value={items.length} />
                  <SummaryRow label="진행 중 항목" value={inProgressCount} />
                  <SummaryRow label="완료 항목" value={completedCount} />
                </Stack>
              </CardContent>
            </Card>

            <Card sx={{ borderRadius: 3, border: "1px solid var(--line)" }}>
              <CardContent sx={{ p: 2.5 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <HelpOutlineOutlinedIcon sx={{ color: "var(--brand)" }} />
                  <Typography fontWeight={800}>점검 가이드</Typography>
                </Stack>
                <Stack spacing={1} sx={{ mt: 2 }}>
                  {[
                    "좌측 목록: 생리 기능 검사 항목 조회",
                    "행 클릭: 우측 상세 정보 갱신",
                    "수정 버튼: 생리 기능 검사 수정 화면으로 이동",
                    "신규 작성: 생리 기능 검사 등록 화면으로 이동",
                  ].map((text) => (
                    <Box
                      key={text}
                      sx={{
                        p: 1.25,
                        borderRadius: 2,
                        border: "1px solid var(--line)",
                        bgcolor: "rgba(255,255,255,0.7)",
                      }}
                    >
                      <Typography sx={{ fontSize: 12, color: "var(--muted)" }}>
                        {text}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Box>
      </Stack>
    </MainLayout>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Stack direction="row" justifyContent="space-between" spacing={2}>
      <Typography sx={{ color: "text.secondary", fontSize: 13 }}>
        {label}
      </Typography>
      <Typography sx={{ fontWeight: 700, fontSize: 13, textAlign: "right" }}>
        {value}
      </Typography>
    </Stack>
  );
}

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <Box
      sx={{
        p: 1.25,
        borderRadius: 2,
        border: "1px solid var(--line)",
        display: "flex",
        justifyContent: "space-between",
        bgcolor: "rgba(255,255,255,0.7)",
      }}
    >
      <Typography>{label}</Typography>
      <Typography fontWeight={800}>{value}</Typography>
    </Box>
  );
}