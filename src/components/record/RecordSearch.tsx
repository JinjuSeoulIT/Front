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
import {
  fetchRecordsRequest,
  searchRecordRequest,
} from "@/features/Record/recordSlice";

export default function RecordSearch() {
  const dispatch = useDispatch<AppDispatch>();

  const [searchType, setSearchType] = useState("recordId");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleSearch = () => {
    if (searchType === "recordId") {
      dispatch(
        searchRecordRequest({
          searchType,
          searchValue: searchKeyword.trim(),
        })
      );
      return;
    }

    dispatch(
      searchRecordRequest({
        searchType,
        startDate,
        endDate,
      })
    );
  };

  const handleResetSearch = () => {
    setSearchType("recordId");
    setSearchKeyword("");
    setStartDate("");
    setEndDate("");
    dispatch(fetchRecordsRequest());
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
          <MenuItem value="recordId">기록 아이디</MenuItem>
          <MenuItem value="recordedAt">기록일시</MenuItem>
        </Select>
      </FormControl>

      {searchType === "recordId" ? (
        <TextField
          size="small"
          label="기록 아이디 입력"
          value={searchKeyword}
          // placeholder="기록아이디 입력해주세요."
          onChange={(event) => setSearchKeyword(event.target.value)}
        />
      ) : (
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
