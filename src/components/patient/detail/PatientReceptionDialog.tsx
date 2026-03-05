"use client";

import * as React from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
} from "@mui/material";
import type { Department, ReceptionForm } from "./PatientDetailUtils";

type Props = {
  open: boolean;
  onClose: () => void;
  form: ReceptionForm;
  onFormChange: (next: ReceptionForm | ((prev: ReceptionForm) => ReceptionForm)) => void;
  departments: Department[];
  saving: boolean;
  onSave: () => void;
};

export default function PatientReceptionDialog(props: Props) {
  const { open, onClose, form, onFormChange, departments, saving, onSave } = props;

  const handleDeptChange = (nextDeptName: string) => {
    const nextDept = departments.find((d) => d.name === nextDeptName);
    onFormChange((prev) => ({
      ...prev,
      deptCode: nextDeptName,
      doctorId: nextDept ? String(nextDept.doctorId) : prev.doctorId,
    }));
  };
  const handleDoctorChange = (nextDoctorId: string) => {
    const nextDept = departments.find((d) => String(d.doctorId) === nextDoctorId);
    onFormChange((prev) => ({
      ...prev,
      doctorId: nextDoctorId,
      deptCode: nextDept?.name ?? prev.deptCode,
    }));
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 4 } }}>
      <DialogTitle>접수 등록</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            select
            label="진료과"
            value={form.deptCode}
            onChange={(e) => handleDeptChange(e.target.value)}
            fullWidth
          >
            {departments.map((dept) => (
              <MenuItem key={dept.id} value={dept.name}>
                {dept.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="담당의"
            value={form.doctorId}
            onChange={(e) => handleDoctorChange(e.target.value)}
            fullWidth
          >
            {departments.map((dept) => (
              <MenuItem key={dept.doctorId} value={String(dept.doctorId)}>
                {dept.doctor}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="내원유형"
            value={form.visitType}
            onChange={(e) => onFormChange((prev) => ({ ...prev, visitType: e.target.value }))}
            fullWidth
          >
            <MenuItem value="OUTPATIENT">외래</MenuItem>
            <MenuItem value="EMERGENCY">응급</MenuItem>
            <MenuItem value="INPATIENT">입원</MenuItem>
          </TextField>
          <TextField
            label="내원 일시(선택)"
            type="datetime-local"
            value={form.arrivedAt}
            onChange={(e) => onFormChange((prev) => ({ ...prev, arrivedAt: e.target.value }))}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
          <TextField
            label="접수 메모(선택)"
            value={form.note}
            onChange={(e) => onFormChange((prev) => ({ ...prev, note: e.target.value }))}
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>취소</Button>
        <Button variant="contained" onClick={onSave} disabled={saving}>
          저장
        </Button>
      </DialogActions>
    </Dialog>
  );
}
