"use client";

import * as React from "react";
import MainLayout from "@/components/layout/MainLayout";
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Pagination,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { getSessionUser } from "@/lib/session";
import {
  createCommonDocApi,
  downloadCommonDocAttachmentApi,
  deleteCommonDocApi,
  fetchCommonDocApi,
  fetchCommonDocPageApi,
  updateCommonDocApi,
  type CommonDoc,
} from "@/lib/commonDocsApi";

const PAGE_SIZE = 10;
const DEFAULT_MEETING_NAMES = ["정기이사회", "임시이사회", "분과위원회", "간호간병동합서비스병동위원회"];

export default function BoardMeetingsPage() {
  const user = React.useMemo(() => getSessionUser(), []);

  const [items, setItems] = React.useState<CommonDoc[]>([]);
  const [keyword, setKeyword] = React.useState("");
  const [searchInput, setSearchInput] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [pageCount, setPageCount] = React.useState(1);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [meetingCatalog, setMeetingCatalog] = React.useState<Array<{ name: string; maxRound: number; nextRound: number }>>([]);
  const [meetingDefinitions, setMeetingDefinitions] = React.useState<CommonDoc[]>([]);
  const [seriesDialogOpen, setSeriesDialogOpen] = React.useState(false);
  const [seriesNameInput, setSeriesNameInput] = React.useState("");
  const [seriesEditing, setSeriesEditing] = React.useState<CommonDoc | null>(null);

  const [open, setOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [detail, setDetail] = React.useState<CommonDoc | null>(null);

  const [form, setForm] = React.useState({
    round: "",
    titleSuffix: "",
    content: "",
    attachmentFileName: "",
    attachmentMimeType: "",
    attachmentBase64: "",
  });

  const latestMeeting = React.useMemo(() => {
    if (!meetingCatalog.length) return null;
    return meetingCatalog.reduce((acc, cur) => (cur.maxRound > acc.maxRound ? cur : acc), meetingCatalog[0]);
  }, [meetingCatalog]);

  const calcNextRound = React.useCallback((rounds: number[]) => {
    if (!rounds.length) return 1;
    const set = new Set(rounds.filter((v) => Number.isFinite(v) && v > 0));
    let n = 1;
    while (set.has(n)) n += 1;
    return n;
  }, []);

  const buildTitle = React.useCallback((round: string, suffix: string) => {
    const n = round.trim();
    const base = n ? `${n}차 회의록` : "회의록";
    const s = suffix.trim();
    return s ? `${base} - ${s}` : base;
  }, []);

  const parseRoundFromTitle = React.useCallback((title: string) => {
    const m = title.match(/^(\d+)차\s*회의록/);
    return m?.[1] || "";
  }, []);

  const parseSuffixFromTitle = React.useCallback((title: string) => {
    const idx = title.indexOf("-");
    if (idx < 0) return "";
    return title.slice(idx + 1).trim();
  }, []);

  const buildMeetingCatalog = React.useCallback((docs: CommonDoc[]) => {
    const maxByName = new Map<string, number>();
    for (const doc of docs) {
      const name = parseSuffixFromTitle(doc.title || "");
      if (!name) continue;
      const round = Number(parseRoundFromTitle(doc.title || "") || "0");
      const prev = maxByName.get(name) ?? 0;
      maxByName.set(name, Math.max(prev, round));
    }
    return Array.from(maxByName.entries())
      .map(([name, maxRound]) => ({ name, maxRound }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [parseRoundFromTitle, parseSuffixFromTitle]);

  const loadMeetingCatalog = React.useCallback(async () => {
    try {
      const minutesResult = await fetchCommonDocPageApi(0, 500, "", "ALL", "회의록");
      const rounds = buildMeetingCatalog(minutesResult.items || []);
      const roundMap = new Map<string, number>(rounds.map((v) => [v.name, v.maxRound]));
      const roundsByName = new Map<string, number[]>();
      for (const doc of minutesResult.items || []) {
        const name = parseSuffixFromTitle(doc.title || "");
        if (!name) continue;
        const round = Number(parseRoundFromTitle(doc.title || "") || "0");
        if (!Number.isFinite(round) || round <= 0) continue;
        const prev = roundsByName.get(name) || [];
        prev.push(round);
        roundsByName.set(name, prev);
      }

      let defs: CommonDoc[] = [];
      try {
        const defsResult = await fetchCommonDocPageApi(0, 200, "", "ALL", "회의정의");
        defs = defsResult.items || [];
      } catch {
        defs = [];
      }

      const names = Array.from(
        new Set([
          ...DEFAULT_MEETING_NAMES,
          ...defs.map((d) => d.title || "").filter(Boolean),
          ...rounds.map((r) => r.name || "").filter(Boolean),
        ])
      );

      setMeetingDefinitions(defs);
      setMeetingCatalog(
        names
          .map((name) => ({
            name,
            maxRound: roundMap.get(name) || 0,
            nextRound: calcNextRound(roundsByName.get(name) || []),
          }))
          .filter((v) => !!v.name)
          .sort((a, b) => a.name.localeCompare(b.name))
      );
    } catch {
      setMeetingDefinitions([]);
      setMeetingCatalog(DEFAULT_MEETING_NAMES.map((name) => ({ name, maxRound: 0, nextRound: 1 })));
    }
  }, [buildMeetingCatalog, calcNextRound, parseRoundFromTitle, parseSuffixFromTitle]);

  const loadPage = React.useCallback(async (nextPage: number, nextKeyword: string) => {
    try {
      const result = await fetchCommonDocPageApi(nextPage - 1, PAGE_SIZE, nextKeyword, "ALL", "회의록");
      setItems(result.items || []);
      setPage(result.page + 1);
      setPageCount(Math.max(1, result.totalPages || 1));
      setErrorMessage(null);
    } catch (error) {
      setItems([]);
      setPageCount(1);
      setErrorMessage(error instanceof Error ? error.message : "회의록을 불러오지 못했습니다.");
    }
  }, []);

  React.useEffect(() => {
    void loadPage(1, "");
  }, [loadPage]);

  React.useEffect(() => {
    void loadMeetingCatalog();
  }, [loadMeetingCatalog]);

  const isOwner = React.useCallback((item: CommonDoc) => (item.authorId || "") === (user?.username || ""), [user?.username]);

  const openCreate = () => {
    setEditingId(null);
    const first = latestMeeting;
    setForm({
      round: first ? String(first.nextRound) : "",
      titleSuffix: first?.name || "",
      content: "",
      attachmentFileName: "",
      attachmentMimeType: "",
      attachmentBase64: "",
    });
    setOpen(true);
  };

  const saveSeries = async () => {
    const name = seriesNameInput.trim();
    if (!name) return;
    try {
      if (seriesEditing) {
        await updateCommonDocApi(seriesEditing.id, {
          category: "회의정의",
          title: name,
          content: seriesEditing.content || "",
          authorId: user?.username || "",
          authorName: user?.fullName || user?.username || "작성자",
        });
      } else {
        await createCommonDocApi({
          category: "회의정의",
          title: name,
          content: "",
          authorId: user?.username || "",
          authorName: user?.fullName || user?.username || "작성자",
        });
      }
      setSeriesNameInput("");
      setSeriesEditing(null);
      await loadMeetingCatalog();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "회의 정의 저장 실패");
    }
  };

  const removeSeries = async (doc: CommonDoc) => {
    if (!window.confirm(`'${doc.title}' 회의를 삭제하시겠습니까?`)) return;
    try {
      await deleteCommonDocApi(doc.id);
      if (form.titleSuffix === doc.title) {
        setForm((p) => ({ ...p, titleSuffix: "", round: "" }));
      }
      await loadMeetingCatalog();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "회의 정의 삭제 실패");
    }
  };

  const openEdit = (item: CommonDoc) => {
    if (!isOwner(item)) return;
    setEditingId(item.id);
    setForm({
      round: parseRoundFromTitle(item.title || ""),
      titleSuffix: parseSuffixFromTitle(item.title || ""),
      content: item.content || "",
      attachmentFileName: item.attachmentFileName || "",
      attachmentMimeType: item.attachmentMimeType || "",
      attachmentBase64: "",
    });
    setOpen(true);
  };

  const submit = async () => {
    if (!form.round.trim()) return window.alert("몇 차 회의인지 입력해 주세요.");
    if (!form.titleSuffix.trim()) return window.alert("회의를 선택해 주세요.");
    const title = buildTitle(form.round, form.titleSuffix);
    if (!title.trim()) return;

    const body = form.content.trim();

    const req = {
      category: "회의록",
      title,
      content: body,
      attachmentFileName: form.attachmentFileName || undefined,
      attachmentMimeType: form.attachmentMimeType || undefined,
      attachmentBase64: form.attachmentBase64 || undefined,
      authorId: user?.username || "",
      authorName: user?.fullName || user?.username || "작성자",
    };

    try {
      if (editingId) await updateCommonDocApi(editingId, req);
      else await createCommonDocApi(req);
      setOpen(false);
      setDetail(null);
      await loadPage(editingId ? page : 1, keyword);
      await loadMeetingCatalog();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "회의록 저장 실패");
    }
  };

  const remove = async () => {
    if (!detail || !isOwner(detail)) return;
    if (!window.confirm("회의록을 삭제하시겠습니까?")) return;
    await deleteCommonDocApi(detail.id);
    setDetail(null);
    await loadPage(page, keyword);
  };

  const openDetail = async (item: CommonDoc) => {
    try {
      setDetail(await fetchCommonDocApi(item.id));
    } catch {
      setDetail(item);
    }
  };

  const downloadAttachment = async (item: CommonDoc) => {
    try {
      const blob = await downloadCommonDocAttachmentApi(item.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = item.attachmentFileName || `meeting-attachment-${item.id}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      const refreshed = await fetchCommonDocApi(item.id);
      setDetail(refreshed);
      setItems((prev) => prev.map((v) => (v.id === refreshed.id ? { ...v, attachmentDownloadCount: refreshed.attachmentDownloadCount } : v)));
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "첨부 다운로드 실패");
    }
  };

  return (
    <MainLayout>
      <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography sx={{ fontSize: 24, fontWeight: 900 }}>회의/위원회</Typography>
              <Typography sx={{ color: "var(--muted)", mt: 0.5 }}>N차 회의록과 회의 관련 첨부파일을 업로드/보관합니다.</Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" onClick={() => setSeriesDialogOpen(true)}>회의 관리</Button>
              <Button variant="contained" onClick={openCreate}>회의록 등록</Button>
            </Stack>
          </Stack>

          <Stack direction="row" spacing={1}>
            <TextField
              size="small"
              placeholder="회의록 제목/내용 검색"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              sx={{ width: { xs: "100%", md: 420 } }}
            />
            <Button
              variant="outlined"
              onClick={async () => {
                const q = searchInput.trim();
                setKeyword(q);
                await loadPage(1, q);
              }}
            >
              검색
            </Button>
          </Stack>

          <Card sx={{ border: "1px solid var(--line)", bgcolor: "rgba(255,255,255,0.72)" }}>
            <CardContent sx={{ py: 0.9, "&:last-child": { pb: 0.9 } }}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "72px 1fr 120px 120px",
                  alignItems: "center",
                  columnGap: 1,
                }}
              >
                <Typography sx={{ fontSize: 13, color: "var(--muted)", fontWeight: 900, textAlign: "center" }}>번호</Typography>
                <Typography sx={{ fontSize: 13, color: "var(--muted)", fontWeight: 900, textAlign: "center" }}>제목</Typography>
                <Typography sx={{ fontSize: 13, color: "var(--muted)", fontWeight: 900, textAlign: "center" }}>작성자</Typography>
                <Typography sx={{ fontSize: 13, color: "var(--muted)", fontWeight: 900, textAlign: "center" }}>작성일</Typography>
              </Box>
            </CardContent>
          </Card>

          {items.map((doc) => (
            <Card key={doc.id} onClick={() => void openDetail(doc)} sx={{ border: "1px solid var(--line)", cursor: "pointer" }}>
              <CardContent sx={{ py: 1.25, "&:last-child": { pb: 1.25 } }}>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "72px 1fr 120px 120px",
                    alignItems: "center",
                    columnGap: 1,
                  }}
                >
                  <Typography sx={{ fontSize: 13, color: "var(--muted)", textAlign: "center" }}>{doc.id}</Typography>
                  <Typography sx={{ fontWeight: 500, textAlign: "left", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {doc.title}
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: "var(--muted)", textAlign: "center" }}>
                    {doc.authorName || "-"}
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: "var(--muted)", textAlign: "center" }}>
                    {(doc.createdAt || "-").slice(0, 10).replace(/-/g, "/")}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ))}

          {!items.length ? (
            <Typography sx={{ color: "var(--muted)", textAlign: "center", py: 3 }}>
              {errorMessage || "등록된 회의록이 없습니다."}
            </Typography>
          ) : null}

          <Stack direction="row" justifyContent="center" sx={{ pt: 0.5 }}>
            <Pagination count={pageCount} page={page} onChange={(_, value) => void loadPage(value, keyword)} color="primary" />
          </Stack>
      </Stack>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editingId ? "회의록 수정" : "회의록 등록"}</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={1.25} sx={{ mt: 0.5 }}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              <TextField
                select
                SelectProps={{ native: true }}
                label="회의 선택"
                value={form.titleSuffix}
                onChange={(e) => {
                  const name = e.target.value;
                  const selected = meetingCatalog.find((m) => m.name === name);
                  setForm((p) => ({
                    ...p,
                    titleSuffix: name,
                    round: editingId ? p.round : selected ? String(selected.nextRound) : p.round,
                  }));
                }}
                fullWidth
                helperText={
                  editingId
                    ? "수정 시 회의명을 변경할 수 있습니다."
                    : "선택한 회의의 비어 있는 가장 작은 차수로 자동 등록됩니다."
                }
              >
                <option value="">선택</option>
                {meetingCatalog.map((m) => (
                  <option key={m.name} value={m.name}>{m.name}</option>
                ))}
                {form.titleSuffix && !meetingCatalog.find((m) => m.name === form.titleSuffix) ? (
                  <option value={form.titleSuffix}>{form.titleSuffix}</option>
                ) : null}
              </TextField>
            </Stack>
            <Typography sx={{ fontSize: 12, color: "var(--muted)" }}>
              제목 미리보기: {buildTitle(form.round, form.titleSuffix)}
            </Typography>
            <TextField
              label="회의 내용"
              value={form.content}
              onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
              multiline
              minRows={8}
              fullWidth
            />
            <Button component="label" variant="outlined" sx={{ alignSelf: "flex-start" }}>
              회의 파일 첨부
              <input
                hidden
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => {
                    const raw = String(reader.result || "");
                    const base64 = raw.includes(",") ? raw.split(",")[1] : raw;
                    setForm((p) => ({
                      ...p,
                      attachmentFileName: file.name,
                      attachmentMimeType: file.type || "application/octet-stream",
                      attachmentBase64: base64,
                    }));
                  };
                  reader.readAsDataURL(file);
                }}
              />
            </Button>
            <Typography sx={{ fontSize: 12, color: "var(--muted)" }}>
              {form.attachmentFileName || "첨부 없음"}
            </Typography>

            <Card variant="outlined" sx={{ borderRadius: 1.5, bgcolor: "rgba(255,255,255,0.82)" }}>
              <CardContent sx={{ py: 1.2, "&:last-child": { pb: 1.2 } }}>
                <Typography sx={{ fontSize: 12, color: "var(--muted)", mb: 0.6 }}>미리보기</Typography>
                <Typography sx={{ fontSize: 16, fontWeight: 700 }}>
                  {buildTitle(form.round, form.titleSuffix)}
                </Typography>
                <Typography sx={{ fontSize: 12, color: "var(--muted)", mt: 0.5 }}>
                  작성자 {user?.fullName || user?.username || "-"}
                </Typography>
                <Typography sx={{ fontSize: 12, color: "var(--muted)", mt: 0.25 }}>
                  첨부파일 {form.attachmentFileName || "없음"}
                </Typography>
                <Typography sx={{ whiteSpace: "pre-wrap", fontSize: 13, mt: 0.9 }}>
                  {(form.content || "회의 내용을 입력하면 여기에 미리 표시됩니다.").slice(0, 240)}
                  {form.content.length > 240 ? "..." : ""}
                </Typography>
              </CardContent>
            </Card>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>닫기</Button>
          <Button variant="contained" onClick={() => void submit()}>저장</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(detail)} onClose={() => setDetail(null)} fullWidth maxWidth="sm">
        <DialogTitle>회의록 상세</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={1} sx={{ mt: 0.5 }}>
            <Typography sx={{ fontWeight: 800 }}>{detail?.title}</Typography>
            <Card variant="outlined" sx={{ borderRadius: 1.5 }}>
              <CardContent sx={{ py: 1.2, "&:last-child": { pb: 1.2 } }}>
                <Stack spacing={0.6}>
                  <Typography sx={{ fontSize: 13 }}>작성자: {detail?.authorName || "-"}</Typography>
                  <Typography sx={{ fontSize: 13 }}>등록일: {detail?.createdAt || "-"}</Typography>
                  <Typography sx={{ fontSize: 13 }}>
                    첨부파일: {detail?.attachmentFileName || "없음"}
                    {detail?.attachmentFileName ? ` (다운로드: ${detail?.attachmentDownloadCount ?? 0}회)` : ""}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
            <Typography sx={{ whiteSpace: "pre-wrap" }}>{detail?.content || "(내용 없음)"}</Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          {detail?.attachmentFileName ? (
            <Button variant="outlined" onClick={() => void downloadAttachment(detail)}>첨부파일 다운로드</Button>
          ) : null}
          <Button onClick={() => setDetail(null)}>닫기</Button>
          {detail && isOwner(detail) ? (
            <>
              <Button onClick={() => openEdit(detail)}>수정</Button>
              <Button color="error" onClick={() => void remove()}>삭제</Button>
            </>
          ) : null}
        </DialogActions>
      </Dialog>

      <Dialog open={seriesDialogOpen} onClose={() => setSeriesDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>회의 정의 관리</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={1} sx={{ mt: 0.5 }}>
            <Stack direction="row" spacing={1}>
              <TextField
                label="회의명"
                value={seriesNameInput}
                onChange={(e) => setSeriesNameInput(e.target.value)}
                fullWidth
                placeholder="예: 정기이사회"
              />
              <Button variant="contained" onClick={() => void saveSeries()}>
                {seriesEditing ? "수정" : "추가"}
              </Button>
            </Stack>

            {meetingDefinitions.map((doc) => (
              <Card key={doc.id} variant="outlined" sx={{ borderRadius: 1.5 }}>
                <CardContent sx={{ py: 1, "&:last-child": { pb: 1 } }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                    <Typography sx={{ fontWeight: 700 }}>{doc.title}</Typography>
                    <Stack direction="row" spacing={1}>
                      <Button
                        size="small"
                        onClick={() => {
                          setSeriesEditing(doc);
                          setSeriesNameInput(doc.title || "");
                        }}
                      >
                        수정
                      </Button>
                      <Button size="small" color="error" onClick={() => void removeSeries(doc)}>삭제</Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setSeriesDialogOpen(false);
            setSeriesEditing(null);
            setSeriesNameInput("");
          }}>닫기</Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
}
