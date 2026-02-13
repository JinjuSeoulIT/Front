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
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import RestartAltOutlinedIcon from "@mui/icons-material/RestartAltOutlined";
import {
  ImagingExam,
  ImagingExamCreatePayload,
  createImagingExamApi,
  deleteImagingExamApi,
  fetchImagingExamsApi,
  searchImagingExamsApi,
  updateImagingExamApi,
} from "@/lib/imagingExamApi";

type SearchBy = "visitId" | "imagingType";

const emptyForm: ImagingExamCreatePayload = {
  visitId: "",
  imagingType: "",
  examStatusYn: "Y",
  examAt: "",
};

const safe = (value?: string | null) => {
  const v = value?.trim();
  return v ? v : "-";
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

const statusLabel = (value?: string | null) => {
  const v = value?.trim().toUpperCase();
  return v === "N" ? "비활성" : "활성";
};

const isInactive = (value?: string | null) => {
  const v = value?.trim().toUpperCase();
  return v === "N";
};

export default function NurseImagingPage() {
  const [items, setItems] = React.useState<ImagingExam[]>([]);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState<ImagingExamCreatePayload>(emptyForm);
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [tab, setTab] = React.useState<"ACTIVE" | "INACTIVE" | "ALL">("ACTIVE");

  const [searchBy, setSearchBy] = React.useState<SearchBy>("visitId");
  const [keyword, setKeyword] = React.useState("");
  const [searchMode, setSearchMode] = React.useState(false);

  const selected = React.useMemo(
    () => items.find((i) => i.imagingExamId === selectedId) ?? null,
    [items, selectedId]
  );

  const filtered = React.useMemo(() => {
    return items.filter((i) => {
      if (tab === "ACTIVE" && isInactive(i.examStatusYn)) return false;
      if (tab === "INACTIVE" && !isInactive(i.examStatusYn)) return false;
      return true;
    });
  }, [items, tab]);

  const totalCount = items.length;
  const inactiveCount = items.filter((i) => isInactive(i.examStatusYn)).length;
  const activeCount = totalCount - inactiveCount;

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchImagingExamsApi();
      setItems(data);
      if (selectedId && !data.find((i) => i.imagingExamId === selectedId)) {
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
      imagingType: selected.imagingType ?? "",
      examStatusYn: selected.examStatusYn ?? "Y",
      examAt: toDateTimeInputValue(selected.examAt),
    });
  }, [selected]);

  const handleSearch = async () => {
    const value = keyword.trim();
    if (!value) {
      setError("검색어를 입력하세요.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await searchImagingExamsApi(searchBy, value);
      setItems(data);
      setSearchMode(true);
      if (selectedId && !data.find((i) => i.imagingExamId === selectedId)) {
        setSelectedId(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "검색 실패");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchReset = async () => {
    setKeyword("");
    setSearchMode(false);
    await load();
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const payload: ImagingExamCreatePayload = {
        visitId: normalize(form.visitId),
        imagingType: normalize(form.imagingType),
        examStatusYn: normalize(form.examStatusYn) ?? "Y",
        examAt: normalizeDateTime(form.examAt),
      };

      if (selected) {
        await updateImagingExamApi(selected.imagingExamId, payload);
      } else {
        await createImagingExamApi(payload);
      }

      await load();
      setSearchMode(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장 실패");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("영상검사를 비활성 처리할까요?")) return;
    setSaving(true);
    setError(null);
    try {
      await deleteImagingExamApi(id);
      if (selectedId === id) {
        setSelectedId(null);
      }
      await load();
      setSearchMode(false);
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
                  영상검사 워크스테이션
                </Typography>
                <Typography sx={{ color: "var(--muted)" }}>
                  영상검사 CRUD와 검색 점검을 위한 간호 화면입니다.
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1}>
                <Button component={Link} href="/nurse" variant="outlined">
                  문진
                </Button>
                <Button component={Link} href="/nurse/vitals" variant="outlined">
                  활력징후
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
          {searchMode && <Chip label="검색 결과" color="secondary" />}
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
                  <ScienceOutlinedIcon sx={{ color: "var(--brand)" }} />
                  <Typography fontWeight={800}>영상검사 리스트</Typography>
                </Stack>
                <Chip label={`표시 ${filtered.length}`} size="small" />
              </Stack>

              <Tabs
                value={searchBy}
                onChange={(_, v) => setSearchBy(v as SearchBy)}
                sx={{ mt: 1 }}
              >
                <Tab label="진료ID" value="visitId" />
                <Tab label="영상종류" value="imagingType" />
              </Tabs>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mt: 1.5 }}>
                <TextField
                  size="small"
                  placeholder={searchBy === "visitId" ? "진료ID 입력" : "영상종류 입력"}
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  fullWidth
                />
                <Button
                  variant="contained"
                  startIcon={<SearchOutlinedIcon />}
                  onClick={handleSearch}
                >
                  검색
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<RestartAltOutlinedIcon />}
                  onClick={handleSearchReset}
                >
                  초기화
                </Button>
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
                    key={row.imagingExamId}
                    onClick={() => setSelectedId(row.imagingExamId)}
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      border: "1px solid var(--line)",
                      bgcolor:
                        selected?.imagingExamId === row.imagingExamId
                          ? "rgba(11, 91, 143, 0.12)"
                          : "rgba(255,255,255,0.7)",
                      cursor: "pointer",
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between">
                      <Typography fontWeight={700}>{row.imagingExamId}</Typography>
                      <Chip label={statusLabel(row.examStatusYn)} size="small" />
                    </Stack>
                    <Typography sx={{ color: "var(--muted)", fontSize: 12, mt: 0.25 }}>
                      진료 {safe(row.visitId)} · 종류 {safe(row.imagingType)}
                    </Typography>
                    <Typography sx={{ color: "var(--muted)", fontSize: 12, mt: 0.25 }}>
                      검사일시 {safe(row.examAt)}
                    </Typography>
                  </Box>
                ))}
                {!filtered.length && (
                  <Typography color="text.secondary">표시할 영상검사가 없습니다.</Typography>
                )}
              </Stack>
            </CardContent>
          </Card>

          <Stack spacing={2}>
            <Card sx={{ borderRadius: 3, border: "1px solid var(--line)" }}>
              <CardContent sx={{ p: 2.5 }}>
                <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <ScienceOutlinedIcon sx={{ color: "var(--brand-strong)" }} />
                    <Typography fontWeight={800}>선택 영상검사</Typography>
                  </Stack>
                  {selected && (
                    <Stack direction="row" spacing={1}>
                      <Chip label={statusLabel(selected.examStatusYn)} size="small" />
                      {!isInactive(selected.examStatusYn) && (
                        <Button
                          variant="outlined"
                          color="warning"
                          size="small"
                          startIcon={<DeleteOutlineIcon />}
                          onClick={() => handleDelete(selected.imagingExamId)}
                          disabled={saving}
                        >
                          비활성
                        </Button>
                      )}
                    </Stack>
                  )}
                </Stack>

                <Box sx={{ mt: 2, p: 2, borderRadius: 2, bgcolor: "rgba(255,255,255,0.7)" }}>
                  <Row label="영상검사 ID" value={safe(selected?.imagingExamId)} />
                  <Row label="진료 ID" value={safe(selected?.visitId)} />
                  <Row label="검사종류" value={safe(selected?.imagingType)} />
                  <Row label="상태" value={statusLabel(selected?.examStatusYn)} />
                  <Row label="검사일시" value={safe(selected?.examAt)} />
                  <Row label="생성일시" value={safe(selected?.createdAt)} />
                  <Row label="수정일시" value={safe(selected?.updatedAt)} />
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ borderRadius: 3, border: "1px solid var(--line)" }}>
              <CardContent sx={{ p: 2.5 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <ScienceOutlinedIcon sx={{ color: "var(--brand)" }} />
                  <Typography fontWeight={800}>영상검사 등록 / 수정</Typography>
                </Stack>
                <Box sx={{ maxWidth: 560, width: "100%", mt: 2 }}>
                  <Stack spacing={1.5}>
                    <TextField
                      label="진료 ID"
                      value={form.visitId ?? ""}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, visitId: e.target.value }))
                      }
                      size="small"
                    />
                    <TextField
                      label="영상종류"
                      value={form.imagingType ?? ""}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, imagingType: e.target.value }))
                      }
                      size="small"
                    />
                    <FormControl size="small">
                      <InputLabel id="exam-status-label">상태</InputLabel>
                      <Select
                        labelId="exam-status-label"
                        label="상태"
                        value={form.examStatusYn ?? "Y"}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            examStatusYn: String(e.target.value),
                          }))
                        }
                      >
                        <MenuItem value="Y">Y</MenuItem>
                        <MenuItem value="N">N</MenuItem>
                      </Select>
                    </FormControl>
                    <TextField
                      label="검사일시"
                      type="datetime-local"
                      value={form.examAt ?? ""}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, examAt: e.target.value }))
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
                  <SummaryRow label="활성 항목" value={activeCount} />
                  <SummaryRow label="비활성 항목" value={inactiveCount} />
                  <SummaryRow label="전체 항목" value={totalCount} />
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
                    "조회: 기본 목록은 전체 조회 API 호출",
                    "검색: 탭(진료ID/영상종류) 선택 후 검색",
                    "수정: 리스트 선택 후 값 변경",
                    "삭제: 비활성 처리(N)로 동작",
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
