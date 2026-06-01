export function statusClass(status = "") {
  const normalized = status.toLowerCase();
  if (normalized === "paid") return "success";
  if (normalized === "partial") return "warning";
  return "danger";
}
