"use client";

import { Box, Typography, List, ListItemButton, Chip } from "@mui/material";
import type { ChartPatient } from "./chartTypes";

const ROOMS: { room: string; patients: { id: string; name: string; gender: string; age: number; type?: string; tag?: string; birthDate?: string; vip?: boolean }[] }[] = [
  {
    room: "진료실01",
    patients: [
      { id: "1", name: "이은솔", gender: "여", age: 31 },
      { id: "2", name: "김메디", gender: "남", age: 23, type: "일반진료", tag: "우선대기", birthDate: "1999-09-09", vip: true },
    ],
  },
  {
    room: "진료실02",
    patients: [{ id: "3", name: "김진욱", gender: "여", age: 35, type: "일반진료" }],
  },
  {
    room: "방사선실",
    patients: [{ id: "4", name: "천지혜", gender: "여", age: 37, type: "검사" }],
  },
  {
    room: "수납실",
    patients: [{ id: "5", name: "손예진", gender: "여", age: 16, type: "검사" }],
  },
  {
    room: "체형교정실",
    patients: [{ id: "6", name: "김남길", gender: "남", age: 31, type: "레이저치료" }],
  },
];

function toChartPatient(p: { id: string; name: string; gender: string; age: number; birthDate?: string; vip?: boolean }): ChartPatient {
  return {
    patientId: p.id,
    name: p.name,
    gender: p.gender,
    age: p.age,
    birthDate: p.birthDate,
    vip: p.vip,
  };
}

type PatientListPanelProps = {
  selectedPatient?: ChartPatient | null;
  onSelectPatient?: (patient: ChartPatient) => void;
};

export default function PatientListPanel({ selectedPatient, onSelectPatient }: PatientListPanelProps) {
  const selectedId = selectedPatient?.patientId ?? null;

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "var(--panel)",
        borderRadius: 2,
        border: "1px solid var(--line)",
        overflow: "hidden",
      }}
    >
      <Box sx={{ p: 1.5, borderBottom: "1px solid var(--line)" }}>
        <Typography fontWeight={800} fontSize={15}>
          환자리스트
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          대기 6 예약 0 방문 2
        </Typography>
      </Box>
      <List disablePadding sx={{ flex: 1, overflow: "auto", py: 0.5 }}>
        {ROOMS.map(({ room, patients }) => (
          <Box key={room} sx={{ mb: 1 }}>
            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ px: 1.5, display: "block", py: 0.5 }}>
              {room}
            </Typography>
            {patients.map((p) => (
              <ListItemButton
                key={p.id}
                selected={selectedId === p.id}
                onClick={() => onSelectPatient?.(toChartPatient(p))}
                sx={{
                  borderRadius: 1,
                  mx: 1,
                  py: 1,
                  "&.Mui-selected": {
                    bgcolor: "rgba(11, 91, 143, 0.12)",
                    borderLeft: "3px solid var(--brand)",
                  },
                }}
              >
                <Box sx={{ width: "100%" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexWrap: "wrap" }}>
                    <Typography fontWeight={700} fontSize={14}>
                      {p.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {p.gender} {p.age}세
                    </Typography>
                    {p.type && (
                      <Chip label={p.type} size="small" sx={{ height: 20, fontSize: 11, fontWeight: 600 }} />
                    )}
                    {p.tag && (
                      <Chip label={p.tag} size="small" color="primary" sx={{ height: 20, fontSize: 11 }} />
                    )}
                  </Box>
                </Box>
              </ListItemButton>
            ))}
          </Box>
        ))}
      </List>
    </Box>
  );
}
