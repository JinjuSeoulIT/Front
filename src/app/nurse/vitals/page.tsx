"use client";

import * as React from "react";
import Link from "next/link";
import MainLayout from "@/components/layout/MainLayout";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import MonitorHeartOutlinedIcon from "@mui/icons-material/MonitorHeartOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import {
  Vital,
  VitalCreatePayload,
  createVitalApi,
  deleteVitalApi,
  fetchVitalsApi,
  updateVitalApi,
} from "@/lib/vitalApi";

const emptyForm: VitalCreatePayload = {
  visitId: "",
  temperature: "",
  pulse: "",
  respiration: "",
  bloodPressure: "",
  measuredAt: "",
  status: "Y",
};

const safe = (value?: string | null) => {
  const v = value?.trim();
  return v ? v : "-";
};

const normalize = (value?: string | null) => {
  const v = value?.trim();
  return v ? v : null;
};

const toDateTimeInputValue = (value?: string | null) => {
  const v = value?.trim();
  if (!v) return "";
  return v.replace(" ", "T").slice(0, 16);
};

const normalizeDateTime = (value?: string | null) => {
  const v = value?.trim();
  if (!v) return null;
  return v.length === 16 ? `${v}:00` : v;
};

const isInactiveStatus = (value?: string | null) => {
  const v = value?.trim().toUpperCase();
  return v === "N" || v === "INACTIVE";
};

const statusText = (value?: string | null) => {
  if (isInactiveStatus(value)) return "비활성";
  return value?.trim() || "활성";
};

export default function NurseVitalsPage() {
  const [items, setItems] = React.useState<Vital[]>([]);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState<VitalCreatePayload>(emptyForm);
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [tab, setTab] = React.useState<"ACTIVE" | "INACTIVE" | "ALL">("ACTIVE");

  const selected = React.useMemo(
    () => items.find((i) => i.vitalId === selectedId) ?? null,
    [items, selectedId]
  );

  const filtered = React.useMemo(() => {
    return items.filter((i) => {
      const inactive = isInactiveStatus(i.status);
      if (tab === "ACTIVE" && inactive) return false;
      if (tab === "INACTIVE" && !inactive) return false;
      return true;
    });
  }, [items, tab]);

  const totalCount = items.length;
  const inactiveCount = items.filter((i) => isInactiveStatus(i.status)).length;
  const activeCount = totalCount - inactiveCount;

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchVitalsApi();
      setItems(data);
      if (selectedId && !data.find((i) => i.vitalId === selectedId)) {
        setSelectedId(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "불러오기 실패");
    } finally {
      setLoading(false);
    }
  }, [selectedId]);

  React.useEffect(() => {
    load();
  }, [load]);

  React.useEffect(() => {
    if (!selected) {
      setForm(emptyForm);
      return;
    }
    setForm({
      visitId: selected.visitId ?? "",
      temperature: selected.temperature ?? "",
      pulse: selected.pulse ?? "",
      respiration: selected.respiration ?? "",
      bloodPressure: selected.bloodPressure ?? "",
      measuredAt: toDateTimeInputValue(selected.measuredAt),
      status: selected.status ?? "Y",
    });
  }, [selected]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const payload: VitalCreatePayload = {
        visitId: normalize(form.visitId),
        temperature: normalize(form.temperature),
        pulse: normalize(form.pulse),
        respiration: normalize(form.respiration),
        bloodPressure: normalize(form.bloodPressure),
        measuredAt: normalizeDateTime(form.measuredAt),
        status: normalize(form.status) ?? "Y",
      };

      if (selected) {
        await updateVitalApi(selected.vitalId, payload);
      } else {
        await createVitalApi(payload);
      }

      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장 실패");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("활력징후를 삭제할까요?")) return;
    setSaving(true);
    setError(null);
    try {
      await deleteVitalApi(id);
      if (selectedId === id) {
        setSelectedId(null);
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "삭제 실패");
    } finally {
      setSaving(false);
    }
  };

  const handleNew = () => {
    setSelectedId(null);
    setForm(emptyForm);
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
            <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="center">
              <Stack spacing={0.5} sx={{ flexGrow: 1 }}>
                <Typography sx={{ fontSize: 22, fontWeight: 900 }}>
                  간호 워크스테이션
                </Typography>
                <Typography sx={{ color: "var(--muted)" }}>
                  활력징후 CRUD 점검용 화면입니다.
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1}>
                <Button component={Link} href="/nurse" variant="outlined">
                  문진 페이지
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={load}
                  disabled={loading}
                >
                  새로고침
                </Button>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleNew}>
                  신규 작성
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
          <Chip label={`전체 ${totalCount}`} color="primary" />
          <Chip label={`활성 ${activeCount}`} variant="outlined" />
          <Chip label={`비활성 ${inactiveCount}`} variant="outlined" />
          {loading && <Chip label="불러오는 중" variant="outlined" />}
          {error && <Chip label={`오류: ${error}`} color="error" />}
        </Stack>

        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: { xs: "1fr", lg: "1.2fr 2.2fr 1.2fr" },
            alignItems: "stretch",
          }}
        >
          <Card sx={{ borderRadius: 3, border: "1px solid var(--line)" }}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                <Stack direction="row" spacing={1} alignItems="center">
                  <MonitorHeartOutlinedIcon sx={{ color: "var(--brand)" }} />
                  <Typography fontWeight={800}>활력징후 리스트</Typography>
                </Stack>
                <Chip label={`표시 ${filtered.length}`} size="small" />
              </Stack>
              <Tabs
                value={tab}
                onChange={(_, v) => setTab(v as "ACTIVE" | "INACTIVE" | "ALL")}
                sx={{ mt: 1 }}
              >
                <Tab label="활성" value="ACTIVE" />
                <Tab label="비활성" value="INACTIVE" />
                <Tab label="전체" value="ALL" />
              </Tabs>

              <Stack spacing={1.25} sx={{ mt: 2 }}>
                {filtered.map((row) => (
                  <Box
                    key={row.vitalId}
                    onClick={() => setSelectedId(row.vitalId)}
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      border: "1px solid var(--line)",
                      bgcolor:
                        selected?.vitalId === row.vitalId
                          ? "rgba(11, 91, 143, 0.12)"
                          : "rgba(255,255,255,0.7)",
                      cursor: "pointer",
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between">
                      <Typography fontWeight={700}>{row.vitalId}</Typography>
                      <Chip label={statusText(row.status)} size="small" />
                    </Stack>
                    <Typography sx={{ color: "var(--muted)", fontSize: 12, mt: 0.25 }}>
                      방문 {safe(row.visitId)} · 체온 {safe(row.temperature)}
                    </Typography>
                    <Typography sx={{ color: "var(--muted)", fontSize: 12, mt: 0.25 }}>
                      맥박 {safe(row.pulse)} · 호흡 {safe(row.respiration)}
                    </Typography>
                  </Box>
                ))}
                {!filtered.length && (
                  <Typography color="text.secondary">표시할 활력징후가 없습니다.</Typography>
                )}
              </Stack>
            </CardContent>
          </Card>

          <Stack spacing={2}>
            <Card sx={{ borderRadius: 3, border: "1px solid var(--line)" }}>
              <CardContent sx={{ p: 2.5 }}>
                <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <MonitorHeartOutlinedIcon sx={{ color: "var(--brand-strong)" }} />
                    <Typography fontWeight={800}>선택 항목</Typography>
                  </Stack>
                  {selected && (
                    <Stack direction="row" spacing={1}>
                      <Chip label={statusText(selected.status)} size="small" />
                      <Button
                        variant="outlined"
                        color="warning"
                        size="small"
                        startIcon={<DeleteOutlineIcon />}
                        onClick={() => handleDelete(selected.vitalId)}
                        disabled={saving}
                      >
                        비활성
                      </Button>
                    </Stack>
                  )}
                </Stack>

                <Box sx={{ mt: 2, p: 2, borderRadius: 2, bgcolor: "rgba(255,255,255,0.7)" }}>
                  <Row label="ID" value={safe(selected?.vitalId)} />
                  <Row label="방문 ID" value={safe(selected?.visitId)} />
                  <Row label="측정시각" value={safe(selected?.measuredAt)} />
                  <Row label="생성시각" value={safe(selected?.createdAt)} />
                  <Row label="상태" value={statusText(selected?.status)} />
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ borderRadius: 3, border: "1px solid var(--line)" }}>
              <CardContent sx={{ p: 2.5 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <MonitorHeartOutlinedIcon sx={{ color: "var(--brand)" }} />
                  <Typography fontWeight={800}>수치 상세</Typography>
                </Stack>
                <Box sx={{ mt: 2, p: 2, borderRadius: 2, bgcolor: "rgba(255,255,255,0.7)" }}>
                  <Typography fontWeight={700}>체온</Typography>
                  <Typography sx={{ color: "var(--muted)", mt: 0.5 }}>
                    {safe(selected?.temperature)}
                  </Typography>
                  <Divider sx={{ my: 1.5 }} />
                  <Typography fontWeight={700}>맥박</Typography>
                  <Typography sx={{ color: "var(--muted)", mt: 0.5 }}>
                    {safe(selected?.pulse)}
                  </Typography>
                  <Divider sx={{ my: 1.5 }} />
                  <Typography fontWeight={700}>호흡</Typography>
                  <Typography sx={{ color: "var(--muted)", mt: 0.5 }}>
                    {safe(selected?.respiration)}
                  </Typography>
                  <Divider sx={{ my: 1.5 }} />
                  <Typography fontWeight={700}>혈압</Typography>
                  <Typography sx={{ color: "var(--muted)", mt: 0.5 }}>
                    {safe(selected?.bloodPressure)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ borderRadius: 3, border: "1px solid var(--line)" }}>
              <CardContent sx={{ p: 2.5 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <MonitorHeartOutlinedIcon sx={{ color: "var(--brand)" }} />
                  <Typography fontWeight={800}>활력징후 등록 / 수정</Typography>
                </Stack>
                <Box sx={{ maxWidth: 560, width: "100%", mt: 2 }}>
                  <Stack spacing={1.5}>
                    <TextField
                      label="방문 ID"
                      value={form.visitId ?? ""}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, visitId: e.target.value }))
                      }
                      size="small"
                    />
                    <TextField
                      label="체온"
                      value={form.temperature ?? ""}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, temperature: e.target.value }))
                      }
                      size="small"
                    />
                    <TextField
                      label="맥박"
                      value={form.pulse ?? ""}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, pulse: e.target.value }))
                      }
                      size="small"
                    />
                    <TextField
                      label="호흡"
                      value={form.respiration ?? ""}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, respiration: e.target.value }))
                      }
                      size="small"
                    />
                    <TextField
                      label="혈압"
                      value={form.bloodPressure ?? ""}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, bloodPressure: e.target.value }))
                      }
                      size="small"
                    />
                    <TextField
                      label="측정시각"
                      type="datetime-local"
                      value={form.measuredAt ?? ""}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, measuredAt: e.target.value }))
                      }
                      size="small"
                      InputLabelProps={{ shrink: true }}
                    />

                    <Stack direction="row" spacing={1} sx={{ pt: 1 }}>
                      <Button
                        variant="contained"
                        onClick={handleSave}
                        disabled={saving}
                        fullWidth
                      >
                        {selected ? "수정" : "등록"}
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={handleNew}
                        disabled={saving}
                        fullWidth
                      >
                        초기화
                      </Button>
                    </Stack>
                  </Stack>
                </Box>
              </CardContent>
            </Card>
          </Stack>

          <Stack spacing={2}>
            <Card sx={{ borderRadius: 3, border: "1px solid var(--line)" }}>
              <CardContent sx={{ p: 2.5 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <FactCheckOutlinedIcon sx={{ color: "var(--accent)" }} />
                  <Typography fontWeight={800}>상태 요약</Typography>
                </Stack>
                <Stack spacing={1.25} sx={{ mt: 2 }}>
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
                    <Typography>활성 항목</Typography>
                    <Typography fontWeight={800}>{activeCount}</Typography>
                  </Box>
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
                    <Typography>비활성 항목</Typography>
                    <Typography fontWeight={800}>{inactiveCount}</Typography>
                  </Box>
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
                    <Typography>전체 항목</Typography>
                    <Typography fontWeight={800}>{totalCount}</Typography>
                  </Box>
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
                    "등록: 필드 입력 후 등록 버튼 클릭",
                    "조회: 리스트에서 항목 선택",
                    "수정: 선택 후 값 변경 → 수정",
                    "삭제: 선택 후 삭제 버튼 클릭",
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
      <Typography sx={{ color: "text.secondary", fontSize: 13 }}>{label}</Typography>
      <Typography sx={{ fontWeight: 700, fontSize: 13, textAlign: "right" }}>
        {value}
      </Typography>
    </Stack>
  );
}

