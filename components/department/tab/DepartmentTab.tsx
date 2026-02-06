"use client";

import React, { useMemo, useState } from "react";
import {
  Autocomplete,
  Box,
  Button,
  MenuItem,
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
  Chip,
  Tooltip,
} from "@mui/material";
import {
  AddCircleOutline,
  ApartmentOutlined,
  GroupsOutlined,
  MeetingRoomOutlined,
  SettingsOutlined,
  StairsOutlined,
  DeleteOutline,
  EditOutlined,
  PhoneIphone,
  RestartAltOutlined,
  SearchOutlined,
} from "@mui/icons-material";

import DepartmentFormModal, {
  DepartmentFormValues,
} from "../form-modal/DepartmentFormModal";

export type DepartmentItem = DepartmentFormValues & { staffCount?: number };

type DepartmentTabProps = {
  departments: DepartmentItem[];
  onCreate: (values: DepartmentFormValues) => void;
  onUpdate: (id: number, values: DepartmentFormValues) => void;
  onDelete: (id: number) => void;
  onSearch: (condition: string, value: string) => void;
  onReset: () => void;
  loading?: boolean;
};

const DepartmentTab: React.FC<DepartmentTabProps> = ({
  departments,
  onCreate,
  onUpdate,
  onDelete,
  onSearch,
  onReset,
  loading = false,
}) => {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<DepartmentItem | null>(null);

  const [condition, setCondition] = useState<
    "name" | "buildingNo" | "floorNo" | "extension"
  >("name");
  const [query, setQuery] = useState("");

  const options = useMemo(() => {
    if (condition === "extension") return [];

    const set = new Set<string>();
    const pick = (d: DepartmentItem): string => {
      switch (condition) {
        case "name":
          return d.name ?? "";
        case "buildingNo":
          return d.buildingNo ?? "";
        case "floorNo":
          return d.floorNo ?? "";
        default:
          return "";
      }
    };

    departments.forEach((d) => {
      const v = pick(d).trim();
      if (v) set.add(v);
    });

    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [condition, departments]);

  const headerMeta = useMemo(() => {
    const countLabel = loading ? "로딩 중" : `${departments.length}개`;
    return { countLabel };
  }, [departments.length, loading]);

  const handleOpenCreate = () => {
    setEditing(null);
    setOpen(true);
  };

  const handleOpenEdit = (item: DepartmentItem) => {
    setEditing(item);
    setOpen(true);
  };

  const handleSubmit = (values: DepartmentFormValues) => {
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
    onSearch(condition, query);
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
              부서 관리
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
            aria-label="부서 등록"
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
                onChange={(e) => setCondition(e.target.value as typeof condition)}
                sx={{ minWidth: 160 }}
              >
                <MenuItem value="name">부서명</MenuItem>
                <MenuItem value="buildingNo">건물</MenuItem>
                <MenuItem value="floorNo">층</MenuItem>
                <MenuItem value="extension">내선</MenuItem>
              </TextField>

              <Autocomplete
                options={options}
                freeSolo
                inputValue={query}
                onInputChange={(_, v) => setQuery(v)}
                onChange={(_, v) => {
                  const next = (typeof v === "string" ? v : "").trim();
                  setQuery(next);
                  onSearch(condition, next);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="검색어"
                    size="small"
                    placeholder="입력하거나 선택"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        e.stopPropagation();
                        onSearch(condition, query);
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
                  setCondition("name");
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
              <TableCell align="center">부서명</TableCell>
              <TableCell align="center">
                <Tooltip title="건물">
                  <ApartmentOutlined fontSize="small" />
                </Tooltip>
              </TableCell>
              <TableCell align="center">
                <Tooltip title="층">
                  <StairsOutlined fontSize="small" />
                </Tooltip>
              </TableCell>
              <TableCell align="center">
                <Tooltip title="호실">
                  <MeetingRoomOutlined fontSize="small" />
                </Tooltip>
              </TableCell>
              <TableCell align="center">
                <Tooltip title="내선">
                  <PhoneIphone fontSize="small" />
                </Tooltip>
              </TableCell>
              <TableCell align="center">
                <Tooltip title="인원">
                  <GroupsOutlined fontSize="small" />
                </Tooltip>
              </TableCell>
              <TableCell align="center">
                <Tooltip title="관리">
                  <SettingsOutlined fontSize="small" />
                </Tooltip>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {departments.map((dept, idx) => (
              <TableRow key={dept.id} hover>
                <TableCell align="center">{idx + 1}</TableCell>
                <TableCell align="center">{dept.name}</TableCell>
                <TableCell align="center">{dept.buildingNo || "-"}</TableCell>
                <TableCell align="center">{dept.floorNo || "-"}</TableCell>
                <TableCell align="center">{dept.roomNo || "-"}</TableCell>
                <TableCell align="center">{dept.extension || "-"}</TableCell>
                <TableCell align="center">{dept.staffCount ?? 0}</TableCell>
                <TableCell align="center">
                  <Stack direction="row" spacing={1} justifyContent="center">
                    <IconButton
                      size="small"
                      aria-label="수정"
                      onClick={() => handleOpenEdit(dept)}
                    >
                      <EditOutlined fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      aria-label="삭제"
                      onClick={() => dept.id && handleDelete(dept.id)}
                    >
                      <DeleteOutline fontSize="small" />
                    </IconButton>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}

            {!departments.length && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  <Stack spacing={0.5} alignItems="center">
                    <Typography sx={{ fontWeight: 800 }}>
                      {loading ? "로딩 중..." : "데이터 없음"}
                    </Typography>
                    {!loading && (
                      <Typography variant="body2" sx={{ color: "text.secondary" }}>
                        새 부서를 등록해 보세요.
                      </Typography>
                    )}
                  </Stack>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      <DepartmentFormModal
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={handleSubmit}
        initialValues={editing}
        title={editing ? "부서 수정" : "부서 등록"}
      />
    </Box>
  );
};

export default DepartmentTab;
