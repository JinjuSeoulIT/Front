"use client";

import MainLayout from "@/components/layout/MainLayout";
import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import {
  applyTrainingApi,
  cancelTrainingApi,
  downloadTrainingCertificateApi,
  fetchTrainingEnrollmentMembersApi,
  fetchTrainingItemsApi,
  updateTrainingEnrollmentStatusApi,
} from "@/lib/trainingApi";
import { getSessionUser } from "@/lib/session";

type TrainingItem = {
  id: number;
  date: string;
  title: string;
  category: "필수" | "선택";
  department: string;
  capacity: number;
  enrolled: number;
  completed: number;
  completedByMe: boolean;
};

type TrainingCompletedMember = {
  staffId: string;
  staffName: string;
  status: string;
  reason?: string | null;
  processedBy?: string | null;
  processedAt?: string | null;
};

const DAYS = ["일", "월", "화", "수", "목", "금", "토"];

export default function BoardTrainingPage() {
  const sessionUser = useMemo(() => getSessionUser(), []);
  const isAdmin = (sessionUser?.role || "").toUpperCase() === "ADMIN";
  const [tab, setTab] = useState<"calendar" | "apply" | "complete">("calendar");
  const [items, setItems] = useState<TrainingItem[]>([]);
  const [myAppliedIds, setMyAppliedIds] = useState<number[]>([]);
  const [selectedTraining, setSelectedTraining] = useState<TrainingItem | null>(null);
  const [completeSearchInput, setCompleteSearchInput] = useState("");
  const [completeKeyword, setCompleteKeyword] = useState("");
  const [expandedSessionId, setExpandedSessionId] = useState<number | null>(null);
  const [completedMembersBySession, setCompletedMembersBySession] = useState<Record<number, TrainingCompletedMember[]>>({});
  const [loadingCompletedMembers, setLoadingCompletedMembers] = useState<Record<number, boolean>>({});
  const [memberPageBySession, setMemberPageBySession] = useState<Record<number, number>>({});
  const [memberFilterBySession, setMemberFilterBySession] = useState<Record<number, "ALL" | "COMPLETED" | "NOT_COMPLETED">>({});
  const [memberSearchBySession, setMemberSearchBySession] = useState<Record<number, string>>({});
  const [statusDialog, setStatusDialog] = useState<{
    open: boolean;
    sessionId: number;
    staffId: string;
    staffName: string;
    status: "COMPLETED" | "NOT_COMPLETED";
  }>({
    open: false,
    sessionId: 0,
    staffId: "",
    staffName: "",
    status: "COMPLETED",
  });
  const [statusReason, setStatusReason] = useState("");
  const [selectedDateKey, setSelectedDateKey] = useState("");

  const loadItems = async () => {
    const data = await fetchTrainingItemsApi();
    setItems(
      data.map((d) => ({
        id: d.id,
        date: d.date,
        title: d.title,
        category: d.category,
        department: d.department,
        capacity: d.capacity,
        enrolled: d.enrolled,
        completed: d.completed,
        completedByMe: Boolean(d.completedByMe),
      }))
    );
    setMyAppliedIds(data.filter((d) => d.appliedByMe).map((d) => d.id));
  };

  useEffect(() => {
    void loadItems();
  }, []);

  const month = "2026-02";
  const monthItems = useMemo(() => items.filter((i) => i.date.startsWith(month)), [items]);

  const cells = useMemo(() => {
    const start = new Date(`${month}-01`);
    const startDay = start.getDay();
    const end = new Date(2026, 2, 0).getDate();
    const arr: Array<{ day: number; date: string; trainings: TrainingItem[] } | null> = [];
    for (let i = 0; i < startDay; i += 1) arr.push(null);
    for (let d = 1; d <= end; d += 1) {
      const date = `${month}-${String(d).padStart(2, "0")}`;
      arr.push({ day: d, date, trainings: monthItems.filter((t) => t.date === date) });
    }
    while (arr.length % 7 !== 0) arr.push(null);
    return arr;
  }, [month, monthItems]);

  useEffect(() => {
    if (!selectedDateKey || !selectedDateKey.startsWith(month)) {
      setSelectedDateKey(monthItems[0]?.date || `${month}-01`);
      return;
    }
    const exists = cells.some((cell) => cell?.date === selectedDateKey);
    if (!exists) {
      setSelectedDateKey(monthItems[0]?.date || `${month}-01`);
    }
  }, [cells, month, monthItems, selectedDateKey]);

  const selectedDateTrainings = useMemo(() => {
    const weight = (category: "필수" | "선택") => (category === "필수" ? 0 : 1);
    return monthItems
      .filter((item) => item.date === selectedDateKey)
      .slice()
      .sort((a, b) => {
        const w = weight(a.category) - weight(b.category);
        if (w !== 0) return w;
        return a.title.localeCompare(b.title, "ko");
      });
  }, [monthItems, selectedDateKey]);

  const apply = (id: number) => {
    void (async () => {
      await applyTrainingApi(id);
      await loadItems();
    })();
  };

  const cancel = (id: number) => {
    void (async () => {
      await cancelTrainingApi(id);
      await loadItems();
    })();
  };

  const downloadCertificate = (item: TrainingItem) => {
    void (async () => {
      try {
        const blob = await downloadTrainingCertificateApi(item.id);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `training-certificate-${item.id}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } catch (error) {
        window.alert(error instanceof Error ? error.message : "수료증 발급에 실패했습니다.");
      }
    })();
  };

  const loadCompletedMembers = (sessionId: number) => {
    void (async () => {
      setLoadingCompletedMembers((prev) => ({ ...prev, [sessionId]: true }));
      try {
        const members = await fetchTrainingEnrollmentMembersApi(sessionId);
        setCompletedMembersBySession((prev) => ({ ...prev, [sessionId]: members }));
        setMemberPageBySession((prev) => ({ ...prev, [sessionId]: 1 }));
        setMemberFilterBySession((prev) => ({ ...prev, [sessionId]: "ALL" }));
        setMemberSearchBySession((prev) => ({ ...prev, [sessionId]: "" }));
      } catch (error) {
        window.alert(error instanceof Error ? error.message : "이수자 목록 조회에 실패했습니다.");
      } finally {
        setLoadingCompletedMembers((prev) => ({ ...prev, [sessionId]: false }));
      }
    })();
  };

  const toggleSessionCard = (sessionId: number) => {
    if (!isAdmin) return;
    setExpandedSessionId((prev) => (prev === sessionId ? null : sessionId));
    if (!completedMembersBySession[sessionId] && !loadingCompletedMembers[sessionId]) {
      loadCompletedMembers(sessionId);
    }
  };

  const openStatusDialog = (
    sessionId: number,
    staffId: string,
    staffName: string,
    status: "COMPLETED" | "NOT_COMPLETED"
  ) => {
    setStatusDialog({ open: true, sessionId, staffId, staffName, status });
    setStatusReason("");
  };

  const submitStatusDialog = () => {
    if (!statusReason.trim()) {
      window.alert("처리 사유를 입력해 주세요.");
      return;
    }
    void (async () => {
      try {
        await updateTrainingEnrollmentStatusApi(
          statusDialog.sessionId,
          statusDialog.staffId,
          statusDialog.status,
          statusReason.trim()
        );
        const members = await fetchTrainingEnrollmentMembersApi(statusDialog.sessionId);
        setCompletedMembersBySession((prev) => ({ ...prev, [statusDialog.sessionId]: members }));
        setMemberPageBySession((prev) => {
          const maxPage = Math.max(1, Math.ceil(members.length / 10));
          const current = prev[statusDialog.sessionId] || 1;
          return { ...prev, [statusDialog.sessionId]: Math.min(current, maxPage) };
        });
        await loadItems();
        setStatusDialog((prev) => ({ ...prev, open: false }));
      } catch (error) {
        window.alert(error instanceof Error ? error.message : "처리 중 오류가 발생했습니다.");
      }
    })();
  };

  const renderAdminMembersPanel = (sessionId: number) => {
    const members = completedMembersBySession[sessionId] || [];
    const filter = memberFilterBySession[sessionId] || "ALL";
    const memberKeyword = (memberSearchBySession[sessionId] || "").trim().toLowerCase();
    const statusFilteredMembers =
      filter === "ALL" ? members : members.filter((m) => m.status === filter);
    const filteredMembers = memberKeyword
      ? statusFilteredMembers.filter(
          (m) =>
            (m.staffName || "").toLowerCase().includes(memberKeyword) ||
            (m.staffId || "").toLowerCase().includes(memberKeyword)
        )
      : statusFilteredMembers;
    const pageSize = 10;
    const totalPages = Math.max(1, Math.ceil(filteredMembers.length / pageSize));
    const currentPage = Math.min(memberPageBySession[sessionId] || 1, totalPages);
    const pageMembers = filteredMembers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    return (
      <>
        <Typography sx={{ fontSize: 12, color: "var(--muted)", mb: 0.5 }}>
          교육 대상/처리 목록 ({filteredMembers.length}명)
        </Typography>
        <Tabs
          value={filter}
          onChange={(_, value: "ALL" | "COMPLETED" | "NOT_COMPLETED") => {
            setMemberFilterBySession((prev) => ({ ...prev, [sessionId]: value }));
            setMemberPageBySession((prev) => ({ ...prev, [sessionId]: 1 }));
          }}
          sx={{ minHeight: 34, mb: 0.8, "& .MuiTab-root": { minHeight: 34, py: 0.2 } }}
        >
          <Tab value="ALL" label="전체" />
          <Tab value="COMPLETED" label="수료" />
          <Tab value="NOT_COMPLETED" label="미수료" />
        </Tabs>
        <TextField
          size="small"
          placeholder="직원명/아이디 검색"
          value={memberSearchBySession[sessionId] || ""}
          onChange={(e) => {
            const v = e.target.value;
            setMemberSearchBySession((prev) => ({ ...prev, [sessionId]: v }));
            setMemberPageBySession((prev) => ({ ...prev, [sessionId]: 1 }));
          }}
          sx={{ mb: 0.8, width: { xs: "100%", md: 300 } }}
        />
        <Stack spacing={0.75}>
          {pageMembers.length ? (
            pageMembers.map((m) => (
              <Stack
                key={`${sessionId}-${m.staffId}`}
                direction={{ xs: "column", md: "row" }}
                spacing={1}
                alignItems={{ xs: "flex-start", md: "center" }}
                justifyContent="space-between"
                sx={{ border: "1px solid var(--line)", borderRadius: 1, p: 0.75, bgcolor: "#fff" }}
              >
                <Stack spacing={0.25}>
                  <Typography sx={{ fontSize: 13, fontWeight: 700 }}>
                    {m.staffName} ({m.staffId})
                  </Typography>
                  {m.reason ? <Typography sx={{ fontSize: 12, color: "var(--muted)" }}>사유: {m.reason}</Typography> : null}
                </Stack>
                <Stack direction="row" spacing={0.75}>
                  <Button
                    size="small"
                    variant="outlined"
                    disabled={m.status === "COMPLETED"}
                    onClick={() => openStatusDialog(sessionId, m.staffId, m.staffName, "COMPLETED")}
                  >
                    수료처리
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="warning"
                    disabled={m.status === "NOT_COMPLETED"}
                    onClick={() => openStatusDialog(sessionId, m.staffId, m.staffName, "NOT_COMPLETED")}
                  >
                    미수료처리
                  </Button>
                </Stack>
              </Stack>
            ))
          ) : (
            <Typography sx={{ fontSize: 12, color: "var(--muted)" }}>이수자 없음</Typography>
          )}
        </Stack>
        {filteredMembers.length > 10 ? (
          <Stack direction="row" justifyContent="center" alignItems="center" spacing={0.75} sx={{ mt: 1.1 }}>
            <Button
              size="small"
              variant="outlined"
              disabled={currentPage <= 1}
              onClick={() =>
                setMemberPageBySession((prev) => ({
                  ...prev,
                  [sessionId]: Math.max(1, (prev[sessionId] || 1) - 5),
                }))
              }
            >
              &laquo;
            </Button>
            <Typography sx={{ fontSize: 12, color: "var(--muted)", minWidth: 44, textAlign: "center" }}>
              {currentPage}/{totalPages}
            </Typography>
            <Button
              size="small"
              variant="outlined"
              disabled={currentPage >= totalPages}
              onClick={() =>
                setMemberPageBySession((prev) => ({
                  ...prev,
                  [sessionId]: Math.min(totalPages, (prev[sessionId] || 1) + 5),
                }))
              }
            >
              &raquo;
            </Button>
          </Stack>
        ) : null}
      </>
    );
  };

  const selectedLive = selectedTraining ? items.find((v) => v.id === selectedTraining.id) || selectedTraining : null;
  const completeItems = useMemo(() => {
    if (isAdmin) return items;
    return items.filter((i) => i.completedByMe || myAppliedIds.includes(i.id));
  }, [isAdmin, items, myAppliedIds]);
  const filteredCompleteItems = useMemo(() => {
    const q = completeKeyword.trim().toLowerCase();
    if (!q) return completeItems;
    return completeItems.filter((i) => i.title.toLowerCase().includes(q));
  }, [completeItems, completeKeyword]);

  return (
    <MainLayout>
      <Stack spacing={2.2}>
          <Typography sx={{ fontSize: 24, fontWeight: 900 }}>교육/이수</Typography>

        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="교육 캘린더" value="calendar" />
          <Tab label="수강 신청/취소" value="apply" />
          <Tab label="이수 체크" value="complete" />
        </Tabs>

        {tab === "calendar" ? (
          <Card sx={{ border: "1px solid var(--line)" }}>
            <CardContent>
              <Stack spacing={1.2}>
                <Typography sx={{ fontWeight: 800 }}>{month} 교육 캘린더</Typography>
                <Box sx={{ display: "flex", flexDirection: { xs: "column", lg: "row" }, gap: 1.2, alignItems: "stretch" }}>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: 0.8 }}>
                      {DAYS.map((d) => (
                        <Typography key={d} sx={{ fontSize: 12, color: "var(--muted)", fontWeight: 700, textAlign: "center" }}>{d}</Typography>
                      ))}
                      {cells.map((cell, idx) => (
                        <Card
                          key={idx}
                          variant="outlined"
                          onClick={() => cell && setSelectedDateKey(cell.date)}
                          sx={{
                            minHeight: 92,
                            p: 0.7,
                            cursor: cell ? "pointer" : "default",
                            bgcolor: cell ? "#fff" : "rgba(148,163,184,0.06)",
                            borderColor: cell?.date === selectedDateKey ? "var(--brand)" : "var(--line)",
                            borderWidth: cell?.date === selectedDateKey ? 2 : 1,
                          }}
                        >
                          {cell ? (
                            <Stack spacing={0.5}>
                              <Typography sx={{ fontSize: 12, fontWeight: 800 }}>{cell.day}</Typography>
                              {cell.trainings.slice(0, 2).map((t) => (
                                <Chip
                                  key={t.id}
                                  size="small"
                                  label={`${t.category} ${t.title}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedTraining(t);
                                  }}
                                />
                              ))}
                              {cell.trainings.length > 2 ? (
                                <Typography sx={{ fontSize: 11, color: "var(--muted)" }}>
                                  + {cell.trainings.length - 2}건 더 있음
                                </Typography>
                              ) : null}
                            </Stack>
                          ) : null}
                        </Card>
                      ))}
                    </Box>
                  </Box>

                  <Card
                    sx={{
                      width: { xs: "100%", lg: 320 },
                      border: "1px solid var(--line)",
                      borderRadius: 2,
                      bgcolor: "#fff",
                      maxHeight: { xs: 320, lg: 560 },
                      overflow: "hidden",
                    }}
                  >
                    <CardContent sx={{ p: 1.5, height: "100%", overflowY: "auto" }}>
                      <Typography sx={{ fontWeight: 900, fontSize: 16, mb: 0.75 }}>
                        {selectedDateKey || "날짜 선택"}
                      </Typography>
                      <Divider sx={{ mb: 1 }} />
                      <Stack spacing={0.8}>
                        {selectedDateTrainings.length ? (
                          selectedDateTrainings.map((item) => (
                            <Card
                              key={item.id}
                              variant="outlined"
                              onClick={() => setSelectedTraining(item)}
                              sx={{ p: 0.9, cursor: "pointer", borderColor: "var(--line)", "&:hover": { borderColor: "var(--brand)" } }}
                            >
                              <Stack spacing={0.35}>
                                <Stack direction="row" spacing={0.6} alignItems="center">
                                  <Chip size="small" label={item.category} color={item.category === "필수" ? "error" : "default"} />
                                  <Typography sx={{ fontSize: 12, color: "var(--muted)" }}>
                                    {item.enrolled}/{item.capacity}
                                  </Typography>
                                </Stack>
                                <Typography sx={{ fontSize: 13, fontWeight: 700 }}>{item.title}</Typography>
                                <Typography sx={{ fontSize: 12, color: "var(--muted)" }}>{item.department}</Typography>
                              </Stack>
                            </Card>
                          ))
                        ) : (
                          <Typography sx={{ fontSize: 12, color: "var(--muted)" }}>
                            선택한 날짜의 교육이 없습니다.
                          </Typography>
                        )}
                      </Stack>
                    </CardContent>
                  </Card>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        ) : null}

        {tab === "apply" ? (
          <Card sx={{ border: "1px solid var(--line)" }}>
            <CardContent>
              <Stack spacing={1.2}>
                <Typography sx={{ fontWeight: 800 }}>수강 신청/취소</Typography>
                {items.map((i) => {
                  const applied = myAppliedIds.includes(i.id);
                  const full = i.enrolled >= i.capacity;
                  return (
                    <Card key={i.id} variant="outlined">
                      <CardContent>
                        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1}>
                          <Stack spacing={0.4}>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Typography sx={{ fontWeight: 800, cursor: "pointer" }} onClick={() => setSelectedTraining(i)}>{i.title}</Typography>
                              <Chip size="small" label={i.category} color={i.category === "필수" ? "error" : "default"} />
                            </Stack>
                            <Typography sx={{ fontSize: 13, color: "var(--muted)" }}>{i.date} · {i.department} · {i.enrolled}/{i.capacity}</Typography>
                          </Stack>
                          {applied ? (
                            <Button color="inherit" variant="outlined" onClick={() => cancel(i.id)}>신청 취소</Button>
                          ) : (
                            <Button variant="contained" disabled={full} onClick={() => apply(i.id)}>{full ? "정원 마감" : "신청"}</Button>
                          )}
                        </Stack>
                      </CardContent>
                    </Card>
                  );
                })}
              </Stack>
            </CardContent>
          </Card>
        ) : null}

        {tab === "complete" ? (
          <Card sx={{ border: "1px solid var(--line)" }}>
            <CardContent>
              <Stack spacing={1.2}>
                <Typography sx={{ fontWeight: 800 }}>이수 체크</Typography>
                <Typography sx={{ fontSize: 12, color: "var(--muted)" }}>
                  {isAdmin ? "관리자 화면: 교육별 이수 처리와 이수자 조회를 지원합니다." : "내가 이수한 교육 내역과 수료증 발급만 제공합니다."}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                  <TextField
                    size="small"
                    placeholder="교육명 검색"
                    value={completeSearchInput}
                    onChange={(e) => setCompleteSearchInput(e.target.value)}
                    sx={{ width: { xs: "100%", md: 360 } }}
                  />
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => setCompleteKeyword(completeSearchInput.trim())}
                  >
                    검색
                  </Button>
                </Stack>
                <Divider />
                {filteredCompleteItems.map((i) => (
                  <Card
                    key={i.id}
                    variant="outlined"
                    onClick={() => toggleSessionCard(i.id)}
                    sx={{ cursor: isAdmin ? "pointer" : "default" }}
                  >
                    <CardContent>
                      <Stack spacing={0.8}>
                        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1}>
                          <Typography>{`${i.title} (${i.date})`}</Typography>
                          <Stack direction="row" spacing={1}>
                            <Button
                              size="small"
                              variant="contained"
                              disabled={!i.completedByMe}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (i.completedByMe) downloadCertificate(i);
                              }}
                            >
                              수료증 PDF 발급
                            </Button>
                          </Stack>
                        </Stack>
                        {isAdmin && expandedSessionId === i.id ? (
                          <Box sx={{ border: "1px solid var(--line)", borderRadius: 1.5, p: 1, bgcolor: "rgba(248,250,252,0.8)" }}>
                            {loadingCompletedMembers[i.id] && !completedMembersBySession[i.id] ? (
                              <Typography sx={{ fontSize: 12, color: "var(--muted)" }}>대상 목록 불러오는 중...</Typography>
                            ) : null}
                            {completedMembersBySession[i.id] ? renderAdminMembersPanel(i.id) : null}
                          </Box>
                        ) : null}
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
                {!filteredCompleteItems.length ? (
                  <Typography sx={{ fontSize: 12, color: "var(--muted)" }}>
                    {completeKeyword ? "검색 결과가 없습니다." : isAdmin ? "등록된 교육이 없습니다." : "내 이수 내역이 없습니다."}
                  </Typography>
                ) : null}
              </Stack>
            </CardContent>
          </Card>
        ) : null}

        <Card sx={{ border: "1px solid var(--line)" }}>
          <CardContent>
            <Typography sx={{ color: "var(--muted)", fontSize: 12 }}>
              초안 상태입니다. 다음 단계로는 교육 상세 모달(강사/장소/교육자료), 이수자 목록, 수료증 PDF 발급 흐름을 연결하면 됩니다.
            </Typography>
          </CardContent>
        </Card>
      </Stack>

      <Dialog open={!!selectedLive} onClose={() => setSelectedTraining(null)} maxWidth="sm" fullWidth>
        <DialogTitle>교육 상세</DialogTitle>
        <DialogContent dividers>
          {selectedLive ? (
            <Stack spacing={1.1}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography sx={{ fontWeight: 900 }}>{selectedLive.title}</Typography>
                <Chip size="small" label={selectedLive.category} color={selectedLive.category === "필수" ? "error" : "default"} />
              </Stack>
              <Typography sx={{ fontSize: 13, color: "var(--muted)" }}>일정 {selectedLive.date}</Typography>
              <Typography sx={{ fontSize: 13, color: "var(--muted)" }}>대상 {selectedLive.department}</Typography>
              <Typography sx={{ fontSize: 13, color: "var(--muted)" }}>신청 현황 {selectedLive.enrolled}/{selectedLive.capacity}</Typography>
              <Divider />
              <Typography sx={{ fontSize: 13 }}>
                교육 목적: 의료진 공통 업무 표준과 환자 안전 프로토콜을 강화하기 위한 실무 중심 교육입니다.
              </Typography>
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions>
          {selectedLive ? (
            myAppliedIds.includes(selectedLive.id) ? (
              <Button variant="outlined" color="inherit" onClick={() => cancel(selectedLive.id)}>신청 취소</Button>
            ) : (
              <Button
                variant="contained"
                disabled={selectedLive.enrolled >= selectedLive.capacity}
                onClick={() => apply(selectedLive.id)}
              >
                {selectedLive.enrolled >= selectedLive.capacity ? "정원 마감" : "수강 신청"}
              </Button>
            )
          ) : null}
          <Button onClick={() => setSelectedTraining(null)}>닫기</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={statusDialog.open}
        onClose={() => setStatusDialog((prev) => ({ ...prev, open: false }))}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>{statusDialog.status === "COMPLETED" ? "수료 처리" : "미수료 처리"}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1}>
            <Typography sx={{ fontSize: 13 }}>
              대상: {statusDialog.staffName} ({statusDialog.staffId})
            </Typography>
            <TextField
              label="처리 사유"
              value={statusReason}
              onChange={(e) => setStatusReason(e.target.value)}
              multiline
              minRows={3}
              placeholder={statusDialog.status === "COMPLETED" ? "수료 처리 사유를 입력하세요." : "미수료 처리 사유를 입력하세요."}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialog((prev) => ({ ...prev, open: false }))}>취소</Button>
          <Button variant="contained" onClick={submitStatusDialog}>저장</Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
}
