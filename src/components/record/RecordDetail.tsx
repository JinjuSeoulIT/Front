import { Card, CardContent, Stack, Typography } from "@mui/material";
import type { RecordItem } from "@/features/Record/recordTypes";

type RecordDetailProps = {
  selected: RecordItem | null;
};

export default function RecordDetail({ selected }: RecordDetailProps) {
  return (
    <Card sx={{ borderRadius: 3, border: "1px solid var(--line)" }}>
      <CardContent>
        <Typography fontWeight={800} sx={{ mb: 1 }}>
          상세 조회
        </Typography>

        {!selected ? (
          <Typography color="text.secondary">목록에서 기록을 선택하세요.</Typography>
        ) : (
          <Stack spacing={0.75}>
            <Typography>기록 ID: {selected.nursingId ?? "-"}</Typography>
            <Typography>방문 ID: {selected.visitId ?? "-"}</Typography>
            <Typography>기록 시각: {selected.recordedAt ?? "-"}</Typography>
            <Typography>
              혈압: {selected.systolicBp ?? "-"} / {selected.diastolicBp ?? "-"}
            </Typography>
            <Typography>
              맥박 / 호흡: {selected.pulse ?? "-"} / {selected.respiration ?? "-"}
            </Typography>
            <Typography>
              체온 / SpO2: {selected.temperature ?? "-"} / {selected.spo2 ?? "-"}
            </Typography>
            <Typography>관찰 내용: {selected.observation ?? "-"}</Typography>
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}
