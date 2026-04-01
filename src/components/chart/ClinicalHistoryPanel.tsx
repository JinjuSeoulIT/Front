"use client";

import { Box, Typography, Button, TextField, Chip } from "@mui/material";

const CLINICALS = [
  {
    date: "2022-09-30 10:16",
    doctor: "이은솔",
    tags: ["x-ray2", "x-ray"],
    section: "진료기록",
    diagnosisPlaceholder: "주상병을 입력해주세요.",
  },
  {
    date: "2022-09-28 (2일전)",
    doctor: "이은솔",
    tags: ["일반진료", "건강보험"],
    chiefComplaint: "무릎통증으로 내원",
    treatment: "재진진료-의료, 보건의료원 내과",
  },
  {
    date: "2022-09-28 (2일전)",
    doctor: "이은솔",
    tags: ["일반진료", "건강보험"],
    chiefComplaint: "무릎통증으로 내원",
    detail: "걸을때마다 소리남",
    diagnosis: ["상세불명의 연소성 관절염, 무릎관절", "관절통, 여러 부위"],
    prescriptions: [
      { name: "테놀정500밀리그램_ID...", qty: "111" },
      { name: "에포스정(에페리손염산염)(50mg)", qty: "223" },
      { name: "에스프정20mg(에스오메프라마그네", qty: "113" },
    ],
  },
];

type ClinicalHistoryPanelProps = {
  patientId?: string | null;
};

export default function ClinicalHistoryPanel({ patientId }: ClinicalHistoryPanelProps) {
  const handleRoom = () => {};
  const handleReception = () => {};

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
          진료 이력
        </Typography>
      </Box>
      <Box sx={{ flex: 1, overflow: "auto", p: 1.5 }}>
        {!patientId ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
            환자를 선택하면 진료 이력이 표시됩니다
          </Typography>
        ) : (
        CLINICALS.map((v, i) => (
          <Box
            key={i}
            sx={{
              mb: 2,
              p: 1.5,
              borderRadius: 2,
              border: "1px solid var(--line)",
              bgcolor: "var(--panel-soft)",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexWrap: "wrap", mb: 1 }}>
              <Typography variant="caption" fontWeight={700} color="text.secondary">
                {v.date}
              </Typography>
              <Typography variant="caption" fontWeight={600}>
                {v.doctor}
              </Typography>
            </Box>
            {v.tags?.map((tag) => (
              <Chip key={tag} label={tag} size="small" sx={{ mr: 0.5, mb: 0.5, height: 22 }} />
            ))}
            {v.section && (
              <Typography variant="caption" display="block" fontWeight={700} sx={{ mt: 1 }}>
                {v.section}
              </Typography>
            )}
            {v.diagnosisPlaceholder && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="caption" fontWeight={700} display="block" sx={{ mb: 0.5 }}>
                  진단 및 처방
                </Typography>
                <TextField
                  size="small"
                  fullWidth
                  placeholder={v.diagnosisPlaceholder}
                  sx={{ "& .MuiInputBase-root": { fontSize: 13 } }}
                />
              </Box>
            )}
            {v.chiefComplaint && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                {v.chiefComplaint}
                {v.detail && `, ${v.detail}`}
              </Typography>
            )}
            {v.treatment && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {v.treatment}
              </Typography>
            )}
            {v.diagnosis?.map((d, j) => (
              <Typography key={j} variant="body2" sx={{ mt: 0.5 }}>
                {d}
              </Typography>
            ))}
            {v.prescriptions?.map((pr, j) => (
              <Box key={j} sx={{ display: "flex", justifyContent: "space-between", mt: 0.5 }}>
                <Typography variant="body2">{pr.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {pr.qty}
                </Typography>
              </Box>
            ))}
          </Box>
        ))
        )}
      </Box>
      <Box sx={{ p: 1.5, borderTop: "1px solid var(--line)", display: "flex", gap: 1 }}>
        <Button variant="contained" size="small" sx={{ bgcolor: "var(--brand)", textTransform: "none", fontWeight: 700 }} onClick={handleRoom}>
          진료실01
        </Button>
        <Button variant="outlined" size="small" sx={{ textTransform: "none", fontWeight: 700 }} onClick={handleReception}>
          재접수 생성
        </Button>
      </Box>
    </Box>
  );
}
