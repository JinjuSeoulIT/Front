"use client";

import { useState } from "react";
import { Box, Button, MenuItem, Select, TextField } from "@mui/material";

type Props = {
  onSearch: (type: string, value: string) => void;
};

export default function RecordSearchBar({ onSearch }: Props) {
  const [searchType, setSearchType] = useState("visitId");
  const [searchValue, setSearchValue] = useState("");

  return (
    <Box sx={{ display: "flex", gap: 1 }}>
      <Select
        size="small"
        value={searchType}
        onChange={(e) => setSearchType(e.target.value)}
      >
        <MenuItem value="visitId">방문 ID</MenuItem>
        <MenuItem value="recordDate">기록 날짜</MenuItem>
      </Select>

      <TextField
        size="small"
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        placeholder="검색 값"
      />

      <Button variant="contained" onClick={() => onSearch(searchType, searchValue)}>
        검색
      </Button>
    </Box>
  );
}
