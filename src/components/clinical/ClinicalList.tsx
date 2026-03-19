"use client";

import * as React from "react";
import {
  Box,
  Chip,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Pagination,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import type { Patient } from "@/features/patients/patientTypes";
import type { ClinicalRes } from "./types";
import type { ClinicalTab } from "./types";
import { clinicalStatusView, resolveClinicalStatus } from "./clinicalDocumentation";

type Props = {
  department: string;
  onDepartmentChange: (v: string) => void;
  query: string;
  onQueryChange: (v: string) => void;
  tab: ClinicalTab;
  onTabChange: (t: ClinicalTab) => void;
  paginatedLeftList: Patient[];
  listForLeft: Patient[];
  leftPage: number;
  totalLeftPages: number;
  onLeftPageChange: (page: number) => void;
  clinicalByPatientId: Map<number, ClinicalRes>;
  selectedPatient: Patient | null;
  onSelectPatient: (patientId: number) => void;
};

export function ClinicalPatientList({
  department,
  onDepartmentChange,
  query,
  onQueryChange,
  tab,
  onTabChange,
  paginatedLeftList,
  listForLeft,
  leftPage,
  totalLeftPages,
  onLeftPageChange,
  clinicalByPatientId,
  selectedPatient,
  onSelectPatient,
}: Props) {
  return (
    <Box
      sx={{
        borderRight: "1px solid var(--line)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Box sx={{ p: 1.5, borderBottom: "1px solid var(--line)" }}>
        <FormControl size="small" fullWidth>
          <InputLabel>진료실</InputLabel>
          <Select value={department} label="진료실" onChange={(e) => onDepartmentChange(e.target.value)}>
            <MenuItem value="내과1">내과1</MenuItem>
            <MenuItem value="내과2">내과2</MenuItem>
            <MenuItem value="외과">외과</MenuItem>
          </Select>
        </FormControl>
        <TextField
          size="small"
          fullWidth
          placeholder="환자검색 (F5)"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchOutlinedIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{ mt: 1, "& .MuiOutlinedInput-root": { bgcolor: "#fff" } }}
        />
      </Box>
      <Typography sx={{ px: 1.5, py: 1, fontWeight: 700, fontSize: 13 }}>
        진료 대기/완료 환자목록
      </Typography>
      <Tabs
        value={tab}
        onChange={(_, v) => onTabChange(v as ClinicalTab)}
        sx={{ minHeight: 40, "& .MuiTab-root": { minHeight: 40 } }}
      >
        <Tab label="대기" value="WAIT" />
        <Tab label="완료" value="ALL" />
      </Tabs>
      <Stack spacing={0.5} sx={{ flex: 1, overflow: "auto", p: 1 }}>
        {paginatedLeftList.map((p) => {
          const status = clinicalStatusView(resolveClinicalStatus(clinicalByPatientId.get(p.patientId)));
          return (
            <Box
              key={`${p.patientId}-${p.patientNo ?? ""}`}
              onClick={() => onSelectPatient(p.patientId)}
              sx={{
                p: 1.25,
                borderRadius: 1.5,
                border: "1px solid var(--line)",
                bgcolor: selectedPatient?.patientId === p.patientId ? "rgba(11, 91, 143, 0.12)" : "#fff",
                cursor: "pointer",
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography fontWeight={700} sx={{ fontSize: 14 }}>
                  {p.name}
                </Typography>
                <Chip label={status.label} color={status.color} size="small" sx={{ height: 22 }} />
              </Stack>
              <Typography sx={{ fontSize: 12, color: "var(--muted)", mt: 0.25 }}>
                {p.patientNo ?? p.patientId} · {department}
              </Typography>
            </Box>
          );
        })}
        {!listForLeft.length && (
          <Typography color="text.secondary" sx={{ fontSize: 13 }}>
            대기 환자가 없습니다.
          </Typography>
        )}
      </Stack>
      <Stack sx={{ p: 1, borderTop: "1px solid var(--line)" }}>
        <Pagination
          page={leftPage}
          count={totalLeftPages}
          size="small"
          color="primary"
          disabled={listForLeft.length === 0}
          onChange={(_, page) => onLeftPageChange(page)}
        />
      </Stack>
    </Box>
  );
}
