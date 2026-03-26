"use client";

import * as React from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
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
import { TestExecutionActions } from "@/features/medical_support/testExecution/testExecutionSlice";
import type { TestExecution } from "@/features/medical_support/testExecution/testExecutionType";
import type { RootState, AppDispatch } from "@/store/store";

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

export default function NurseSpecimenPage() {
  const dispatch = useDispatch<AppDispatch>();

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  const { list: items, loading, error } = useSelector(
    (state: RootState) => state.testexecutions
  );

  React.useEffect(() => {
    dispatch(
      TestExecutionActions.fetchTestExecutionsRequest({
        executionType: "SPECIMEN",
      })
    );
  }, [dispatch]);

  const completedCount = React.useMemo(
    () =>
      items.filter((item) =>
        DONE_STATUSES.includes(normalizeStatus(item.progressStatus))
      ).length,
    [items]
  );

  const inProgressCount = React.useMemo(
    () =>
      items.filter((item) =>
        ACTIVE_STATUSES.includes(normalizeStatus(item.progressStatus))
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
      items.find((item) => String(item.testExecutionId) === String(selectedId)) ??
      null,
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

  const handleSelect = (item: TestExecution) => {
    setSelectedId(String(item.testExecutionId));
  };

  return (
    <MainLayout showSidebar={false}>
      <Box sx={{ width: "100%", maxWidth: 1280, mx: "auto" }}>
        <Stack spacing={1.5}>
          <Card
            sx={{
              borderRadius: 3,
              border: "1px solid var(--line)",
              boxShadow: "var(--shadow-1)",
              background:
                "linear-gradient(120deg, rgba(11, 91, 143, 0.18) 0%, rgba(11, 91, 143, 0) 58%)",
            }}
          >
            <CardContent sx={{ p: { xs: 2, md: 2.25 } }}>
              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={1.5}
                alignItems={{ xs: "flex-start", md: "center" }}
              >
                <Stack spacing={0.25} sx={{ flexGrow: 1 }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <ScienceOutlinedIcon sx={{ color: "var(--brand-strong)" }} />
                    <Typography sx={{ fontSize: { xs: 19, md: 20 }, fontWeight: 900 }}>
                      검체 워크스테이션
                    </Typography>
                  </Stack>
                  <Typography sx={{ color: "var(--muted)", fontSize: 13 }}>
                    검사 수행 목록 중 검체 항목만 조회하고 상세를 확인하는 화면입니다.
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<RefreshIcon />}
                    onClick={() =>
                      dispatch(
                        TestExecutionActions.fetchTestExecutionsRequest({
                          executionType: "SPECIMEN",
                        })
                      )
                    }
                    disabled={loading}
                  >
                    새로고침
                  </Button>
                  <Button
                    component={Link}
                    href="/medical_support/testExecution/create"
                    variant="contained"
                    size="small"
                    startIcon={<AddIcon />}
                  >
                    신규 작성
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
            <Chip label={`전체 ${items.length}`} color="primary" size="small" />
            <Chip label={`진행 중 ${inProgressCount}`} color="info" variant="outlined" size="small" />
            <Chip label={`완료 ${completedCount}`} color="success" variant="outlined" size="small" />
            {loading && <Chip label="불러오는 중" variant="outlined" size="small" />}
            {error && <Chip label={`오류: ${error}`} color="error" size="small" />}
          </Stack>

          <Box
            sx={{
              display: "grid",
              gap: 1.5,
              gridTemplateColumns: { xs: "1fr", lg: "1.2fr 1fr" },
              alignItems: "start",
            }}
          >
            <Card sx={{ borderRadius: 3, border: "1px solid var(--line)" }}>
              <CardContent sx={{ p: 1.75 }}>
                <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                  <Typography fontWeight={800} sx={{ fontSize: 14 }}>
                    검체 목록
                  </Typography>
                  <Chip label={`${items.length}건`} size="small" />
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
                      mt: 1.5,
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
                            <TableCell align="center">검사수행 ID</TableCell>
                            <TableCell align="center">오더항목 ID</TableCell>
                            <TableCell align="center">검사유형</TableCell>
                            <TableCell align="center">진행상태</TableCell>
                            <TableCell align="center">시작일시</TableCell>
                            <TableCell align="center">완료일시</TableCell>
                          </TableRow>
                        </TableHead>

                        <TableBody>
                          {paginatedItems.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                                조회된 검체가 없습니다.
                              </TableCell>
                            </TableRow>
                          )}

                          {paginatedItems.map((item, index) => (
                            <TableRow
                              key={String(item.testExecutionId)}
                              hover
                              onClick={() => handleSelect(item)}
                              sx={{
                                cursor: "pointer",
                                "& td": { py: 1.25, whiteSpace: "nowrap" },
                                "&:hover": { backgroundColor: "#f9fbff" },
                                backgroundColor:
                                  String(activeSelected?.testExecutionId) ===
                                  String(item.testExecutionId)
                                    ? "rgba(11, 91, 143, 0.08)"
                                    : "transparent",
                              }}
                            >
                              <TableCell align="center">
                                {currentPage * rowsPerPage + index + 1}
                              </TableCell>
                              <TableCell align="center">
                                {safeValue(item.testExecutionId)}
                              </TableCell>
                              <TableCell align="center">
                                {safeValue(item.orderItemId)}
                              </TableCell>
                              <TableCell align="center">
                                {safeValue(item.executionType)}
                              </TableCell>
                              <TableCell align="center">
                                <Chip
                                  label={safeValue(item.progressStatus)}
                                  color={getStatusColor(item.progressStatus)}
                                  size="small"
                                  sx={getStatusSx(item.progressStatus)}
                                />
                              </TableCell>
                              <TableCell align="center">
                                {formatDateTime(item.startedAt)}
                              </TableCell>
                              <TableCell align="center">
                                {formatDateTime(item.completedAt)}
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
                <CardContent sx={{ p: 1.75 }}>
                  <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                    <Typography fontWeight={800} sx={{ fontSize: 14 }}>
                      선택 검사 수행
                    </Typography>
                    {activeSelected && (
                      <Stack direction="row" spacing={1}>
                        <Chip
                          label={safeValue(activeSelected.progressStatus)}
                          size="small"
                          color={getStatusColor(activeSelected.progressStatus)}
                          sx={getStatusSx(activeSelected.progressStatus)}
                        />
                        <Button
                          component={Link}
                          href={`/medical_support/testExecution/edit/${activeSelected.testExecutionId}`}
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
                      mt: 1.5,
                      p: 1.25,
                      borderRadius: 1.5,
                      bgcolor: "rgba(255,255,255,0.7)",
                      border: "1px solid var(--line)",
                      display: "grid",
                      gap: 0.8,
                      gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                    }}
                  >
                    <Row label="검사수행 ID" value={safeValue(activeSelected?.testExecutionId)} />
                    <Row label="오더항목 ID" value={safeValue(activeSelected?.orderItemId)} />
                    <Row label="검사유형" value={safeValue(activeSelected?.executionType)} />
                    <Row label="진행상태" value={safeValue(activeSelected?.progressStatus)} />
                    <Row label="시작일시" value={formatDateTime(activeSelected?.startedAt)} />
                    <Row label="완료일시" value={formatDateTime(activeSelected?.completedAt)} />
                    <Row label="수행자 ID" value={safeValue(activeSelected?.performerId)} />
                    <Row label="수정일시" value={formatDateTime(activeSelected?.updatedAt)} />
                  </Box>
                </CardContent>
              </Card>

              <Card sx={{ borderRadius: 3, border: "1px solid var(--line)" }}>
                <CardContent sx={{ p: 1.75 }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <FactCheckOutlinedIcon sx={{ color: "var(--accent)" }} />
                    <Typography fontWeight={800} sx={{ fontSize: 14 }}>
                      상태 요약
                    </Typography>
                  </Stack>
                  <Stack spacing={1.25} sx={{ mt: 2 }}>
                    <SummaryRow label="전체 항목" value={items.length} />
                    <SummaryRow label="진행 중 항목" value={inProgressCount} />
                    <SummaryRow label="완료 항목" value={completedCount} />
                  </Stack>
                </CardContent>
              </Card>

              <Card sx={{ borderRadius: 3, border: "1px solid var(--line)" }}>
                <CardContent sx={{ p: 1.75 }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <HelpOutlineOutlinedIcon sx={{ color: "var(--brand)" }} />
                    <Typography fontWeight={800} sx={{ fontSize: 14 }}>
                      점검 가이드
                    </Typography>
                  </Stack>
                  <Stack spacing={1} sx={{ mt: 2 }}>
                    {[
                      "좌측 목록: SPECIMEN 타입의 검사 수행 목록 조회",
                      "행 클릭: 우측 선택 검사 수행 정보 갱신",
                      "수정 버튼: 검사 수행 수정 화면으로 이동",
                      "검체 기록은 검사 수행 수정 후 확인",
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
      </Box>
    </MainLayout>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Stack direction="row" justifyContent="space-between" spacing={1.25}>
      <Typography sx={{ color: "text.secondary", fontSize: 12.5 }}>{label}</Typography>
      <Typography sx={{ fontWeight: 700, fontSize: 12.5, textAlign: "right" }}>
        {value}
      </Typography>
    </Stack>
  );
}

function SummaryRow({ label, value }: { label: string; value: React.ReactNode }) {
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
