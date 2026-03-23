"use client";

import * as React from "react";
import { Box, Button, TextField, Typography, InputAdornment } from "@mui/material";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import type { Patient } from "@/features/patients/patientTypes";

type Props = {
  query: string;
  onQueryChange: (v: string) => void;
  creatingClinical: boolean;
  selectedPatient: Patient | null;
  onStartNewClinical: () => void;
};

export function ClinicalToolbar({
  query,
  onQueryChange,
  creatingClinical,
  selectedPatient,
  onStartNewClinical,
}: Props) {
  return (
    <Box
      sx={{
        px: 2,
        py: 1.5,
        display: "flex",
        alignItems: "center",
        gap: 2,
        borderBottom: "1px solid var(--line)",
        bgcolor: "rgba(255,255,255,0.9)",
      }}
    >
      <Typography sx={{ fontWeight: 800, fontSize: 18 }}>오늘의 현황 - 진료실</Typography>
      <TextField
        size="small"
        placeholder="환자검색 (이름/환자등록번호/생년월일/휴대폰번호)"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchOutlinedIcon sx={{ color: "var(--muted)" }} />
            </InputAdornment>
          ),
        }}
        sx={{ flex: 1, maxWidth: 420, "& .MuiOutlinedInput-root": { bgcolor: "#fff" } }}
      />
      <Button
        size="small"
        variant="outlined"
        startIcon={<DescriptionOutlinedIcon />}
        onClick={() => window.alert("차트 화면 이동 예정")}
      >
        차트
      </Button>
      <Button
        variant="contained"
        sx={{ bgcolor: "var(--brand)" }}
        disabled={creatingClinical || !selectedPatient}
        onClick={() => void onStartNewClinical()}
      >
        {creatingClinical ? "등록 중…" : "신규 진료 시작"}
      </Button>
    </Box>
  );
}
