"use client";

import { useEffect, useState } from "react";
import { Box, Typography, TextField, InputAdornment } from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { fetchPatientMemosApi, createPatientMemoApi, type PatientMemo } from "@/lib/memoApi";

type PatientRecordsPanelProps = {
  patientId?: string | null;
};

function formatMemoDate(s: string | null | undefined): string {
  if (!s) return "";
  const d = new Date(s);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

const SAMPLE_MEMOS: Record<string, PatientMemo[]> = {
  "1": [
    { memoId: 101, patientId: 1, memo: "상시 복용 약물 확인 완료. 혈압약 정기 복용 중.", createdBy: "김메디", createdAt: "2024-02-20T09:15:00" },
    { memoId: 102, patientId: 1, memo: "전달 처방전 발급. 다음 내원 시 금요일 예약 잡아두었음.", createdBy: "접수팀", createdAt: "2024-02-18T14:20:00" },
    { memoId: 103, patientId: 1, memo: "가족력 있음. 당뇨·고혈압 가족력 기록 확인.", createdBy: "박선영", createdAt: "2024-02-15T11:00:00" },
    { memoId: 104, patientId: 1, memo: "무릎 통증 재발 시 물리치료 연계 가능하다고 안내함.", createdBy: "이은솔", createdAt: "2024-02-10T10:30:00" },
  ],
  "2": [
    { memoId: 201, patientId: 2, memo: "고혈압약 복용 중. 오늘 혈압 128/82 측정.", createdBy: "김메디", createdAt: "2024-02-22T08:45:00" },
    { memoId: 202, patientId: 2, memo: "VIP 환자. 접수·진료 시 우선 안내.", createdBy: "관리자", createdAt: "2024-02-01T09:00:00" },
    { memoId: 203, patientId: 2, memo: "다음 내원 시 당화혈색소 재검사 예정.", createdBy: "이은솔", createdAt: "2024-01-28T16:20:00" },
    { memoId: 204, patientId: 2, memo: "알레르기: 페니실린. 처방 시 참고.", createdBy: "간호팀", createdAt: "2024-01-15T11:10:00" },
  ],
  "3": [
    { memoId: 301, patientId: 3, memo: "갑상선 기능 검사 결과 정상. 6개월 후 재검 안내.", createdBy: "김진욱", createdAt: "2024-02-21T10:00:00" },
    { memoId: 302, patientId: 3, memo: "건강보험 자격 확인 완료. 유효기간 내 유지.", createdBy: "수납팀", createdAt: "2024-02-18T15:30:00" },
    { memoId: 303, patientId: 3, memo: "스트레스성 두통으로 내원. 생활 습관 상담 진행.", createdBy: "이은솔", createdAt: "2024-02-10T14:00:00" },
  ],
  "4": [
    { memoId: 401, patientId: 4, memo: "방사선 검사 예약 완료. 당일 금식 불필요.", createdBy: "방사선실", createdAt: "2024-02-22T09:30:00" },
    { memoId: 402, patientId: 4, memo: "이전 영상 CD 지참 요청 안내함.", createdBy: "접수팀", createdAt: "2024-02-20T08:00:00" },
    { memoId: 403, patientId: 4, memo: "요추 MRI 판독 결과 추후 상담 예약.", createdBy: "김메디", createdAt: "2024-02-15T16:45:00" },
  ],
  "5": [
    { memoId: 501, patientId: 5, memo: "미성년자. 보호자 동반 내원. 보호자 연락처 확인함.", createdBy: "접수팀", createdAt: "2024-02-21T13:20:00" },
    { memoId: 502, patientId: 5, memo: "검사 전 금식 8시간 안내 완료.", createdBy: "간호팀", createdAt: "2024-02-21T13:15:00" },
    { memoId: 503, patientId: 5, memo: "성장 관련 문의. 다음 내원 시 성장판 검사 가능하다고 안내.", createdBy: "이은솔", createdAt: "2024-02-18T11:00:00" },
  ],
  "6": [
    { memoId: 601, patientId: 6, memo: "레이저치료 3회차 진행. 피부 반응 양호.", createdBy: "체형교정실", createdAt: "2024-02-22T11:00:00" },
    { memoId: 602, patientId: 6, memo: "치료 부위 자외선 차단, 보습 안내함.", createdBy: "김메디", createdAt: "2024-02-20T10:30:00" },
    { memoId: 603, patientId: 6, memo: "다음 치료 일정 2/29 오후 2시로 예약.", createdBy: "접수팀", createdAt: "2024-02-18T14:00:00" },
  ],
};

function getSampleMemos(patientId: string): PatientMemo[] {
  const list = SAMPLE_MEMOS[patientId];
  return list ? [...list].sort((a, b) => (new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime())) : [];
}

export default function PatientRecordsPanel({ patientId }: PatientRecordsPanelProps) {
  const [memos, setMemos] = useState<PatientMemo[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!patientId) {
      setMemos([]);
      return;
    }
    const numId = parseInt(patientId, 10);
    if (!Number.isFinite(numId)) {
      setMemos([]);
      return;
    }
    setLoading(true);
    fetchPatientMemosApi(numId)
      .then((list) => {
        if (list.length > 0) setMemos(list);
        else setMemos(getSampleMemos(patientId));
      })
      .catch(() => setMemos(getSampleMemos(patientId)))
      .finally(() => setLoading(false));
  }, [patientId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || !patientId) return;
    const numId = parseInt(patientId, 10);
    if (!Number.isFinite(numId)) return;
    setSubmitting(true);
    try {
      await createPatientMemoApi({ patientId: numId, memo: text });
      setInput("");
      const list = await fetchPatientMemosApi(numId);
      setMemos(list);
    } catch {
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "var(--panel)",
        borderRadius: 2,
        border: "1px solid var(--line)",
        overflow: "hidden",
      }}
    >
      <Box sx={{ p: 1.5, borderBottom: "1px solid var(--line)" }}>
        <Typography fontWeight={800} fontSize={15}>
          환자기록
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {patientId ? (memos.length ? "기록 " + memos.length + "건" : "기록 없음") : "환자를 선택하면 기록이 표시됩니다"}
        </Typography>
      </Box>
      <Box sx={{ flex: 1, overflow: "auto", p: 1.5 }}>
        {!patientId ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
            환자를 선택하세요
          </Typography>
        ) : loading ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
            로딩 중…
          </Typography>
        ) : (
          memos.map((r) => (
            <Box
              key={r.memoId}
              sx={{
                py: 1,
                borderBottom: "1px solid var(--line)",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.25 }}>
                <Typography variant="caption" fontWeight={700} color="text.secondary">
                  {formatMemoDate(r.createdAt)}
                </Typography>
                {r.createdBy && (
                  <Typography variant="caption" fontWeight={700}>
                    {r.createdBy}
                  </Typography>
                )}
              </Box>
              <Typography variant="body2">{r.memo}</Typography>
            </Box>
          ))
        )}
      </Box>
      <Box component="form" onSubmit={handleSubmit} sx={{ p: 1.5, borderTop: "1px solid var(--line)" }}>
        <TextField
          size="small"
          fullWidth
          placeholder="기록 입력"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={!patientId || submitting}
          sx={{
            "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: 13 },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EditOutlinedIcon fontSize="small" sx={{ color: "var(--muted)" }} />
              </InputAdornment>
            ),
          }}
        />
      </Box>
    </Box>
  );
}
