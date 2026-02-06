"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";

import {
  deleteEmployeeRequest,
  fetchEmployeeRequest,
  updateEmployeeRequest,
} from "@/entities/employee/model/employeesSlice";
import { useAppDispatch, useAppSelector } from "@/shared/store/hooks";

import EmployeeDetail from "@/components/employee/detail/EmployeeDetail";
import EmployeeEditForm, {
  type EmployeeFormState,
} from "@/components/employee/detail/EmployeeEditForm";

/* ================= Content ================= */

function EmployeeDetailPageContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  const { items, loading, error } = useAppSelector(state => state.employees);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  /* ================= 직원 ID ================= */

  const employeeId = useMemo(() => {
    const id = Number(params?.id);
    return Number.isNaN(id) ? undefined : id;
  }, [params]);

  const employee = useMemo(
    () => items.find((item) => item.id === employeeId),
    [items, employeeId]
  );

  const editMode = searchParams.get("mode") === "edit";

  /* ================= Fetch ================= */

  useEffect(() => {
    console.log("1. UI : 직원 상세 조회 요청");

    if (!employeeId) 
      return;
    dispatch(fetchEmployeeRequest(employeeId));
  }, [dispatch, employeeId]);

  /* ================= Handlers ================= */

  const handleSave = (form: EmployeeFormState) => {
    console.log("1. UI : 직원 수정 요청");

    if (!employeeId)
      return;
    dispatch(updateEmployeeRequest({ id: employeeId, data: form }));
    router.push(`/employees/${employeeId}`);
  };

  const handleDelete = () => {
    if (!employeeId) return;
    dispatch(deleteEmployeeRequest(employeeId));
    router.push("/employees");
    setDeleteConfirmOpen(false);
  };

  const goBack = () => router.push("/employees");
  const goToEdit = () =>
    router.push(`/employees/${employeeId}?mode=edit`);

  /* ================= Render ================= */

  return (
    <Box maxWidth="960px" mx="auto" mt={4}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4" fontWeight={700}>
          {editMode ? "직원 수정" : "직원 상세"}
        </Typography>

        {!editMode && (
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" onClick={goBack}>
              목록
            </Button>
            <Button variant="contained" onClick={goToEdit}>
              수정
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={() => setDeleteConfirmOpen(true)}
              disabled={loading}
            >
              삭제
            </Button>
          </Stack>
        )}
      </Stack>

      {loading && (
        <Typography align="center" color="text.secondary">
          정보를 불러오는 중입니다…
        </Typography>
      )}

      {error && (
        <Alert severity="error" sx={{ my: 2 }}>
          {error}
        </Alert>
      )}

      {!loading && !error && !employee && (
        <Alert severity="warning" sx={{ my: 2 }}>
          직원 정보를 찾을 수 없습니다.
        </Alert>
      )}

      {!loading && !error && employee && (
        <Card>
          <CardContent>
            {editMode ? 
            (<EmployeeEditForm
                employee={employee}
                saving={loading}
                onSave={handleSave}
                onCancel={() => router.back()}
              />) 
              : (<EmployeeDetail employee={employee} />)
            }
          </CardContent>
        </Card>
      )}

      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>직원 삭제</DialogTitle>
        <DialogContent>
          <DialogContentText>
            정말로 이 직원을 삭제하시겠습니까?
            <br />
            삭제 후에는 되돌릴 수 없습니다.
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
            onClick={handleDelete}
            color="error"
            disabled={loading}
          >
            삭제
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

/* ================= Page ================= */
// 비 동기 처리동안에, loading ... 이라는 메시지가 나타나게 됨.

// Suspense 는 내부 컴포넌트가 랜더링 가능할때까지
//      무대 커튼
// fallback을 보여주는 장치
//      무대 준비중 안내 문구.



export default function EmployeeDetailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EmployeeDetailPageContent />
    </Suspense>
  );
}
