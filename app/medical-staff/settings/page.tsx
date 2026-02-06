"use client";
import React, { useEffect, useState } from "react";
import { Box, Tabs, Tab } from "@mui/material";
import { Snackbar, Alert } from "@mui/material";
import DepartmentTab from "@/components/department/tab/DepartmentTab";
import PositionTab from "@/components/position/tab/PositionTab";
import { useAppDispatch, useAppSelector } from "@/shared/store/hooks";
import {
  fetchDepartmentsRequest,
  fetchDepartmentsByConditionRequest,
  createDepartmentRequest,
  updateDepartmentRequest,
  deleteDepartmentRequest,
  clearDepartmentStatus,
  type SearchCondition as DepartmentSearchCondition,
} from "@/entities/department/model/departmentSlice";
import {
  fetchPositionsRequest,
  fetchPositionsByConditionRequest,
  createPositionRequest,
  updatePositionRequest,
  deletePositionRequest,
  clearPositionStatus,
  type SearchCondition as PositionSearchCondition,
} from "@/entities/position/model/positionSlice";
const MedicalStaffSettingsPage = () => {
  const dispatch = useAppDispatch();
  const [tab, setTab] = useState(0);
  const departments = useAppSelector((state) => state.department.items);
  const positions = useAppSelector((state) => state.position.items);
  const deptStatus = useAppSelector((state) => state.department.lastActionStatus);
  const deptMessage = useAppSelector((state) => state.department.lastActionMessage);
  const posStatus = useAppSelector((state) => state.position.lastActionStatus);
  const posMessage = useAppSelector((state) => state.position.lastActionMessage);
  const [toastOpen, setToastOpen] = useState(false);

  

  const toDepartmentCondition = (v: string): DepartmentSearchCondition["condition"] => {
    switch (v) {
      case "name":
      case "buildingNo":
      case "floorNo":
      case "roomNo":
      case "extension":
        return v;
      default:
        return "name";
    }
  };

  const toPositionCondition = (v: string): PositionSearchCondition["condition"] => {
    switch (v) {
      case "name":
      case "code":
      case "description":
        return v;
      default:
        return "name";
    }
  };
  useEffect(() => {
    dispatch(fetchDepartmentsRequest());
    dispatch(fetchPositionsRequest());
  }, [dispatch]);
  useEffect(() => {
    if (deptStatus && deptMessage) setToastOpen(true);
  }, [deptStatus, deptMessage]);
  useEffect(() => {
    if (posStatus && posMessage) setToastOpen(true);
  }, [posStatus, posMessage]);
  return (
    <Box>
      <Tabs value={tab} onChange={(_, v) => setTab(v)}>
        <Tab label="부서 관리" />
        <Tab label="직책 관리" />
      </Tabs>
      {tab === 0 && (
        <DepartmentTab
          departments={departments}
          onCreate={(values) => dispatch(createDepartmentRequest(values))}
          onUpdate={(id, values) =>
            dispatch(updateDepartmentRequest({ id, data: values }))
          }
          onDelete={(id) => dispatch(deleteDepartmentRequest(id))}
          onSearch={(condition, value) =>
            dispatch(
              fetchDepartmentsByConditionRequest({ condition: toDepartmentCondition(condition), value })
            )
          }
          onReset={() => dispatch(fetchDepartmentsRequest())}
        />
      )}
      {tab === 1 && (
        <PositionTab
          positions={positions}
          onCreate={(values) => dispatch(createPositionRequest(values))}
          onUpdate={(id, values) =>
            dispatch(updatePositionRequest({ id, data: values }))
          }
          onDelete={(id) => dispatch(deletePositionRequest(id))}
          onSearch={(condition, value) =>
            dispatch(
              fetchPositionsByConditionRequest({ condition: toPositionCondition(condition), value })
            )
          }
          onReset={() => dispatch(fetchPositionsRequest())}
        />
      )}
      <Snackbar
        open={toastOpen}
        autoHideDuration={2500}
        onClose={() => {
          setToastOpen(false);
          dispatch(clearDepartmentStatus());
          dispatch(clearPositionStatus());
        }}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity={deptStatus === "success" || posStatus === "success" ? "success" : "error"}
          variant="filled"
          onClose={() => {
            setToastOpen(false);
            dispatch(clearDepartmentStatus());
            dispatch(clearPositionStatus());
          }}
        >
          {deptMessage || posMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};
export default MedicalStaffSettingsPage;
