"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  type SelectChangeEvent,
} from "@mui/material";

import {
  deleteEmployeeRequest,
  fetchEmployeesRequest,
  fetchEmployeesByConditionRequest,
  type Employee,
  type SearchCondition,
} from "@/entities/employee/model/employeesSlice";

import { useAppDispatch, useAppSelector } from "@/shared/store/hooks";

import EmployeeListHeader from "@/components/employee/list/EmployeeListHeader";
import EmployeeListStatus from "@/components/employee/list/EmployeeListStatus";
import EmployeeSearchBar from "@/components/employee/list/EmployeeSearchBar";
import EmployeeTable from "@/components/employee/list/EmployeeTable";

/* ================= 타입 ================= */

type SearchField = "name" | "employeeId" | "department";
type SortField = "employeeId" | "name" | "department";
type SortDirection = "asc" | "desc";

/* ================= Page ================= */

export default function EmployeeListPage() {
  const dispatch = useAppDispatch();
  const { items, loading, error } = useAppSelector(state => state.employees);

  /* 검색 상태 */
  const [query, setQuery] = useState("");
  const [searchField, setSearchField] = useState<SearchField>("name");

  /* 정렬 상태 */
  const [sort, setSort] = useState<{field: SortField;direction: SortDirection;}>
  ({field: "employeeId",direction: "asc",});

  /* 삭제 확인 다이얼로그 */
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);

  /* ================= Effects ================= */

  /** 최초 로드 시 전체 직원 조회 */
  useEffect(() => {
    console.log("1. UI: 전체 목록 조회 요청");
    dispatch(fetchEmployeesRequest());
  }, [dispatch]);

  /* ================= 검색 ================= */

  const searchEmployees = () => {
    const trimmed = query.trim();

    if (!trimmed) {
      alert("검색어를 입력하세요.");
      return;
    }

    const condition: SearchCondition = {
      condition: searchField,
      value: trimmed,
    };

    console.log(
      `1. UI: 조건 검색 요청 / 타입: ${searchField}, 값: ${trimmed}`
    );
    dispatch(fetchEmployeesByConditionRequest(condition));
  };

  const showAllEmployees = () => {
    setQuery("");
    console.log("1. UI: 전체 목록 다시 조회");
    dispatch(fetchEmployeesRequest());
  };

  /* ================= 정렬 ================= */

  const handleSort = (field: SortField) => {
    setSort(
      prev => {
      if (prev.field === field) 
        {
        return {
          field, direction: prev.direction === "asc" ? "desc" : "asc",
              };
        }
      return { field, direction: "asc" };
    });
  };

  /* ================= 입력 ================= */

  const handleQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  };

  const handleSearchFieldChange = (event: SelectChangeEvent<string>) => {
    setSearchField(event.target.value as SearchField);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.nativeEvent.isComposing) {
      searchEmployees();
    }
  };

  /* ================= 삭제 ================= */

  const handleDeleteClick = (id: number) => {
    setSelectedEmployeeId(id);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedEmployeeId !== null) {
      dispatch(deleteEmployeeRequest(selectedEmployeeId));
    }
    setSelectedEmployeeId(null);
    setDeleteConfirmOpen(false);
  };

  /* ================= 정렬된 목록 ================= */

  const sortedItems = useMemo(() => {
    if (!Array.isArray(items)) return [];

    const copied = [...items];
    copied.sort((a: Employee, b: Employee) => {
      const aVal = a[sort.field] ?? "";
      const bVal = b[sort.field] ?? "";

      if (aVal === bVal) return 0;

      if (sort.direction === "asc") {
        return aVal > bVal ? 1 : -1; // 양수 음수로 구분함, 큰 값 작은값 구분이 아님.
      }
      return aVal < bVal ? 1 : -1; // -1: aVal , 1:bVal
    });

    return copied;
  }, [items, sort]);

  /* ================= Render ================= */

  return (
    <>
      <EmployeeListHeader />

      <EmployeeListStatus loading={loading} error={error} />

      <EmployeeSearchBar
        query={query}
        searchField={searchField}
        onChangeQuery={handleQueryChange}
        onChangeField={handleSearchFieldChange}
        onSearch={searchEmployees}
        onShowAll={showAllEmployees}
        onKeyDown={handleKeyDown}
      />

      <EmployeeTable
        items={sortedItems}
        loading={loading}
        sort={sort}
        onSort={handleSort}
        onDelete={handleDeleteClick}
      />

      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>직원 삭제</DialogTitle>
        <DialogContent>
          <DialogContentText>
            정말로 이 직원의 정보를 삭제하시겠습니까?
            <br />
            이 작업은 되돌릴 수 없습니다.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteConfirmOpen(false)}
            disabled={loading}
          >
            취소
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            disabled={loading}
          >
            삭제
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
