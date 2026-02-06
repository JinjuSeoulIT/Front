import Link from "next/link";
import {
  IconButton,
  Table,
  TableBody,
  TableCell,
  Button,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
} from "@mui/material";
import type { Employee } from "@/entities/employee/model/employeesSlice";

type SortField = "employeeId" | "name" | "department";
type SortDirection = "asc" | "desc";

interface Props {
  items: Employee[];
  loading: boolean;
  sort: 
  { field: SortField; direction: SortDirection };
  onSort: (field: SortField) => void;
  onDelete: (id: number) => void;
}

const EmployeeTable = ({ items, loading, sort, onSort, onDelete }: Props) => {
  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          {(["employeeId", "name", "department"] as SortField[]).map((field) => (
            <TableCell
              key={field}
              sortDirection={sort.field === field ? sort.direction : false}
            >
              <TableSortLabel
                active={sort.field === field}
                direction={sort.field === field ? sort.direction : "asc"}
                onClick={() => onSort(field)}
              >
                {
                field === "employeeId" ? "사번"
                        : (field === "name" ? "이름": "부서")
                }
              </TableSortLabel>
            </TableCell>
          ))}
          <TableCell align="center">상세</TableCell>
          {/* <TableCell align="center">수정</TableCell> */}
          <TableCell align="center">삭제</TableCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {!loading && items.length === 0 && (
          <TableRow>
            <TableCell colSpan={6} align="center">
              <Typography color="text.secondary" p={4}>
                검색 결과가 없습니다.
              </Typography>
            </TableCell>
          </TableRow>
        )}

        {items.map((e) => (
          <TableRow key={e.id} hover>
            <TableCell>{e.employeeId ?? "-"}</TableCell>
            <TableCell>{e.name ?? "-"}</TableCell>
            <TableCell>{e.department ?? "-"}</TableCell>
            <TableCell align="center">
              <Link href={`/employees/${e.id}`} passHref>
              <Button
                variant="outlined"
                size="small"
                onClick={()=>{}}
              >
                상세
              </Button>
            </Link>
            </TableCell>
            {/* <TableCell align="center">
              <Button
                component={Link}
                href={`/employees/${e.id}?mode=edit`}
                size="small"
              >
                수정
              </Button>
            </TableCell> */}
            <TableCell align="center">
              <IconButton
                color="error"
                onClick={() => onDelete(e.id)}
              >
                삭제
              </IconButton>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default EmployeeTable;
