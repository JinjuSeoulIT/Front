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
import type { ClinicalRes } from "./types";
import type { ClinicalTab } from "./types";
import type { ReceptionQueueItem } from "./visitApi";
import { clinicalStatusView, resolveClinicalStatus } from "./clinicalDocumentation";
import { formatDepartmentName } from "@/lib/departmentLabel";

function receptionStatusLabel(status?: string | null): string {
  switch (status?.toUpperCase?.()) {
    case "WAITING":
    case "CALLED":
      return "대기";
    case "IN_PROGRESS":
      return "진료중";
    case "COMPLETED":
    case "DONE":
      return "완료";
    case "PAYMENT_WAIT":
      return "수납대기";
    case "CANCELLED":
    case "CANCELED":
      return "취소";
    case "INACTIVE":
      return "비활성";
    default:
      return status?.trim() ? status : "미분류";
  }
}

function receptionStatusColor(
  status?: string | null
): "default" | "primary" | "success" | "warning" | "error" {
  const s = status?.toUpperCase?.();
  if (s === "WAITING" || s === "CALLED") return "warning";
  if (s === "IN_PROGRESS") return "success";
  if (s === "COMPLETED" || s === "DONE") return "default";
  return "default";
}

type Props = {
  department: string;
  onDepartmentChange: (v: string) => void;
  query: string;
  onQueryChange: (v: string) => void;
  tab: ClinicalTab;
  onTabChange: (t: ClinicalTab) => void;
  paginatedLeftList: ReceptionQueueItem[];
  listForLeft: ReceptionQueueItem[];
  leftPage: number;
  totalLeftPages: number;
  onLeftPageChange: (page: number) => void;
  clinicalByPatientId: Map<number, ClinicalRes>;
  selectedReception: ReceptionQueueItem | null;
  onSelectReception: (r: ReceptionQueueItem) => void;
  receptionLoading?: boolean;
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
  selectedReception,
  onSelectReception,
  receptionLoading = false,
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
        {receptionLoading && (
          <Typography color="text.secondary" sx={{ fontSize: 13 }}>
            접수 목록 불러오는 중…
          </Typography>
        )}
        {!receptionLoading && paginatedLeftList.map((r) => {
          const isSelected = selectedReception?.receptionId === r.receptionId;
          const displayName =
            r.patientName?.trim() || `환자 ${r.patientId ?? "-"}`;
          const statusLabelText = receptionStatusLabel(r.status);
          const statusColor = receptionStatusColor(r.status);
          return (
            <Box
              key={r.receptionId}
              onClick={() => onSelectReception(r)}
              sx={{
                p: 1.25,
                borderRadius: 1.5,
                border: "1px solid var(--line)",
                bgcolor: isSelected ? "rgba(11, 91, 143, 0.12)" : "#fff",
                cursor: "pointer",
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography fontWeight={700} sx={{ fontSize: 14 }}>
                  {displayName}
                </Typography>
                <Chip
                  label={statusLabelText}
                  color={statusColor}
                  size="small"
                  sx={{ height: 22 }}
                />
              </Stack>
              <Typography sx={{ fontSize: 12, color: "var(--muted)", mt: 0.25 }}>
                {r.receptionNo ?? r.receptionId} · {formatDepartmentName(r.departmentName, r.departmentId) || department}
              </Typography>
            </Box>
          );
        })}
        {!receptionLoading && !listForLeft.length && (
          <Typography color="text.secondary" sx={{ fontSize: 13 }}>
            조회된 접수가 없습니다.
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
