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

type Props = {
  open: boolean;
  onClose: () => void;
  visitId: number | null;
  onCreated: () => void | Promise<void>;
};

export function ClinicalOrderDialog({ open, onClose, visitId, onCreated }: Props) {
  const [newOrderType, setNewOrderType] = React.useState<LabOrderType>("IMAGING");
  const [newOrderName, setNewOrderName] = React.useState("");
  const [creating, setCreating] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setNewOrderType("IMAGING");
      setNewOrderName("");
    }
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>검사 오더 등록</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <FormControl fullWidth size="small">
            <InputLabel>검사 유형</InputLabel>
            <Select
              value={newOrderType}
              label="검사 유형"
              onChange={(e) => setNewOrderType(e.target.value as LabOrderType)}
            >
              <MenuItem value="IMAGING">{ORDER_TYPE_LABELS.IMAGING}</MenuItem>
              <MenuItem value="PATHOLOGY">{ORDER_TYPE_LABELS.PATHOLOGY}</MenuItem>
              <MenuItem value="SPECIMEN">{ORDER_TYPE_LABELS.SPECIMEN}</MenuItem>
              <MenuItem value="ENDOSCOPY">{ORDER_TYPE_LABELS.ENDOSCOPY}</MenuItem>
              <MenuItem value="PHYSIOLOGICAL">{ORDER_TYPE_LABELS.PHYSIOLOGICAL}</MenuItem>
              <MenuItem value="PROCEDURE">{ORDER_TYPE_LABELS.PROCEDURE}</MenuItem>
              <MenuItem value="MEDICATION">{ORDER_TYPE_LABELS.MEDICATION}</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            size="small"
            label="검사/처치 명"
            value={newOrderName}
            onChange={(e) => setNewOrderName(e.target.value)}
            placeholder="예: CBC, 흉부 X-ray, 주사"
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
              window.alert(err instanceof Error ? err.message : "검사 오더 등록에 실패했습니다.");
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
