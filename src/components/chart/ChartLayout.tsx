"use client";

import { Box } from "@mui/material";
import ChartSidebar from "./ChartSidebar";
import ChartHeader from "./ChartHeader";
import ChartPatientBar from "./ChartPatientBar";
import type { ChartPatient } from "./chartTypes";

const SIDEBAR_W = 220;

export default function ChartLayout({
  children,
  showSidebar = false,
  selectedPatient = null,
}: {
  children: React.ReactNode;
  showSidebar?: boolean;
  selectedPatient?: ChartPatient | null;
}) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "var(--bg)",
      }}
    >
      <Box sx={{ display: "flex", flex: 1, minHeight: 0 }}>
        {showSidebar && <ChartSidebar width={SIDEBAR_W} />}
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          <ChartHeader />
          <ChartPatientBar selectedPatient={selectedPatient} />
          <Box sx={{ flex: 1, minHeight: 0, overflow: "auto", p: 1.5 }}>
            {children}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
