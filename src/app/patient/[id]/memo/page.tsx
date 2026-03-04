"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import {
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";

import type { PatientMemo } from "@/lib/memoApi";
import {
  createPatientMemoApi,
  deletePatientMemoApi,
  fetchPatientMemosApi,
  updatePatientMemoApi,
} from "@/lib/memoApi";

type MemoFormState = {
  memo: string;
};

function formatDate(value?: string | null) {
  if (!value) return "-";
  return value.slice(0, 16).replace("T", " ");
}

export default function PatientMemosPage() {
  const params = useParams<{ id: string }>();
  const patientId = Number(params.id);

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [memos, setMemos] = React.useState<PatientMemo[]>([]);

  const [memoDialogOpen, setMemoDialogOpen] = React.useState(false);
  const [memoDialogMode, setMemoDialogMode] = React.useState<"create" | "edit">(
    "create"
  );
  const [editingMemo, setEditingMemo] = React.useState<PatientMemo | null>(null);
  const [memoForm, setMemoForm] = React.useState<MemoFormState>({ memo: "" });

  const loadMemos = React.useCallback(async () => {
    if (!patientId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetchPatientMemosApi(patientId);
      setMemos(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load memos");
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  React.useEffect(() => {
    loadMemos();
  }, [loadMemos]);

  const openCreateMemo = () => {
    setMemoDialogMode("create");
    setEditingMemo(null);
    setMemoForm({ memo: "" });
    setMemoDialogOpen(true);
  };

  const openEditMemo = (item: PatientMemo) => {
    setMemoDialogMode("edit");
    setEditingMemo(item);
    setMemoForm({ memo: item.memo ?? "" });
    setMemoDialogOpen(true);
  };

  const closeMemoDialog = () => setMemoDialogOpen(false);

  const onSubmitMemo = async () => {
    if (!patientId || !memoForm.memo.trim()) return;
    try {
      if (memoDialogMode === "create") {
        await createPatientMemoApi({
          patientId,
          memo: memoForm.memo.trim(),
        });
      } else if (editingMemo) {
        await updatePatientMemoApi(editingMemo.memoId, {
          memo: memoForm.memo.trim(),
        });
      }
      setMemoDialogOpen(false);
      await loadMemos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    }
  };

  const onDeleteMemo = async (item: PatientMemo) => {
    if (!confirm("Delete this memo?")) return;
    try {
      await deletePatientMemoApi(item.memoId);
      await loadMemos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  };

  return (
    <MainLayout>
      <Card
        elevation={0}
        sx={{
          borderRadius: 4,
          border: "1px solid var(--line)",
          boxShadow: "var(--shadow-2)",
        }}
      >
        <CardContent>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mb: 1 }}
          >
            <Typography fontWeight={900}>Patient Memos</Typography>
            <Button size="small" variant="outlined" onClick={openCreateMemo}>
              Add Memo
            </Button>
          </Stack>

          {error && (
            <Typography color="error" fontWeight={900} sx={{ mb: 1 }}>
              {error}
            </Typography>
          )}

          <Table size="small">
            <TableHead sx={{ bgcolor: "#f4f7fb" }}>
              <TableRow
                sx={{
                  "& th": {
                    fontWeight: 800,
                    color: "#425366",
                    borderBottom: "1px solid var(--line)",
                  },
                }}
              >
                <TableCell>Memo</TableCell>
                <TableCell>Created By</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={4}>
                    <Typography color="text.secondary">Loading...</Typography>
                  </TableCell>
                </TableRow>
              )}

              {!loading && memos.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4}>
                    <Typography color="text.secondary">
                      No memos yet.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}

              {memos.map((item) => (
                <TableRow key={item.memoId} hover>
                  <TableCell sx={{ whiteSpace: "pre-line" }}>
                    {item.memo}
                  </TableCell>
                  <TableCell>{item.createdBy ?? "-"}</TableCell>
                  <TableCell>{formatDate(item.createdAt)}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5}>
                      <IconButton size="small" onClick={() => openEditMemo(item)}>
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => onDeleteMemo(item)}
                      >
                        <DeleteOutlineOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog
        open={memoDialogOpen}
        onClose={closeMemoDialog}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 4 } }}
      >
        <DialogTitle>
          {memoDialogMode === "create" ? "Add Memo" : "Edit Memo"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Memo"
              value={memoForm.memo}
              onChange={(e) =>
                setMemoForm((prev) => ({ ...prev, memo: e.target.value }))
              }
              fullWidth
              multiline
              minRows={3}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeMemoDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={onSubmitMemo}
            disabled={!memoForm.memo.trim()}
          >
            {memoDialogMode === "create" ? "Create" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
}
