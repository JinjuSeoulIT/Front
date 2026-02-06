"use client";

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

export type DepartmentFormValues = {
  id?: number;
  name: string;
  buildingNo?: string;
  floorNo?: string;
  roomNo?: string;
  headMedicalStaffId?: number | null;
  extension?: string;
  status?: string;
};

type DepartmentFormModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: DepartmentFormValues) => void;
  initialValues?: DepartmentFormValues | null;
  title?: string;
};

const defaultValues: DepartmentFormValues = {
  name: "",
  buildingNo: "",
  floorNo: "",
  roomNo: "",
  headMedicalStaffId: null,
  extension: "",
  status: "ACTIVE",
};

function statusChip(status?: string) {
  if (status === "INACTIVE") {
    return <Chip label="비활성" color="default" variant="outlined" size="small" />;
  }
  return <Chip label="활성" color="success" variant="filled" size="small" />;
}

const DepartmentFormModal: React.FC<DepartmentFormModalProps> = ({
  open,
  onClose,
  onSubmit,
  initialValues,
  title = "부서 등록",
}) => {
  const [form, setForm] = useState<DepartmentFormValues>(defaultValues);

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
      ? "기존 부서 정보를 수정합니다."
      : "새 부서를 등록합니다.";
  }, [isEditing]);

  const handleChange = (
    field: keyof DepartmentFormValues,
    value: DepartmentFormValues[keyof DepartmentFormValues]
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    onSubmit({
      ...form,
      name: form.name.trim(),
      buildingNo: (form.buildingNo ?? "").trim(),
      floorNo: (form.floorNo ?? "").trim(),
      roomNo: (form.roomNo ?? "").trim(),
      extension: (form.extension ?? "").trim(),
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
              <Box sx={{ mt: 2 }}>
                <TextField
                  label="부서명"
                  fullWidth
                  required
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                />
              </Box>
            </Box>
          </Paper>

          <Paper variant="outlined" sx={{ borderRadius: 2 }}>
            <Box sx={{ p: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, letterSpacing: 0.3, mb: 1 }}>
                위치 / 연락
              </Typography>
              <Divider />
              <Grid container spacing={2} sx={{ mt: 0 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="건물"
                    fullWidth
                    placeholder="예: 본관"
                    value={form.buildingNo || ""}
                    onChange={(e) => handleChange("buildingNo", e.target.value)}
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField
                    label="층"
                    fullWidth
                    placeholder="예: 2 / B"
                    helperText="지하는 B"
                    value={form.floorNo || ""}
                    onChange={(e) => handleChange("floorNo", e.target.value)}
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField
                    label="호실"
                    fullWidth
                    placeholder="예: 201"
                    value={form.roomNo || ""}
                    onChange={(e) => handleChange("roomNo", e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="내선번호"
                    fullWidth
                    placeholder="예: 1201"
                    value={form.extension || ""}
                    onChange={(e) => handleChange("extension", e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="부서장 의료진 ID"
                    fullWidth
                    type="number"
                    value={form.headMedicalStaffId ?? ""}
                    onChange={(e) =>
                      handleChange(
                        "headMedicalStaffId",
                        e.target.value === "" ? null : Number(e.target.value)
                      )
                    }
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

export default DepartmentFormModal;
