"use client";

import * as React from "react";
import MainLayout from "@/components/layout/MainLayout";
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Pagination,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { getSessionUser } from "@/lib/session";
import {
  createStaffBoardPostApi,
  deleteStaffBoardPostApi,
  fetchStaffBoardPostApi,
  fetchStaffBoardPageApi,
  type StaffBoardPost,
  updateStaffBoardPostApi,
} from "@/lib/staffBoardApi";

const PAGE_SIZE = 10;
const PINNED_NOTICE_COUNT = 5;
const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

const RANGE_META_PREFIX = "RANGE:";
const SCHEDULE_COLORS = [
  {
    barBg: "rgba(16, 94, 160, 0.14)",
    barText: "#0f4f86",
    cardBg: "#ffffff",
    cardBorder: "rgba(16, 94, 160, 0.4)",
    cardText: "#0f4f86",
  },
  {
    barBg: "rgba(22, 140, 102, 0.14)",
    barText: "#146f52",
    cardBg: "#ffffff",
    cardBorder: "rgba(22, 140, 102, 0.4)",
    cardText: "#146f52",
  },
  {
    barBg: "rgba(160, 102, 16, 0.14)",
    barText: "#8a5810",
    cardBg: "#ffffff",
    cardBorder: "rgba(160, 102, 16, 0.4)",
    cardText: "#8a5810",
  },
  {
    barBg: "rgba(126, 82, 173, 0.14)",
    barText: "#6f46a1",
    cardBg: "#ffffff",
    cardBorder: "rgba(126, 82, 173, 0.4)",
    cardText: "#6f46a1",
  },
  {
    barBg: "rgba(180, 71, 98, 0.14)",
    barText: "#9a2f4c",
    cardBg: "#ffffff",
    cardBorder: "rgba(180, 71, 98, 0.4)",
    cardText: "#9a2f4c",
  },
];

const NOTICE_SCHEDULE_COLORS = [
  { barBg: "rgba(15, 69, 112, 0.26)", barText: "#0f3c60", cardBg: "#1f4f7a", cardBorder: "#17466b", cardText: "#f5faff" },
  { barBg: "rgba(17, 92, 84, 0.26)", barText: "#0f5a52", cardBg: "#1f6a63", cardBorder: "#15554f", cardText: "#f2fffc" },
  { barBg: "rgba(118, 85, 24, 0.28)", barText: "#6b4a12", cardBg: "#7d5b20", cardBorder: "#6a4c18", cardText: "#fffaf0" },
  { barBg: "rgba(96, 61, 138, 0.28)", barText: "#5d3b87", cardBg: "#68448f", cardBorder: "#543872", cardText: "#faf5ff" },
  { barBg: "rgba(132, 42, 70, 0.28)", barText: "#7f2944", cardBg: "#8d3553", cardBorder: "#742b44", cardText: "#fff5f8" },
];

const parseScheduleContent = (item: StaffBoardPost) => {
  const raw = item.content || "";
  const start = (item.eventDate || "").trim();
  const endFallback = start;

  if (!raw.startsWith(RANGE_META_PREFIX)) {
    return {
      startDate: start,
      endDate: endFallback,
      body: raw,
    };
  }

  const [firstLine, ...rest] = raw.split("\n");
  const range = firstLine.slice(RANGE_META_PREFIX.length).trim();
  const [startDateRaw, endDateRaw] = range.split("~");
  const startDate = (startDateRaw || start).trim();
  const endDate = (endDateRaw || startDate || endFallback).trim();

  return {
    startDate,
    endDate,
    body: rest.join("\n").trim(),
  };
};

const normalizeRange = (startDate?: string, endDate?: string) => {
  const start = (startDate || "").trim();
  const end = (endDate || start).trim();
  if (!start) return { startDate: "", endDate: "" };
  if (!end) return { startDate: start, endDate: start };
  return start <= end ? { startDate: start, endDate: end } : { startDate: end, endDate: start };
};

const buildScheduleContent = (body: string, startDate: string, endDate: string) => {
  const trimmedBody = body.trim();
  if (!startDate || !endDate || startDate === endDate) {
    return trimmedBody;
  }
  return `${RANGE_META_PREFIX}${startDate}~${endDate}\n\n${trimmedBody}`;
};

const formatScheduleRange = (startDate: string, endDate: string) => {
  if (!startDate && !endDate) return "-";
  if (!endDate || startDate === endDate) return startDate || endDate;
  return `${startDate} ~ ${endDate}`;
};

const toDateKey = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const getRangeEdge = (item: StaffBoardPost, dateKey: string) => {
  const parsed = parseScheduleContent(item);
  const range = normalizeRange(parsed.startDate || item.eventDate || "", parsed.endDate || item.eventDate || "");
  const startKey = toDateKey(range.startDate);
  const endKey = toDateKey(range.endDate);
  return {
    isStart: Boolean(startKey) && dateKey === startKey,
    isEnd: Boolean(endKey) && dateKey === endKey,
    isSingle: Boolean(startKey) && Boolean(endKey) && startKey === endKey,
  };
};

const getRangeLength = (item: StaffBoardPost) => {
  const parsed = parseScheduleContent(item);
  const range = normalizeRange(parsed.startDate || item.eventDate || "", parsed.endDate || item.eventDate || "");
  const startKey = toDateKey(range.startDate);
  const endKey = toDateKey(range.endDate);
  if (!startKey || !endKey) return 1;
  const start = new Date(startKey);
  const end = new Date(endKey);
  const diff = Math.floor((end.getTime() - start.getTime()) / 86400000);
  return Math.max(1, diff + 1);
};

const getRangeMiddleKey = (item: StaffBoardPost) => {
  const parsed = parseScheduleContent(item);
  const range = normalizeRange(parsed.startDate || item.eventDate || "", parsed.endDate || item.eventDate || "");
  const startKey = toDateKey(range.startDate);
  const endKey = toDateKey(range.endDate);
  if (!startKey || !endKey) return "";

  const start = new Date(startKey);
  const end = new Date(endKey);
  const length = Math.max(1, Math.floor((end.getTime() - start.getTime()) / 86400000) + 1);
  const middleOffset = Math.floor((length - 1) / 2);
  const middle = new Date(start);
  middle.setDate(middle.getDate() + middleOffset);
  const y = middle.getFullYear();
  const m = `${middle.getMonth() + 1}`.padStart(2, "0");
  const d = `${middle.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const getScheduleColor = (item: StaffBoardPost) => {
  const seed = `${item.id}|${item.title || ""}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  const palette = item.postType === "공지" ? NOTICE_SCHEDULE_COLORS : SCHEDULE_COLORS;
  const picked = palette[hash % palette.length];
  return {
    ...picked,
    isNotice: item.postType === "공지",
  };
};

export default function StaffSchedulePage() {
  const currentUser = React.useMemo(() => getSessionUser(), []);
  const [items, setItems] = React.useState<StaffBoardPost[]>([]);
  const [keyword, setKeyword] = React.useState("");
  const [searchInput, setSearchInput] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [pageCount, setPageCount] = React.useState(1);
  const [open, setOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [detail, setDetail] = React.useState<StaffBoardPost | null>(null);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deletePinInput, setDeletePinInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [hideNotices, setHideNotices] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<"BOARD" | "CALENDAR">("BOARD");
  const [calendarMonth, setCalendarMonth] = React.useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDateKey, setSelectedDateKey] = React.useState(() => toDateKey(new Date().toISOString().slice(0, 10)));
  const [form, setForm] = React.useState({
    isNotice: true,
    title: "",
    time: "",
    endDate: "",
    location: "",
    content: "",
    deletePin: "",
  });

  const visibleItems = React.useMemo(() => {
    const notices = items.filter((item) => item.postType === "공지");
    const normals = items.filter((item) => item.postType !== "공지");

    if (hideNotices) {
      const start = (page - 1) * PAGE_SIZE;
      return normals.slice(start, start + PAGE_SIZE);
    }

    const pinned = notices.slice(0, PINNED_NOTICE_COUNT);
    const normalSlots = Math.max(1, PAGE_SIZE - pinned.length);
    const normalStart = (page - 1) * normalSlots;
    return [...pinned, ...normals.slice(normalStart, normalStart + normalSlots)];
  }, [hideNotices, items, page]);

  const noticeCount = React.useMemo(
    () => items.filter((item) => item.postType === "공지").length,
    [items]
  );
  const normalCount = React.useMemo(
    () => items.filter((item) => item.postType !== "공지").length,
    [items]
  );
  const totalCount = hideNotices ? normalCount : noticeCount + normalCount;

  const calendarItems = React.useMemo(
    () => (hideNotices ? items.filter((item) => item.postType !== "공지") : items),
    [hideNotices, items]
  );

  const calendarItemsByDate = React.useMemo(() => {
    const map = new Map<string, StaffBoardPost[]>();
    for (const item of calendarItems) {
      const parsed = parseScheduleContent(item);
      const range = normalizeRange(parsed.startDate || item.eventDate || "", parsed.endDate || item.eventDate || "");
      const startKey = toDateKey(range.startDate);
      const endKey = toDateKey(range.endDate);
      if (!startKey || !endKey) continue;

      const start = new Date(startKey);
      const end = new Date(endKey);
      const cursor = new Date(start);
      let guard = 0;

      while (cursor <= end && guard < 90) {
        const y = cursor.getFullYear();
        const m = `${cursor.getMonth() + 1}`.padStart(2, "0");
        const d = `${cursor.getDate()}`.padStart(2, "0");
        const key = `${y}-${m}-${d}`;
        const list = map.get(key) ?? [];
        list.push(item);
        map.set(key, list);
        cursor.setDate(cursor.getDate() + 1);
        guard += 1;
      }
    }
    return map;
  }, [calendarItems]);

  const monthLabel = `${calendarMonth.getFullYear()}년 ${calendarMonth.getMonth() + 1}월`;

  const calendarCells = React.useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const firstWeekday = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const totalSlots = Math.ceil((firstWeekday + daysInMonth) / 7) * 7;

    return Array.from({ length: totalSlots }, (_, index) => {
      const dayNumber = index - firstWeekday + 1;
      if (dayNumber < 1 || dayNumber > daysInMonth) {
        return { inMonth: false, dayNumber: null as number | null, key: `blank-${index}` };
      }

      const dateKey = `${year}-${`${month + 1}`.padStart(2, "0")}-${`${dayNumber}`.padStart(2, "0")}`;
      return { inMonth: true, dayNumber, key: dateKey, dateKey };
    });
  }, [calendarMonth]);

  const selectedDateItems = React.useMemo(
    () => (selectedDateKey ? calendarItemsByDate.get(selectedDateKey) ?? [] : []),
    [calendarItemsByDate, selectedDateKey]
  );

  React.useEffect(() => {
    const firstDateCell = calendarCells.find((cell) => cell.inMonth && "dateKey" in cell && cell.dateKey);
    if (!firstDateCell || !("dateKey" in firstDateCell) || !firstDateCell.dateKey) return;
    const currentMonthPrefix = `${calendarMonth.getFullYear()}-${`${calendarMonth.getMonth() + 1}`.padStart(2, "0")}`;
    if (!selectedDateKey.startsWith(currentMonthPrefix)) {
      setSelectedDateKey(firstDateCell.dateKey);
    }
  }, [calendarCells, calendarMonth, selectedDateKey]);

  const loadPage = React.useCallback(async (nextPage: number, nextKeyword: string) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const result = await fetchStaffBoardPageApi({
        category: "SCHEDULE",
        keyword: nextKeyword,
        page: 0,
        size: 500,
      });
      const rows = result.items || [];
      const noticeCount = rows.filter((item) => item.postType === "공지").length;
      const normalCount = rows.length - noticeCount;
      const pinnedCount = hideNotices ? 0 : Math.min(PINNED_NOTICE_COUNT, noticeCount);
      const normalSlots = hideNotices ? PAGE_SIZE : Math.max(1, PAGE_SIZE - pinnedCount);
      const totalPages = Math.max(1, Math.ceil(normalCount / normalSlots));

      setItems(rows);
      setPage(Math.min(nextPage, totalPages));
      setPageCount(totalPages);
    } catch (error) {
      setItems([]);
      setPageCount(1);
      setErrorMessage(error instanceof Error ? error.message : "일정을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [hideNotices]);

  React.useEffect(() => {
    void loadPage(1, keyword);
  }, [hideNotices, keyword, loadPage]);

  const isOwner = React.useCallback(
    (item: StaffBoardPost) => {
      const username = (currentUser?.username || "").trim();
      const fullName = (currentUser?.fullName || "").trim();
      return item.authorId === username || (!!fullName && item.authorName === fullName);
    },
    [currentUser?.fullName, currentUser?.username]
  );

  const openCreate = () => {
    const today = new Date().toISOString().slice(0, 10);
    setEditingId(null);
    setForm({
      isNotice: true,
      title: "",
      time: today,
      endDate: today,
      location: "",
      content: "",
      deletePin: "",
    });
    setOpen(true);
  };

  const openEdit = (item: StaffBoardPost) => {
    if (!isOwner(item)) return;
    const parsed = parseScheduleContent(item);
    setEditingId(item.id);
    setForm({
      isNotice: (item.postType || "공지") === "공지",
      title: item.title,
      time: parsed.startDate || item.eventDate || "",
      endDate: parsed.endDate || parsed.startDate || item.eventDate || "",
      location: item.location || "",
      content: parsed.body,
      deletePin: "",
    });
    setOpen(true);
  };

  const submit = async () => {
    if (!form.title.trim()) return;
    if (!form.time.trim()) {
      window.alert("시작 일자를 입력해 주세요.");
      return;
    }
    if (!editingId && !/^\d{4}$/.test(form.deletePin)) {
      window.alert("삭제 비밀번호는 4자리 숫자로 입력해 주세요.");
      return;
    }
    try {
      const range = normalizeRange(form.time, form.endDate);
      const req = {
        postType: form.isNotice ? "공지" : "일반",
        title: form.title.trim(),
        content: buildScheduleContent(form.content, range.startDate, range.endDate),
        eventDate: range.startDate,
        location: form.location.trim(),
        authorId: currentUser?.username || "",
        authorName: currentUser?.fullName || currentUser?.username || "작성자",
        deletePin: editingId ? undefined : form.deletePin,
      };
      if (editingId) {
        await updateStaffBoardPostApi("SCHEDULE", editingId, req);
      } else {
        await createStaffBoardPostApi("SCHEDULE", req);
      }
      setOpen(false);
      setDetail(null);
      await loadPage(editingId ? page : 1, keyword);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "저장에 실패했습니다.");
    }
  };

  const remove = async () => {
    if (!detail || !isOwner(detail)) return;
    try {
      await deleteStaffBoardPostApi("SCHEDULE", detail.id, deletePinInput);
      setDeleteOpen(false);
      setDetail(null);
      setDeletePinInput("");
      await loadPage(page, keyword);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "삭제에 실패했습니다.");
    }
  };

  return (
    <MainLayout>
      <Stack spacing={2}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography sx={{ fontSize: 24, fontWeight: 900 }}>주요일정</Typography>
            <Typography sx={{ color: "var(--muted)", mt: 0.5 }}>부서 간 공유되는 운영 일정을 조회합니다.</Typography>
          </Box>
          <Typography sx={{ color: "var(--text)", fontSize: 15, fontWeight: 800, whiteSpace: "nowrap" }}>
            검색된 데이터 {totalCount}건
          </Typography>
        </Stack>

        <Tabs
          value={viewMode}
          onChange={(_, value: "BOARD" | "CALENDAR") => setViewMode(value)}
          sx={{
            width: "fit-content",
            border: "1px solid var(--line)",
            borderRadius: 2,
            minHeight: 38,
            "& .MuiTab-root": { minHeight: 38, px: 1.75 },
          }}
        >
          <Tab value="BOARD" label="게시판으로 보기" />
          <Tab value="CALENDAR" label="달력으로 보기" />
        </Tabs>

        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <TextField
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="일정명/내용 검색"
            sx={{ width: { xs: "100%", md: 420 } }}
          />
          <FormControlLabel
            control={<Checkbox checked={hideNotices} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHideNotices(e.target.checked)} />}
            label="공지 숨기기"
            sx={{ ml: 0.5, whiteSpace: "nowrap" }}
          />
          <Button
            variant="outlined"
            onClick={async () => {
              setKeyword(searchInput.trim());
              await loadPage(1, searchInput.trim());
            }}
          >
            검색
          </Button>
          <Button variant="contained" onClick={openCreate}>등록</Button>
        </Stack>

        {viewMode === "CALENDAR" ? (
          <Card sx={{ borderRadius: 2, border: "1px solid var(--line)", bgcolor: "#fff" }}>
            <CardContent sx={{ p: 2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.25 }}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    const next = new Date(calendarMonth);
                    next.setMonth(next.getMonth() - 1);
                    setCalendarMonth(new Date(next.getFullYear(), next.getMonth(), 1));
                  }}
                >
                  이전 달
                </Button>
                <Typography sx={{ fontWeight: 800, fontSize: 18 }}>{monthLabel}</Typography>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    const next = new Date(calendarMonth);
                    next.setMonth(next.getMonth() + 1);
                    setCalendarMonth(new Date(next.getFullYear(), next.getMonth(), 1));
                  }}
                >
                  다음 달
                </Button>
              </Stack>

              <Stack direction={{ xs: "column", lg: "row" }} spacing={2} alignItems="stretch">
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: 0 }}>
                    {WEEKDAY_LABELS.map((label) => (
                      <Typography
                        key={label}
                        sx={{ textAlign: "center", color: "var(--muted)", fontSize: 12, fontWeight: 700 }}
                      >
                        {label}
                      </Typography>
                    ))}

                    {calendarCells.map((cell) => {
                      if (!cell.inMonth) {
                        return (
                          <Box key={cell.key} sx={{ minHeight: 108, border: "1px dashed rgba(0,0,0,0.05)", bgcolor: "rgba(0,0,0,0.01)" }} />
                        );
                      }

                      const dateKey = "dateKey" in cell ? cell.dateKey : "";
                      const dayItems = dateKey ? calendarItemsByDate.get(dateKey) ?? [] : [];
                      const previewItems = [...dayItems]
                        .sort((a, b) => {
                          const aLen = getRangeLength(a);
                          const bLen = getRangeLength(b);
                          if (aLen !== bLen) return bLen - aLen;
                          const aStart = parseScheduleContent(a).startDate || a.eventDate || "";
                          const bStart = parseScheduleContent(b).startDate || b.eventDate || "";
                          if (aStart !== bStart) return aStart.localeCompare(bStart);
                          return a.id - b.id;
                        })
                        .slice(0, 2);
                      const remain = dayItems.length - previewItems.length;

                      return (
                        <Box
                          key={cell.key}
                          onClick={() => {
                            if (dateKey) setSelectedDateKey(dateKey);
                          }}
                          sx={{
                            minHeight: 108,
                            border: dateKey === selectedDateKey ? "2px solid #0e5b95" : "1px solid var(--line)",
                            bgcolor: dateKey === selectedDateKey ? "rgba(14,91,149,0.03)" : "#fff",
                            p: 0.35,
                            cursor: "pointer",
                          }}
                        >
                          <Typography sx={{ fontSize: 12, fontWeight: 800, mb: 0.4, px: 0.4 }}>{cell.dayNumber}</Typography>
                          <Stack spacing={0.4}>
                            {previewItems.map((item) => {
                              const tone = getScheduleColor(item);
                              return (
                                <Box
                                  key={item.id}
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    try {
                                      const found = await fetchStaffBoardPostApi("SCHEDULE", item.id);
                                      setDetail(found);
                                    } catch {
                                      setDetail(item);
                                    }
                                  }}
                                  sx={{
                                    px: 0.45,
                                    py: 0.2,
                                    fontSize: 11,
                                    fontWeight: item.postType === "공지" ? 800 : 500,
                                    color: tone.barText,
                                    bgcolor: tone.barBg,
                                    borderRadius: 6,
                                    cursor: "pointer",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {item.postType === "공지" ? `[공지] ${item.title}` : item.title}
                                </Box>
                              );
                            })}
                            {remain > 0 ? (
                              <Typography sx={{ fontSize: 11, color: "var(--muted)" }}>+ {remain}건 더 있음</Typography>
                            ) : null}
                          </Stack>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>

                <Card sx={{ width: { xs: "100%", lg: 360 }, border: "1px solid var(--line)", borderRadius: 2, bgcolor: "#fff" }}>
                  <CardContent sx={{ p: 1.5 }}>
                    <Typography sx={{ fontWeight: 900, fontSize: 16, mb: 0.75 }}>
                      {selectedDateKey || "날짜 선택"}
                    </Typography>
                    <Stack spacing={0.75}>
                      {selectedDateItems.length ? (
                        selectedDateItems.map((item) => {
                          const parsed = parseScheduleContent(item);
                          const rangeText = formatScheduleRange(parsed.startDate || item.eventDate || "", parsed.endDate || item.eventDate || "");
                          return (
                            <Box
                              key={`selected-${item.id}`}
                              onClick={async () => {
                                try {
                                  const found = await fetchStaffBoardPostApi("SCHEDULE", item.id);
                                  setDetail(found);
                                } catch {
                                  setDetail(item);
                                }
                              }}
                              sx={{
                                border: "1px solid var(--line)",
                                borderRadius: 1.5,
                                p: 1,
                                cursor: "pointer",
                                bgcolor: item.postType === "공지" ? "rgba(36,74,117,0.06)" : "#fff",
                              }}
                            >
                              <Typography sx={{ fontSize: 13, fontWeight: 800 }}>
                                {item.postType === "공지" ? `[공지] ${item.title}` : item.title}
                              </Typography>
                              <Typography sx={{ mt: 0.25, color: "var(--muted)", fontSize: 12 }}>
                                {rangeText} · {item.location || "장소 미정"}
                              </Typography>
                            </Box>
                          );
                        })
                      ) : (
                        <Typography sx={{ color: "var(--muted)", fontSize: 13, py: 1.5 }}>
                          선택한 날짜의 일정이 없습니다.
                        </Typography>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Stack>
            </CardContent>
          </Card>
        ) : null}

        {viewMode === "BOARD" ? visibleItems.map((item) => {
          const parsed = parseScheduleContent(item);
          const rangeText = formatScheduleRange(parsed.startDate || item.eventDate || "", parsed.endDate || item.eventDate || "");
          return (
          <Card key={item.id} onClick={async () => {
            try {
              const found = await fetchStaffBoardPostApi("SCHEDULE", item.id);
              setDetail(found);
            } catch {
              setDetail(item);
            }
          }} sx={{
            borderRadius: 2,
            border: item.postType === "공지" ? "2px solid #1a446d" : "1px solid var(--line)",
            cursor: "pointer",
            bgcolor: item.postType === "공지" ? "#244a75" : "#fff",
            boxShadow: item.postType === "공지" ? "0 8px 18px rgba(17,61,99,0.18)" : "none",
          }}>
            <CardContent sx={{ py: 1.25, px: 1.75, "&:last-child": { pb: 1.25 } }}>
              <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1.25}>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography sx={{ fontWeight: item.postType === "공지" ? 900 : 800, fontSize: 20, color: item.postType === "공지" ? "#f8fbff" : "inherit" }}>
                    {item.postType === "공지" ? `[공지] ${item.title}` : item.title}
                  </Typography>
                  <Typography sx={{ color: item.postType === "공지" ? "rgba(248,251,255,0.82)" : "var(--muted)", fontSize: 12, mt: 0.25, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {parsed.body || "(내용 없음)"}
                  </Typography>
                </Box>
                <Stack spacing={0.25} sx={{ minWidth: { xs: "auto", md: 210 }, textAlign: { xs: "left", md: "right" } }}>
                  <Typography sx={{ color: item.postType === "공지" ? "rgba(248,251,255,0.9)" : "var(--muted)", fontSize: 12 }}>
                    일시 {rangeText}
                  </Typography>
                  <Typography sx={{ color: item.postType === "공지" ? "rgba(248,251,255,0.9)" : "var(--muted)", fontSize: 12 }}>
                    작성자 {item.authorName || "-"}
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        );
        }) : null}

        {!loading && !visibleItems.length && viewMode === "BOARD" ? (
          <Typography sx={{ color: "var(--muted)", textAlign: "center", py: 3 }}>
            {errorMessage || "등록된 일정이 없습니다."}
          </Typography>
        ) : null}

        <Stack direction="row" justifyContent="center" sx={{ pt: 1, display: viewMode === "BOARD" ? "flex" : "none" }}>
          <Pagination
            count={pageCount}
            page={page}
            onChange={(_, value) => {
              setPage(value);
            }}
            color="primary"
          />
        </Stack>

        <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
          <DialogTitle>{editingId ? "일정 수정" : "일정 등록"}</DialogTitle>
          <DialogContent sx={{ pt: 1 }}>
            <Stack spacing={1.25} sx={{ mt: 0.5 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={form.isNotice}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm((p) => ({ ...p, isNotice: e.target.checked }))}
                  />
                }
                label="공지로 등록"
              />
              <TextField label="일정명" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} fullWidth />
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
                <TextField
                  type="date"
                  label="시작일"
                  InputLabelProps={{ shrink: true }}
                  value={form.time}
                  onChange={(e) => setForm((p) => ({ ...p, time: e.target.value }))}
                  fullWidth
                />
                <TextField
                  type="date"
                  label="종료일"
                  InputLabelProps={{ shrink: true }}
                  value={form.endDate}
                  onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))}
                  fullWidth
                />
              </Stack>
              <TextField label="장소" value={form.location} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} fullWidth />
              <TextField label="내용" value={form.content} onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))} multiline minRows={3} fullWidth />
              <Box sx={{ border: "1px dashed var(--line)", borderRadius: 2, p: 1.25, bgcolor: "rgba(255,255,255,0.65)" }}>
                <Typography sx={{ fontSize: 12, color: "var(--muted)" }}>미리보기</Typography>
                <Typography sx={{ fontWeight: 800, mt: 0.25 }}>
                  {`[${form.isNotice ? "공지" : "일반"}] ${form.title.trim() || "일정명"}`}
                </Typography>
                <Typography sx={{ color: "var(--muted)", fontSize: 12, mt: 0.25 }}>
                  {`기간: ${formatScheduleRange(normalizeRange(form.time, form.endDate).startDate || "일시", normalizeRange(form.time, form.endDate).endDate || "일시")} · 장소: ${form.location.trim() || "장소"}`}
                </Typography>
                <Typography sx={{ color: "var(--muted)", fontSize: 12, mt: 0.25 }}>
                  {`작성자: ${currentUser?.fullName || currentUser?.username || "작성자"}`}
                </Typography>
                <Typography sx={{ color: "var(--muted)", fontSize: 12, mt: 0.25, whiteSpace: "pre-wrap" }}>
                  {form.content.trim() || "내용을 입력하세요."}
                </Typography>
              </Box>
              {!editingId ? (
                <TextField type="password" label="삭제 비밀번호(4자리 숫자)" value={form.deletePin} onChange={(e) => setForm((p) => ({ ...p, deletePin: e.target.value.replace(/\D/g, "").slice(0, 4) }))} fullWidth inputProps={{ inputMode: "numeric" }} />
              ) : null}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>닫기</Button>
            <Button variant="contained" onClick={() => void submit()}>저장</Button>
          </DialogActions>
        </Dialog>

        <Dialog open={Boolean(detail)} onClose={() => setDetail(null)} fullWidth maxWidth="sm">
          <DialogTitle>일정 상세</DialogTitle>
          <DialogContent sx={{ pt: 1 }}>
            <Stack spacing={1} sx={{ mt: 0.5 }}>
              {detail ? (() => {
                const parsed = parseScheduleContent(detail);
                const rangeText = formatScheduleRange(parsed.startDate || detail.eventDate || "", parsed.endDate || detail.eventDate || "");
                return (
                  <>
                    <Typography sx={{ fontWeight: 800 }}>{detail.title}</Typography>
                    <Typography sx={{ color: "var(--muted)", fontSize: 13 }}>
                      구분 {detail.postType || "일반"} · 작성자 {detail.authorName || "-"}
                    </Typography>
                    <Typography>기간: {rangeText}</Typography>
                    <Typography>장소: {detail.location || "-"}</Typography>
                    <Typography sx={{ whiteSpace: "pre-wrap" }}>{parsed.body || "(메모 없음)"}</Typography>
                  </>
                );
              })() : null}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDetail(null)}>닫기</Button>
            {detail && isOwner(detail) ? (
              <>
                <Button onClick={() => openEdit(detail)}>수정</Button>
                <Button
                  color="error"
                  onClick={() => {
                    setDeletePinInput("");
                    setDeleteOpen(true);
                  }}
                >
                  삭제
                </Button>
              </>
            ) : null}
          </DialogActions>
        </Dialog>

        <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} fullWidth maxWidth="xs">
          <DialogTitle>일정 삭제</DialogTitle>
          <DialogContent sx={{ pt: 1 }}>
            <TextField label="삭제 비밀번호(4자리 숫자)" value={deletePinInput} onChange={(e) => setDeletePinInput(e.target.value.replace(/\D/g, "").slice(0, 4))} fullWidth />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteOpen(false)}>취소</Button>
            <Button color="error" variant="contained" onClick={() => void remove()}>삭제</Button>
          </DialogActions>
        </Dialog>
      </Stack>
    </MainLayout>
  );
}
