"use client";

import * as React from "react";
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  FormControlLabel,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import AddIcon from "@mui/icons-material/Add";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import type { PatientForm as PatientFormPayload } from "@/features/patients/patientTypes";

type DaumPostcodeData = { address?: string };
type DaumPostcodeInstance = { open: () => void };
type DaumPostcodeConstructor = new (opts: {
  oncomplete: (data: DaumPostcodeData) => void;
}) => DaumPostcodeInstance;
type DaumWindow = Window & { daum?: { Postcode?: DaumPostcodeConstructor } };

const PATIENT_TYPES = [
  { value: "VIP", label: "VIP" },
  { value: "지인추천", label: "지인추천" },
  { value: "검색방문", label: "검색방문" },
  { value: "실비O", label: "실비O" },
  { value: "실비X", label: "실비X" },
] as const;

type Props = {
  open: boolean;
  onClose: () => void;
  loading?: boolean;
  error?: string | null;
  initialName?: string;
  onSubmit: (form: PatientFormPayload) => void;
  onSubmitAndReception: (form: PatientFormPayload) => void;
};

export default function PatientRegistrationModal({
  open,
  onClose,
  loading = false,
  error = null,
  initialName = "",
  onSubmit,
  onSubmitAndReception,
}: Props) {
  const [name, setName] = React.useState(initialName);
  const [rrn1, setRrn1] = React.useState("");
  const [rrn2, setRrn2] = React.useState("");
  const [noRrn, setNoRrn] = React.useState(false);
  const [phone, setPhone] = React.useState("");
  const [emergencyPhone, setEmergencyPhone] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [addressDetail, setAddressDetail] = React.useState("");
  const [patientType, setPatientType] = React.useState("");
  const [consentRequired, setConsentRequired] = React.useState(false);
  const [consentOptional, setConsentOptional] = React.useState(false);
  const [consentAll, setConsentAll] = React.useState(false);

  React.useEffect(() => {
    setName(initialName);
  }, [initialName, open]);

  React.useEffect(() => {
    if (consentAll) {
      setConsentRequired(true);
      setConsentOptional(true);
    }
  }, [consentAll]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    if (document.getElementById("daum-postcode-script")) return;
    const s = document.createElement("script");
    s.id = "daum-postcode-script";
    s.src = "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
    s.async = true;
    document.body.appendChild(s);
  }, []);

  const handleAddressSearch = () => {
    const daum = (window as DaumWindow).daum;
    if (!daum?.Postcode) {
      alert("주소 검색 스크립트를 불러오는 중입니다. 잠시 후 다시 시도하세요.");
      return;
    }
    new daum.Postcode({
      oncomplete: (data) => {
        setAddress(data.address ?? "");
        setAddressDetail("");
      },
    }).open();
  };

  const buildPayload = (): PatientFormPayload | null => {
    const n = name.trim();
    if (!n) return null;
    if (!consentRequired) return null;

    const trim = (v: string) => v.trim() || undefined;
    let birthDate: string | undefined;
    if (!noRrn && rrn1.length >= 6) {
      const yy = rrn1.slice(0, 2);
      const mm = rrn1.slice(2, 4);
      const dd = rrn1.slice(4, 6);
      const prefix = parseInt(yy, 10) >= 0 && parseInt(yy, 10) <= 24 ? "20" : "19";
      birthDate = `${prefix}${yy}-${mm}-${dd}`;
    }

    const noteParts: string[] = [];
    if (patientType) noteParts.push(`환자유형: ${patientType}`);
    if (emergencyPhone.trim()) noteParts.push(`비상연락처: ${emergencyPhone.trim()}`);
    if (noRrn) noteParts.push("주민등록번호 없음");

    return {
      name: n,
      birthDate,
      phone: trim(phone) || undefined,
      guardianPhone: trim(emergencyPhone) || undefined,
      address: trim(address) || undefined,
      addressDetail: trim(addressDetail) || undefined,
      note: noteParts.length ? noteParts.join(", ") : undefined,
    };
  };

  const handleSubmit = () => {
    const p = buildPayload();
    if (p) {
      onSubmit(p);
    } else {
      if (!name.trim()) alert("이름을 입력해 주세요.");
      else if (!consentRequired) alert("(필수) 개인정보 수집·이용 동의에 체크해 주세요.");
    }
  };

  const handleSubmitAndReception = () => {
    const p = buildPayload();
    if (p) {
      onSubmitAndReception(p);
    } else {
      if (!name.trim()) alert("이름을 입력해 주세요.");
      else if (!consentRequired) alert("(필수) 개인정보 수집·이용 동의에 체크해 주세요.");
    }
  };

  const fieldSx = { "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } } as const;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          border: "1px solid #dbe5f5",
          boxShadow: "0 20px 40px rgba(23, 52, 97, 0.18)",
        },
      }}
    >
      <DialogContent sx={{ p: 0, overflow: "hidden" }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 3, py: 2, borderBottom: "1px solid #e8eef7" }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <PersonOutlineIcon sx={{ color: "#2b5aa9", fontSize: 28 }} />
            <Typography variant="h6" fontWeight={900}>
              신규환자등록
            </Typography>
          </Stack>
          <IconButton onClick={onClose} size="small" sx={{ color: "text.secondary" }}>
            <CloseIcon />
          </IconButton>
        </Stack>

        <Box sx={{ p: 3, maxHeight: "70vh", overflow: "auto" }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
            <Stack spacing={2} sx={{ flex: 1, minWidth: 0 }}>
              <TextField
                label="이름*"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                fullWidth
                sx={fieldSx}
              />
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  주민등록번호(외국인등록번호)*
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: "wrap" }}>
                  <TextField
                    placeholder="앞 6자리"
                    value={rrn1}
                    onChange={(e) => setRrn1(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    disabled={noRrn}
                    sx={{ ...fieldSx, width: 100 }}
                    inputProps={{ maxLength: 6 }}
                  />
                  <Typography>-</Typography>
                  <TextField
                    placeholder="뒤 7자리"
                    value={rrn2}
                    onChange={(e) => setRrn2(e.target.value.replace(/\D/g, "").slice(0, 7))}
                    disabled={noRrn}
                    sx={{ ...fieldSx, width: 120 }}
                    inputProps={{ maxLength: 7 }}
                  />
                  <FormControlLabel
                    control={<Checkbox checked={noRrn} onChange={(e) => setNoRrn(e.target.checked)} size="small" />}
                    label="주민등록번호가 없습니다."
                    sx={{ ml: 1 }}
                  />
                </Stack>
              </Box>
              <TextField
                label="대표연락처"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                fullWidth
                placeholder="010-0000-0000"
                sx={fieldSx}
              />
              <TextField
                label="비상연락처"
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value)}
                fullWidth
                placeholder="010-0000-0000"
                sx={fieldSx}
              />
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  주소
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                  <TextField
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    fullWidth
                    size="small"
                    sx={fieldSx}
                    placeholder="주소 검색"
                  />
                  <Button variant="outlined" onClick={handleAddressSearch} sx={{ minWidth: 80, color: "#2b5aa9" }}>
                    검색
                  </Button>
                </Stack>
                <TextField
                  value={addressDetail}
                  onChange={(e) => setAddressDetail(e.target.value)}
                  fullWidth
                  size="small"
                  placeholder="상세주소 입력"
                  sx={fieldSx}
                />
              </Box>
            </Stack>

            <Stack spacing={2} sx={{ flex: 1, minWidth: 0 }}>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  환자유형
                </Typography>
                <TextField
                  select
                  value={patientType}
                  onChange={(e) => setPatientType(e.target.value)}
                  fullWidth
                  size="small"
                  sx={fieldSx}
                  placeholder="선택"
                >
                  <MenuItem value="">선택</MenuItem>
                  {PATIENT_TYPES.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
              <Box>
                <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    가족관계
                  </Typography>
                  <IconButton size="small" sx={{ color: "#2b5aa9", p: 0.25 }}>
                    <AddIcon fontSize="small" />
                  </IconButton>
                </Stack>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: "1px dashed #dbe5f5",
                    bgcolor: "rgba(43, 90, 169, 0.04)",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <PersonOutlineIcon sx={{ color: "text.disabled", fontSize: 20 }} />
                  <Typography variant="body2" color="text.secondary">
                    등록된 가족이 없습니다.
                  </Typography>
                </Box>
              </Box>
              <Box>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                  <Checkbox
                    checked={consentAll}
                    onChange={(e) => setConsentAll(e.target.checked)}
                    size="small"
                  />
                  <Typography variant="body2" fontWeight={800}>
                    약관 전체 동의
                  </Typography>
                </Stack>
                <Stack spacing={1}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <FormControlLabel
                      control={<Checkbox checked={consentRequired} onChange={(e) => setConsentRequired(e.target.checked)} size="small" />}
                      label={<Typography variant="body2">(필수) 개인정보 수집·이용 동의</Typography>}
                    />
                    <Button size="small" endIcon={<ChevronRightIcon />} sx={{ color: "#2b5aa9", minWidth: 0 }}>
                      약관 &gt;
                    </Button>
                  </Stack>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <FormControlLabel
                      control={<Checkbox checked={consentOptional} onChange={(e) => setConsentOptional(e.target.checked)} size="small" />}
                      label={<Typography variant="body2">(선택) 병의원 마케팅 정보 수신 동의</Typography>}
                    />
                    <Button size="small" endIcon={<ChevronRightIcon />} sx={{ color: "#2b5aa9", minWidth: 0 }}>
                      약관 &gt;
                    </Button>
                  </Stack>
                </Stack>
              </Box>
            </Stack>
          </Stack>

          {error && (
            <Typography color="error" fontWeight={800} sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}
        </Box>

        <Stack
          direction="row"
          spacing={1}
          justifyContent="flex-end"
          sx={{ px: 3, py: 2, borderTop: "1px solid #e8eef7", bgcolor: "#fafbfd" }}
        >
          <Button variant="outlined" onClick={onClose} disabled={loading}>
            취소
          </Button>
          <Button variant="outlined" onClick={handleSubmit} disabled={loading || !name.trim() || !consentRequired}>
            등록완료
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmitAndReception}
            disabled={loading || !name.trim() || !consentRequired}
            sx={{ bgcolor: "#2b5aa9", fontWeight: 800 }}
          >
            등록 후 접수
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
