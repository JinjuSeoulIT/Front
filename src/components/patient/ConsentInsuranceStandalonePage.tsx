"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/store/store";
import { patientActions } from "@/features/patients/patientSlice";
import type { Patient } from "@/features/patients/patientTypes";
import { searchPatientsMultiApi } from "@/lib/patientApi";

const API_BASE =
  process.env.NEXT_PUBLIC_PATIENTS_API_BASE_URL ?? "http://192.168.1.60:8181";

function resolvePhotoUrl(url?: string | null) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${API_BASE}${url.startsWith("/") ? "" : "/"}${url}`;
}

type TodayItem = {
  patientId: number;
  patientName: string;
  patientNo?: string | null;
  updatedAt?: string | null;
};

type Props = {
  title: string;
  description?: string;
  basePath: string;
  todayListTitle: string;
  todayItems: TodayItem[];
  todayLoading?: boolean;
};

export default function ConsentInsuranceStandalonePage({
  title,
  description,
  basePath,
  todayListTitle,
  todayItems,
  todayLoading = false,
}: Props) {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [searchName, setSearchName] = useState("");
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [searching, setSearching] = useState(false);

  const onSearch = async () => {
    const q = searchName.trim();
    if (!q) return;
    setSearching(true);
    try {
      const list = await searchPatientsMultiApi({ name: q });
      setSearchResults(list);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const onSelectPatient = (p: Patient) => {
    dispatch(patientActions.fetchPatientSuccess(p));
    router.push(`${basePath}/${p.patientId}`);
  };

  const onSelectTodayItem = (item: TodayItem) => {
    const p: Patient = {
      patientId: item.patientId,
      name: item.patientName,
      patientNo: item.patientNo,
    } as Patient;
    dispatch(patientActions.fetchPatientSuccess(p));
    router.push(`${basePath}/${item.patientId}`);
  };

  return (
    <Stack spacing={3}>
      <Card
        sx={{
          borderRadius: 3,
          border: "1px solid #dbe5f5",
          boxShadow: "0 12px 24px rgba(23, 52, 97, 0.12)",
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Box>
              <Typography fontWeight={800}>{title}</Typography>
              {description && (
                <Typography sx={{ color: "#7b8aa9", fontSize: 13, mt: 0.5 }}>
                  {description}
                </Typography>
              )}
            </Box>

            {/* 오늘 등록·수정된 건 */}
            <Box>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                {todayListTitle}
              </Typography>
              {todayLoading ? (
                <Typography color="#7b8aa9" fontSize={13}>
                  불러오는 중...
                </Typography>
              ) : todayItems.length === 0 ? (
                <Typography color="#7b8aa9" fontSize={13}>
                  오늘 등록·수정된 건이 없습니다.
                </Typography>
              ) : (
                <Stack spacing={1}>
                  {todayItems.map((item) => (
                    <Box
                      key={item.patientId}
                      onClick={() => onSelectTodayItem(item)}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        px: 1.5,
                        py: 1.2,
                        borderRadius: 2,
                        cursor: "pointer",
                        "&:hover": { bgcolor: "#f1f6ff" },
                      }}
                    >
                      <Typography fontWeight={700}>{item.patientName}</Typography>
                      <Typography sx={{ color: "#7b8aa9", fontSize: 12 }}>
                        {item.patientNo ?? "-"}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>

            {/* 환자 검색 */}
            <Box>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                환자 검색
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
                <TextField
                  size="small"
                  placeholder="환자명으로 검색"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && onSearch()}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ flex: 1 }}
                />
                <Chip
                  label={searching ? "검색 중" : "검색"}
                  color="primary"
                  onClick={onSearch}
                  sx={{ cursor: "pointer" }}
                />
              </Stack>
              <Stack spacing={1}>
                {searchResults.map((p) => (
                  <Box
                    key={p.patientId}
                    onClick={() => onSelectPatient(p)}
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "44px minmax(0, 1fr)",
                      alignItems: "center",
                      gap: 1.5,
                      px: 1.5,
                      py: 1.2,
                      borderRadius: 2,
                      cursor: "pointer",
                      "&:hover": { bgcolor: "#f1f6ff" },
                    }}
                  >
                    <Avatar
                      src={resolvePhotoUrl(p.photoUrl) || undefined}
                      sx={{
                        width: 36,
                        height: 36,
                        bgcolor: "#d7e6ff",
                        color: "#2b5aa9",
                      }}
                    >
                      {p.name?.slice(0, 1) ?? "?"}
                    </Avatar>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography fontWeight={700} noWrap>
                        {p.name}
                      </Typography>
                      <Typography sx={{ color: "#7b8aa9", fontSize: 12 }} noWrap>
                        {p.patientNo ?? "-"} · {p.birthDate ?? "-"}
                      </Typography>
                    </Box>
                  </Box>
                ))}
                {!searching && searchName.trim() && searchResults.length === 0 && (
                  <Typography color="#7b8aa9" fontSize={13}>
                    검색 결과가 없습니다.
                  </Typography>
                )}
              </Stack>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
