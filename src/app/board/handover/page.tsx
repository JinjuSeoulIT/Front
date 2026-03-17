"use client";

import MainLayout from "@/components/layout/MainLayout";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Checkbox,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  Pagination,
} from "@mui/material";
import { searchPatientsApi } from "@/lib/patientApi";
import { fetchMyStaffProfileApi, fetchStaffListApi } from "@/lib/staffApi";
import { getSessionUser } from "@/lib/session";
import type { Patient } from "@/features/patients/patientTypes";
import {
  createHandoverOptionApi,
  deleteHandoverOptionApi,
  fetchHandoverOptionsApi,
  reorderHandoverOptionsApi,
  type HandoverOption,
} from "@/lib/handoverOptionApi";

type ShiftType = "주간" | "이브닝" | "야간";
type FormTab = "base" | "patient";

const STATUS_OPTIONS = ["안정", "관찰 필요", "주의", "악화 경향", "응급 대응 중", "퇴원 예정", "기타"];

const toBirth6 = (birthDate?: string | null) => {
  if (!birthDate) return "------";
  const digits = birthDate.replace(/[^0-9]/g, "");
  if (digits.length >= 8) return digits.slice(2, 8);
  if (digits.length >= 6) return digits.slice(0, 6);
  return "------";
};

const PATIENT_PAGE_SIZE = 10;

type HandoverItem = {
  id: number;
  date: string;
  shift: ShiftType;
  department: string;
  writer: string;
  summary: string;
  patients: Array<{
    patientId?: number;
    patientLabel: string;
    bpSystolic?: string;
    bpDiastolic?: string;
    pulse?: string;
    temperature?: string;
    spo2?: string;
    status: string;
    completed: string;
    todo: string;
    caution: string;
  }>;
  wardNotes: string;
};

export default function BoardHandoverPage() {
  const user = useMemo(() => getSessionUser(), []);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<HandoverItem | null>(null);
  const [handoverItems, setHandoverItems] = useState<HandoverItem[]>([]);
  const [patientOptions, setPatientOptions] = useState<Patient[]>([]);
  const [patientSearchLoading, setPatientSearchLoading] = useState(false);
  const [patientSearchTried, setPatientSearchTried] = useState(false);
  const [patientPickerOpen, setPatientPickerOpen] = useState(false);
  const [patientPage, setPatientPage] = useState(1);
  const [vitalInputOpen, setVitalInputOpen] = useState(false);
  const [draftVitalViewOpen, setDraftVitalViewOpen] = useState(false);
  const [selectedDraftIndex, setSelectedDraftIndex] = useState<number | null>(null);
  const [optionManagerOpen, setOptionManagerOpen] = useState(false);
  const [completedOptions, setCompletedOptions] = useState<HandoverOption[]>([]);
  const [todoOptions, setTodoOptions] = useState<HandoverOption[]>([]);
  const [newCompletedOption, setNewCompletedOption] = useState("");
  const [newTodoOption, setNewTodoOption] = useState("");
  const [draggingCompleted, setDraggingCompleted] = useState<number | null>(null);
  const [draggingTodo, setDraggingTodo] = useState<number | null>(null);
  const [departmentName, setDepartmentName] = useState("공통");

  const [openForm, setOpenForm] = useState(false);
  const [formTab, setFormTab] = useState<FormTab>("base");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [patientSearchInput, setPatientSearchInput] = useState("");
  const [patientDrafts, setPatientDrafts] = useState<HandoverItem["patients"]>([]);
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    shift: "주간" as ShiftType,
    summary: "",
    wardNotes: "",
    patientId: "",
    bpSystolic: "",
    bpDiastolic: "",
    pulse: "",
    temperature: "",
    spo2: "",
    statusCode: "안정",
    statusEtc: "",
    completedItems: [] as string[],
    completedEtc: "",
    todoItems: [] as string[],
    todoEtc: "",
    caution: "",
  });

  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      try {
        const [, myProfile] = await Promise.all([
          fetchStaffListApi(true),
          fetchMyStaffProfileApi().catch(() => null),
        ]);
        if (!mounted) return;
        if (myProfile?.departmentName?.trim()) {
          setDepartmentName(myProfile.departmentName.trim());
        }
      } catch {
        if (mounted) setHandoverItems([]);
      }
    };

    void loadProfile();
    return () => {
      mounted = false;
    };
  }, []);

  const loadOptionSets = async () => {
    const [completed, todo] = await Promise.all([
      fetchHandoverOptionsApi("COMPLETED"),
      fetchHandoverOptionsApi("TODO"),
    ]);
    setCompletedOptions(completed);
    setTodoOptions(todo);
  };

  useEffect(() => {
    const load = async () => {
      try {
        await loadOptionSets();
      } catch {
        setCompletedOptions([]);
        setTodoOptions([]);
      }
    };
    void load();
  }, []);

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return handoverItems;
    return handoverItems.filter((item) => {
      const haystack = [item.date, item.shift, item.department, item.writer, item.summary, item.wardNotes].join(" ").toLowerCase();
      return haystack.includes(keyword);
    });
  }, [handoverItems, search]);

  const selectedPatientInForm = useMemo(
    () => patientOptions.find((p) => String(p.patientId) === form.patientId) || null,
    [form.patientId, patientOptions]
  );

  const previewCard = useMemo(() => {
    const writer = user?.fullName || user?.username || "작성자";
    const dept = departmentName || "공통";
    const summary = form.summary.trim() || "인계 요약을 입력하면 여기에 표시됩니다.";
    const patientCount = selectedPatientInForm ? 1 : 0;
    return {
      date: form.date || new Date().toISOString().slice(0, 10),
      shift: form.shift,
      department: dept,
      writer,
      summary,
      patientCount: patientDrafts.length + patientCount,
    };
  }, [departmentName, form.date, form.shift, form.summary, patientDrafts.length, selectedPatientInForm, user?.fullName, user?.username]);

  const toggleMulti = (field: "completedItems" | "todoItems", value: string) => {
    setForm((prev) => {
      const has = prev[field].includes(value);
      return { ...prev, [field]: has ? prev[field].filter((v) => v !== value) : [...prev[field], value] };
    });
  };

  const reorderOptions = (list: HandoverOption[], fromId: number, toId: number) => {
    const from = list.findIndex((v) => v.id === fromId);
    const to = list.findIndex((v) => v.id === toId);
    if (from < 0 || to < 0 || from === to) return list;
    const next = [...list];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    return next;
  };

  const addOption = async (type: "COMPLETED" | "TODO", label: string) => {
    if (!label.trim()) return;
    try {
      await createHandoverOptionApi(type, label.trim());
      await loadOptionSets();
      if (type === "COMPLETED") setNewCompletedOption("");
      else setNewTodoOption("");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "옵션 추가 실패");
    }
  };

  const removeOption = async (id: number) => {
    try {
      await deleteHandoverOptionApi(id);
      await loadOptionSets();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "옵션 삭제 실패");
    }
  };

  const patientPageCount = useMemo(
    () => Math.max(1, Math.ceil(patientOptions.length / PATIENT_PAGE_SIZE)),
    [patientOptions.length]
  );

  const pagedPatientOptions = useMemo(() => {
    const start = (patientPage - 1) * PATIENT_PAGE_SIZE;
    return patientOptions.slice(start, start + PATIENT_PAGE_SIZE);
  }, [patientOptions, patientPage]);

  const openCreate = () => {
    setEditingId(null);
    setErrorMessage(null);
    setFormTab("base");
    setForm({
      date: new Date().toISOString().slice(0, 10),
      shift: "주간",
      summary: "",
      wardNotes: "",
      patientId: "",
      bpSystolic: "",
      bpDiastolic: "",
      pulse: "",
      temperature: "",
      spo2: "",
      statusCode: "안정",
      statusEtc: "",
      completedItems: [],
      completedEtc: "",
      todoItems: [],
      todoEtc: "",
      caution: "",
    });
    setPatientDrafts([]);
    setPatientOptions([]);
    setPatientSearchTried(false);
    setPatientPickerOpen(false);
    setPatientPage(1);
    setPatientSearchInput("");
    setOpenForm(true);
  };

  const openEdit = () => {
    if (!selected) return;
    const first = selected.patients[0];
    setEditingId(selected.id);
    setErrorMessage(null);
    setFormTab("base");
    setForm({
      date: selected.date,
      shift: selected.shift,
      summary: selected.summary,
      wardNotes: selected.wardNotes,
      patientId: first?.patientId ? String(first.patientId) : "",
      bpSystolic: first?.bpSystolic || "",
      bpDiastolic: first?.bpDiastolic || "",
      pulse: first?.pulse || "",
      temperature: first?.temperature || "",
      spo2: first?.spo2 || "",
      statusCode: "기타",
      statusEtc: first?.status || "",
      completedItems: [],
      completedEtc: first?.completed || "",
      todoItems: [],
      todoEtc: first?.todo || "",
      caution: first?.caution || "",
    });
    setPatientDrafts(selected.patients || []);
    setPatientOptions([]);
    setPatientSearchTried(false);
    setPatientPickerOpen(false);
    setPatientPage(1);
    setPatientSearchInput("");
    setOpenForm(true);
  };

  const searchPatientsForForm = async () => {
    const keyword = patientSearchInput.trim();
    if (keyword.length < 2) {
      setErrorMessage("환자 검색어를 2글자 이상 입력해 주세요.");
      return;
    }
    setErrorMessage(null);
    setPatientSearchLoading(true);
    try {
      const normalized = keyword.replace(/\s+/g, "");
      const isPatientNo = /^p\d+$/i.test(normalized);
      const isPhoneLike = /^[0-9-]+$/.test(normalized);
      const type = isPatientNo ? "patientNo" : isPhoneLike ? "phone" : "name";
      const result = await searchPatientsApi(type, keyword);
      setPatientOptions(result || []);
      setPatientSearchTried(true);
      setPatientPickerOpen(true);
      setPatientPage(1);
    } catch {
      setPatientOptions([]);
      setPatientSearchTried(true);
      setErrorMessage("환자 검색 중 오류가 발생했습니다.");
    } finally {
      setPatientSearchLoading(false);
    }
  };

  const saveForm = () => {
    if (!form.date || !form.summary.trim()) {
      setErrorMessage("일자와 인계 요약은 필수입니다.");
      return;
    }

    const selectedPatient = patientOptions.find((p) => String(p.patientId) === form.patientId);
    const statusText = form.statusCode === "기타" ? form.statusEtc.trim() : form.statusCode;
    const completedSelected = form.completedItems.filter((v) => v !== "기타(직접입력)");
    const todoSelected = form.todoItems.filter((v) => v !== "기타(직접입력)");
    const completedText = [
      ...completedSelected,
      form.completedItems.includes("기타(직접입력)") ? form.completedEtc.trim() : "",
    ]
      .filter(Boolean)
      .join(", ");
    const todoText = [
      ...todoSelected,
      form.todoItems.includes("기타(직접입력)") ? form.todoEtc.trim() : "",
    ]
      .filter(Boolean)
      .join(", ");
    const mergedPatients = selectedPatient
      ? [
          ...patientDrafts,
          {
            patientId: selectedPatient.patientId,
            patientLabel: `${selectedPatient.name} (${toBirth6(selectedPatient.birthDate)})`,
            bpSystolic: form.bpSystolic.trim(),
            bpDiastolic: form.bpDiastolic.trim(),
            pulse: form.pulse.trim(),
            temperature: form.temperature.trim(),
            spo2: form.spo2.trim(),
            status: statusText,
            completed: completedText,
            todo: todoText,
            caution: form.caution.trim(),
          },
        ]
      : patientDrafts;

    const payload: HandoverItem = {
      id: editingId ?? Date.now(),
      date: form.date,
      shift: form.shift,
      department: departmentName,
      writer: user?.fullName || user?.username || "작성자",
      summary: form.summary.trim(),
      wardNotes: form.wardNotes.trim(),
      patients: mergedPatients,
    };

    setHandoverItems((prev) => {
      if (!editingId) return [payload, ...prev];
      return prev.map((item) => (item.id === editingId ? payload : item));
    });
    setSelected(payload);
    setOpenForm(false);
    setEditingId(null);
    setErrorMessage(null);
  };

  const addPatientDraft = () => {
    if (!selectedPatientInForm) {
      setErrorMessage("환자를 먼저 조회/선택해 주세요.");
      return;
    }
    const statusText = form.statusCode === "기타" ? form.statusEtc.trim() : form.statusCode;
    const completedText = [...form.completedItems, form.completedEtc.trim()].filter(Boolean).join(", ");
    const todoText = [...form.todoItems, form.todoEtc.trim()].filter(Boolean).join(", ");

    const draft = {
      patientId: selectedPatientInForm.patientId,
      patientLabel: `${selectedPatientInForm.name} (${toBirth6(selectedPatientInForm.birthDate)})`,
      bpSystolic: form.bpSystolic.trim(),
      bpDiastolic: form.bpDiastolic.trim(),
      pulse: form.pulse.trim(),
      temperature: form.temperature.trim(),
      spo2: form.spo2.trim(),
      status: statusText,
      completed: completedText,
      todo: todoText,
      caution: form.caution.trim(),
    };
    setPatientDrafts((prev) => [...prev, draft]);
    setForm((p) => ({
      ...p,
      patientId: "",
      bpSystolic: "",
      bpDiastolic: "",
      pulse: "",
      temperature: "",
      spo2: "",
      statusCode: "안정",
      statusEtc: "",
      completedItems: [],
      completedEtc: "",
      todoItems: [],
      todoEtc: "",
      caution: "",
    }));
    setPatientSearchInput("");
    setPatientOptions([]);
    setPatientSearchTried(false);
    setPatientPickerOpen(false);
    setErrorMessage(null);
  };

  const selectedDraft = useMemo(() => {
    if (selectedDraftIndex === null) return null;
    return patientDrafts[selectedDraftIndex] || null;
  }, [patientDrafts, selectedDraftIndex]);

  const removeSelected = () => {
    if (!selected) return;
    if (!window.confirm("이 인계노트를 삭제할까요?")) return;
    setHandoverItems((prev) => prev.filter((item) => item.id !== selected.id));
    setSelected(null);
  };

  return (
    <MainLayout>
      <Stack spacing={2.5}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography sx={{ fontSize: 24, fontWeight: 900 }}>인계노트</Typography>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" onClick={() => setOptionManagerOpen(true)}>체크 항목 관리</Button>
            <Button variant="contained" onClick={openCreate}>인계노트 등록</Button>
          </Stack>
        </Stack>

        <Card sx={{ border: "1px solid var(--line)" }}>
          <CardContent>
            <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} justifyContent="space-between" alignItems={{ xs: "stretch", md: "center" }}>
              <Typography sx={{ color: "var(--muted)" }}>날짜 카드 목록을 눌러 상세 인계를 확인하세요.</Typography>
              <TextField size="small" placeholder="날짜/부서/작성자 검색" value={search} onChange={(e) => setSearch(e.target.value)} sx={{ width: { xs: "100%", md: 280 } }} />
            </Stack>
          </CardContent>
        </Card>

        <Box sx={{ display: "grid", gap: 1.5, gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))", xl: "repeat(3, minmax(0, 1fr))" } }}>
          {filtered.map((item) => (
            <Card key={item.id} sx={{ border: "1px solid var(--line)", boxShadow: "var(--shadow-1)" }}>
              <CardActionArea onClick={() => setSelected(item)}>
                <CardContent>
                  <Stack spacing={1.1}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography sx={{ fontWeight: 800 }}>{item.date}</Typography>
                      <Chip size="small" label={item.shift} />
                    </Stack>
                    <Typography sx={{ fontSize: 13, color: "var(--muted)" }}>{item.department} · 작성자 {item.writer}</Typography>
                    <Typography sx={{ fontWeight: 700 }}>{item.summary}</Typography>
                    <Typography sx={{ fontSize: 12, color: "var(--muted)" }}>환자 {item.patients.length}명 인계</Typography>
                  </Stack>
                </CardContent>
              </CardActionArea>
            </Card>
          ))}
        </Box>
      </Stack>

      <Dialog open={!!selected} onClose={() => setSelected(null)} maxWidth="md" fullWidth>
        <DialogTitle>인계노트 상세</DialogTitle>
        <DialogContent dividers>
          {selected ? (
            <Stack spacing={2}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                <Chip label={`일자 ${selected.date}`} />
                <Chip label={`근무 ${selected.shift}`} />
                <Chip label={`부서 ${selected.department}`} />
                <Chip label={`작성자 ${selected.writer}`} />
              </Stack>
              <Typography sx={{ fontWeight: 800 }}>인계 요약</Typography>
              <Typography>{selected.summary}</Typography>
              <Divider />
              <Typography sx={{ fontWeight: 800 }}>환자 정보</Typography>
              {selected.patients.length ? selected.patients.map((p, idx) => (
                <Card key={`${selected.id}-${idx}`} variant="outlined">
                  <CardContent>
                    <Stack spacing={0.8}>
                      <Typography sx={{ fontWeight: 800 }}>{p.patientLabel}</Typography>
                      <Typography>
                        <strong>활력징후:</strong> BP {p.bpSystolic || "-"}/{p.bpDiastolic || "-"} mmHg · PR {p.pulse || "-"} · BT {p.temperature || "-"}C · SpO2 {p.spo2 || "-"}%
                      </Typography>
                      <Typography><strong>현재 상태:</strong> {p.status || "-"}</Typography>
                      <Typography><strong>완료 조치:</strong> {p.completed || "-"}</Typography>
                      <Typography><strong>다음 근무 할 일:</strong> {p.todo || "-"}</Typography>
                      <Typography><strong>주의사항:</strong> {p.caution || "-"}</Typography>
                    </Stack>
                  </CardContent>
                </Card>
              )) : <Typography sx={{ color: "var(--muted)" }}>연결된 환자 없음</Typography>}
              <Divider />
              <Typography sx={{ fontWeight: 800 }}>병동 공통 전달사항</Typography>
              <Typography>{selected.wardNotes || "-"}</Typography>
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={openEdit}>수정</Button>
          <Button color="error" onClick={removeSelected}>삭제</Button>
          <Button onClick={() => setSelected(null)}>닫기</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openForm} onClose={() => setOpenForm(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? "인계노트 수정" : "인계노트 등록"}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1.25}>
            {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

            <Tabs value={formTab} onChange={(_, v) => setFormTab(v)}>
              <Tab value="base" label="인계 기본정보" />
              <Tab value="patient" label="환자 정보" />
            </Tabs>

            {formTab === "base" ? (
              <Stack spacing={1.2}>
                <Stack spacing={0.6}>
                  <Typography sx={{ fontSize: 13, fontWeight: 700 }}>근무</Typography>
                  <Stack direction="row" flexWrap="wrap" gap={0.5}>
                    {(["주간", "이브닝", "야간"] as ShiftType[]).map((shift) => (
                      <FormControlLabel
                        key={shift}
                        sx={{ mr: 1.2 }}
                        control={
                          <Checkbox
                            size="small"
                            checked={form.shift === shift}
                            onChange={() => setForm((p) => ({ ...p, shift }))}
                          />
                        }
                        label={<Typography sx={{ fontSize: 13 }}>{shift}</Typography>}
                      />
                    ))}
                  </Stack>
                </Stack>
                <TextField label="인계 요약" value={form.summary} onChange={(e) => setForm((p) => ({ ...p, summary: e.target.value }))} />
                <Stack direction="row" justifyContent="flex-start">
                  <TextField
                    type="date"
                    label="일자"
                    value={form.date}
                    onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
                    InputLabelProps={{ shrink: true }}
                    sx={{ width: { xs: "100%", sm: 240 } }}
                  />
                </Stack>
                <TextField label="병동 공통 전달사항" multiline minRows={3} value={form.wardNotes} onChange={(e) => setForm((p) => ({ ...p, wardNotes: e.target.value }))} />
                <Stack direction="row" spacing={1}>
                  <Chip label={`작성자 ${user?.fullName || user?.username || "-"}`} />
                  <Chip label={`부서 ${departmentName || "공통"}`} />
                </Stack>
              </Stack>
            ) : (
              <Stack spacing={1.2}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <TextField
                    size="small"
                    label="환자 검색"
                    placeholder="이름/전화"
                    value={patientSearchInput}
                    onChange={(e) => setPatientSearchInput(e.target.value)}
                    sx={{ flex: 1 }}
                  />
                  <Button variant="outlined" onClick={() => void searchPatientsForForm()} disabled={patientSearchLoading}>
                    {patientSearchLoading ? "조회 중..." : "조회"}
                  </Button>
                </Stack>
                {selectedPatientInForm ? (
                  <Chip
                    color="primary"
                    label={`선택됨: ${selectedPatientInForm.name} (${toBirth6(selectedPatientInForm.birthDate)})`}
                    onDelete={() => setForm((p) => ({ ...p, patientId: "" }))}
                  />
                ) : null}
                <Typography sx={{ color: "var(--muted)", fontSize: 12 }}>
                  조회 결과는 작은 검색창에서 선택합니다.
                </Typography>
                <TextField
                  select
                  SelectProps={{ native: true }}
                  label="현재 상태"
                  value={form.statusCode}
                  onChange={(e) => setForm((p) => ({ ...p, statusCode: e.target.value }))}
                >
                  {STATUS_OPTIONS.map((op) => (
                    <option key={op} value={op}>{op}</option>
                  ))}
                </TextField>
                {form.statusCode === "기타" ? (
                  <TextField label="현재 상태(기타)" value={form.statusEtc} onChange={(e) => setForm((p) => ({ ...p, statusEtc: e.target.value }))} />
                ) : null}
                <Stack direction="row" spacing={1}>
                  <Button variant="outlined" onClick={() => setVitalInputOpen(true)}>바이탈 입력</Button>
                  {(form.bpSystolic || form.bpDiastolic || form.pulse || form.temperature || form.spo2) ? (
                    <Chip
                      size="small"
                      label={`BP ${form.bpSystolic || "-"}/${form.bpDiastolic || "-"} · PR ${form.pulse || "-"} · BT ${form.temperature || "-"} · SpO2 ${form.spo2 || "-"}`}
                    />
                  ) : null}
                </Stack>
                <Divider sx={{ my: 0.5 }} />

                <Stack spacing={0.7}>
                  <Typography sx={{ fontSize: 13, fontWeight: 700 }}>완료 조치</Typography>
                  <Stack direction="row" flexWrap="wrap" gap={0.25}>
                    {completedOptions.map((op) => (
                      <FormControlLabel
                        key={op.id}
                        sx={{ mr: 1.2 }}
                        control={
                          <Checkbox
                            size="small"
                            checked={form.completedItems.includes(op.label)}
                            onChange={() => toggleMulti("completedItems", op.label)}
                          />
                        }
                        label={<Typography sx={{ fontSize: 13 }}>{op.label}</Typography>}
                      />
                    ))}
                  </Stack>
                  {form.completedItems.includes("기타(직접입력)") ? (
                    <TextField label="완료 조치(기타)" value={form.completedEtc} onChange={(e) => setForm((p) => ({ ...p, completedEtc: e.target.value }))} />
                  ) : null}
                </Stack>

                <Divider sx={{ my: 0.5 }} />

                <Stack spacing={0.7}>
                  <Typography sx={{ fontSize: 13, fontWeight: 700 }}>다음 근무 할 일</Typography>
                  <Stack direction="row" flexWrap="wrap" gap={0.25}>
                    {todoOptions.map((op) => (
                      <FormControlLabel
                        key={op.id}
                        sx={{ mr: 1.2 }}
                        control={
                          <Checkbox
                            size="small"
                            checked={form.todoItems.includes(op.label)}
                            onChange={() => toggleMulti("todoItems", op.label)}
                          />
                        }
                        label={<Typography sx={{ fontSize: 13 }}>{op.label}</Typography>}
                      />
                    ))}
                  </Stack>
                  {form.todoItems.includes("기타(직접입력)") ? (
                    <TextField label="다음 근무 할 일(기타)" value={form.todoEtc} onChange={(e) => setForm((p) => ({ ...p, todoEtc: e.target.value }))} />
                  ) : null}
                </Stack>
                <TextField label="주의사항" value={form.caution} onChange={(e) => setForm((p) => ({ ...p, caution: e.target.value }))} />
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography sx={{ fontSize: 12, color: "var(--muted)" }}>등록 대기 환자 {patientDrafts.length}명</Typography>
                  <Button variant="contained" size="small" onClick={addPatientDraft}>환자 추가</Button>
                </Stack>
                {patientDrafts.length ? (
                  <Card variant="outlined" sx={{ maxHeight: 180, overflow: "auto" }}>
                    <CardContent sx={{ p: 1 }}>
                      <Stack spacing={0.75}>
                        {patientDrafts.map((p, idx) => (
                          <Stack key={`${p.patientId || "x"}-${idx}`} direction="row" justifyContent="space-between" alignItems="center">
                            <Button
                              size="small"
                              variant="text"
                              sx={{ textTransform: "none", justifyContent: "flex-start" }}
                              onClick={() => {
                                setSelectedDraftIndex(idx);
                                setDraftVitalViewOpen(true);
                              }}
                            >
                              {p.patientLabel}
                            </Button>
                            <Button color="error" size="small" onClick={() => setPatientDrafts((prev) => prev.filter((_, i) => i !== idx))}>삭제</Button>
                          </Stack>
                        ))}
                      </Stack>
                    </CardContent>
                  </Card>
                ) : null}
              </Stack>
            )}

            <Card variant="outlined" sx={{ mt: 0.5 }}>
              <CardContent>
                <Typography sx={{ fontSize: 12, color: "var(--muted)", mb: 0.75 }}>등록 후 카드 미리보기</Typography>
                <Stack spacing={1.1}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography sx={{ fontWeight: 800 }}>{previewCard.date}</Typography>
                    <Chip size="small" label={previewCard.shift} />
                  </Stack>
                  <Typography sx={{ fontSize: 13, color: "var(--muted)" }}>
                    {previewCard.department} · 작성자 {previewCard.writer}
                  </Typography>
                  <Typography sx={{ fontWeight: 700 }}>{previewCard.summary}</Typography>
                  <Typography sx={{ fontSize: 12, color: "var(--muted)" }}>
                    환자 {previewCard.patientCount}명 인계
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenForm(false)}>취소</Button>
          <Button variant="contained" onClick={saveForm}>{editingId ? "수정 저장" : "등록"}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={patientPickerOpen} onClose={() => setPatientPickerOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>환자 검색 결과</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1}>
            <Typography sx={{ fontSize: 12, color: "var(--muted)" }}>
              페이지당 10명씩 표시됩니다.
            </Typography>
            <Box sx={{ maxHeight: 320, overflow: "auto", pr: 0.5 }}>
              <Stack spacing={0.75}>
            {patientOptions.length ? (
              pagedPatientOptions.map((p) => {
                const active = String(p.patientId) === form.patientId;
                return (
                  <Button
                    key={p.patientId}
                    variant={active ? "contained" : "text"}
                    size="small"
                    sx={{ justifyContent: "flex-start", textTransform: "none" }}
                    onClick={() => {
                      setForm((prev) => ({ ...prev, patientId: String(p.patientId) }));
                      setPatientPickerOpen(false);
                    }}
                  >
                    {p.name} ({toBirth6(p.birthDate)})
                  </Button>
                );
              })
            ) : patientSearchTried ? (
              <Typography sx={{ color: "var(--muted)", fontSize: 12 }}>검색 결과가 없습니다.</Typography>
            ) : (
              <Typography sx={{ color: "var(--muted)", fontSize: 12 }}>검색어 입력 후 조회하세요.</Typography>
            )}
              </Stack>
            </Box>
            {patientOptions.length > PATIENT_PAGE_SIZE ? (
              <Stack direction="row" justifyContent="center" sx={{ pt: 0.25 }}>
                <Pagination
                  size="small"
                  count={patientPageCount}
                  page={patientPage}
                  onChange={(_, value) => setPatientPage(value)}
                />
              </Stack>
            ) : null}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPatientPickerOpen(false)}>닫기</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={vitalInputOpen} onClose={() => setVitalInputOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>바이탈 입력</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              <TextField label="수축기" value={form.bpSystolic} onChange={(e) => setForm((p) => ({ ...p, bpSystolic: e.target.value }))} placeholder="예: 120" />
              <TextField label="이완기" value={form.bpDiastolic} onChange={(e) => setForm((p) => ({ ...p, bpDiastolic: e.target.value }))} placeholder="예: 80" />
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              <TextField label="맥박" value={form.pulse} onChange={(e) => setForm((p) => ({ ...p, pulse: e.target.value }))} placeholder="예: 78" />
              <TextField label="체온" value={form.temperature} onChange={(e) => setForm((p) => ({ ...p, temperature: e.target.value }))} placeholder="예: 36.7" />
              <TextField label="산소포화도" value={form.spo2} onChange={(e) => setForm((p) => ({ ...p, spo2: e.target.value }))} placeholder="예: 98" />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVitalInputOpen(false)}>확인</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={draftVitalViewOpen} onClose={() => setDraftVitalViewOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>등록 환자 바이탈</DialogTitle>
        <DialogContent dividers>
          {selectedDraft ? (
            <Stack spacing={0.9}>
              <Typography sx={{ fontWeight: 800 }}>{selectedDraft.patientLabel}</Typography>
              <Typography>BP: {selectedDraft.bpSystolic || "-"}/{selectedDraft.bpDiastolic || "-"} mmHg</Typography>
              <Typography>PR: {selectedDraft.pulse || "-"}</Typography>
              <Typography>BT: {selectedDraft.temperature || "-"} C</Typography>
              <Typography>SpO2: {selectedDraft.spo2 || "-"}%</Typography>
              <Divider />
              <Typography><strong>현재 상태:</strong> {selectedDraft.status || "-"}</Typography>
              <Typography><strong>완료 조치:</strong> {selectedDraft.completed || "-"}</Typography>
              <Typography><strong>다음 근무 할 일:</strong> {selectedDraft.todo || "-"}</Typography>
              <Typography><strong>주의사항:</strong> {selectedDraft.caution || "-"}</Typography>
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDraftVitalViewOpen(false)}>닫기</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={optionManagerOpen} onClose={() => setOptionManagerOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>인계 체크 항목 관리</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <Typography sx={{ fontSize: 12, color: "var(--muted)" }}>유지보수를 위해 완료조치/다음근무할일 항목을 여기서 관리합니다.</Typography>

            <Stack spacing={1}>
              <Typography sx={{ fontWeight: 800 }}>완료 조치 항목</Typography>
              <Stack direction="row" spacing={1}>
                <TextField size="small" label="항목 추가" value={newCompletedOption} onChange={(e) => setNewCompletedOption(e.target.value)} sx={{ flex: 1 }} />
                <Button
                  variant="outlined"
                  onClick={() => void addOption("COMPLETED", newCompletedOption)}
                >
                  추가
                </Button>
              </Stack>
              <Stack direction="row" flexWrap="wrap" gap={0.75}>
                {completedOptions.map((op) => (
                  <Box
                    key={`co-${op.id}`}
                    draggable
                    onDragStart={() => setDraggingCompleted(op.id)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={async () => {
                      if (!draggingCompleted) return;
                      const next = reorderOptions(completedOptions, draggingCompleted, op.id);
                      setCompletedOptions(next);
                      await reorderHandoverOptionsApi("COMPLETED", next.map((v) => v.id));
                      setDraggingCompleted(null);
                    }}
                    onDragEnd={() => setDraggingCompleted(null)}
                    sx={{ cursor: "grab" }}
                  >
                    <Chip
                      label={op.label}
                      onDelete={op.label === "기타(직접입력)" ? undefined : () => void removeOption(op.id)}
                    />
                  </Box>
                ))}
              </Stack>
            </Stack>

            <Divider />

            <Stack spacing={1}>
              <Typography sx={{ fontWeight: 800 }}>다음 근무 할 일 항목</Typography>
              <Stack direction="row" spacing={1}>
                <TextField size="small" label="항목 추가" value={newTodoOption} onChange={(e) => setNewTodoOption(e.target.value)} sx={{ flex: 1 }} />
                <Button
                  variant="outlined"
                  onClick={() => void addOption("TODO", newTodoOption)}
                >
                  추가
                </Button>
              </Stack>
              <Stack direction="row" flexWrap="wrap" gap={0.75}>
                {todoOptions.map((op) => (
                  <Box
                    key={`to-${op.id}`}
                    draggable
                    onDragStart={() => setDraggingTodo(op.id)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={async () => {
                      if (!draggingTodo) return;
                      const next = reorderOptions(todoOptions, draggingTodo, op.id);
                      setTodoOptions(next);
                      await reorderHandoverOptionsApi("TODO", next.map((v) => v.id));
                      setDraggingTodo(null);
                    }}
                    onDragEnd={() => setDraggingTodo(null)}
                    sx={{ cursor: "grab" }}
                  >
                    <Chip
                      label={op.label}
                      onDelete={op.label === "기타(직접입력)" ? undefined : () => void removeOption(op.id)}
                    />
                  </Box>
                ))}
              </Stack>
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOptionManagerOpen(false)}>닫기</Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
}
