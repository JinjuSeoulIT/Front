"use client";

import { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  FormControlLabel,
  Checkbox,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import { createOrder } from "@/lib/clinicalApi";

const ORDER_SETS = [
  "코로나19 검사 역환급",
  "RAT 검사(음성)",
  "RAT 검사료(양성)",
  "01 진료세트",
  "02 비급여 세트",
  "03 금정",
  "04 검사 세트",
  "05 기본세트",
];

function toItemCode(label: string): string {
  return "SET_" + label.replace(/\s+/g, "_").slice(0, 20);
}

type OrderSetPanelProps = {
  patientId?: string | null;
  clinicalId?: number | null;
};

export default function OrderSetPanel({ patientId, clinicalId }: OrderSetPanelProps) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });

  const handleToggle = (label: string) => {
    setChecked((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const handleMore = () => {};

  const handleOrderRegister = async () => {
    if (clinicalId == null) {
      setSnack({ open: true, message: "진료를 선택한 후 오더를 등록할 수 있습니다.", severity: "error" });
      return;
    }
    const selected = ORDER_SETS.filter((label) => checked[label]);
    if (selected.length === 0) {
      setSnack({ open: true, message: "오더 세트를 1개 이상 선택해 주세요.", severity: "error" });
      return;
    }
    setLoading(true);
    try {
      await createOrder(clinicalId, {
        orderType: "EXAM",
        items: selected.map((label) => ({
          itemCode: toItemCode(label),
          itemName: label,
        })),
      });
      setSnack({ open: true, message: "검사 오더가 등록되었습니다.", severity: "success" });
      setChecked({});
    } catch (e) {
      setSnack({
        open: true,
        message: e instanceof Error ? e.message : "검사 오더 등록에 실패했습니다.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

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
          오더세트
        </Typography>
        <TextField
          size="small"
          fullWidth
          placeholder="검색"
          sx={{
            mt: 1,
            "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: "var(--panel-soft)", fontSize: 13 },
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
      <Box sx={{ flex: 1, overflow: "auto", px: 1.5, py: 0.5 }}>
        {ORDER_SETS.map((label) => (
          <FormControlLabel
            key={label}
            control={
              <Checkbox
                size="small"
                checked={!!checked[label]}
                onChange={() => handleToggle(label)}
                disabled={!patientId}
              />
            }
            label={
              <Typography fontSize={13} fontWeight={600}>
                {label}
              </Typography>
            }
            sx={{ display: "flex", mb: 0.25 }}
          />
        ))}
      </Box>
      <Box sx={{ p: 1.5, borderTop: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 1 }}>
        <Button
          fullWidth
          size="small"
          variant="contained"
          sx={{ textTransform: "none", fontWeight: 700, bgcolor: "var(--brand)" }}
          onClick={handleOrderRegister}
          disabled={loading || !clinicalId}
        >
          오더 등록
        </Button>
        <Button fullWidth size="small" sx={{ textTransform: "none", fontWeight: 700 }} onClick={handleMore}>
          더보기
        </Button>
      </Box>
      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snack.severity} onClose={() => setSnack((p) => ({ ...p, open: false }))}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
