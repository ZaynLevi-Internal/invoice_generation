export default function StatusBadge({ status }) {
  const styles = {
    Pending: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    Paid: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    Cancelled: 'bg-red-50 text-red-700 ring-red-600/20'
  };
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${styles[status] || styles.Pending}`}>
      {status}
    </span>
  );
}
