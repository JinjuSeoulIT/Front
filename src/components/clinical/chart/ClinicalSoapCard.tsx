"use client";

import * as React from "react";
import {
  Autocomplete,
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import {
  addDiagnosisApi,
  removeDiagnosisApi,
  addPrescriptionApi,
  removePrescriptionApi,
  createDoctorNoteApi,
  updateDoctorNoteApi,
  type DoctorNoteRes,
  type DiagnosisRes,
  type PrescriptionRes,
} from "@/lib/clinicalRecordApi";
import {
  searchDrugsForChoseongMatch,
  searchDrugsForVisit,
} from "@/lib/drugSearchApi";
import { isChoseongOnlyQuery } from "@/lib/koreanChoseong";

const DRUG_SEARCH_MIN_CHARS = 2;
const DRUG_SEARCH_DEBOUNCE_MS = 380;
const DRUG_SEARCH_PAGE_SIZE = 25;
const DRUG_SEARCH_CHOSEONG_DISPLAY_MAX = 80;

type DrugSuggestOption = {
  key: string;
  itemSeq: string;
  itemName: string;
  entpName?: string;
};

type Props = {
  visitId: number | null;
  doctorNote: DoctorNoteRes | null;
  diagnoses: DiagnosisRes[];
  prescriptions: PrescriptionRes[];
  symptomText: string;
  onSymptomTextChange: (v: string) => void;
  diagnosisCodeInput: string;
  onDiagnosisCodeInputChange: (v: string) => void;
  diagnosisNameInput: string;
  onDiagnosisNameInputChange: (v: string) => void;
  prescriptionNameInput: string;
  onPrescriptionNameInputChange: (v: string) => void;
  prescriptionDosageInput: string;
  onPrescriptionDosageInputChange: (v: string) => void;
  prescriptionDaysInput: string;
  onPrescriptionDaysInputChange: (v: string) => void;
  additionalMemo: string;
  onAdditionalMemoChange: (v: string) => void;
  savingRecord: boolean;
  onSavingRecordChange: (v: boolean) => void;
  onDoctorNoteReload: () => void;
  onDiagnosesReload: () => void;
  onPrescriptionsReload: () => void;
};

export function ClinicalSoapCard({
  visitId,
  doctorNote,
  diagnoses,
  prescriptions,
  symptomText,
  onSymptomTextChange,
  diagnosisCodeInput,
  onDiagnosisCodeInputChange,
  diagnosisNameInput,
  onDiagnosisNameInputChange,
  prescriptionNameInput,
  onPrescriptionNameInputChange,
  prescriptionDosageInput,
  onPrescriptionDosageInputChange,
  prescriptionDaysInput,
  onPrescriptionDaysInputChange,
  additionalMemo,
  onAdditionalMemoChange,
  savingRecord,
  onSavingRecordChange,
  onDoctorNoteReload,
  onDiagnosesReload,
  onPrescriptionsReload,
}: Props) {
  const [drugOptions, setDrugOptions] = React.useState<DrugSuggestOption[]>([]);
  const [drugLoading, setDrugLoading] = React.useState(false);
  const [drugHint, setDrugHint] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (visitId == null) {
      setDrugOptions([]);
      setDrugHint(null);
      return;
    }
    const q = prescriptionNameInput.trim();
    const compactChoseong = q.replace(/\s+/g, "");
    if (compactChoseong.length < DRUG_SEARCH_MIN_CHARS) {
      setDrugOptions([]);
      setDrugHint(
        compactChoseong.length === 0
          ? null
          : `제품명 또는 초성 ${DRUG_SEARCH_MIN_CHARS}자 이상 입력 시 식약처 e약은요에서 검색합니다. (예: 타이, ㅌㅇ)`
      );
      return;
    }
    const ac = new AbortController();
    const timer = window.setTimeout(() => {
      void (async () => {
        setDrugLoading(true);
        setDrugHint(null);
        try {
          const choseongMode =
            isChoseongOnlyQuery(compactChoseong) &&
            compactChoseong.length >= DRUG_SEARCH_MIN_CHARS;
          let mapped: DrugSuggestOption[];
          if (choseongMode) {
            const cho = await searchDrugsForChoseongMatch(visitId, {
              compactChoseong,
              signal: ac.signal,
            });
            if (cho.resultCode && cho.resultCode !== "00") {
              setDrugOptions([]);
              setDrugHint(cho.resultMsg || "공공데이터 응답 오류");
              return;
            }
            const raw = cho.items.filter((it) => (it.itemName ?? "").trim().length > 0);
            mapped = raw.slice(0, DRUG_SEARCH_CHOSEONG_DISPLAY_MAX).map((it, idx) => {
              const name = (it.itemName ?? "").trim();
              const seq = (it.itemSeq ?? "").trim();
              return {
                key: seq ? `${seq}-${idx}` : `${name}-${idx}`,
                itemSeq: seq,
                itemName: name,
                entpName: (it.entpName ?? "").trim() || undefined,
              };
            });
            setDrugOptions(mapped);
            if (mapped.length === 0) {
              setDrugHint(
                `초성 '${compactChoseong}'에 맞는 품목이 없습니다. 한글 제품명으로 검색해 보세요.`
              );
            } else if (raw.length > DRUG_SEARCH_CHOSEONG_DISPLAY_MAX) {
              setDrugHint(
                `초성 일치 ${raw.length.toLocaleString()}건 중 ${DRUG_SEARCH_CHOSEONG_DISPLAY_MAX}건만 표시`
              );
            } else if (cho.totalCountMain != null && cho.totalCountMain > raw.length) {
              setDrugHint(
                `‘${compactChoseong[0]}’로 시작하는 품목 약 ${cho.totalCountMain.toLocaleString()}건 중 초성 일치 ${raw.length.toLocaleString()}건`
              );
            }
          } else {
            const result = await searchDrugsForVisit(visitId, {
              itemName: q,
              numOfRows: DRUG_SEARCH_PAGE_SIZE,
              signal: ac.signal,
            });
            if (result.resultCode && result.resultCode !== "00") {
              setDrugOptions([]);
              setDrugHint(result.resultMsg || "공공데이터 응답 오류");
              return;
            }
            const raw = result.items ?? [];
            const items = raw.filter((it) => (it.itemName ?? "").trim().length > 0);
            mapped = items.map((it, idx) => {
              const name = (it.itemName ?? "").trim();
              const seq = (it.itemSeq ?? "").trim();
              return {
                key: seq ? `${seq}-${idx}` : `${name}-${idx}`,
                itemSeq: seq,
                itemName: name,
                entpName: (it.entpName ?? "").trim() || undefined,
              };
            });
            setDrugOptions(mapped);
            if (mapped.length === 0) {
              setDrugHint("검색 결과가 없습니다. 직접 입력 후 추가할 수 있습니다.");
            } else if (
              result.totalCount != null &&
              result.totalCount > mapped.length
            ) {
              setDrugHint(`전체 ${result.totalCount.toLocaleString()}건 중 상위 ${mapped.length}건`);
            }
          }
        } catch (e) {
          if (e instanceof Error && e.name === "AbortError") return;
          setDrugOptions([]);
          setDrugHint(e instanceof Error ? e.message : "약품 검색에 실패했습니다.");
        } finally {
          setDrugLoading(false);
        }
      })();
    }, DRUG_SEARCH_DEBOUNCE_MS);
    return () => {
      window.clearTimeout(timer);
      ac.abort();
    };
  }, [visitId, prescriptionNameInput]);

  return (
    <Card sx={{ borderRadius: 2, border: "1px solid var(--line)" }}>
      <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
        <Typography fontWeight={800} sx={{ fontSize: 15, mb: 0.5 }}>
          진료기록 작성 (SOAP)
        </Typography>
        <Typography sx={{ fontSize: 10, color: "var(--muted)", mb: 1.25 }}>
          S 주관적 · O 객관적(활력은 좌측 카드) · A 상병 · P 처방·오더·메모
        </Typography>
        <Typography sx={{ fontWeight: 700, fontSize: 13, color: "var(--muted)", mb: 0.5 }}>
          S 증상·주호소 (Subjective)
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={3}
          size="small"
          placeholder="증상을 입력하세요"
          value={symptomText}
          onChange={(e) => onSymptomTextChange(e.target.value)}
          sx={{ mb: 2, "& .MuiOutlinedInput-root": { bgcolor: "#fff" } }}
        />
        <Typography sx={{ fontWeight: 700, fontSize: 13, color: "var(--muted)", mb: 0.5 }}>
          A 상병 (Assessment)
        </Typography>
        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1, mb: 1 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>주</TableCell>
                <TableCell>상병기호</TableCell>
                <TableCell>상병명</TableCell>
                <TableCell width={60}></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {diagnoses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} sx={{ color: "var(--muted)", fontSize: 13 }}>
                    등록된 상병이 없습니다. +추가로 검색하여 등록하세요.
                  </TableCell>
                </TableRow>
              ) : (
                diagnoses.map((d) => (
                  <TableRow key={d.diagnosisId}>
                    <TableCell>{d.mainYn === "Y" ? "주" : "부"}</TableCell>
                    <TableCell>{d.dxCode ?? "-"}</TableCell>
                    <TableCell>{d.dxName ?? "-"}</TableCell>
                    <TableCell>
                      {visitId != null && (
                        <Button
                          size="small"
                          color="error"
                          onClick={async () => {
                            try {
                              await removeDiagnosisApi(visitId, d.diagnosisId);
                              onDiagnosesReload();
                            } catch (e) {
                              window.alert(e instanceof Error ? e.message : "삭제 실패");
                            }
                          }}
                        >
                          삭제
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }} flexWrap="wrap">
          <Typography sx={{ fontSize: 12, color: "var(--muted)" }}>목록에 없으면 직접입력</Typography>
          <TextField
            size="small"
            placeholder="코드"
            value={diagnosisCodeInput}
            onChange={(e) => onDiagnosisCodeInputChange(e.target.value)}
            sx={{ width: 80, "& .MuiOutlinedInput-root": { bgcolor: "#fff" } }}
          />
          <TextField
            size="small"
            placeholder="상병명"
            value={diagnosisNameInput}
            onChange={(e) => onDiagnosisNameInputChange(e.target.value)}
            sx={{ width: 140, "& .MuiOutlinedInput-root": { bgcolor: "#fff" } }}
          />
          <Button
            size="small"
            variant="outlined"
            disabled={visitId == null}
            onClick={async () => {
              if (visitId == null || (!diagnosisCodeInput.trim() && !diagnosisNameInput.trim())) return;
              try {
                await addDiagnosisApi(visitId, {
                  dxCode: diagnosisCodeInput.trim() || null,
                  dxName: diagnosisNameInput.trim() || null,
                  main: diagnoses.length === 0,
                });
                onDiagnosesReload();
                onDiagnosisCodeInputChange("");
                onDiagnosisNameInputChange("");
              } catch (e) {
                window.alert(e instanceof Error ? e.message : "등록 실패");
              }
            }}
          >
            추가
          </Button>
        </Stack>
        <Typography sx={{ fontWeight: 700, fontSize: 13, color: "var(--muted)", mb: 0.5 }}>
          P 처방·약품 (Plan)
        </Typography>
        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1, mb: 1 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>약품명</TableCell>
                <TableCell>용량</TableCell>
                <TableCell>일수</TableCell>
                <TableCell width={60}></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {prescriptions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} sx={{ color: "var(--muted)", fontSize: 13 }}>
                    등록된 처방이 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                prescriptions.map((p) => (
                  <TableRow key={p.prescriptionId}>
                    <TableCell>{p.medicationName ?? "-"}</TableCell>
                    <TableCell>{p.dosage ?? "-"}</TableCell>
                    <TableCell>{p.days ?? "-"}</TableCell>
                    <TableCell>
                      {visitId != null && (
                        <Button
                          size="small"
                          color="error"
                          onClick={async () => {
                            try {
                              await removePrescriptionApi(visitId, p.prescriptionId);
                              onPrescriptionsReload();
                            } catch (e) {
                              window.alert(e instanceof Error ? e.message : "삭제 실패");
                            }
                          }}
                        >
                          삭제
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }} flexWrap="wrap">
          <Typography sx={{ fontSize: 12 }}>다음 추가할 약:</Typography>
          <TextField
            size="small"
            placeholder="용량"
            value={prescriptionDosageInput}
            onChange={(e) => onPrescriptionDosageInputChange(e.target.value)}
            sx={{ width: 70, "& .MuiOutlinedInput-root": { bgcolor: "#fff" } }}
          />
          <TextField
            size="small"
            placeholder="일수"
            value={prescriptionDaysInput}
            onChange={(e) => onPrescriptionDaysInputChange(e.target.value)}
            sx={{ width: 60, "& .MuiOutlinedInput-root": { bgcolor: "#fff" } }}
          />
          <Autocomplete
            size="small"
            sx={{ minWidth: 280, flex: "1 1 220px", "& .MuiOutlinedInput-root": { bgcolor: "#fff" } }}
            options={drugOptions}
            loading={drugLoading}
            filterOptions={(opts) => opts}
            getOptionLabel={(opt) =>
              typeof opt === "string"
                ? opt
                : [opt.itemName, opt.entpName ? `(${opt.entpName})` : "", opt.itemSeq ? `#${opt.itemSeq}` : ""]
                    .filter(Boolean)
                    .join(" ")
            }
            isOptionEqualToValue={(a, b) =>
              typeof a === "object" &&
              typeof b === "object" &&
              "key" in a &&
              "key" in b &&
              a.key === b.key
            }
            inputValue={prescriptionNameInput}
            onInputChange={(_, value, reason) => {
              if (reason === "input" || reason === "clear" || reason === "reset") {
                onPrescriptionNameInputChange(value);
              }
            }}
            onChange={(_, value) => {
              if (value && typeof value === "object" && "itemName" in value) {
                const o = value as DrugSuggestOption;
                onPrescriptionNameInputChange(
                  o.itemSeq ? `${o.itemName} (${o.itemSeq})` : o.itemName
                );
              } else if (typeof value === "string") {
                onPrescriptionNameInputChange(value);
              } else {
                onPrescriptionNameInputChange("");
              }
            }}
            noOptionsText={
              visitId == null
                ? "진료(방문)을 선택한 뒤 검색할 수 있습니다."
                : drugLoading
                  ? "검색 중…"
                  : prescriptionNameInput.trim().length < DRUG_SEARCH_MIN_CHARS
                    ? `제품명 ${DRUG_SEARCH_MIN_CHARS}글자 이상 입력하세요.`
                    : "일치하는 품목이 없습니다."
            }
            freeSolo
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="약품명 검색 (e약은요)"
                helperText={drugHint}
                FormHelperTextProps={{ sx: { mx: 0, fontSize: 11 } }}
              />
            )}
          />
          <Button
            size="small"
            variant="outlined"
            disabled={visitId == null}
            onClick={async () => {
              if (visitId == null || !prescriptionNameInput.trim()) return;
              try {
                await addPrescriptionApi(visitId, {
                  medicationName: prescriptionNameInput.trim(),
                  dosage: prescriptionDosageInput || null,
                  days: prescriptionDaysInput || null,
                });
                onPrescriptionsReload();
                onPrescriptionNameInputChange("");
                onPrescriptionDosageInputChange("");
                onPrescriptionDaysInputChange("");
              } catch (e) {
                window.alert(e instanceof Error ? e.message : "등록 실패");
              }
            }}
          >
            추가
          </Button>
        </Stack>
        <Typography sx={{ fontWeight: 700, fontSize: 13, color: "var(--muted)", mb: 0.5 }}>
          추가 메모 (시술, 추후계획 등)
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={2}
          size="small"
          value={additionalMemo}
          onChange={(e) => onAdditionalMemoChange(e.target.value)}
          sx={{ mb: 2, "& .MuiOutlinedInput-root": { bgcolor: "#fff" } }}
        />
        <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" flexWrap="wrap">
          <Stack direction="row" spacing={1} alignItems="center">
            <Button size="small" variant="outlined" onClick={() => window.alert("사전심사 예정")}>
              사전심사
            </Button>
            <Button
              size="small"
              variant="contained"
              sx={{ bgcolor: "var(--brand)" }}
              disabled={visitId == null || savingRecord}
              onClick={async () => {
                if (visitId == null) return;
                onSavingRecordChange(true);
                try {
                  if (doctorNote) {
                    await updateDoctorNoteApi(visitId, {
                      presentIllness: symptomText,
                      clinicalMemo: additionalMemo,
                    });
                  } else {
                    await createDoctorNoteApi(visitId, {
                      presentIllness: symptomText,
                      clinicalMemo: additionalMemo,
                    });
                  }
                  await onDoctorNoteReload();
                  window.alert("진료기록이 저장되었습니다.");
                } catch (e) {
                  window.alert(e instanceof Error ? e.message : "저장 실패");
                } finally {
                  onSavingRecordChange(false);
                }
              }}
            >
              {savingRecord ? "저장 중…" : "진료 저장"}
            </Button>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <FormControl size="small" sx={{ minWidth: 100 }}>
              <InputLabel>전달</InputLabel>
              <Select label="전달" value="수납실">
                <MenuItem value="수납실">수납실</MenuItem>
              </Select>
            </FormControl>
            <Button size="small" variant="contained" color="success" onClick={() => window.alert("진료완료 처리 예정")}>
              진료완료
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
