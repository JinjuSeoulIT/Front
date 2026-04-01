"use client";

import { useRouter } from "next/navigation";
import { Box, TextField, InputAdornment, Button, Typography } from "@mui/material";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";
import LocalHospitalOutlinedIcon from "@mui/icons-material/LocalHospitalOutlined";

export default function ChartHeader() {
  const router = useRouter();

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        py: 1.5,
        px: 2,
        borderBottom: "1px solid var(--line)",
        bgcolor: "rgba(255,255,255,0.9)",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <LocalHospitalOutlinedIcon sx={{ color: "var(--brand)" }} />
        <Typography fontWeight={800} fontSize={18}>
          테스트 의원
        </Typography>
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography
          component="span"
          sx={{
            px: 2,
            py: 1,
            borderRadius: 2,
            bgcolor: "rgba(11, 91, 143, 0.14)",
            color: "var(--brand-strong)",
            fontWeight: 800,
            fontSize: 14,
          }}
        >
          차트
        </Typography>
        <TextField
          size="small"
          placeholder="검색"
          sx={{
            width: 220,
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              bgcolor: "var(--panel)",
              fontSize: 14,
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchOutlinedIcon fontSize="small" sx={{ color: "var(--muted)" }} />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      <Box sx={{ flex: 1 }} />
      <Button
        variant="contained"
        startIcon={<PersonAddOutlinedIcon />}
        onClick={() => router.push("/patients/new")}
        sx={{
          bgcolor: "var(--brand)",
          borderRadius: 2,
          textTransform: "none",
          fontWeight: 700,
          px: 2,
        }}
      >
        신규환자
      </Button>
    </Box>
  );
}
