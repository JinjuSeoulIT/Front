"use client";

import * as React from "react";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/store/store";
import type { Patient } from "@/features/patients/patientTypes";
import type { PatientForm as PatientFormPayload } from "@/features/patients/patientTypes";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { updatePatientApi } from "@/lib/patientApi";
import { patientActions } from "@/features/patients/patientSlice";

type RrnType = "domestic" | "foreign";

type FormState = {
  name: string;
  email: string;
  gender: string;
  birthDate: string;
  rrnFront: string;
  rrnBack: string;
  rrnType: RrnType;
  phone: string;
  address: string;
  addressDetail: string;
  note: string;
};

type DaumPostcodeData = { address?: string };
type DaumPostcodeInstance = { open: () => void };
type DaumPostcodeConstructor = new (opts: {
  oncomplete: (data: DaumPostcodeData) => void;
}) => DaumPostcodeInstance;
type DaumWindow = Window & {
  daum?: { Postcode?: DaumPostcodeConstructor };
};

function toOptional(value: string) {
  const t = value.trim();
  return t.length === 0 ? undefined : t;
}

/** 주민/외국인등록번호 뒷자리 첫 글자로 성별 추론 (1,3,5,7,9=남, 2,4,6,8,0=여) */
function getGenderFromRrnFirstDigit(d: string): "M" | "F" | "" {
  if (!d || d.length === 0) return "";
  const n = d[0];
  if (["1", "3", "5", "7", "9"].includes(n)) return "M";
  if (["2", "4", "6", "8", "0"].includes(n)) return "F";
  return "";
}
function toOptionalOrEmpty(value: string) {
  const t = value.trim();
  return t.length === 0 ? "" : t;
}

type Props = {
  open: boolean;
  onClose: () => void;
  patient: Patient;
};

export default function PatientEditModal({ open, onClose, patient }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [form, setForm] = React.useState<FormState>({
    name: patient?.name ?? "",
    email: patient?.email ?? "",
    gender: patient?.gender ?? "",
    birthDate: patient?.birthDate ?? "",
    rrnFront: patient?.rrn ? String(patient.rrn).slice(0, 6) : "",
    rrnBack: patient?.rrn ? String(patient.rrn).slice(6, 13) : "",
    rrnType: (patient?.isForeigner ? "foreign" : "domestic") as RrnType,
    phone: patient?.phone ?? "",
    address: patient?.address ?? "",
    addressDetail: patient?.addressDetail ?? "",
    note: patient?.note ?? "",
  });

  React.useEffect(() => {
    if (open && patient) {
      setForm({
        name: patient.name ?? "",
        email: patient.email ?? "",
        gender: patient.gender ?? "",
        birthDate: patient.birthDate ?? "",
        rrnFront: patient.rrn ? String(patient.rrn).slice(0, 6) : "",
        rrnBack: patient.rrn ? String(patient.rrn).slice(6, 13) : "",
        rrnType: (patient.isForeigner ? "foreign" : "domestic") as RrnType,
        phone: patient.phone ?? "",
        address: patient.address ?? "",
        addressDetail: patient.addressDetail ?? "",
        note: patient.note ?? "",
      });
    }
  }, [open, patient]);

  const handleClose = () => {
    if (!loading) {
      setError(null);
      onClose();
    }
  };

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
        setForm((p) => ({
          ...p,
          address: data.address ?? "",
          addressDetail: "",
        }));
      },
    }).open();
  };

  const validateRequired = (): string | null => {
    if (!form.name.trim()) return "환자명을 입력해 주세요.";
    if (!form.birthDate.trim()) return "생년월일을 입력해 주세요.";
    if (!form.phone.trim()) return "연락처를 입력해 주세요.";
    const rrn = (form.rrnFront + form.rrnBack).replace(/\D/g, "");
    if (rrn.length !== 13) return `${form.rrnType === "domestic" ? "주민등록번호" : "외국인등록번호"} 13자리를 입력해 주세요.`;
    return null;
  };

  const buildPayload = (): PatientFormPayload | null => {
    const name = form.name.trim();
    if (!name) return null;
    return {
      name,
      email: toOptional(form.email),
      gender: toOptional(form.gender),
      birthDate: toOptional(form.birthDate),
      rrn: toOptional(form.rrnFront + form.rrnBack),
      phone: toOptional(form.phone),
      address: toOptionalOrEmpty(form.address),
      addressDetail: toOptionalOrEmpty(form.addressDetail),
      isForeigner: form.rrnType === "foreign",
      note: toOptional(form.note),
    };
  };

  const handleSubmit = async () => {
    const err = validateRequired();
    if (err) {
      alert(err);
      return;
    }
    const payload = buildPayload();
    if (!payload || !patient) return;
    try {
      setLoading(true);
      setError(null);
      await updatePatientApi(patient.patientId, payload);
      dispatch(patientActions.fetchPatientRequest({ patientId: patient.patientId }));
      dispatch(patientActions.fetchPatientsRequest());
      handleClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "환자 수정 실패");
    } finally {
      setLoading(false);
    }
  };

  const canSubmit =
    form.name.trim() &&
    form.birthDate.trim() &&
    form.phone.trim() &&
    (form.rrnFront + form.rrnBack).replace(/\D/g, "").length === 13;

  const inputSx = { "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } };

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
          <EditOutlinedIcon sx={{ color: "#2b5aa9", fontSize: 28 }} />
          <Typography variant="h6" fontWeight={800}>
            환자 정보 수정
          </Typography>
        </Stack>
        <IconButton onClick={handleClose} disabled={loading} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3, overflow: "auto" }}>
        <Stack spacing={2}>
          <TextField
            label="환자명*"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            required
            fullWidth
            size="small"
            sx={inputSx}
          />
          <TextField
            label="이메일"
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
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
                label={form.rrnType === "domestic" ? "주민등록번호(앞 6자리)*" : "외국인등록번호(앞 6자리)*"}
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
                label={form.rrnType === "domestic" ? "주민등록번호(뒤 7자리)*" : "외국인등록번호(뒤 7자리)*"}
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
          <TextField
            label="연락처*"
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
            <Button variant="outlined" onClick={handleAddressSearch} sx={{ minWidth: 80, color: "#2b5aa9" }}>
              검색
            </Button>
          </Stack>
          <TextField
            label="상세주소"
            value={form.addressDetail}
            onChange={(e) => setForm((p) => ({ ...p, addressDetail: e.target.value }))}
            fullWidth
            size="small"
            sx={inputSx}
          />
          <TextField
            label="알레르기/주의사항"
            value={form.note}
            onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))}
            fullWidth
            multiline
            minRows={2}
            size="small"
            sx={inputSx}
          />

          <Typography variant="caption" color="text.secondary">
            ※ *는 필수 입력 항목입니다.
          </Typography>
          {error && (
            <Typography color="error" fontWeight={600}>
              {error}
            </Typography>
          )}
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" onClick={handleClose} disabled={loading}>
              취소
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading || !canSubmit}
              sx={{ bgcolor: "#2b5aa9" }}
            >
              저장
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
