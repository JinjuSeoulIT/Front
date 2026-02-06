"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  MenuItem,
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

import MedicalStaffFormModal, {
  MedicalStaffFormValues,
  SimpleOption,
} from "../form-modal/MedicalStaffFormModal";
import MedicalStaffDetailModal, {
  MedicalStaffDetail,
} from "../detail-modal/MedicalStaffDetailModal";
import { fetchMedicalStaffByConditionApi } from "@/entities/medical-staff/api/medicalStaffApi";

export type MedicalStaffItem = MedicalStaffDetail & MedicalStaffFormValues;

type MedicalStaffListProps = {
  items: MedicalStaffItem[];
  departments: SimpleOption[];
  positions: SimpleOption[];
  onSearch: (condition: string, value: string) => void;
  onCreate: (values: MedicalStaffFormValues) => void;
  onUpdate: (id: number, values: MedicalStaffFormValues) => void;
  onDelete: (id: number) => void;
  detailOpen: boolean;
  detailLoading?: boolean;
  detailData?: MedicalStaffDetail | null;
  onOpenDetail: (id: number) => void;
  onCloseDetail: () => void;
  loading?: boolean;
};

const conditionLabel: Record<string, string> = {
  name: "이름",
  department: "부서",
  position: "직책",
  staff_type: "직군",
  staff_id: "직원 ID",
};

const MedicalStaffList: React.FC<MedicalStaffListProps> = ({
  items,
  departments,
  positions,
  onSearch,
  onCreate,
  onUpdate,
  onDelete,
  detailOpen,
  detailLoading = false,
  detailData,
  onOpenDetail,
  onCloseDetail,
  loading = false,
}) => {
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<MedicalStaffItem | null>(null);
  const [condition, setCondition] = useState("name");
  const [value, setValue] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [remoteOptions, setRemoteOptions] = useState<string[]>([]);
  const lastRequestId = useRef(0);

  const options = useMemo(() => {
    const set = new Set<string>();

    if (condition === "department") {
      departments.forEach((dept) => {
        const v = (dept.name ?? "").trim();
        if (v) set.add(v);
      });
      return Array.from(set).sort((a, b) => a.localeCompare(b));
    }

    if (condition === "position") {
      positions.forEach((pos) => {
        const v = (pos.name ?? "").trim();
        if (v) set.add(v);
      });
      return Array.from(set).sort((a, b) => a.localeCompare(b));
    }

    items.forEach((item) => {
      let v = "";
      switch (condition) {
        case "name":
          v = item.name ?? "";
          break;
        case "staff_id":
          v = item.staffId ?? "";
          break;
        case "staff_type":
          v = item.domainRole ?? "";
          break;
        default:
          v = "";
      }
      const normalized = v.trim();
      if (normalized) set.add(normalized);
    });

    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [condition, departments, items, positions]);

  useEffect(() => {
    const query = value.trim();
    if (!query) {
      setRemoteOptions([]);
      return;
    }

    const requestId = ++lastRequestId.current;
    const timer = window.setTimeout(async () => {
      try {
        const res = await fetchMedicalStaffByConditionApi({
          condition: condition as any,
          value: query,
        });
        if (lastRequestId.current !== requestId) return;
        if (!res.success || !res.result) {
          setRemoteOptions([]);
          return;
        }

        const list = Array.isArray(res.result) ? res.result : [res.result];
        const set = new Set<string>();
        list.forEach((item: any) => {
          let v = "";
          switch (condition) {
            case "name":
              v = item.fullName ?? item.name ?? "";
              break;
            case "staff_id":
              v = item.username ?? item.staffId ?? "";
              break;
            case "staff_type":
              v = item.domainRole ?? "";
              break;
            case "department":
              v = item.departmentName ?? "";
              break;
            case "position":
              v = item.positionName ?? "";
              break;
            default:
              v = "";
          }
          const normalized = String(v ?? "").trim();
          if (normalized) set.add(normalized);
        });
        setRemoteOptions(Array.from(set).sort((a, b) => a.localeCompare(b)));
      } catch {
        if (lastRequestId.current === requestId) {
          setRemoteOptions([]);
        }
      }
    }, 250);

    return () => window.clearTimeout(timer);
  }, [condition, value]);

  const headerMeta = useMemo(() => {
    const countLabel = loading ? "로딩 중" : `${items.length}명`;
    return { countLabel };
  }, [items.length, loading]);

  const handleOpenCreate = () => {
    setEditing(null);
    setOpenForm(true);
  };

  const handleOpenEdit = (item: MedicalStaffItem) => {
    setEditing(item);
    setOpenForm(true);
  };

  const handleOpenDetail = (item: MedicalStaffItem) => {
    const id = item.id;
    if (id === undefined || id === null) return;
    setSelectedId(id);
    onOpenDetail(id);
  };

  const handleSubmit = (values: MedicalStaffFormValues) => {
    if (editing?.id) {
      onUpdate(editing.id, values);
    } else {
      onCreate(values);
    }
    setOpenForm(false);
  };

  const handleSearch = (e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault();
    e?.stopPropagation();
    onSearch(condition, value);
  };

  const handleDelete = (id: number) => {
    const ok = window.confirm("진짜 삭제하시겠습니까?");
    if (ok) onDelete(id);
  };

  return (
    <Box>
      <Box
        sx={{
          p: 2,
          borderRadius: 2,
          background:
            "linear-gradient(135deg, rgba(25,118,210,0.10), rgba(76,175,80,0.06))",
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
              의료진 목록
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
            aria-label="의료진 등록"
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
              <TextField
                select
                label="조건"
                size="small"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                sx={{ minWidth: 160 }}
              >
                <MenuItem value="name">이름</MenuItem>
                <MenuItem value="department">부서</MenuItem>
                <MenuItem value="position">직책</MenuItem>
                <MenuItem value="staff_type">직군</MenuItem>
                <MenuItem value="staff_id">직원 ID</MenuItem>
              </TextField>

              <Autocomplete
                options={remoteOptions.length ? remoteOptions : options}
                freeSolo
                inputValue={value}
                onInputChange={(_, v) => setValue(v)}
                onChange={(_, v) => {
                  const next = (typeof v === "string" ? v : "").trim();
                  setValue(next);
                  onSearch(condition, next);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="검색어"
                    size="small"
                    placeholder={`${conditionLabel[condition] || "검색"} 검색`}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        e.stopPropagation();
                        onSearch(condition, value);
                      }
                    }}
                  />
                )}
                sx={{ flex: 1, minWidth: 220 }}
              />

              <IconButton
                color="primary"
                aria-label="검색"
                onClick={handleSearch}
              >
                <SearchOutlined />
              </IconButton>
            </Stack>

            <Stack
              direction="row"
              spacing={1}
              justifyContent={{ xs: "flex-start", md: "flex-end" }}
            >
              <IconButton
                aria-label="초기화"
                onClick={() => {
                  setValue("");
                  onSearch("name", "");
                  setCondition("name");
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
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 800, letterSpacing: 0.3 }}
          >
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
              <TableCell align="center">직원ID</TableCell>
              <TableCell align="center">이름</TableCell>
              <TableCell align="center">부서</TableCell>
              <TableCell align="center">직책</TableCell>
              <TableCell align="center">관리</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item, idx) => (
              <TableRow
                key={item.id}
                hover
                selected={selectedId === item.id}
                sx={{
                  cursor: "pointer",
                  "&.Mui-selected": { bgcolor: "rgba(25,118,210,0.08)" },
                  "&.Mui-selected:hover": { bgcolor: "rgba(25,118,210,0.12)" },
                }}
                onClick={() => handleOpenDetail(item)}
              >
                <TableCell align="center">{idx + 1}</TableCell>
                <TableCell align="center">{item.staffId}</TableCell>
                <TableCell align="center">{item.name}</TableCell>
                <TableCell align="center">
                  {item.departmentName?.trim()
                    ? item.departmentName
                    : "-"}
                </TableCell>
                <TableCell align="center">
                  {item.positionName ?? item.positionId ?? ""}
                </TableCell>
                <TableCell align="center">
                  <Stack direction="row" spacing={1} justifyContent="center">
                    <IconButton
                      size="small"
                      aria-label="수정"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEdit(item);
                      }}
                    >
                      <EditOutlined fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      aria-label="삭제"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (item.id) handleDelete(item.id);
                      }}
                    >
                      <DeleteOutline fontSize="small" />
                    </IconButton>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}

            {!items.length && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <Stack spacing={0.5} alignItems="center">
                    <Typography sx={{ fontWeight: 800 }}>
                      {loading ? "로딩 중..." : "데이터 없음"}
                    </Typography>
                    {!loading && (
                      <Typography variant="body2" sx={{ color: "text.secondary" }}>
                        조건을 바꾸거나 새 의료진을 등록해 보세요.
                      </Typography>
                    )}
                  </Stack>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      <MedicalStaffFormModal
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSubmit={handleSubmit}
        initialValues={editing}
        departments={departments}
        positions={positions}
        title={editing ? "의료진 수정" : "의료진 등록"}
      />

      <MedicalStaffDetailModal
        open={detailOpen}
        onClose={onCloseDetail}
        data={detailData}
        loading={detailLoading}
      />
    </Box>
  );
};

export default MedicalStaffList;
