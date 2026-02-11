"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";

import type { PatientInfoHistory } from "@/lib/infoHistoryApi";
import { fetchPatientInfoHistoryApi } from "@/lib/infoHistoryApi";

function formatDate(value?: string | null) {
  if (!value) return "-";
  return value.slice(0, 16).replace("T", " ");
}

function truncate(value?: string | null, max = 160) {
  if (!value) return "-";
  if (value.length <= max) return value;
  return `${value.slice(0, max)}...`;
}

export default function PatientInfoHistoryPage() {
  const params = useParams<{ id: string }>();
  const patientId = Number(params.id);

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [history, setHistory] = React.useState<PatientInfoHistory[]>([]);

  const loadHistory = React.useCallback(async () => {
    if (!patientId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetchPatientInfoHistoryApi(patientId);
      setHistory(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load info history");
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  React.useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const latest = history[0];

  return (
    <MainLayout>
      <Stack spacing={2}>
        <Card
          elevation={0}
          sx={{
            borderRadius: 4,
            border: "1px solid var(--line)",
            boxShadow: "var(--shadow-2)",
            background:
              "linear-gradient(120deg, rgba(11, 91, 143, 0.08) 0%, rgba(11, 91, 143, 0) 60%)",
          }}
        >
          <CardContent>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="center">
              <Stack spacing={0.5} sx={{ flexGrow: 1 }}>
                <Typography fontWeight={900} sx={{ fontSize: 22 }}>
                  Patient Info History
                </Typography>
                <Typography color="text.secondary" fontWeight={700}>
                  Track changes to patient base info.
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip
                  icon={<EventOutlinedIcon />}
                  label={latest ? formatDate(latest.changedAt) : "No recent record"}
                  sx={{ bgcolor: "rgba(11, 91, 143, 0.12)" }}
                />
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<RefreshOutlinedIcon />}
                  onClick={loadHistory}
                >
                  Refresh
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {error && (
          <Typography color="error" fontWeight={900} sx={{ ml: 1 }}>
            {error}
          </Typography>
        )}

        <Card
          elevation={0}
          sx={{
            borderRadius: 4,
            border: "1px solid var(--line)",
            boxShadow: "var(--shadow-1)",
          }}
        >
          <CardContent>
            {loading && (
              <Typography color="text.secondary">Loading...</Typography>
            )}

            {!loading && history.length === 0 && (
              <Typography color="text.secondary">
                No change history found.
              </Typography>
            )}

            <Stack spacing={1.5}>
              {history.map((item) => (
                <Box
                  key={item.historyId}
                  sx={{
                    p: 1.5,
                    borderRadius: 3,
                    border: "1px solid var(--line)",
                    bgcolor: "rgba(255,255,255,0.8)",
                  }}
                >
                  <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "center" }}>
                    <Stack spacing={0.5} sx={{ minWidth: 160 }}>
                      <Typography fontWeight={800}>Change</Typography>
                      <Typography color="text.secondary">
                        {item.changeType}
                      </Typography>
                    </Stack>

                    <Divider flexItem orientation="vertical" sx={{ display: { xs: "none", md: "block" } }} />

                    <Stack spacing={0.5} sx={{ minWidth: 140 }}>
                      <Typography fontWeight={800}>Changed By</Typography>
                      <Typography color="text.secondary">
                        {item.changedBy ?? "-"}
                      </Typography>
                    </Stack>

                    <Divider flexItem orientation="vertical" sx={{ display: { xs: "none", md: "block" } }} />

                    <Stack spacing={0.5} sx={{ minWidth: 160 }}>
                      <Typography fontWeight={800}>Changed At</Typography>
                      <Typography color="text.secondary">
                        {formatDate(item.changedAt)}
                      </Typography>
                    </Stack>
                  </Stack>

                  <Divider sx={{ my: 1.5 }} />

                  <Stack spacing={1}>
                    <Stack spacing={0.5}>
                      <Typography fontWeight={800}>Before</Typography>
                      <Typography
                        color="text.secondary"
                        sx={{ fontFamily: "Consolas, monospace", fontSize: 12 }}
                      >
                        {truncate(item.beforeData)}
                      </Typography>
                    </Stack>
                    <Stack spacing={0.5}>
                      <Typography fontWeight={800}>After</Typography>
                      <Typography
                        color="text.secondary"
                        sx={{ fontFamily: "Consolas, monospace", fontSize: 12 }}
                      >
                        {truncate(item.afterData)}
                      </Typography>
                    </Stack>
                  </Stack>
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </MainLayout>
  );
}
