import {
  Button,
  FormControl,
  InputAdornment,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";

const SEARCH_FIELDS = [
  { value: "name", label: "이름" },
  { value: "employeeId", label: "사번" },
  { value: "department", label: "부서" },
] as const;

type SearchField = (typeof SEARCH_FIELDS)[number]["value"];

interface Props {
  query: string;
  searchField: SearchField;
  onChangeQuery: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeField: (e: SelectChangeEvent<string>) => void;
  onSearch: () => void;
  onShowAll: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

const EmployeeSearchBar = ({
  query,
  searchField,
  onChangeQuery,
  onChangeField,
  onSearch,
  onShowAll,
  onKeyDown,
}: Props) => {
  const label = SEARCH_FIELDS.find(f => f.value === searchField)?.label ?? "검색";

  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={1.5}
      alignItems={{ xs: "stretch", sm: "center" }}
      mb={2}
    >
      <FormControl size="small" sx={{ minWidth: 140 }}>
        <Select value={searchField} onChange={onChangeField}>
          {SEARCH_FIELDS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        size="small"
        placeholder={`${label} 검색`}
        value={query}
        onChange={onChangeQuery}
        onKeyDown={onKeyDown}
        InputProps={{
          startAdornment: <InputAdornment position="start" />,
        }}
        sx={{ flex: 1 }}
      />

      <Button variant="contained" onClick={onSearch}>
        조회
      </Button>
      <Button variant="outlined" onClick={onShowAll}>
        전체 목록
      </Button>
    </Stack>
  );
};

export default EmployeeSearchBar;
