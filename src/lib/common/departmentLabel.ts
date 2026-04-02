export function formatDepartmentName(
  departmentName?: string | null,
  departmentId?: string | number | null
): string {
  const trimmed = departmentName?.trim();
  if (trimmed) return trimmed;

  if (departmentId != null) {
    const normalized = String(departmentId).trim();
    if (normalized) return `진료과 ${normalized}`;
  }

  return "-";
}
