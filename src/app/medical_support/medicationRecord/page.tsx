"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import MainLayout from "@/components/layout/MainLayout";
import {
  Box,
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
  Button,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";

type MedicationRecord = {
  medicationId: string | number;
  testExecutionId: string | number;
  administeredAt: string;
  doseNumber: string | number;
  doseUnit: string;
  nursingId: string | number;
  status: string;
  createdAt: string;
  updatedAt: string;
};

// 임시 더미 데이터
const mockRows: MedicationRecord[] = [
  {
    medicationId: "MED_001",
    testExecutionId: "TE_001",
    administeredAt: "2026-03-26T09:30:00",
    doseNumber: 1,
    doseUnit: "정",
    nursingId: "NUR_001",
    status: "ACTIVE",
    createdAt: "2026-03-26T09:00:00",
    updatedAt: "2026-03-26T09:30:00",
  },
  {
    medicationId: "MED_002",
    testExecutionId: "TE_002",
    administeredAt: "2026-03-26T10:00:00",
    doseNumber: 2,
    doseUnit: "mL",
    nursingId: "NUR_002",
    status: "INACTIVE",
    createdAt: "2026-03-26T09:40:00",
    updatedAt: "2026-03-26T10:10:00",
  },
];

const TABLE_HEADERS = [
  "번호",
  "투약기록 ID",
  "검사수행 ID",
  "투약일시",
  "투약량",
  "투약단위",
  "간호사 ID",
  "상태",
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

const safeValue = (value?: string | number | null) => {
  if (value === null || value === undefined) return "-";

  const text = String(value).trim();
  return text ? text : "-";
};

const normalizeStatus = (value?: string | null) =>
  value?.trim().toUpperCase() ?? "";

const getStatusColor = (
  status?: string | null
): "default" | "success" | "error" => {
  const normalized = normalizeStatus(status);

  if (normalized === "ACTIVE") return "success";
  if (normalized === "INACTIVE") return "error";

  return "default";
};

export default function MedicationRecordPage() {
  const [rows, setRows] = useState<MedicationRecord[]>(mockRows);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const activeCount = useMemo(
    () => rows.filter((item) => normalizeStatus(item.status) === "ACTIVE").length,
    [rows]
  );

  const inactiveCount = useMemo(
    () => rows.filter((item) => normalizeStatus(item.status) === "INACTIVE").length,
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
    // 나중에 API 연결 시 여기서 재조회
    setRows([...mockRows]);
  };

  return (
    <MainLayout>
      <Box sx={{ px: 3, py: 3, maxWidth: 1600, mx: "auto" }}>
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
                  투약 기록 목록
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  투약 기록 정보를 조회할 수 있습니다.
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
                  label={`활성 ${activeCount}건`}
                  size="small"
                  color="success"
                  variant="outlined"
                />
                <Chip
                  label={`비활성 ${inactiveCount}건`}
                  size="small"
                  color="error"
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
                <Table size="small" stickyHeader sx={{ minWidth: 1400 }}>
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
                        <TableCell colSpan={10} align="center" sx={{ py: 5 }}>
                          투약 기록 데이터가 없습니다.
                        </TableCell>
                      </TableRow>
                    )}

                    {paginatedRows.map((item, index) => (
                      <TableRow
                        key={String(item.medicationId)}
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
                          {safeValue(item.medicationId)}
                        </TableCell>
                        <TableCell align="center">
                          {safeValue(item.testExecutionId)}
                        </TableCell>
                        <TableCell align="center">
                          {formatDateTime(item.administeredAt)}
                        </TableCell>
                        <TableCell align="center">
                          {safeValue(item.doseNumber)}
                        </TableCell>
                        <TableCell align="center">
                          {safeValue(item.doseUnit)}
                        </TableCell>
                        <TableCell align="center">
                          {safeValue(item.nursingId)}
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={safeValue(item.status)}
                            color={getStatusColor(item.status)}
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
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