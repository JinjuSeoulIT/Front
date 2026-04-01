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
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import MonitorHeartOutlinedIcon from "@mui/icons-material/MonitorHeartOutlined";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import {
  Assessment,
  AssessmentCreatePayload,
  createAssessmentApi,
  deleteAssessmentApi,
  fetchAssessmentsApi,
  updateAssessmentApi,
} from "@/lib/assessmentApi";

const emptyForm: AssessmentCreatePayload = {
  visitId: "",
  visitReason: "",
  medicalHistory: "",
  allergyYn: "N",
  allergyNote: "",
  nurseId: "",
  isActive: "Y",
};

const safe = (value?: string | null) => {
  const v = value?.trim();
  return v ? v : "-";
};

const activeLabel = (value?: string | null) => {
  const v = value?.trim();
  return v ? v : "Y";
};

const activeText = (value?: string | null) =>
  activeLabel(value) === "N" ? "비활성" : "활성";

const normalize = (value?: string | null) => {
  const v = value?.trim();
  return v ? v : null;
};

export default function NursePage() {
  const [items, setItems] = React.useState<Assessment[]>([]);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState<AssessmentCreatePayload>(emptyForm);
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [tab, setTab] = React.useState<"ACTIVE" | "INACTIVE" | "ALL">("ACTIVE");

  const selected = React.useMemo(
    () => items.find((i) => i.assessmentId === selectedId) ?? null,
    [items, selectedId]
  );

  const filtered = React.useMemo(() => {
    return items.filter((i) => {
      const active = activeLabel(i.isActive);
      if (tab === "ACTIVE" && active === "N") return false;
      if (tab === "INACTIVE" && active !== "N") return false;
      return true;
    });
  }, [items, tab]);

  const totalCount = items.length;
  const inactiveCount = items.filter((i) => activeLabel(i.isActive) === "N")
    .length;
  const activeCount = totalCount - inactiveCount;

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAssessmentsApi();
      setItems(data);
      if (selectedId && !data.find((i) => i.assessmentId === selectedId)) {
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
      visitReason: selected.visitReason ?? "",
      medicalHistory: selected.medicalHistory ?? "",
      allergyYn: selected.allergyYn ?? "N",
      allergyNote: selected.allergyNote ?? "",
      nurseId: selected.nurseId ?? "",
      isActive: selected.isActive ?? "Y",
    });
  }, [selected]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const payload: AssessmentCreatePayload = {
        visitId: normalize(form.visitId),
        visitReason: normalize(form.visitReason),
        medicalHistory: normalize(form.medicalHistory),
        allergyYn: normalize(form.allergyYn) ?? "N",
        allergyNote: normalize(form.allergyNote),
        nurseId: normalize(form.nurseId),
        isActive: form.isActive ?? "Y",
      };

      if (selected) {
        await updateAssessmentApi(selected.assessmentId, payload);
      } else {
        await createAssessmentApi(payload);
      }

      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장 실패");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("문진을 비활성 처리할까요?")) return;
    setSaving(true);
    setError(null);
    try {
      await deleteAssessmentApi(id);
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
                  문진 관리 및 CRUD 검증을 위한 간호 화면입니다.
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1}>
                <Button
                  component={Link}
                  href="/nurse/imaging"
                  variant="contained"
                  color="secondary"
                  startIcon={<ScienceOutlinedIcon />}
                  sx={{ fontWeight: 800 }}
                >
                  영상검사
                </Button>
                <Button
                  component={Link}
                  href="/nurse/vitals"
                  variant="contained"
                  color="error"
                  startIcon={<MonitorHeartOutlinedIcon />}
                  sx={{ fontWeight: 800 }}
                >
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
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleNew}
                >
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
                  <AssignmentOutlinedIcon sx={{ color: "var(--brand)" }} />
                  <Typography fontWeight={800}>문진 리스트</Typography>
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
                    key={row.assessmentId}
                    onClick={() => setSelectedId(row.assessmentId)}
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      border: "1px solid var(--line)",
                      bgcolor:
                        selected?.assessmentId === row.assessmentId
                          ? "rgba(11, 91, 143, 0.12)"
                          : "rgba(255,255,255,0.7)",
                      cursor: "pointer",
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between">
                      <Typography fontWeight={700}>{row.assessmentId}</Typography>
                      <Chip label={activeText(row.isActive)} size="small" />
                    </Stack>
                    <Typography sx={{ color: "var(--muted)", fontSize: 12, mt: 0.25 }}>
                      방문 {safe(row.visitId)} · 간호사 {safe(row.nurseId)}
                    </Typography>
                    <Typography sx={{ color: "var(--muted)", fontSize: 12, mt: 0.25 }}>
                      사유 {safe(row.visitReason)}
                    </Typography>
                  </Box>
                ))}
                {!filtered.length && (
                  <Typography color="text.secondary">표시할 문진이 없습니다.</Typography>
                )}
              </Stack>
            </CardContent>
          </Card>

          <Stack spacing={2}>
            <Card sx={{ borderRadius: 3, border: "1px solid var(--line)" }}>
              <CardContent sx={{ p: 2.5 }}>
                <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <AssignmentOutlinedIcon sx={{ color: "var(--brand-strong)" }} />
                    <Typography fontWeight={800}>선택 문진</Typography>
                  </Stack>
                  {selected && (
                    <Stack direction="row" spacing={1}>
                      <Chip label={activeText(selected.isActive)} size="small" />
                      {activeLabel(selected.isActive) !== "N" && (
                        <Button
                          variant="outlined"
                          color="warning"
                          size="small"
                          startIcon={<DeleteOutlineIcon />}
                          onClick={() => handleDelete(selected.assessmentId)}
                          disabled={saving}
                        >
                          비활성
                        </Button>
                      )}
                    </Stack>
                  )}
                </Stack>

                <Box sx={{ mt: 2, p: 2, borderRadius: 2, bgcolor: "rgba(255,255,255,0.7)" }}>
                  <Row label="문진 ID" value={safe(selected?.assessmentId)} />
                  <Row label="방문 ID" value={safe(selected?.visitId)} />
                  <Row label="간호사 ID" value={safe(selected?.nurseId)} />
                  <Row label="활성 여부" value={activeText(selected?.isActive)} />
                  <Row label="생성일" value={safe(selected?.createdAt)} />
                  <Row label="수정일" value={safe(selected?.updatedAt)} />
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ borderRadius: 3, border: "1px solid var(--line)" }}>
              <CardContent sx={{ p: 2.5 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <AssignmentOutlinedIcon sx={{ color: "var(--brand)" }} />
                  <Typography fontWeight={800}>문진 내용</Typography>
                </Stack>
                <Box sx={{ mt: 2, p: 2, borderRadius: 2, bgcolor: "rgba(255,255,255,0.7)" }}>
                  <Typography fontWeight={700}>방문 사유</Typography>
                  <Typography sx={{ color: "var(--muted)", mt: 0.5 }}>
                    {safe(selected?.visitReason)}
                  </Typography>
                  <Divider sx={{ my: 1.5 }} />
                  <Typography fontWeight={700}>병력</Typography>
                  <Typography sx={{ color: "var(--muted)", mt: 0.5, whiteSpace: "pre-wrap" }}>
                    {safe(selected?.medicalHistory)}
                  </Typography>
                  <Divider sx={{ my: 1.5 }} />
                  <Typography fontWeight={700}>알레르기</Typography>
                  <Typography sx={{ color: "var(--muted)", mt: 0.5 }}>
                    {safe(selected?.allergyYn)} · {safe(selected?.allergyNote)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ borderRadius: 3, border: "1px solid var(--line)" }}>
              <CardContent sx={{ p: 2.5 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <AssignmentOutlinedIcon sx={{ color: "var(--brand)" }} />
                  <Typography fontWeight={800}>문진 등록 / 수정</Typography>
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
                      label="방문 사유"
                      value={form.visitReason ?? ""}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, visitReason: e.target.value }))
                      }
                      size="small"
                    />
                    <TextField
                      label="병력"
                      value={form.medicalHistory ?? ""}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          medicalHistory: e.target.value,
                        }))
                      }
                      size="small"
                      multiline
                      minRows={3}
                    />
                    <FormControl size="small">
                      <InputLabel id="allergy-label">알레르기</InputLabel>
                      <Select
                        labelId="allergy-label"
                        label="알레르기"
                        value={form.allergyYn ?? "N"}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            allergyYn: String(e.target.value),
                          }))
                        }
                      >
                        <MenuItem value="N">N</MenuItem>
                        <MenuItem value="Y">Y</MenuItem>
                      </Select>
                    </FormControl>
                    <TextField
                      label="알레르기 메모"
                      value={form.allergyNote ?? ""}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          allergyNote: e.target.value,
                        }))
                      }
                      size="small"
                    />
                    <TextField
                      label="간호사 ID"
                      value={form.nurseId ?? ""}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, nurseId: e.target.value }))
                      }
                      size="small"
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
                    <Typography>활성 문진</Typography>
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
                    <Typography>비활성 문진</Typography>
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
                    <Typography>전체 문진</Typography>
                    <Typography fontWeight={800}>{totalCount}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            <Card sx={{ borderRadius: 3, border: "1px solid var(--line)" }}>
              <CardContent sx={{ p: 2.5 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <HelpOutlineOutlinedIcon sx={{ color: "var(--brand)" }} />
                  <Typography fontWeight={800}>검증 가이드</Typography>
                </Stack>
                <Stack spacing={1} sx={{ mt: 2 }}>
                  {[
                    "등록: 필드 입력 후 등록 버튼 클릭",
                    "수정: 리스트 선택 후 값 변경 → 수정",
                    "삭제: 선택 문진에서 비활성 처리",
                    "비활성 문진은 비활성 탭에서 확인",
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
