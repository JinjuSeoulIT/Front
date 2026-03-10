export interface StaffListItem {
  id?: number;
  username?: string | null;
  statusCode?: string | null;
  status?: string | null;
  domainRole?: string | null;
  fullName?: string | null;
  officeLocation?: string | null;
  photoKey?: string | null;
  bio?: string | null;
  phone?: string | null;
  deptId?: number | null;
  positionId?: number | null;
  departmentName?: string | null;
  positionName?: string | null;
  photoUrl?: string | null;
}

export interface StaffSelfUpdateReq {
  fullName?: string;
  phone?: string | null;
  officeLocation?: string | null;
  bio?: string | null;
}

export interface StaffStatusUpdateReq {
  statusCode: string;
  reason?: string | null;
}

export interface StaffAssignmentUpdateReq {
  deptId?: number | null;
  positionId?: number | null;
  domainRole?: string | null;
}

export interface AdminStaffUpdateReq {
  username?: string;
  fullName?: string;
  phone?: string | null;
  officeLocation?: string | null;
  bio?: string | null;
  statusCode?: string | null;
  domainRole?: string | null;
  deptId?: number | null;
  positionId?: number | null;
}

export interface StaffCreateReq {
  username: string;
  password: string;
  fullName: string;
  phone?: string | null;
  domainRole: string;
  deptId?: number | null;
  positionId?: number | null;
  statusCode?: string | null;
}

export interface DepartmentOption {
  id: number;
  name: string;
  description?: string | null;
  location?: string | null;
  buildingNo?: string | null;
  floorNo?: string | null;
  roomNo?: string | null;
  extension?: string | null;
  headStaffId?: number | null;
  sortOrder?: number | null;
  isActive?: string | null;
}

export interface PositionOption {
  id: number;
  title: string;
  positionCode?: string | null;
  description?: string | null;
  sortOrder?: number | null;
  isActive?: string | null;
}

export interface StaffHistoryItem {
  id: number;
  staffId: number;
  changeType?: string | null;
  beforeValue?: string | null;
  afterValue?: string | null;
  changedAt?: string | null;
  changedBy?: string | null;
}

export interface StaffCredentialItem {
  id: number;
  staffId: number;
  credType: "LICENSE" | "CERT";
  name: string;
  credNumber?: string | null;
  issuer?: string | null;
  expiresAt?: string | null;
  status?: string | null;
  fileKey?: string | null;
}

export interface StaffChangeRequestItem {
  id: number;
  staffId: number;
  requestType: string;
  status: string;
  reason?: string | null;
  payload?: string | null;
  requestedAt?: string | null;
  processedAt?: string | null;
  processedBy?: string | null;
}

export interface StaffAuditLogItem {
  id: number;
  targetType: string;
  targetId: number;
  actionType: string;
  actor?: string | null;
  description?: string | null;
  createdAt?: string | null;
}
