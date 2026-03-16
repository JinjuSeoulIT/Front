"use client";

import { useState } from "react";
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/store/store";
import { RecActions } from "@/features/record/recordSlice";

export default function RecordSearch() {
  const dispatch = useDispatch<AppDispatch>();

  const [searchType, setSearchType] = useState("name");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

const handleSearch = () => {
  const keyword = searchKeyword.trim();

  if (searchType === "recordedAt") {
    if (!startDate || !endDate) {
      return;
    }

    dispatch(
      RecActions.searchRecordsRequest({
        searchType,
        startDate,
        endDate,
      })
    );
    return;
  }

  if (!keyword) {
    return;
  }

  dispatch(
    RecActions.searchRecordsRequest({
      searchType,
      searchValue: keyword,
    })
  );
};

  const handleResetSearch = () => {
    setSearchType("name");
    setSearchKeyword("");
    setStartDate("");
    setEndDate("");
    dispatch(RecActions.fetchRecordsRequest());
  };

  return (
    <div
      style={{
        display: "flex",
        gap: "8px",
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel id="record-search-type-label">검색 기준</InputLabel>
<Select
  labelId="record-search-type-label"
  label="검색 기준"
  value={searchType}
  onChange={(event) => setSearchType(String(event.target.value))}
>

  <MenuItem value="name">간호사 이름</MenuItem>
  <MenuItem value="recordedAt">기록일시</MenuItem>
</Select>
      </FormControl>

{searchType === "recordedAt" ? (
  <>
    <TextField
      type="date"
      size="small"
      label="시작일"
      InputLabelProps={{ shrink: true }}
      value={startDate}
      onChange={(event) => setStartDate(event.target.value)}
    />
    <TextField
      type="date"
      size="small"
      label="종료일"
      InputLabelProps={{ shrink: true }}
      value={endDate}
      onChange={(event) => setEndDate(event.target.value)}
    />
  </>
) : (
  <TextField
    size="small"
    label="간호사 이름 입력"
    value={searchKeyword}
    onChange={(event) => setSearchKeyword(event.target.value)}
  />
)}

      <Button variant="outlined" size="small" onClick={handleSearch}>
        검색
      </Button>

      <Button variant="text" size="small" onClick={handleResetSearch}>
        초기화
      </Button>
    </div>
  );
}