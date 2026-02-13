"use client";

import * as React from "react";
import {
  Button,
  Divider,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import type {
  DepartmentOption,
  DoctorOption,
  PatientOption,
  ReservationForm as ReservationFormPayload,
} from "@/features/Reservations/ReservationTypes";
import { fetchPatientsApi } from "@/lib/masterDataApi";

type ReservationFormState = {
  reservationNo: string;
  patientId: string;
  patientName: string;
  departmentId: string;
  departmentName: string;
  doctorId: string;
  doctorName: string;
  reservedAt: string;
  status: string;
  note: string;
};

type ReservationFormProps = {
  title: string;
  initial: ReservationFormState;
  loading: boolean;
  error?: string | null;
  submitLabel: string;
  onSubmit: (form: ReservationFormPayload) => void;
  onCancel: () => void;
};

const statusOptions = [
  { value: "RESERVED", label: "예약" },
  { value: "COMPLETED", label: "완료" },
  { value: "CANCELED", label: "취소" },
];

const departmentOptions: DepartmentOption[] = [
  { departmentId: 1, departmentName: "내과" },
  { departmentId: 2, departmentName: "외과" },
  { departmentId: 3, departmentName: "정형외과" },
  { departmentId: 4, departmentName: "신경외과" },
];

const doctorOptions: DoctorOption[] = [
  { doctorId: 1, doctorName: "송태민", departmentId: 1 },
  { doctorId: 2, doctorName: "이현석", departmentId: 2 },
  { doctorId: 3, doctorName: "성숙희", departmentId: 3 },
  { doctorId: 4, doctorName: "최효정", departmentId: 4 },
];

function toOptionalNumber(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parsed = Number(trimmed);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function toOptionalString(value: string) {
  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
}

export default function ReservationForm({
  title,
  initial,
  loading,
  error,
  submitLabel,
  onSubmit,
  onCancel,
}: ReservationFormProps) {
  const [form, setForm] = React.useState<ReservationFormState>(initial);
  const [patients, setPatients] = React.useState<PatientOption[]>([]);
  const [listError, setListError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setForm(initial);
  }, [initial]);

  React.useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setListError(null);
        const [patientList] = await Promise.all([fetchPatientsApi()]);
        if (!mounted) return;
        setPatients(patientList);
      } catch (err) {
        if (!mounted) return;
        const message =
          err instanceof Error ? err.message : "목록을 불러오지 못했습니다.";
        setListError(message);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const matchPatientId = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return "";
    const found = patients.find((p) => p.patientName === trimmed);
    return found ? String(found.patientId) : "";
  };

  const getDoctorsByDepartment = (departmentId: string) => {
    const deptId = Number(departmentId);
    if (Number.isNaN(deptId)) return doctorOptions;
    return doctorOptions.filter((d) => (d.departmentId ?? null) === deptId);
  };

  const handleDepartmentChange = (value: string) => {
    const selected = departmentOptions.find((d) => String(d.departmentId) === value);
    const candidates = getDoctorsByDepartment(value);
    const autoDoctor = candidates[0];
    setForm((prev) => {
      const next = {
        ...prev,
        departmentId: value,
        departmentName: selected?.departmentName ?? "",
      };
      if (autoDoctor) {
        next.doctorId = String(autoDoctor.doctorId);
        next.doctorName = autoDoctor.doctorName ?? "";
      } else {
        next.doctorId = "";
        next.doctorName = "";
      }
      return next;
    });
  };

  const handleDoctorChange = (value: string) => {
    const selected = doctorOptions.find((d) => String(d.doctorId) === value);
    const dept = departmentOptions.find(
      (d) => String(d.departmentId) === String(selected?.departmentId ?? "")
    );
    setForm((prev) => ({
      ...prev,
      doctorId: value,
      doctorName: selected?.doctorName ?? "",
      departmentId: selected?.departmentId ? String(selected.departmentId) : prev.departmentId,
      departmentName: dept?.departmentName ?? prev.departmentName,
    }));
  };

  const handleSubmit = () => {
    if (!form.reservationNo.trim()) return;
    const patientId = toOptionalNumber(form.patientId);
    const departmentId = toOptionalNumber(form.departmentId);

    if (!form.patientName.trim() || !departmentId) return;

    const doctorId = toOptionalNumber(form.doctorId);

    onSubmit({
      reservationNo: form.reservationNo.trim(),
      patientId,
      patientName: toOptionalString(form.patientName) ?? null,
      departmentId,
      departmentName: toOptionalString(form.departmentName) ?? null,
      doctorId: doctorId ?? null,
      doctorName: toOptionalString(form.doctorName) ?? null,
      reservedAt: form.reservedAt,
      status: (form.status || "RESERVED") as any,
      note: toOptionalString(form.note) ?? null,
    });
  };

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
          <Typography variant="h6" fontWeight={800}>
            {title}
          </Typography>
          <Typography color="text.secondary" fontWeight={600}>
            예약 기본 정보를 입력해 주세요.
          </Typography>
        </Stack>
        <Divider />

        <Stack spacing={2}>
          <TextField
            label="예약번호"
            value={form.reservationNo}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, reservationNo: e.target.value }))
            }
            required
            fullWidth
            sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }}
          />
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <TextField
              label="환자 이름"
              value={form.patientName}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  patientName: e.target.value,
                  patientId: matchPatientId(e.target.value),
                }))
              }
              required
              fullWidth
              sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }}
            />
            <TextField
              select
              label="진료과"
              value={form.departmentId}
              onChange={(e) => handleDepartmentChange(e.target.value)}
              required
              fullWidth
              sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }}
            >
              {departmentOptions.map((d) => (
                <MenuItem key={d.departmentId} value={String(d.departmentId)}>
                  {d.departmentName}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <TextField
              select
              label="의사 이름"
              value={form.doctorId}
              onChange={(e) => handleDoctorChange(e.target.value)}
              fullWidth
              sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }}
            >
              {getDoctorsByDepartment(form.departmentId).map((d) => (
                <MenuItem key={d.doctorId} value={String(d.doctorId)}>
                  {d.doctorName}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              type="datetime-local"
              label="예약 시간"
              InputLabelProps={{ shrink: true }}
              value={form.reservedAt}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, reservedAt: e.target.value }))
              }
              fullWidth
              sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }}
            />
          </Stack>
          <TextField
            select
            label="상태"
            value={form.status}
            onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
            fullWidth
            sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }}
          >
            {statusOptions.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="메모"
            value={form.note}
            onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))}
            fullWidth
            multiline
            minRows={3}
            sx={{ "& .MuiInputBase-root": { bgcolor: "#f4f7fd" } }}
          />
        </Stack>

        {listError && (
          <Typography color="error" fontWeight={800}>
            {listError}
          </Typography>
        )}

        {error && (
          <Typography color="error" fontWeight={800}>
            {error}
          </Typography>
        )}

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
          <Button variant="outlined" onClick={onCancel} disabled={loading}>
            취소
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={
              loading ||
              !form.reservationNo.trim() ||
              !form.patientName.trim() ||
              !form.departmentId.trim() ||
              !form.reservedAt.trim()
            }
            sx={{ bgcolor: "#2b5aa9" }}
          >
            {submitLabel}
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}

