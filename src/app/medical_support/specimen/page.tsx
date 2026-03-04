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
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import {
  Specimen,
  SpecimenCreatePayload,
  createSpecimenApi,
  deleteSpecimenApi,
  fetchSpecimensApi,
  updateSpecimenApi,
} from "@/lib/specimenApi";

type ListTab = "ACTIVE" | "INACTIVE" | "ALL";
type RightTab = "DETAIL" | "FORM";

type FormState = {
  specimenId: string;
  specimenStatus: string;
  specimenType: string;
  testExecutionID: string;
  collectedAt: string;
  collectedById: string;
};

const emptyForm: FormState = {
  specimenId: "",
  specimenStatus: "",
  specimenType: "",
  testExecutionID: "",
  collectedAt: "",
  collectedById: "",
};

const specimenStatusOptions = [
  { value: "COLLECTED", label: "채취 완료" }, // 검체 채취가 완료된 상태
  { value: "RECEIVED", label: "검사실 접수 완료" }, // 검사실에서 검체를 인수한 상태
  { value: "REJECTED", label: "반려" }, // 오염/용기 오류 등으로 반려된 상태
] as const;
type SpecimenStatus = (typeof specimenStatusOptions)[number]["value"];

const isSpecimenStatus = (value?: string | null): value is SpecimenStatus =>
  !!value &&
  specimenStatusOptions.some((option) => option.value === value);

const specimenStatusText = (value?: string | null) => {
  const option = specimenStatusOptions.find((v) => v.value === value);
  return option ? `${option.value} - ${option.label}` : safe(value);
};

const specimenTypeOptions = [
  { value: "BLOOD", label: "혈액 (전혈 포함)" },
  { value: "URINE", label: "소변" },
  { value: "SPUTUM", label: "객담 (가래)" },
  { value: "TISSUE", label: "조직 (생검 포함)" },
  { value: "STOOL", label: "대변" },
] as const;
type SpecimenType = (typeof specimenTypeOptions)[number]["value"];

const isSpecimenType = (value?: string | null): value is SpecimenType =>
  !!value &&
  specimenTypeOptions.some((option) => option.value === value);

const specimenTypeText = (value?: string | null) => {
  const option = specimenTypeOptions.find((v) => v.value === value);
  return option ? `${option.value} - ${option.label}` : safe(value);
};

const safe = (value?: string | number | null) => {
  if (value === null || value === undefined) return "-";
  const text = String(value).trim();
  return text ? text : "-";
};

const normalize = (value?: string | null) => {
  const v = value?.trim();
  return v ? v : null;
};

const normalizeDateTime = (value?: string | null) => {
  const v = value?.trim();
  if (!v) return null;
  return v.length === 16 ? `${v}:00` : v;
};

const toDateTimeInputValue = (value?: string | null) => {
  const v = value?.trim();
  if (!v) return "";
  return v.replace(" ", "T").slice(0, 16);
};

const isInactive = (value?: string | null) => {
  const v = value?.trim().toUpperCase();
  return v === "INACTIVE" || v === "N";
};

const statusLabel = (value?: string | null) => (isInactive(value) ? "비활성" : "활성");

const readTestExecutionId = (item?: Specimen | null) =>
  item?.testExecutionID ?? item?.testExecutionId ?? "";

export default function NurseSpecimenPage() {
  const [items, setItems] = React.useState<Specimen[]>([]);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState<FormState>(emptyForm);
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [listTab, setListTab] = React.useState<ListTab>("ACTIVE");
  const [rightTab, setRightTab] = React.useState<RightTab>("DETAIL");

  const selected = React.useMemo(
    () => items.find((i) => i.specimenId === selectedId) ?? null,
    [items, selectedId]
  );

  const filtered = React.useMemo(() => {
    return items.filter((i) => {
      if (listTab === "ACTIVE" && isInactive(i.status)) return false;
      if (listTab === "INACTIVE" && !isInactive(i.status)) return false;
      return true;
    });
  }, [items, listTab]);

  const totalCount = items.length;
  const inactiveCount = items.filter((i) => isInactive(i.status)).length;
  const activeCount = totalCount - inactiveCount;

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSpecimensApi();
      setItems(data);
      if (selectedId && !data.find((i) => i.specimenId === selectedId)) {
        setSelectedId(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "검체 목록 조회에 실패했습니다");
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
      specimenId: selected.specimenId ?? "",
      specimenStatus: isSpecimenStatus(selected.specimenStatus)
        ? selected.specimenStatus
        : "",
      specimenType: isSpecimenType(selected.specimenType)
        ? selected.specimenType
        : "",
      testExecutionID: readTestExecutionId(selected),
      collectedAt: toDateTimeInputValue(selected.collectedAt),
      collectedById: selected.collectedById ?? "",
    });
  }, [selected]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const payload: SpecimenCreatePayload = {
        specimenId: normalize(form.specimenId),
        specimenStatus: normalize(form.specimenStatus),
        specimenType: normalize(form.specimenType),
        testExecutionID: normalize(form.testExecutionID),
        collectedAt: normalizeDateTime(form.collectedAt),
        collectedById: normalize(form.collectedById),
      };

      if (selected) {
        await updateSpecimenApi(selected.specimenId, payload);
      } else {
        await createSpecimenApi(payload);
      }

      await load();
      setRightTab("DETAIL");
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장에 실패했습니다");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("해당 검체를 비활성화하시겠습니까?")) return;
    setSaving(true);
    setError(null);
    try {
      await deleteSpecimenApi(id);
      if (selectedId === id) {
        setSelectedId(null);
      }
      await load();
      setRightTab("DETAIL");
    } catch (err) {
      setError(err instanceof Error ? err.message : "비활성화에 실패했습니다");
    } finally {
      setSaving(false);
    }
  };

  const handleNew = () => {
    setSelectedId(null);
    setForm(emptyForm);
    setRightTab("FORM");
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
                    간호 검체 API 기본 CRUD를 점검하는 화면입니다.
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1}>
                  <Button component={Link} href="/nurse/record" variant="text" size="small">
                    간호 기록
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<RefreshIcon />}
                    onClick={load}
                    disabled={loading}
                  >
                    새로고침
                  </Button>
                  <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={handleNew}>
                    신규 작성
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
            <Chip label={`전체 ${totalCount}`} color="primary" size="small" />
            <Chip label={`활성 ${activeCount}`} variant="outlined" size="small" />
            <Chip label={`비활성 ${inactiveCount}`} variant="outlined" size="small" />
            {loading && <Chip label="불러오는 중" variant="outlined" size="small" />}
            {error && <Chip label={`오류: ${error}`} color="error" size="small" />}
          </Stack>

          <Box
            sx={{
              display: "grid",
              gap: 1.5,
              gridTemplateColumns: { xs: "1fr", lg: "360px minmax(0, 1fr)" },
              alignItems: "start",
            }}
          >
            <Card sx={{ borderRadius: 3, border: "1px solid var(--line)" }}>
              <CardContent sx={{ p: 1.75 }}>
                <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                  <Typography fontWeight={800} sx={{ fontSize: 14 }}>
                    검체 목록
                  </Typography>
                  <Chip label={`${filtered.length}건`} size="small" />
                </Stack>

                <Tabs
                  value={listTab}
                  onChange={(_, v) => setListTab(v as ListTab)}
                  sx={{ mt: 0.5, minHeight: 34, "& .MuiTab-root": { minHeight: 34, py: 0 } }}
                >
                  <Tab label="활성" value="ACTIVE" />
                  <Tab label="비활성" value="INACTIVE" />
                  <Tab label="전체" value="ALL" />
                </Tabs>

                <Box sx={{ mt: 1.25, maxHeight: { xs: 320, lg: "calc(100vh - 300px)" }, overflowY: "auto", pr: 0.5 }}>
                  <Stack spacing={0.85}>
                    {filtered.map((row) => (
                      <Box
                        key={row.specimenId}
                        onClick={() => {
                          setSelectedId(row.specimenId);
                          setRightTab("DETAIL");
                        }}
                        sx={{
                          p: 1.15,
                          borderRadius: 1.5,
                          border: "1px solid var(--line)",
                          bgcolor:
                            selected?.specimenId === row.specimenId
                              ? "rgba(11, 91, 143, 0.12)"
                              : "rgba(255,255,255,0.7)",
                          cursor: "pointer",
                        }}
                      >
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography fontWeight={700} sx={{ fontSize: 13 }}>
                            {row.specimenId}
                          </Typography>
                          <Chip label={statusLabel(row.status)} size="small" />
                        </Stack>
                        <Typography sx={{ color: "var(--muted)", fontSize: 11.5, mt: 0.4 }}>
                          종류 {specimenTypeText(row.specimenType)} | 진행상태 {specimenStatusText(row.specimenStatus)}
                        </Typography>
                        <Typography sx={{ color: "var(--muted)", fontSize: 11.5, mt: 0.2 }}>
                          검사실행 {safe(readTestExecutionId(row))} | 채취자 {safe(row.collectedById)}
                        </Typography>
                      </Box>
                    ))}
                    {!filtered.length && (
                      <Typography color="text.secondary" sx={{ fontSize: 13, py: 1 }}>
                        조회된 검체가 없습니다.
                      </Typography>
                    )}
                  </Stack>
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ borderRadius: 3, border: "1px solid var(--line)" }}>
              <CardContent sx={{ p: 1.75 }}>
                <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                  <Typography fontWeight={800} sx={{ fontSize: 14 }}>
                    검체 상세
                  </Typography>
                  {selected && rightTab === "DETAIL" && !isInactive(selected.status) && (
                    <Button
                      variant="outlined"
                      color="warning"
                      size="small"
                      startIcon={<DeleteOutlineIcon />}
                      onClick={() => handleDelete(selected.specimenId)}
                      disabled={saving}
                    >
                      비활성화
                    </Button>
                  )}
                </Stack>

                <Tabs
                  value={rightTab}
                  onChange={(_, v) => setRightTab(v as RightTab)}
                  sx={{ mt: 0.5, minHeight: 34, "& .MuiTab-root": { minHeight: 34, py: 0 } }}
                >
                  <Tab label="상세" value="DETAIL" />
                  <Tab label="등록 / 수정" value="FORM" />
                </Tabs>

                {rightTab === "DETAIL" ? (
                  <Box sx={{ mt: 1.5 }}>
                    {!selected ? (
                      <Typography color="text.secondary" sx={{ fontSize: 13 }}>
                        왼쪽 목록에서 검체를 선택하세요.
                      </Typography>
                    ) : (
                      <Box
                        sx={{
                          p: 1.25,
                          borderRadius: 1.5,
                          bgcolor: "rgba(255,255,255,0.7)",
                          border: "1px solid var(--line)",
                          display: "grid",
                          gap: 0.8,
                          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                        }}
                      >
                        <Row label="검체 ID" value={safe(selected.specimenId)} />
                        <Row label="상태" value={statusLabel(selected.status)} />
                        <Row label="검체 종류" value={specimenTypeText(selected.specimenType)} />
                        <Row label="진행상태" value={specimenStatusText(selected.specimenStatus)} />
                        <Row label="검사실행 ID" value={safe(readTestExecutionId(selected))} />
                        <Row label="채취 일시" value={safe(selected.collectedAt)} />
                        <Row label="채취자 ID" value={safe(selected.collectedById)} />
                      </Box>
                    )}
                  </Box>
                ) : (
                  <Box sx={{ mt: 1.5 }}>
                    <Box
                      sx={{
                        display: "grid",
                        gap: 1.1,
                        gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
                      }}
                    >
                      <TextField
                        label="검체 ID (신규 시 비워두면 자동생성)"
                        value={form.specimenId}
                        onChange={(e) => setForm((prev) => ({ ...prev, specimenId: e.target.value }))}
                        size="small"
                        fullWidth
                      />
                      <FormControl size="small" fullWidth>
                        <InputLabel id="specimen-status-label">검체 진행상태</InputLabel>
                        <Select
                          labelId="specimen-status-label"
                          label="검체 진행상태"
                          value={form.specimenStatus}
                          onChange={(e) =>
                            setForm((prev) => ({ ...prev, specimenStatus: String(e.target.value) }))
                          }
                        >
                          <MenuItem value="">선택</MenuItem>
                          {specimenStatusOptions.map((status) => (
                            <MenuItem key={status.value} value={status.value}>
                              {status.value} - {status.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <FormControl size="small" fullWidth>
                        <InputLabel id="specimen-type-label">검체 종류</InputLabel>
                        <Select
                          labelId="specimen-type-label"
                          label="검체 종류"
                          value={form.specimenType}
                          onChange={(e) =>
                            setForm((prev) => ({ ...prev, specimenType: String(e.target.value) }))
                          }
                        >
                          <MenuItem value="">선택</MenuItem>
                          {specimenTypeOptions.map((type) => (
                            <MenuItem key={type.value} value={type.value}>
                              {type.value} - {type.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <TextField
                        label="검사실행 ID"
                        value={form.testExecutionID}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, testExecutionID: e.target.value }))
                        }
                        size="small"
                        fullWidth
                      />
                      <TextField
                        label="채취 일시"
                        type="datetime-local"
                        value={form.collectedAt}
                        onChange={(e) => setForm((prev) => ({ ...prev, collectedAt: e.target.value }))}
                        size="small"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                      />
                      <TextField
                        label="채취자 ID"
                        value={form.collectedById}
                        onChange={(e) => setForm((prev) => ({ ...prev, collectedById: e.target.value }))}
                        size="small"
                        fullWidth
                      />
                    </Box>

                    <Stack direction="row" spacing={1} sx={{ pt: 1.5 }}>
                      <Button variant="contained" onClick={handleSave} disabled={saving} fullWidth>
                        {selected ? "수정" : "등록"}
                      </Button>
                      <Button variant="outlined" onClick={handleNew} disabled={saving} fullWidth>
                        초기화
                      </Button>
                    </Stack>
                  </Box>
                )}
              </CardContent>
            </Card>
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
      <Typography sx={{ fontWeight: 700, fontSize: 12.5, textAlign: "right" }}>{value}</Typography>
    </Stack>
  );
}
