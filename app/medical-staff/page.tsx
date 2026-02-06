"use client";

import React, { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useAppDispatch, useAppSelector } from "@/shared/store/hooks";
import { Snackbar, Alert } from "@mui/material";
import {
  fetchMedicalStaffRequest,
  fetchMedicalStaffByConditionRequest,
  fetchMedicalStaffDetailRequest,
  createMedicalStaffRequest,
  updateMedicalStaffRequest,
  deleteMedicalStaffRequest,
  clearMedicalStaffStatus,
  type SearchCondition,
} from "@/entities/medical-staff/model/medicalStaffSlice";
import { fetchDepartmentsRequest } from "@/entities/department/model/departmentSlice";
import { fetchPositionsRequest } from "@/entities/position/model/positionSlice";
import { MedicalStaffFormValues } from "@/components/medical-staff/form-modal/MedicalStaffFormModal";
import type { MedicalStaffItem } from "@/components/medical-staff/list/MedicalStaffList";

const MedicalStaffList = dynamic(
  () => import("@/components/medical-staff/list/MedicalStaffList"),
  { ssr: false }
);

const MedicalStaffPage = () => {
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.medicalStaff.items);
  const loading = useAppSelector((state) => state.medicalStaff.loading);
  const lastActionStatus = useAppSelector((state) => state.medicalStaff.lastActionStatus);
  const lastActionMessage = useAppSelector((state) => state.medicalStaff.lastActionMessage);
  const detail = useAppSelector((state) => state.medicalStaff.detail);
  const detailLoading = useAppSelector((state) => state.medicalStaff.detailLoading);
  const departments = useAppSelector((state) => state.department.items);
  const positions = useAppSelector((state) => state.position.items);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [toastOpen, setToastOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchMedicalStaffRequest());
    dispatch(fetchDepartmentsRequest());
    dispatch(fetchPositionsRequest());
  }, [dispatch]);

  useEffect(() => {
    if (!lastActionStatus || !lastActionMessage) return;
    setToastOpen(true);
  }, [lastActionStatus, lastActionMessage]);

  const buildStaffPayload = (id: number | undefined, values: MedicalStaffFormValues) => {
    return {
      ...(id ? { id } : {}),
      username: values.staffId,
      fullName: values.name,
      phone: values.phone,
      deptId: values.departmentId ?? null,
      positionId: values.positionId ?? null,
      statusCode: values.status,
      // TODO: backend DB requires PASSWORD_HASH NOT NULL; replace with real auth flow.
    };
  };

  const handleCreate = (values: MedicalStaffFormValues) => {
    const formData = new FormData();
    const staffPayload = buildStaffPayload(undefined, values);

    formData.append(
      "staff",
      new Blob([JSON.stringify(staffPayload)], { type: "application/json" })
    );

    if (values.profileImageFile) {
      formData.append("file", values.profileImageFile);
    }

    dispatch(createMedicalStaffRequest(formData));
  };

  const handleUpdate = (id: number, values: MedicalStaffFormValues) => {
    const formData = new FormData();
    const staffPayload = buildStaffPayload(id, values);

    formData.append(
      "staff",
      new Blob([JSON.stringify(staffPayload)], { type: "application/json" })
    );

    if (values.profileImageFile) {
      formData.append("file", values.profileImageFile);
    }

    dispatch(updateMedicalStaffRequest({ id, formData }));
  };

  const handleDelete = (id: number) => {
    dispatch(deleteMedicalStaffRequest(id));
  };

  const deptNameById = new Map(departments.map((d) => [d.id, d.name] as const));
  const positionNameById = new Map(positions.map((p) => [p.id, p.name] as const));

  const toStatusCode = (code?: string) => {
    // Keep form/edit payload using backend status codes.
    // (Display label conversion happens in the detail modal.)
    switch (code) {
      case "ACTIVE":
      case "ON_LEAVE":
      case "INACTIVE":
      case "RESIGNED":
        return code;
      default:
        return "ACTIVE";
    }
  };

const uiItems: MedicalStaffItem[] = items.map((it) => ({
    ...(it as unknown as MedicalStaffItem),
    staffId: it.username ?? "",
    name: it.fullName ?? "",
    departmentId: it.deptId ?? null,
    positionId: it.positionId ?? null,
    photoUrl: it.photoUrl,
    departmentName:
      it.departmentName?.trim() ? it.departmentName : deptNameById.get(it.deptId ?? -1) ?? "",
    positionName:
      it.positionName?.trim() ? it.positionName : positionNameById.get(it.positionId ?? -1) ?? "",
    status: toStatusCode(it.statusCode ?? it.status),
    domainRole: it.domainRole,
    officeLocation: it.officeLocation,
    bio: it.bio,
  }));

  const uiDetail: MedicalStaffItem | null = useMemo(() => {
    if (detailId === null || detailId === undefined) return null;

    const fromList = uiItems.find((x) => x.id === detailId) ?? null;
    if (!detail) return fromList;

    if (detail.id !== detailId) return fromList;

    return {
      ...(fromList ?? {}),
      ...(detail as unknown as MedicalStaffItem),
      staffId: detail.username ?? fromList?.staffId ?? "",
      name: detail.fullName ?? fromList?.name ?? "",
      departmentId: detail.deptId ?? fromList?.departmentId ?? null,
      positionId: detail.positionId ?? fromList?.positionId ?? null,
      photoUrl: detail.photoUrl ?? fromList?.photoUrl,
      departmentName:
        detail.departmentName?.trim()
          ? detail.departmentName
          : deptNameById.get(detail.deptId ?? -1) ?? fromList?.departmentName ?? "",
      positionName:
        detail.positionName?.trim()
          ? detail.positionName
          : positionNameById.get(detail.positionId ?? -1) ?? fromList?.positionName ?? "",
      status: toStatusCode(detail.statusCode ?? detail.status),
      domainRole: detail.domainRole ?? fromList?.domainRole,
      officeLocation: detail.officeLocation ?? fromList?.officeLocation,
      bio: detail.bio ?? fromList?.bio,
      phone: detail.phone ?? fromList?.phone,
    };
  }, [detail, detailId, deptNameById, positionNameById, uiItems]);

  return (
    <>
      <MedicalStaffList
        items={uiItems}
        departments={departments.map((d) => ({ id: d.id, name: d.name }))}
        positions={positions.map((p) => ({ id: p.id, name: p.name }))}
        loading={loading}
        onSearch={(cond, value) =>
          dispatch(fetchMedicalStaffByConditionRequest({ condition: cond as SearchCondition["condition"], value }))
        }
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        onDelete={handleDelete}

        detailOpen={detailOpen}
        detailLoading={detailLoading}
        detailData={uiDetail}
        onOpenDetail={(id) => {
          setDetailId(id);
          setDetailOpen(true);
          dispatch(fetchMedicalStaffDetailRequest(id));
        }}
        onCloseDetail={() => setDetailOpen(false)}
      />
      <Snackbar
        open={toastOpen}
        autoHideDuration={2500}
        onClose={() => {
          setToastOpen(false);
          dispatch(clearMedicalStaffStatus());
        }}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity={lastActionStatus === "success" ? "success" : "error"}
          variant="filled"
          onClose={() => {
            setToastOpen(false);
            dispatch(clearMedicalStaffStatus());
          }}
        >
          {lastActionMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default MedicalStaffPage;
