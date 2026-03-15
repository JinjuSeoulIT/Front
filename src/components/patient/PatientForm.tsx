"use client";

import * as React from "react";
import Link from "next/link";
import {
  Button,
  CircularProgress,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import LocalHospitalOutlinedIcon from "@mui/icons-material/LocalHospitalOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import MedicalServicesOutlinedIcon from "@mui/icons-material/MedicalServicesOutlined";
import type { PatientForm as PatientFormPayload } from "@/features/patients/patientTypes";
import type { Patient } from "@/features/patients/patientTypes";
import { searchPatientsApi } from "@/lib/patientApi";

type PatientFormState = {
  name: string;
  email: string;
  gender: string;
  birthDate: string;
  phone: string;
  address: string;
  addressDetail: string;
  guardianName: string;
  guardianPhone: string;
  guardianRelation: string;
  isForeigner: boolean;
  contactPriority: string;
  note: string;
  photoFile: File | null;
};

type PatientFormProps = {
  title: string;
  initial: PatientFormState;
  loading: boolean;
  error?: string | null;
  submitLabel: string;
  onSubmit: (form: PatientFormPayload) => void;
  secondarySubmitLabel?: string;
  onSecondarySubmit?: (form: PatientFormPayload) => void;
  postSubmitOptions?: { label: string; onSubmit: (form: PatientFormPayload) => void }[];
  onCancel: () => void;
  onDelete?: () => void;
  showPhotoField?: boolean;
  enableDuplicateCheck?: boolean;
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
function toOptionalOrEmpty(value: string) {
  const t = value.trim();
  return t.length === 0 ? "" : t;
}

export default function PatientForm({
  title,
  initial,
  loading,
  error,
  submitLabel,
  onSubmit,
  secondarySubmitLabel,
  onSecondarySubmit,
  postSubmitOptions,
  onCancel,
  onDelete,
  showPhotoField = false,
  enableDuplicateCheck = false,
}: PatientFormProps) {
  const [form, setForm] = React.useState<PatientFormState>(initial);
  const [duplicateOpen, setDuplicateOpen] = React.useState(false);
  const [duplicateLoading, setDuplicateLoading] = React.useState(false);
  const [duplicateList, setDuplicateList] = React.useState<Patient[]>([]);
  const [postSubmitAnchorEl, setPostSubmitAnchorEl] = React.useState<null | HTMLElement>(null);
  const hasPostSubmitOptions = Boolean(postSubmitOptions?.length);

  React.useEffect(() => setForm(initial), [initial]);

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
      oncomplete: (data) =>
        setForm((prev) => ({ ...prev, address: data.address ?? "", addressDetail: "" })),
    }).open();
  };

  const buildPayload = (): PatientFormPayload | null => {
    const name = form.name.trim();
    if (!name) return null;
    return {
      name,
      email: toOptional(form.email),
      gender: toOptional(form.gender),
      birthDate: toOptional(form.birthDate),
      phone: toOptional(form.phone),
      address: toOptionalOrEmpty(form.address),
      addressDetail: toOptionalOrEmpty(form.addressDetail),
      guardianName: toOptional(form.guardianName),
      guardianPhone: toOptional(form.guardianPhone),
      guardianRelation: toOptional(form.guardianRelation),
      isForeigner: form.isForeigner,
      contactPriority: toOptional(form.contactPriority) ?? "PATIENT",
      note: toOptional(form.note),
      photoFile: form.photoFile ?? undefined,
    };
  };

  const handleSubmit = () => {
    const p = buildPayload();
    if (p) onSubmit(p);
  };

  const handleSecondarySubmit = () => {
    const p = buildPayload();
    if (p && onSecondarySubmit) onSecondarySubmit(p);
  };

  const onSelectPostSubmitOption = (opt: { onSubmit: (f: PatientFormPayload) => void }) => {
    const p = buildPayload();
    if (p) {
      setPostSubmitAnchorEl(null);
      opt.onSubmit(p);
    }
  };

  const optionIcon = (label: string) => {
    if (label.includes("외래")) return <LocalHospitalOutlinedIcon sx={{ fontSize: 18 }} />;
    if (label.includes("예약")) return <EventAvailableOutlinedIcon sx={{ fontSize: 18 }} />;
    if (label.includes("응급")) return <MedicalServicesOutlinedIcon sx={{ fontSize: 18 }} />;
    return <LocalHospitalOutlinedIcon sx={{ fontSize: 18 }} />;
  };

  const handleDuplicateCheck = async () => {
    const [n, ph, b] = [form.name.trim(), form.phone.trim(), form.birthDate.trim()];
    if (!n && !ph && !b) {
      alert("이름/연락처/생년월일 중 하나는 입력해 주세요.");
      return;
    }
    try {
      setDuplicateLoading(true);
      const [r1, r2, r3] = await Promise.all([
        n ? searchPatientsApi("name", n) : Promise.resolve([]),
        ph ? searchPatientsApi("phone", ph) : Promise.resolve([]),
        b ? searchPatientsApi("birthDate", b) : Promise.resolve([]),
      ]);
      const m = new Map<number, Patient>();
      for (const list of [r1, r2, r3])
        for (const item of list) m.set(item.patientId, item);
      setDuplicateList(Array.from(m.values()));
      setDuplicateOpen(true);
    } finally {
      setDuplicateLoading(false);
    }
  };

  const fieldSx = { "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } } as const;

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 3, md: 4 },
        borderRadius: 3,
        border: "1px solid #dbe5f5",
        bgcolor: "white",
        boxShadow: "0 14px 28px rgba(23, 52, 97, 0.15)",
      }}
    >
      <Stack spacing={2.5}>
        <Stack spacing={0.5}>
          <Typography variant="h6" fontWeight={800}>{title}</Typography>
          <Typography color="text.secondary" fontWeight={600}>
            환자 기본 정보를 정확히 입력해 주세요.
          </Typography>
        </Stack>
        <Divider />

        <Stack spacing={2}>
          <TextField label="환자명" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required fullWidth sx={fieldSx} />
          <TextField label="이메일" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} fullWidth sx={fieldSx} />
          <TextField select label="성별" value={form.gender} onChange={(e) => setForm((p) => ({ ...p, gender: e.target.value }))} fullWidth sx={fieldSx}>
            <MenuItem value="">선택 안함</MenuItem>
            <MenuItem value="M">남</MenuItem>
            <MenuItem value="F">여</MenuItem>
          </TextField>
          <TextField type="date" label="생년월일" InputLabelProps={{ shrink: true }} value={form.birthDate} onChange={(e) => setForm((p) => ({ ...p, birthDate: e.target.value }))} fullWidth sx={fieldSx} />
          <TextField label="연락처" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} fullWidth sx={fieldSx} />
          {enableDuplicateCheck && (
            <Button variant="outlined" onClick={handleDuplicateCheck} disabled={duplicateLoading} sx={{ width: "fit-content", color: "#2b5aa9" }}>
              {duplicateLoading ? <CircularProgress size={18} /> : "중복 확인"}
            </Button>
          )}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <TextField label="주소" value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} fullWidth sx={fieldSx} />
            <Button variant="outlined" onClick={handleAddressSearch} sx={{ minWidth: 120, color: "#2b5aa9" }}>주소 검색</Button>
          </Stack>
          <TextField label="상세주소" value={form.addressDetail} onChange={(e) => setForm((p) => ({ ...p, addressDetail: e.target.value }))} fullWidth sx={fieldSx} />
          <Divider />
          <Typography fontWeight={800}>보호자 정보</Typography>
          <TextField label="보호자 이름" value={form.guardianName} onChange={(e) => setForm((p) => ({ ...p, guardianName: e.target.value }))} fullWidth sx={fieldSx} />
          <TextField label="보호자 연락처" value={form.guardianPhone} onChange={(e) => setForm((p) => ({ ...p, guardianPhone: e.target.value }))} fullWidth sx={fieldSx} />
          <TextField label="관계" value={form.guardianRelation} onChange={(e) => setForm((p) => ({ ...p, guardianRelation: e.target.value }))} fullWidth sx={fieldSx} />
          <Divider />
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <TextField select label="내/외국인" value={form.isForeigner ? "Y" : "N"} onChange={(e) => setForm((p) => ({ ...p, isForeigner: e.target.value === "Y" }))} fullWidth sx={fieldSx}>
              <MenuItem value="N">내국인</MenuItem>
              <MenuItem value="Y">외국인</MenuItem>
            </TextField>
            <TextField select label="연락 우선순위" value={form.contactPriority} onChange={(e) => setForm((p) => ({ ...p, contactPriority: e.target.value }))} fullWidth sx={fieldSx}>
              <MenuItem value="PATIENT">본인</MenuItem>
              <MenuItem value="GUARDIAN">보호자</MenuItem>
            </TextField>
          </Stack>
          <TextField label="알레르기/주의사항" value={form.note} onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))} fullWidth multiline minRows={2} sx={fieldSx} />
          {showPhotoField && (
            <Stack direction="row" spacing={1} alignItems="center">
              <Button variant="outlined" component="label">
                환자 사진
                <input type="file" accept="image/*" hidden onChange={(e) => setForm((p) => ({ ...p, photoFile: e.target.files?.[0] ?? null }))} />
              </Button>
              <Typography variant="body2" color="text.secondary">{form.photoFile?.name ?? "파일 없음"}</Typography>
            </Stack>
          )}
        </Stack>

        {error && <Typography color="error" fontWeight={800}>{error}</Typography>}

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
          <Button variant="outlined" onClick={onCancel} disabled={loading}>취소</Button>
          {onDelete && <Button variant="outlined" color="warning" onClick={onDelete} disabled={loading}>비활성</Button>}
          <Button variant="contained" onClick={handleSubmit} disabled={loading || !form.name.trim()} sx={{ bgcolor: "#2b5aa9" }}>{submitLabel}</Button>
          {hasPostSubmitOptions && (
            <>
              <Button
                variant="contained"
                color="success"
                onClick={(e) => setPostSubmitAnchorEl(e.currentTarget)}
                disabled={loading || !form.name.trim()}
                endIcon={<KeyboardArrowDownRoundedIcon sx={{ transform: postSubmitAnchorEl ? "rotate(180deg)" : "rotate(0deg)", transition: "transform .2s" }} />}
                sx={{ px: 1.75, fontWeight: 800, boxShadow: "0 8px 16px rgba(25, 118, 210, 0.24)" }}
              >
                등록 후 접수
              </Button>
              <Menu
                anchorEl={postSubmitAnchorEl}
                open={Boolean(postSubmitAnchorEl)}
                onClose={() => setPostSubmitAnchorEl(null)}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
                transformOrigin={{ vertical: "bottom", horizontal: "right" }}
                slotProps={{ paper: { sx: { mb: 1, minWidth: 160, p: 0.75, borderRadius: 2.5, border: "1px solid #dbe5f5" } } }}
              >
                {(postSubmitOptions ?? []).map((opt) => (
                  <MenuItem key={opt.label} onClick={() => onSelectPostSubmitOption(opt)} sx={{ gap: 1, borderRadius: 1.5, py: 1, px: 1.25, fontWeight: 700, "&:hover": { bgcolor: "#eef4ff" } }}>
                    {optionIcon(opt.label)}
                    {opt.label}
                  </MenuItem>
                ))}
              </Menu>
            </>
          )}
          {!hasPostSubmitOptions && onSecondarySubmit && secondarySubmitLabel && (
            <Button variant="contained" color="success" onClick={handleSecondarySubmit} disabled={loading || !form.name.trim()}>{secondarySubmitLabel}</Button>
          )}
        </Stack>
      </Stack>

      <Dialog open={duplicateOpen} onClose={() => setDuplicateOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle>중복 후보</DialogTitle>
        <DialogContent>
          {duplicateList.length === 0 ? (
            <Typography color="text.secondary">중복 후보가 없습니다.</Typography>
          ) : (
            <List>
              {duplicateList.map((p) => (
                <ListItem key={p.patientId} divider>
                  <ListItemText primary={`${p.name} · ${p.patientNo ?? p.patientId}`} secondary={`${p.birthDate ?? "-"} · ${p.phone ?? "-"}`} />
                  <Button component={Link} href={`/patients/${p.patientId}`}>상세</Button>
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDuplicateOpen(false)}>계속 등록</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
