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
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

export type PositionFormValues = {
  id?: number;
  name: string;
  code?: string;
  rankLevel?: number | null;
  description?: string;
  status?: string;
};

type PositionFormModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: PositionFormValues) => void;
  initialValues?: PositionFormValues | null;
  title?: string;
};

const defaultValues: PositionFormValues = {
  name: "",
  code: "",
  rankLevel: null,
  description: "",
  status: "ACTIVE",
};

function statusChip(status?: string) {
  if (status === "INACTIVE") {
    return <Chip label="비활성" color="default" variant="outlined" size="small" />;
  }
  return <Chip label="활성" color="success" variant="filled" size="small" />;
}

const PositionFormModal: React.FC<PositionFormModalProps> = ({
  open,
  onClose,
  onSubmit,
  initialValues,
  title = "직책 등록",
}) => {
  const [form, setForm] = useState<PositionFormValues>(defaultValues);

  useEffect(() => {
    if (initialValues) {
      setForm({ ...defaultValues, ...initialValues });
      return;
    }
    setForm(defaultValues);
  }, [initialValues, open]);

  const isEditing = Boolean(form.id);
  const headerSubtitle = useMemo(() => {
    return isEditing
      ? "기존 직책 정보를 수정합니다."
      : "새 직책을 등록합니다.";
  }, [isEditing]);

  const handleChange = (
    field: keyof PositionFormValues,
    value: PositionFormValues[keyof PositionFormValues]
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    onSubmit({
      ...form,
      name: form.name.trim(),
      code: (form.code ?? "").trim(),
      description: (form.description ?? "").trim(),
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ pb: 1.5 }}>
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            background:
              "linear-gradient(135deg, rgba(244,67,54,0.08), rgba(25,118,210,0.06))",
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
            {statusChip(form.status)}
          </Stack>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 0 }}>
        <Stack spacing={2}>
          <Paper variant="outlined" sx={{ borderRadius: 2 }}>
            <Box sx={{ p: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, letterSpacing: 0.3, mb: 1 }}>
                기본 정보
              </Typography>
              <Divider />
              <Grid container spacing={2} sx={{ mt: 0 }}>
                <Grid item xs={12}>
                  <TextField
                    label="직책명"
                    fullWidth
                    required
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="설명"
                    fullWidth
                    multiline
                    minRows={2}
                    value={form.description || ""}
                    onChange={(e) => handleChange("description", e.target.value)}
                  />
                </Grid>
              </Grid>
            </Box>
          </Paper>

          <Paper variant="outlined" sx={{ borderRadius: 2 }}>
            <Box sx={{ p: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, letterSpacing: 0.3, mb: 1 }}>
                상태
              </Typography>
              <Divider />
              <Box sx={{ mt: 2, maxWidth: 240 }}>
                <TextField
                  select
                  label="활성 상태"
                  fullWidth
                  value={form.status || "ACTIVE"}
                  onChange={(e) => handleChange("status", e.target.value)}
                >
                  <MenuItem value="ACTIVE">활성</MenuItem>
                  <MenuItem value="INACTIVE">비활성</MenuItem>
                </TextField>
              </Box>
            </Box>
          </Paper>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>취소</Button>
        <Button variant="contained" onClick={handleSubmit}>
          저장
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PositionFormModal;
