"use client";

import { useRouter } from "next/navigation";
import { Box, Typography, Chip } from "@mui/material";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import type { ChartPatient } from "./chartTypes";

type ChartPatientBarProps = {
  selectedPatient?: ChartPatient | null;
};

export default function ChartPatientBar({ selectedPatient }: ChartPatientBarProps) {
  const router = useRouter();

  const handleBarClick = () => {
    if (selectedPatient?.patientId) {
      router.push(`/patients/${selectedPatient.patientId}`);
    }
  };

  return (
    <Box
      onClick={handleBarClick}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        py: 1.25,
        px: 2,
        bgcolor: "rgba(15, 32, 48, 0.06)",
        borderBottom: "1px solid var(--line)",
        flexWrap: "wrap",
        cursor: selectedPatient ? "pointer" : "default",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <PersonOutlineOutlinedIcon sx={{ color: "var(--muted)" }} />
        {selectedPatient ? (
          <>
            <Typography component="span" fontWeight={700} fontSize={14}>
              {selectedPatient.patientId} {selectedPatient.name}{" "}
              {selectedPatient.gender ?? ""}, {selectedPatient.age ?? ""}세
              {selectedPatient.birthDate ? ` (${selectedPatient.birthDate})` : ""}
            </Typography>
            {selectedPatient.vip && (
              <Chip
                label="#VIP"
                size="small"
                sx={{ fontWeight: 700, bgcolor: "var(--brand-soft)", color: "var(--brand-strong)" }}
              />
            )}
          </>
        ) : (
          <Typography component="span" color="text.secondary" fontSize={14}>
            환자를 선택하세요
          </Typography>
        )}
      </Box>
      {selectedPatient && (selectedPatient.temp ?? selectedPatient.weight ?? selectedPatient.height) && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Typography variant="body2" color="text.secondary">
            제온 {selectedPatient.temp ?? "-"} 체중 {selectedPatient.weight ?? "-"} 산장 {selectedPatient.height ?? "-"}
          </Typography>
        </Box>
      )}
    </Box>
  );
}
