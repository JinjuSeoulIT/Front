"use client";

import type { ChangeEvent } from "react";
import { useMemo, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";

type TreatmentResult = {
  treatmentResultId: string | number;
  testExecutionId: string | number;
  status: string;
  performedAt: string;
  performerId: string | number;
  detail: string;
  createdAt: string;
  updatedAt: string;
};

const DONE_STATUSES = ["COMPLETED"];
const ACTIVE_STATUSES = ["IN_PROGRESS"];

const mockRows: TreatmentResult[] = [
  {
    treatmentResultId: "TR_001",
    testExecutionId: "TE_001",
    status: "COMPLETED",
    performedAt: "2026-03-26T09:30:00",
    performerId: "DOC_001",
    detail: "기본 처치 완료",
    createdAt: "2026-03-26T09:00:00",
    updatedAt: "2026-03-26T09:40:00",
  },
  {
    treatmentResultId: "TR_002",
    testExecutionId: "TE_002",
    status: "IN_PROGRESS",
    performedAt: "2026-03-26T10:10:00",
    performerId: "DOC_002",
    detail: "환자 상태 확인 후 추가 처치 진행 중",
    createdAt: "2026-03-26T10:00:00",
    updatedAt: "2026-03-26T10:15:00",
  },
  {
    treatmentResultId: "TR_003",
    testExecutionId: "TE_003",
    status: "WAITING",
    performedAt: "",
    performerId: "DOC_003",
    detail: "처치 대기",
    createdAt: "2026-03-26T10:20:00",
    updatedAt: "2026-03-26T10:20:00",
  },
];

const TABLE_HEADERS = [
  "번호",
  "처치결과 ID",
  "검사수행 ID",
  "상태",
  "시행일시",
  "시행자 ID",
  "처치내용",
  "생성일시",
  "수정일시",
];

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

const safeValue = (value?: string | number | null) => {
  if (value === null || value === undefined) return "-";

  const text = String(value).trim();
  return text ? text : "-";
};

export default function TreatmentResultPage() {
  const [rows, setRows] = useState<TreatmentResult[]>(mockRows);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const completedCount = useMemo(
    () =>
      rows.filter((item) =>
        DONE_STATUSES.includes(normalizeStatus(item.status))
      ).length,
    [rows]
  );

  const inProgressCount = useMemo(
    () =>
      rows.filter((item) =>
        ACTIVE_STATUSES.includes(normalizeStatus(item.status))
      ).length,
    [rows]
  );

  const maxPage = Math.max(0, Math.ceil(rows.length / rowsPerPage) - 1);
  const currentPage = Math.min(page, maxPage);

  const paginatedRows = useMemo(
    () =>
      rows.slice(
        currentPage * rowsPerPage,
        currentPage * rowsPerPage + rowsPerPage
      ),
    [currentPage, rows, rowsPerPage]
  );

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setRowsPerPage(Number(event.target.value));
    setPage(0);
  };

  const handleRefresh = () => {
    setRows([...mockRows]);
  };

  return (
    <MainLayout>
      <Box sx={{ px: 3, py: 3, maxWidth: 1400, mx: "auto" }}>
        <Card
          elevation={2}
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            border: "1px solid",
            borderColor: "grey.200",
            backgroundColor: "#fff",
          }}
        >
          <Box sx={{ px: 3, py: 2.5, backgroundColor: "#fafafa" }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: { xs: "flex-start", lg: "center" },
                gap: 2,
                flexWrap: "wrap",
              }}
            >
              <Box sx={{ minWidth: 240, flex: "1 1 280px" }}>
                <Typography variant="h6" fontWeight={700}>
                  처치 결과 목록
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  처치 결과 정보를 조회할 수 있습니다.
                </Typography>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  flexWrap: "wrap",
                }}
              >
                <Chip label={`총 ${rows.length}건`} size="small" />
                <Chip
                  label={`진행 중 ${inProgressCount}건`}
                  size="small"
                  color="info"
                  variant="outlined"
                />
                <Chip
                  label={`완료 ${completedCount}건`}
                  size="small"
                  color="success"
                  variant="outlined"
                />
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<RefreshIcon />}
                  onClick={handleRefresh}
                >
                  새로고침
                </Button>
              </Box>
            </Box>
          </Box>

          <Divider />

          <CardContent sx={{ p: 2.5 }}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: 2,
                border: "1px solid",
                borderColor: "grey.200",
                overflow: "hidden",
              }}
            >
              <TableContainer>
                <Table size="small" stickyHeader sx={{ minWidth: 1300 }}>
                  <TableHead>
                    <TableRow>
                      {TABLE_HEADERS.map((label) => (
                        <TableCell
                          key={label}
                          align="center"
                          sx={{
                            fontWeight: 700,
                            py: 1.4,
                            backgroundColor: "#f8f9fa",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {label}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {rows.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={9} align="center" sx={{ py: 5 }}>
                          처치 결과 데이터가 없습니다.
                        </TableCell>
                      </TableRow>
                    )}

                    {paginatedRows.map((item, index) => (
                      <TableRow
                        key={String(item.treatmentResultId)}
                        hover
                        sx={{
                          "& td": { py: 1.25, whiteSpace: "nowrap" },
                          "&:hover": { backgroundColor: "#f9fbff" },
                        }}
                      >
                        <TableCell align="center">
                          {currentPage * rowsPerPage + index + 1}
                        </TableCell>
                        <TableCell align="center">
                          {safeValue(item.treatmentResultId)}
                        </TableCell>
                        <TableCell align="center">
                          {safeValue(item.testExecutionId)}
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
                          {formatDateTime(item.performedAt)}
                        </TableCell>
                        <TableCell align="center">
                          {safeValue(item.performerId)}
                        </TableCell>
                        <TableCell
                          align="left"
                          sx={{
                            maxWidth: 260,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {safeValue(item.detail)}
                        </TableCell>
                        <TableCell align="center">
                          {formatDateTime(item.createdAt)}
                        </TableCell>
                        <TableCell align="center">
                          {formatDateTime(item.updatedAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                component="div"
                count={rows.length}
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
          </CardContent>
        </Card>
      </Box>
    </MainLayout>
  );
}