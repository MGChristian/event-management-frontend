type StatusBadgeProps = {
  status: "active" | "inactive" | "scanned" | "pending";
  label?: string;
};

function StatusBadge({ status, label }: StatusBadgeProps) {
  const styles = {
    active: "bg-green-100 text-green-700 border-green-300",
    inactive: "bg-stone-100 text-stone-600 border-stone-300",
    scanned: "bg-orange-100 text-orange-700 border-orange-300",
    pending: "bg-yellow-100 text-yellow-700 border-yellow-300",
  };

  const defaultLabels = {
    active: "Active",
    inactive: "Inactive",
    scanned: "Scanned",
    pending: "Pending",
  };

  return (
    <span
      className={`rounded-md border px-2 py-1 text-xs font-medium ${styles[status]}`}
    >
      {label || defaultLabels[status]}
    </span>
  );
}

export default StatusBadge;
