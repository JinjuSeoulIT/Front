import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { CheckCircleOutline } from "@mui/icons-material";
import { checkMedicalStaffUsernameApi } from "@/entities/medical-staff/api/medicalStaffApi";

export type MedicalStaffFormValues = {
  id?: number;
  staffId: string;
  name: string;
  phone?: string;
  departmentId?: number | null;
  positionId?: number | null;
  status?: string;
  photoUrl?: string;
  profileImageFile?: File | null;
};

export type SimpleOption = {
  id: number;
  name: string;
};

type MedicalStaffFormModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: MedicalStaffFormValues) => void;
  initialValues?: MedicalStaffFormValues | null;
  departments?: SimpleOption[];
  positions?: SimpleOption[];
  title?: string;
};

const defaultValues: MedicalStaffFormValues = {
  staffId: "",
  name: "",
  phone: "",
  departmentId: null,
  positionId: null,
  status: "ACTIVE",
  profileImageFile: null,
};

function statusChip(status?: string) {
  if (status === "INACTIVE") {
    return <Chip label="비활성" color="default" variant="outlined" size="small" />;
  }
  if (status === "ON_LEAVE") {
    return <Chip label="휴직" color="warning" variant="filled" size="small" />;
  }
  if (status === "RESIGNED") {
    return <Chip label="퇴사" color="default" variant="filled" size="small" />;
  }
  return <Chip label="재직중" color="success" variant="filled" size="small" />;
}

const MedicalStaffFormModal: React.FC<MedicalStaffFormModalProps> = ({
  open,
  onClose,
  onSubmit,
  initialValues,
  departments = [],
  positions = [],
  title = "의료진 등록",
}) => {
  const [form, setForm] = useState<MedicalStaffFormValues>(defaultValues);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [checkingId, setCheckingId] = useState(false);
  const [idAvailable, setIdAvailable] = useState<boolean | null>(null);
  const [idCheckMessage, setIdCheckMessage] = useState<string | null>(null);
  const [checkedStaffId, setCheckedStaffId] = useState<string | null>(null);

  useEffect(() => {
    if (initialValues) {
      setForm({ ...defaultValues, ...initialValues, profileImageFile: null });
      setPreviewUrl(initialValues.photoUrl ?? null);
      setIdAvailable(null);
      setIdCheckMessage(null);
      return;
    }
    setForm(defaultValues);
    setPreviewUrl(null);
    setIdAvailable(null);
    setIdCheckMessage(null);
  }, [initialValues, open]);

  useEffect(() => {
    setIdAvailable(null);
    setIdCheckMessage(null);
    setCheckedStaffId(null);
  }, [form.staffId]);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const isEditing = Boolean(form.id);

  const headerSubtitle = useMemo(() => {
    return isEditing
      ? "기존 의료진 정보를 수정합니다."
      : "새 의료진을 등록합니다.";
  }, [isEditing]);

  const handleChange = (
    field: keyof MedicalStaffFormValues,
    value: MedicalStaffFormValues[keyof MedicalStaffFormValues]
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (file: File | null) => {
    handleChange("profileImageFile", file);
    if (previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(file ? URL.createObjectURL(file) : null);
  };

  const handleSubmit = () => {
    const trimmedStaffId = form.staffId.trim();
    if (!trimmedStaffId || !form.name.trim()) return;
    if (!isEditing) {
      if (idAvailable !== true || checkedStaffId !== trimmedStaffId) return;
    }

    onSubmit({
      ...form,
      staffId: trimmedStaffId,
      name: form.name.trim(),
      phone: (form.phone ?? "").trim(),
    });
  };

  const handleCheckId = async () => {
    const value = form.staffId.trim();
    if (!value || isEditing) return;
    setCheckingId(true);
    setIdCheckMessage(null);
    try {
      const res = await checkMedicalStaffUsernameApi(value);
      if (res.success) {
        setIdAvailable(res.result === true);
        setIdCheckMessage(
          res.result === true ? "사용 가능한 아이디입니다." : "중복된 아이디입니다."
        );
        setCheckedStaffId(value);
      } else {
        setIdAvailable(null);
        setIdCheckMessage(res.message || "중복 검사에 실패했습니다.");
        setCheckedStaffId(null);
      }
    } catch (err) {
      setIdAvailable(null);
      setIdCheckMessage("중복 검사에 실패했습니다.");
      setCheckedStaffId(null);
    } finally {
      setCheckingId(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ pb: 1.5 }}>
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            background:
              "linear-gradient(135deg, rgba(25,118,210,0.10), rgba(76,175,80,0.06))",
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            alignItems={{ xs: "flex-start", sm: "center" }}
            justifyContent="space-between"
          >
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 900, lineHeight: 1.15 }}>
                {title}
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.25 }}>
                {headerSubtitle}
              </Typography>
            </Box>
            {isEditing ? statusChip(form.status) : null}
          </Stack>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 0 }}>
        <Stack spacing={2}>
          <Paper variant="outlined" sx={{ borderRadius: 2 }}>
            <Box sx={{ p: 2 }}>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 800, letterSpacing: 0.3, mb: 1 }}
              >
                프로필 이미지
              </Typography>
              <Divider />
              <Grid container spacing={2} sx={{ mt: 0 }}>
                <Grid item xs={12} sm={4}>
                  <Box
                    sx={{
                      width: "100%",
                      aspectRatio: "1 / 1",
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor: "divider",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                      bgcolor: "grey.50",
                    }}
                  >
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="preview"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        미리보기 없음
                      </Typography>
                    )}
                  </Box>
                </Grid>
                <Grid item xs={12} sm={8}>
                  <Stack spacing={1.5}>
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                      이미지는 선택 사항입니다. (저장 시 함께 업로드됩니다.)
                    </Typography>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                      <Button variant="outlined" component="label">
                        이미지 선택
                        <input
                          type="file"
                          hidden
                          onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
                        />
                      </Button>
                      <Button
                        variant="text"
                        color="inherit"
                        onClick={() => handleFileChange(null)}
                        disabled={!form.profileImageFile}
                      >
                        선택 해제
                      </Button>
                    </Stack>
                    {form.profileImageFile && (
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>
                        선택된 파일: {form.profileImageFile.name}
                      </Typography>
                    )}
                  </Stack>
                </Grid>
              </Grid>
            </Box>
          </Paper>
          <Paper variant="outlined" sx={{ borderRadius: 2 }}>
            <Box sx={{ p: 2 }}>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 800, letterSpacing: 0.3, mb: 1 }}
              >
                기본 정보
              </Typography>
              <Divider />
              <Grid container spacing={2} sx={{ mt: 0 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="직원 ID"
                    fullWidth
                    required
                    value={form.staffId}
                    onChange={(e) => handleChange("staffId", e.target.value)}
                    disabled={isEditing}
                    helperText={isEditing ? "직원 ID는 변경할 수 없습니다." : idCheckMessage ?? ""}
                    FormHelperTextProps={{
                      sx:
                        isEditing || idAvailable === null
                          ? undefined
                          : { color: idAvailable ? "success.main" : "error.main" },
                    }}
                    InputProps={{
                      endAdornment: !isEditing ? (
                        <IconButton
                          size="small"
                          aria-label="아이디 중복 확인"
                          disabled={checkingId || !form.staffId.trim()}
                          onClick={handleCheckId}
                        >
                          <CheckCircleOutline fontSize="small" />
                        </IconButton>
                      ) : undefined,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="이름"
                    fullWidth
                    required
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="연락처"
                    fullWidth
                    value={form.phone || ""}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, "").slice(0, 20);
                      handleChange("phone", digits);
                    }}
                    inputProps={{ inputMode: "numeric" }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    label="재직 상태"
                    fullWidth
                    value={form.status || "ACTIVE"}
                    onChange={(e) => handleChange("status", e.target.value)}
                  >
                    <MenuItem value="ACTIVE">재직중</MenuItem>
                    <MenuItem value="ON_LEAVE">휴직</MenuItem>
                    <MenuItem value="INACTIVE">비활성</MenuItem>
                    <MenuItem value="RESIGNED">퇴사</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
            </Box>
          </Paper>

          <Paper variant="outlined" sx={{ borderRadius: 2 }}>
            <Box sx={{ p: 2 }}>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 800, letterSpacing: 0.3, mb: 1 }}
              >
                소속 정보
              </Typography>
              <Divider />
              <Grid container spacing={2} sx={{ mt: 0 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    label="부서"
                    fullWidth
                    value={form.departmentId ?? ""}
                    onChange={(e) =>
                      handleChange(
                        "departmentId",
                        e.target.value === "" ? null : Number(e.target.value)
                      )
                    }
                  >
                    <MenuItem value="">선택 안함</MenuItem>
                    {departments.map((dept) => (
                      <MenuItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    label="직책"
                    fullWidth
                    value={form.positionId ?? ""}
                    onChange={(e) =>
                      handleChange(
                        "positionId",
                        e.target.value === "" ? null : Number(e.target.value)
                      )
                    }
                  >
                    <MenuItem value="">선택 안함</MenuItem>
                    {positions.map((pos) => (
                      <MenuItem key={pos.id} value={pos.id}>
                        {pos.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>취소</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!isEditing && (idAvailable !== true || checkedStaffId !== form.staffId.trim())}
        >
          저장
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MedicalStaffFormModal;
