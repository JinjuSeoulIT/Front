"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Menu,
  MenuItem,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import CloseIcon from "@mui/icons-material/Close";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LocalHospitalOutlinedIcon from "@mui/icons-material/LocalHospitalOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import MedicalServicesOutlinedIcon from "@mui/icons-material/MedicalServicesOutlined";
import AddIcon from "@mui/icons-material/Add";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { useDispatch } from "react-redux";
import { patientActions } from "@/features/patients/patientSlice";
import type { Patient, PatientFamilyItem, PatientForm as PatientFormPayload } from "@/features/patients/patientTypes";
import { createPatientApi, searchPatientsApi } from "@/lib/patientApi";
import type { AppDispatch } from "@/store/store";

type RrnType = "domestic" | "foreign";

type FormState = {
  name: string;
  gender: string;
  birthDate: string;
  rrnFront: string;
  rrnBack: string;
  rrnType: RrnType;
  phone: string;
  address: string;
  addressDetail: string;
  patientType: string;
  consentRequired: boolean;
  consentMarketing: boolean;
};

type Props = {
  open: boolean;
  onClose: () => void;
};

type DaumPostcodeData = { address?: string };
type DaumPostcodeInstance = { open: () => void };
type DaumPostcodeConstructor = new (opts: { oncomplete: (data: DaumPostcodeData) => void }) => DaumPostcodeInstance;

type DaumWindow = Window & {
  daum?: { Postcode?: DaumPostcodeConstructor };
};

function toOptional(value: string) {
  const t = value.trim();
  return t.length === 0 ? undefined : t;
}

// 주민/외국인등록번호 뒷자리 첫 글자로 성별 추론 (1,3,5,7,9=남, 2,4,6,8,0=여)
function getGenderFromRrnFirstDigit(d: string): "M" | "F" | "" {
  if (!d) return "";
  const n = d[0];
  if (["1", "3", "5", "7", "9"].includes(n)) return "M";
  if (["2", "4", "6", "8", "0"].includes(n)) return "F";
  return "";
}

const initialForm: FormState = {
  name: "",
  gender: "",
  birthDate: "",
  rrnFront: "",
  rrnBack: "",
  rrnType: "domestic",
  phone: "",
  address: "",
  addressDetail: "",
  patientType: "",
  consentRequired: false,
  consentMarketing: false,
};

const PATIENT_TYPES = [
  { value: "VIP", label: "VIP" },
  { value: "지인추천", label: "지인추천" },
  { value: "검색방문", label: "검색방문" },
  { value: "실비O", label: "실비O" },
  { value: "실비X", label: "실비X" },
] as const;

export default function PatientRegistrationModal({ open, onClose }: Props) {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const [form, setForm] = React.useState<FormState>(initialForm);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [duplicateOpen, setDuplicateOpen] = React.useState(false);
  const [duplicateLoading, setDuplicateLoading] = React.useState(false);
  const [duplicateList, setDuplicateList] = React.useState<Patient[]>([]);
  const [postSubmitAnchorEl, setPostSubmitAnchorEl] = React.useState<null | HTMLElement>(null);
  const [families, setFamilies] = React.useState<PatientFamilyItem[]>([]);
  const [familyAddOpen, setFamilyAddOpen] = React.useState(false);
  const [familyAddForm, setFamilyAddForm] = React.useState({
    relation: "",
    familyName: "",
    familyPhone: "",
    birthDate: "",
    isPrimary: false,
  });

  const inputSx = { "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } };

  const handleClose = () => {
    if (submitting) return;
    setForm(initialForm);
    setFamilies([]);
    setError(null);
    onClose();
  };

  const handleAddFamily = () => {
    const { relation, familyName } = familyAddForm;
    if (!relation.trim() || !familyName.trim()) {
      alert("관계와 이름을 입력해 주세요.");
      return;
    }
    setFamilies((prev) => [
      ...prev,
      {
        relation: relation.trim(),
        familyName: familyName.trim(),
        familyPhone: familyAddForm.familyPhone.trim() || undefined,
        birthDate: familyAddForm.birthDate.trim() || undefined,
        isPrimary: familyAddForm.isPrimary,
      },
    ]);
    setFamilyAddForm({ relation: "", familyName: "", familyPhone: "", birthDate: "", isPrimary: false });
    setFamilyAddOpen(false);
  };

  const handleRemoveFamily = (idx: number) => {
    setFamilies((prev) => prev.filter((_, i) => i !== idx));
  };

  React.useEffect(() => {
    if (!open) {
      setForm(initialForm);
      setFamilies([]);
    }
  }, [open]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    if (document.getElementById("daum-postcode-script")) return;

    const script = document.createElement("script");
    script.id = "daum-postcode-script";
    script.src = "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const handleAddressSearch = () => {
    if (typeof window === "undefined") return;
    const daum = (window as DaumWindow).daum;
    if (!daum?.Postcode) {
      alert("주소 검색 스크립트를 불러오는 중입니다. 잠시 후 다시 시도하세요.");
      return;
    }
    new daum.Postcode({
      oncomplete: (data: DaumPostcodeData) => {
        setForm((prev) => ({
          ...prev,
          address: data.address ?? "",
          addressDetail: "",
        }));
      },
    }).open();
  };

  const buildPayload = (): PatientFormPayload | null => {
    const name = form.name.trim();
    if (!name) return null;
    return {
      name,
      gender: toOptional(form.gender),
      birthDate: toOptional(form.birthDate),
      rrn: toOptional(form.rrnFront + form.rrnBack),
      phone: toOptional(form.phone),
      address: form.address.trim() || undefined,
      addressDetail: form.addressDetail.trim() || undefined,
      isForeigner: form.rrnType === "foreign",
      families:
        families.length > 0
          ? families.map((f) => ({
              relation: f.relation,
              familyName: f.familyName,
              familyPhone: f.familyPhone,
              birthDate: f.birthDate,
              isPrimary: f.isPrimary,
            }))
          : undefined,
    };
  };

  const resolveErr = (err: unknown, fallback: string) =>
    err instanceof Error && err.message ? err.message : fallback;

  const validateRequired = (): string | null => {
    if (!form.name.trim()) return "이름을 입력해 주세요.";
    if (!form.birthDate.trim()) return "생년월일을 입력해 주세요.";
    if (!form.phone.trim()) return "대표연락처를 입력해 주세요.";
    const rrn = (form.rrnFront + form.rrnBack).replace(/\D/g, "");
    if (rrn.length !== 13) return `${form.rrnType === "domestic" ? "주민등록번호" : "외국인등록번호"} 13자리를 입력해 주세요.`;
    if (!form.consentRequired) return "(필수) 개인정보 수집·이용 동의에 체크해 주세요.";
    return null;
  };

  const handleRegister = async () => {
    const err = validateRequired();
    if (err) {
      alert(err);
      return;
    }
    const payload = buildPayload();
    if (!payload) return;
    try {
      setSubmitting(true);
      setError(null);
      await createPatientApi(payload);
      dispatch(patientActions.fetchPatientsRequest());
      handleClose();
    } catch (err: unknown) {
      setError(resolveErr(err, "환자 등록 실패"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegisterAndNavigate = async (path: string) => {
    const err = validateRequired();
    if (err) {
      alert(err);
      return;
    }
    const payload = buildPayload();
    if (!payload) return;
    try {
      setSubmitting(true);
      setError(null);
      const created = await createPatientApi(payload);
      dispatch(patientActions.fetchPatientsRequest());
      handleClose();
      router.push(
        `${path}?patientName=${encodeURIComponent(created.name ?? payload.name ?? "")}&patientId=${created.patientId}`
      );
    } catch (err: unknown) {
      setError(resolveErr(err, "등록 후 이동 실패"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDuplicateCheck = async () => {
    const { name, phone, birthDate } = form;
    if (!name.trim() && !phone.trim() && !birthDate.trim()) {
      alert("이름/연락처/생년월일 중 하나는 입력해 주세요.");
      return;
    }
    try {
      setDuplicateLoading(true);
      const results = await Promise.all([
        name.trim() ? searchPatientsApi("name", name.trim()) : Promise.resolve([]),
        phone.trim() ? searchPatientsApi("phone", phone.trim()) : Promise.resolve([]),
        birthDate.trim() ? searchPatientsApi("birthDate", birthDate.trim()) : Promise.resolve([]),
      ]);
      const merged = new Map<number, Patient>();
      for (const list of results) {
        for (const item of list) merged.set(item.patientId, item);
      }
      setDuplicateList(Array.from(merged.values()));
      setDuplicateOpen(true);
    } finally {
      setDuplicateLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: "hidden",
          boxShadow: "0 24px 48px rgba(23, 52, 97, 0.2)",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          py: 2,
          px: 3,
          borderBottom: "1px solid #eee",
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <PersonOutlinedIcon sx={{ color: "#2b5aa9", fontSize: 28 }} />
          <Typography variant="h6" fontWeight={800}>
            신규환자등록
          </Typography>
        </Stack>
        <IconButton onClick={handleClose} disabled={submitting} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Grid container sx={{ minHeight: 400 }}>
          {/* 왼쪽: 기본 정보 */}
          <Grid xs={12} md={6} sx={{ p: 3, borderRight: { md: "1px solid #eee" } }}>
            <Stack spacing={2}>
              <TextField
                label="이름*"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                required
                fullWidth
                size="small"
                sx={inputSx}
              />
              <DatePicker
                label="생년월일*"
                value={form.birthDate ? dayjs(form.birthDate) : null}
                onChange={(date) =>
                  setForm((p) => ({ ...p, birthDate: date ? dayjs(date).format("YYYY-MM-DD") : "" }))
                }
                slotProps={{
                  textField: {
                    required: true,
                    fullWidth: true,
                    size: "small" as const,
                    sx: inputSx,
                  },
                }}
              />
              <Box>
                <RadioGroup
                  row
                  value={form.rrnType}
                  onChange={(e) => setForm((p) => ({ ...p, rrnType: e.target.value as RrnType }))}
                  sx={{ mb: 1 }}
                >
                  <FormControlLabel value="domestic" control={<Radio size="small" />} label="주민등록번호" />
                  <FormControlLabel value="foreign" control={<Radio size="small" />} label="외국인등록번호" />
                </RadioGroup>
                <Stack direction="row" spacing={1} alignItems="center">
                  <TextField
                    value={form.rrnFront}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        rrnFront: e.target.value.replace(/\D/g, "").slice(0, 6),
                      }))
                    }
                    placeholder="000000"
                    inputProps={{ maxLength: 6 }}
                    size="small"
                    sx={{ flex: 1, "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }}
                  />
                  <Typography sx={{ color: "text.secondary" }}>-</Typography>
                  <TextField
                    value={form.rrnBack.length > 0 ? form.rrnBack[0] + "*".repeat(form.rrnBack.length - 1) : ""}
                    onKeyDown={(e) => {
                      if (/^[0-9]$/.test(e.key) && form.rrnBack.length < 7) {
                        const newBack = form.rrnBack + e.key;
                        setForm((p) => ({
                          ...p,
                          rrnBack: newBack,
                          gender: getGenderFromRrnFirstDigit(newBack),
                        }));
                        e.preventDefault();
                      } else if (e.key === "Backspace") {
                        const newBack = form.rrnBack.slice(0, -1);
                        setForm((p) => ({
                          ...p,
                          rrnBack: newBack,
                          gender: getGenderFromRrnFirstDigit(newBack),
                        }));
                        e.preventDefault();
                      }
                    }}
                    onPaste={(e) => {
                      e.preventDefault();
                      const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 7);
                      setForm((p) => ({
                        ...p,
                        rrnBack: pasted,
                        gender: getGenderFromRrnFirstDigit(pasted),
                      }));
                    }}
                    placeholder="0000000"
                    inputProps={{ maxLength: 7 }}
                    size="small"
                    sx={{ flex: 1, "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }}
                  />
                </Stack>
              </Box>

              {(form.rrnFront + form.rrnBack).replace(/\D/g, "").length >= 13 && (
                <Stack direction="row" alignItems="center" spacing={1} sx={{ color: "success.main" }}>
                  <CheckCircleIcon fontSize="small" />
                  <Typography variant="body2">주민/외국인등록번호가 완성되었습니다.</Typography>
                </Stack>
              )}

              <TextField
                label="대표연락처*"
                value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                required
                fullWidth
                size="small"
                sx={inputSx}
              />

              <Stack direction="row" spacing={1}>
                <TextField
                  label="주소"
                  value={form.address}
                  onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                  fullWidth
                  size="small"
                  sx={inputSx}
                />
                <Button variant="outlined" size="small" onClick={handleAddressSearch} sx={{ whiteSpace: "nowrap" }}>
                  주소 검색
                </Button>
              </Stack>
              <TextField
                label="상세주소"
                value={form.addressDetail}
                onChange={(e) => setForm((p) => ({ ...p, addressDetail: e.target.value }))}
                fullWidth
                multiline
                minRows={2}
                size="small"
                sx={inputSx}
              />
              <Button
                variant="outlined"
                onClick={handleDuplicateCheck}
                disabled={duplicateLoading}
                size="small"
                sx={{ width: "fit-content", color: "#2b5aa9" }}
              >
                {duplicateLoading ? <CircularProgress size={18} /> : "중복 확인"}
              </Button>
            </Stack>
          </Grid>

          {/* 오른쪽: 환자유형, 가족, 동의 */}
          <Grid xs={12} md={6} sx={{ p: 3 }}>
            <Stack spacing={2}>
              <TextField
                select
                label="환자유형"
                value={form.patientType}
                onChange={(e) => setForm((p) => ({ ...p, patientType: e.target.value }))}
                fullWidth
                size="small"
                sx={inputSx}
              >
                <MenuItem value="">선택</MenuItem>
                {PATIENT_TYPES.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </TextField>

              <Box>
                <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    가족관계
                  </Typography>
                  <IconButton size="small" sx={{ color: "#2b5aa9", p: 0.25 }} onClick={() => setFamilyAddOpen(true)}>
                    <AddIcon fontSize="small" />
                  </IconButton>
                </Stack>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: "1px dashed #ddd",
                    bgcolor: "#fafafa",
                    minHeight: 60,
                  }}
                >
                  {families.length === 0 ? (
                    <Stack direction="row" alignItems="center" gap={1}>
                      <PersonOutlinedIcon sx={{ color: "#999", fontSize: 20 }} />
                      <Typography variant="body2" color="text.secondary">
                        등록된 가족이 없습니다
                      </Typography>
                    </Stack>
                  ) : (
                    <Stack spacing={0.75}>
                      {families.map((f, idx) => (
                        <Stack
                          key={idx}
                          direction="row"
                          alignItems="center"
                          justifyContent="space-between"
                          sx={{
                            py: 0.5,
                            px: 1,
                            borderRadius: 1,
                            bgcolor: "white",
                            border: "1px solid #eee",
                          }}
                        >
                          <Typography variant="body2">
                            {f.relation} · {f.familyName}
                            {f.familyPhone ? ` (${f.familyPhone})` : ""}
                            {f.isPrimary && " [대표]"}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveFamily(idx)}
                            sx={{ color: "error.main", p: 0.25 }}
                          >
                            <CloseIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Stack>
                      ))}
                    </Stack>
                  )}
                </Box>
              </Box>

              {/* 가족 추가 다이얼로그 */}
              <Dialog open={familyAddOpen} onClose={() => setFamilyAddOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle>가족 추가</DialogTitle>
                <DialogContent>
                  <Stack spacing={1.5} sx={{ pt: 0.5 }}>
                    <TextField
                      select
                      label="관계"
                      value={familyAddForm.relation}
                      onChange={(e) => setFamilyAddForm((p) => ({ ...p, relation: e.target.value }))}
                      size="small"
                      fullWidth
                      sx={inputSx}
                    >
                      <MenuItem value="">선택</MenuItem>
                      <MenuItem value="부">부</MenuItem>
                      <MenuItem value="모">모</MenuItem>
                      <MenuItem value="배우자">배우자</MenuItem>
                      <MenuItem value="자녀">자녀</MenuItem>
                      <MenuItem value="형제">형제</MenuItem>
                      <MenuItem value="기타">기타</MenuItem>
                    </TextField>
                    <TextField
                      label="이름"
                      value={familyAddForm.familyName}
                      onChange={(e) => setFamilyAddForm((p) => ({ ...p, familyName: e.target.value }))}
                      size="small"
                      fullWidth
                      required
                      sx={inputSx}
                    />
                    <TextField
                      label="연락처"
                      value={familyAddForm.familyPhone}
                      onChange={(e) => setFamilyAddForm((p) => ({ ...p, familyPhone: e.target.value }))}
                      size="small"
                      fullWidth
                      sx={inputSx}
                    />
                    <DatePicker
                      label="생년월일"
                      value={familyAddForm.birthDate ? dayjs(familyAddForm.birthDate) : null}
                      onChange={(date) =>
                        setFamilyAddForm((p) => ({
                          ...p,
                          birthDate: date ? dayjs(date).format("YYYY-MM-DD") : "",
                        }))
                      }
                      slotProps={{
                        textField: {
                          size: "small" as const,
                          fullWidth: true,
                          sx: inputSx,
                        },
                      }}
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          size="small"
                          checked={familyAddForm.isPrimary}
                          onChange={(e) => setFamilyAddForm((p) => ({ ...p, isPrimary: e.target.checked }))}
                        />
                      }
                      label="대표연락처"
                      sx={{ "& .MuiFormControlLabel-label": { fontSize: 14 } }}
                    />
                  </Stack>
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setFamilyAddOpen(false)}>취소</Button>
                  <Button variant="contained" onClick={handleAddFamily}>
                    추가
                  </Button>
                </DialogActions>
              </Dialog>

              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: "1px solid #e0e0e0",
                  bgcolor: "#f9fafb",
                }}
              >
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
                  약관 전체 동의
                </Typography>
                <Stack spacing={1}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <FormControlLabel
                      control={
                        <Checkbox
                          size="small"
                          checked={form.consentRequired}
                          onChange={(e) => setForm((p) => ({ ...p, consentRequired: e.target.checked }))}
                        />
                      }
                      label="(필수) 개인정보 수집·이용 동의"
                      sx={{ "& .MuiFormControlLabel-label": { fontSize: 14 } }}
                    />
                    <Button size="small" sx={{ color: "#2b5aa9", minWidth: 0 }}>
                      약관 &gt;
                    </Button>
                  </Stack>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ opacity: 0.85 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          size="small"
                          checked={form.consentMarketing}
                          onChange={(e) => setForm((p) => ({ ...p, consentMarketing: e.target.checked }))}
                        />
                      }
                      label={
                        <Typography variant="body2" color="text.secondary">
                          (선택) 병의원 마케팅 정보 수신 동의
                        </Typography>
                      }
                    />
                    <Button size="small" sx={{ color: "#2b5aa9", minWidth: 0 }}>
                      약관 &gt;
                    </Button>
                  </Stack>
                </Stack>
              </Box>
            </Stack>
          </Grid>
        </Grid>

        <Typography variant="caption" color="text.secondary" sx={{ px: 3, pb: 1 }}>
          ※ *는 필수 입력 항목입니다.
        </Typography>
        {error && (
          <Typography color="error" sx={{ px: 3, pb: 1 }} fontWeight={600}>
            {error}
          </Typography>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          py: 2,
          gap: 1,
          borderTop: "1px solid #eee",
          flexWrap: "wrap",
        }}
      >
        <Button variant="outlined" onClick={handleClose} disabled={submitting}>
          취소
        </Button>
        <Button
          variant="contained"
          onClick={handleRegister}
          disabled={
            submitting ||
            !form.name.trim() ||
            !form.birthDate.trim() ||
            !form.phone.trim() ||
            (form.rrnFront + form.rrnBack).replace(/\D/g, "").length !== 13 ||
            !form.consentRequired
          }
          sx={{ bgcolor: "#64b5f6", "&:hover": { bgcolor: "#42a5f5" } }}
        >
          {submitting ? <CircularProgress size={20} /> : "등록완료"}
        </Button>
        <Button
          variant="contained"
          onClick={(e) => setPostSubmitAnchorEl(e.currentTarget)}
          disabled={
            submitting ||
            !form.name.trim() ||
            !form.birthDate.trim() ||
            !form.phone.trim() ||
            (form.rrnFront + form.rrnBack).replace(/\D/g, "").length !== 13 ||
            !form.consentRequired
          }
          endIcon={
            <KeyboardArrowDownRoundedIcon
              sx={{
                transform: Boolean(postSubmitAnchorEl) ? "rotate(180deg)" : "rotate(0deg)",
              }}
            />
          }
        >
          등록 후 접수
        </Button>
        <Menu
          anchorEl={postSubmitAnchorEl}
          open={Boolean(postSubmitAnchorEl)}
          onClose={() => setPostSubmitAnchorEl(null)}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          transformOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <MenuItem
            onClick={() => {
              setPostSubmitAnchorEl(null);
              handleRegisterAndNavigate("/receptions/new");
            }}
          >
            <LocalHospitalOutlinedIcon sx={{ fontSize: 18, mr: 1 }} />
            외래접수
          </MenuItem>
          <MenuItem
            onClick={() => {
              setPostSubmitAnchorEl(null);
              handleRegisterAndNavigate("/reservations/new");
            }}
          >
            <EventAvailableOutlinedIcon sx={{ fontSize: 18, mr: 1 }} />
            예약접수
          </MenuItem>
          <MenuItem
            onClick={() => {
              setPostSubmitAnchorEl(null);
              handleRegisterAndNavigate("/emergency-receptions/new");
            }}
          >
            <MedicalServicesOutlinedIcon sx={{ fontSize: 18, mr: 1 }} />
            응급접수
          </MenuItem>
        </Menu>
      </DialogActions>

      {/* 중복 후보 다이얼로그 */}
      <Dialog open={duplicateOpen} onClose={() => setDuplicateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>중복 후보</DialogTitle>
        <Box sx={{ px: 2, pb: 2 }}>
          {duplicateList.length === 0 ? (
            <Typography color="text.secondary">중복 후보가 없습니다.</Typography>
          ) : (
            <List>
              {duplicateList.map((p) => (
                <ListItem key={p.patientId} divider>
                  <ListItemText
                    primary={`${p.name} · ${p.patientNo ?? p.patientId}`}
                    secondary={`${p.birthDate ?? "-"} · ${p.phone ?? "-"}`}
                  />
                  <Button component={Link} href={`/patients/${p.patientId}`} size="small">
                    상세
                  </Button>
                </ListItem>
              ))}
            </List>
          )}
        </Box>
        <DialogActions>
          <Button onClick={() => setDuplicateOpen(false)}>계속 등록</Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
}
