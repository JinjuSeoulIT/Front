"use client";

import React, { useMemo, useState } from "react";
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import {
  AddCircleOutline,
  DeleteOutline,
  EditOutlined,
  RestartAltOutlined,
  SearchOutlined,
} from "@mui/icons-material";
import dynamic from "next/dynamic";

import { PositionFormValues } from "@/components/position/form-modal/PositionFormModal";

const PositionFormModal = dynamic(
  () => import("@/components/position/form-modal/PositionFormModal"),
  { ssr: false }
);

export type PositionItem = PositionFormValues;

type PositionTabProps = {
  positions: PositionItem[];
  onCreate: (values: PositionFormValues) => void;
  onUpdate: (id: number, values: PositionFormValues) => void;
  onDelete: (id: number) => void;
  onSearch: (condition: string, value: string) => void;
  onReset: () => void;
  loading?: boolean;
};

const PositionTab: React.FC<PositionTabProps> = ({
  positions,
  onCreate,
  onUpdate,
  onDelete,
  onSearch,
  onReset,
  loading = false,
}) => {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<PositionItem | null>(null);

  const [query, setQuery] = useState("");

  const headerMeta = useMemo(() => {
    const countLabel = loading ? "로딩 중" : `${positions.length}개`;
    return { countLabel };
  }, [positions.length, loading]);

  const handleOpenCreate = () => {
    setEditing(null);
    setOpen(true);
  };

  const handleOpenEdit = (item: PositionItem) => {
    setEditing(item);
    setOpen(true);
  };

  const handleSubmit = (values: PositionFormValues) => {
    if (editing?.id) {
      onUpdate(editing.id, values);
    } else {
      onCreate(values);
    }
    setOpen(false);
  };

  const handleDelete = (id: number) => {
    const ok = window.confirm("진짜 삭제하시겠습니까?");
    if (ok) onDelete(id);
  };

  const handleSearch = (e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault();
    e?.stopPropagation();
    onSearch("name", query);
  };

  const nameOptions = useMemo(() => {
    const set = new Set<string>();
    positions.forEach((p) => {
      const v = (p.name ?? "").trim();
      if (v) set.add(v);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [positions]);

  return (
    <Box>
      <Box
        sx={{
          p: 2,
          borderRadius: 2,
          background:
            "linear-gradient(135deg, rgba(244,67,54,0.08), rgba(25,118,210,0.06))",
          mb: 2,
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between"
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 900, lineHeight: 1.15 }}>
              직책/직위 관리
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.75 }}>
              <Chip
                size="small"
                label={headerMeta.countLabel}
                variant="filled"
                sx={{ bgcolor: "rgba(0,0,0,0.06)" }}
              />
   
            </Stack>
          </Box>

          <IconButton
            color="primary"
            aria-label="직책 등록"
            onClick={handleOpenCreate}
          >
            <AddCircleOutline />
          </IconButton>
        </Stack>
      </Box>

      <Paper variant="outlined" sx={{ borderRadius: 2, mb: 2 }}>
        <Box sx={{ p: 2 }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={1.5}
            alignItems={{ xs: "stretch", md: "center" }}
            justifyContent="space-between"
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              alignItems={{ xs: "stretch", sm: "center" }}
              sx={{ flex: 1 }}
            >
              <Autocomplete
                options={nameOptions}
                freeSolo
                inputValue={query}
                onInputChange={(_, v) => setQuery(v)}
                onChange={(_, v) => {
                  const next = (typeof v === "string" ? v : "").trim();
                  setQuery(next);
                  onSearch("name", next);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="직책명"
                    size="small"
                    placeholder="직책명을 입력하거나 선택"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        e.stopPropagation();
                        onSearch("name", query);
                      }
                    }}
                  />
                )}
                sx={{ flex: 1, minWidth: 240 }}
              />

              <IconButton
                color="primary"
                aria-label="검색"
                onClick={handleSearch}
              >
                <SearchOutlined />
              </IconButton>
            </Stack>

            <Stack direction="row" spacing={1} justifyContent={{ xs: "flex-start", md: "flex-end" }}>
              <IconButton
                aria-label="초기화"
                onClick={() => {
                  setQuery("");
                  onReset();
                }}
              >
                <RestartAltOutlined />
              </IconButton>
            </Stack>
          </Stack>
        </Box>
      </Paper>

      <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, letterSpacing: 0.3 }}>
            목록
          </Typography>
        </Box>
        <Divider />

        <Table size="small" sx={{ "& th, & td": { py: 1, verticalAlign: "middle" } }}>
          <TableHead>
            <TableRow
              sx={{
                bgcolor: "rgba(0,0,0,0.02)",
                "& th": { fontWeight: 800, color: "text.secondary" },
              }}
            >
              <TableCell align="center">No</TableCell>
              <TableCell align="center">직책명</TableCell>
              <TableCell align="center">설명</TableCell>
              <TableCell align="center">관리</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {positions.map((pos, idx) => (
              <TableRow key={pos.id} hover>
                <TableCell align="center">{idx + 1}</TableCell>
                <TableCell align="center">{pos.name}</TableCell>
                <TableCell align="center">{pos.description || "-"}</TableCell>
                <TableCell align="center">
                  <Stack direction="row" spacing={1} justifyContent="center">
                    <IconButton
                      size="small"
                      aria-label="수정"
                      onClick={() => handleOpenEdit(pos)}
                    >
                      <EditOutlined fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      aria-label="삭제"
                      onClick={() => pos.id && handleDelete(pos.id)}
                    >
                      <DeleteOutline fontSize="small" />
                    </IconButton>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}

            {!positions.length && (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                  <Stack spacing={0.5} alignItems="center">
                    <Typography sx={{ fontWeight: 800 }}>
                      {loading ? "로딩 중..." : "데이터 없음"}
                    </Typography>
                    {!loading && (
                      <Typography variant="body2" sx={{ color: "text.secondary" }}>
                        새 직책을 등록해 보세요.
                      </Typography>
                    )}
                  </Stack>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      <PositionFormModal
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={handleSubmit}
        initialValues={editing}
        title={editing ? "직책 수정" : "직책 등록"}
      />
    </Box>
  );
};

export default PositionTab;
