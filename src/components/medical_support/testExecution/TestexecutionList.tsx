"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import type { TestExecution } from "@/features/medical_support/testexecution/testexecutionType";
import { fetchTestExecutionsApi } from "@/lib/medical_support/testexecutionApi";

const DONE_STATUSES = ["COMPLETED", "DONE", "FINISHED", "SUCCESS"];
const ACTIVE_STATUSES = ["IN_PROGRESS", "INPROGRESS", "RUNNING", "PROCESSING"];

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
): "default" | "info" | "warning" | "success" => {
  const normalized = normalizeStatus(status);

  if (DONE_STATUSES.includes(normalized)) return "success";
  if (ACTIVE_STATUSES.includes(normalized)) return "info";
  if (["PENDING", "WAITING", "RETRY", "RETRYING"].includes(normalized)) {
    return "warning";
  }

  return "default";
};

const safeValue = (value?: string | number | null) => {
  if (value === null || value === undefined) return "-";

  const text = String(value).trim();
  return text ? text : "-";
};

export default function TestExecutionList() {
  const [items, setItems] = useState<TestExecution[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTestExecutions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchTestExecutionsApi();
      setItems(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "검사수행 목록을 불러오지 못했습니다."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTestExecutions();
  }, [loadTestExecutions]);

  const completedCount = useMemo(
    () =>
      items.filter((item) =>
        DONE_STATUSES.includes(normalizeStatus(item.progressStatus))
      ).length,
    [items]
  );

  const inProgressCount = useMemo(
    () =>
      items.filter((item) =>
        ACTIVE_STATUSES.includes(normalizeStatus(item.progressStatus))
      ).length,
    [items]
  );

  return (
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
                검사수행 목록
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                검사수행 API 데이터를 바로 조회하는 첫 화면입니다.
              </Typography>
            </Box>

            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}
            >
              <Chip label={`총 ${items.length}건`} size="small" />
              <Chip
                label={`진행중 ${inProgressCount}건`}
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
                onClick={() => void loadTestExecutions()}
                disabled={loading}
              >
                새로고침
              </Button>
            </Box>
          </Box>
        </Box>

        <Divider />

        <CardContent sx={{ p: 2.5 }}>
          {loading && (
            <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
              <CircularProgress size={28} />
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {!loading && !error && (
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
                <Table size="small" stickyHeader sx={{ minWidth: 1200 }}>
                  <TableHead>
                    <TableRow>
                      {[
                        "검사수행 ID",
                        "오더항목 ID",
                        "검사유형",
                        "진행상태",
                        "재시도횟수",
                        "시작일시",
                        "완료일시",
                        "수행자 ID",
                        "수정일시",
                      ].map((label) => (
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
                    {items.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={9} align="center" sx={{ py: 5 }}>
                          조회된 검사수행 데이터가 없습니다.
                        </TableCell>
                      </TableRow>
                    )}

                    {items.map((item) => (
                      <TableRow
                        key={String(item.testExecutionId)}
                        hover
                        sx={{
                          "& td": { py: 1.25, whiteSpace: "nowrap" },
                          "&:hover": { backgroundColor: "#f9fbff" },
                        }}
                      >
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
                          />
                        </TableCell>
                        <TableCell align="center">{safeValue(item.retryNo)}</TableCell>
                        <TableCell align="center">
                          {formatDateTime(item.startedAt)}
                        </TableCell>
                        <TableCell align="center">
                          {formatDateTime(item.completedAt)}
                        </TableCell>
                        <TableCell align="center">
                          {safeValue(item.performerId)}
                        </TableCell>
                        <TableCell align="center">
                          {formatDateTime(item.updatedAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}