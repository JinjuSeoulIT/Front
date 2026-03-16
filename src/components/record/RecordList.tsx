"use client";

import type { ChangeEvent } from "react";
import { useEffect, useState } from "react";
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
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { RecActions } from "@/features/record/recordSlice";
import type { RecordFormType } from "@/features/record/recordTypes";
import type { AppDispatch, RootState } from "@/store/store";
import RecordSearch from "./RecordSearch";

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

export default function RecordList() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { list, loading, error } = useSelector(
    (state: RootState) => state.records
  );
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    dispatch(RecActions.fetchRecordsRequest());
  }, [dispatch]);

  const maxPage = Math.max(0, Math.ceil(list.length / rowsPerPage) - 1);
  const currentPage = Math.min(page, maxPage);
  const paginatedList = list.slice(
    currentPage * rowsPerPage,
    currentPage * rowsPerPage + rowsPerPage
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

  const handleRowClick = (record: RecordFormType) => {
    router.push(`/medical_support/record/detail/${record.recordId}`);
  };

  return (
    <Box
      sx={{
        px: 3,
        py: 3,
        maxWidth: 1240,
        mx: "auto",
      }}
    >
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
        <Box
          sx={{
            px: 3,
            py: 2.5,
            backgroundColor: "#fafafa",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: { xs: "flex-start", lg: "center" },
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <Box sx={{ minWidth: 220, flex: "1 1 260px" }}>
              <Typography variant="h6" fontWeight={700}>
                간호 기록
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 0.5,
                  whiteSpace: "nowrap",
                }}
              >
                간호 기록 목록을 조회하고 상세 페이지로 이동할 수 있습니다.
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
              <Chip label={`총 ${list.length}건`} size="small" />

              <Button
                variant="outlined"
                size="small"
                startIcon={<RefreshIcon />}
                onClick={() => dispatch(RecActions.fetchRecordsRequest())}
                disabled={loading}
              >
                새로고침
              </Button>

              <Button
                component={Link}
                href="/medical_support/record/create"
                variant="contained"
                size="small"
                color="secondary"
                startIcon={<AddIcon />}
                sx={{
                  whiteSpace: "nowrap",
                  borderRadius: 2,
                  px: 1.75,
                  height: 36,
                  flexShrink: 0,
                }}
              >
                간호 기록 등록
              </Button>
            </Box>
          </Box>
        </Box>

        <Divider />

        <CardContent sx={{ p: 2.5 }}>
          <Box sx={{ mb: 2 }}>
            <RecordSearch />
          </Box>

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
                <Table size="small" stickyHeader sx={{ minWidth: 920 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          py: 1.4,
                          backgroundColor: "#f8f9fa",
                          whiteSpace: "nowrap",
                          width: 72,
                        }}
                      >
                        번호
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          py: 1.4,
                          backgroundColor: "#f8f9fa",
                          whiteSpace: "nowrap",
                        }}
                      >
                        간호 기록 ID
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          py: 1.4,
                          backgroundColor: "#f8f9fa",
                          whiteSpace: "nowrap",
                        }}
                      >
                        간호사 이름
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          py: 1.4,
                          backgroundColor: "#f8f9fa",
                          whiteSpace: "nowrap",
                        }}
                      >
                        진료 ID
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          py: 1.4,
                          backgroundColor: "#f8f9fa",
                          whiteSpace: "nowrap",
                        }}
                      >
                        기록일시
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {list.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                          데이터가 없습니다.
                        </TableCell>
                      </TableRow>
                    )}

                    {paginatedList.map((record, index) => (
                      <TableRow
                        key={record.recordId}
                        hover
                        sx={{
                          cursor: "pointer",
                          "& td": { py: 1.25 },
                          "&:hover": { backgroundColor: "#f9fbff" },
                        }}
                        onClick={() => handleRowClick(record)}
                      >
                        <TableCell>
                          {currentPage * rowsPerPage + index + 1}
                        </TableCell>
                        <TableCell>{record.recordId ?? "-"}</TableCell>
                        <TableCell>{record.name ?? "-"}</TableCell>
                        <TableCell>{record.visitId ?? "-"}</TableCell>
                        <TableCell>{formatDateTime(record.recordedAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                component="div"
                count={list.length}
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
    </Box>
  );
}