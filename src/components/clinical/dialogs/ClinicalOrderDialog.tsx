"use client";

import * as React from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import {
  createClinicalOrderApi,
  type LabOrderType,
} from "@/lib/clinicalOrderApi";
import { ORDER_TYPE_LABELS } from "../clinicalDocumentation";

export type ClinicalOrderDialogVariant = "exam" | "treatment";

const EXAM_ORDER_TYPES: LabOrderType[] = [
  "BLOOD",
  "IMAGING",
  "PATHOLOGY",
  "SPECIMEN",
  "ENDOSCOPY",
  "PHYSIOLOGICAL",
];

const TREATMENT_ORDER_TYPES: LabOrderType[] = ["PROCEDURE", "MEDICATION"];

function defaultOrderType(variant: ClinicalOrderDialogVariant): LabOrderType {
  return variant === "exam" ? "IMAGING" : "PROCEDURE";
}

type Props = {
  open: boolean;
  variant: ClinicalOrderDialogVariant;
  onClose: () => void;
  visitId: number | null;
  onCreated: () => void | Promise<void>;
};

export function ClinicalOrderDialog({ open, variant, onClose, visitId, onCreated }: Props) {
  const [newOrderType, setNewOrderType] = React.useState<LabOrderType>(() => defaultOrderType(variant));
  const [newOrderName, setNewOrderName] = React.useState("");
  const [creating, setCreating] = React.useState(false);

  const allowedTypes = variant === "exam" ? EXAM_ORDER_TYPES : TREATMENT_ORDER_TYPES;
  const typeLabel = variant === "exam" ? "검사 유형" : "치료 유형";
  const title = variant === "exam" ? "검사 오더 등록" : "치료 오더 등록";
  const nameFieldLabel = variant === "exam" ? "검사 명" : "처치·약물 명";
  const namePlaceholder =
    variant === "exam" ? "예: CBC, 흉부 X-ray" : "예: 상처 드레싱, 타세틀 시럽";
  const failMessage = variant === "exam" ? "검사 오더 등록에 실패했습니다." : "치료 오더 등록에 실패했습니다.";

  React.useEffect(() => {
    if (open) {
      setNewOrderType(defaultOrderType(variant));
      setNewOrderName("");
    }
  }, [open, variant]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <FormControl fullWidth size="small">
            <InputLabel>{typeLabel}</InputLabel>
            <Select
              value={newOrderType}
              label={typeLabel}
              onChange={(e) => setNewOrderType(e.target.value as LabOrderType)}
            >
              {allowedTypes.map((t) => (
                <MenuItem key={t} value={t}>
                  {ORDER_TYPE_LABELS[t]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            size="small"
            label={nameFieldLabel}
            value={newOrderName}
            onChange={(e) => setNewOrderName(e.target.value)}
            placeholder={namePlaceholder}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>취소</Button>
        <Button
          variant="contained"
          sx={{ bgcolor: "var(--brand)" }}
          disabled={!newOrderName.trim() || creating || visitId == null}
          onClick={async () => {
            if (visitId == null || !newOrderName.trim()) return;
            setCreating(true);
            try {
              await createClinicalOrderApi(visitId, {
                orderType: newOrderType,
                orderName: newOrderName.trim(),
              });
              await onCreated();
              onClose();
              setNewOrderName("");
            } catch (err) {
              window.alert(err instanceof Error ? err.message : failMessage);
            } finally {
              setCreating(false);
            }
          }}
        >
          {creating ? "등록 중…" : "등록"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
