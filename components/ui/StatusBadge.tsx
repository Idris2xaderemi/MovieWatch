export default function StatusBadge({ status }: { status: 'want' | 'watching' | 'watched' }) {
  const map = {
    want: { label: 'Want to watch', className: 'status-want' },
    watching: { label: 'Watching', className: 'status-watching' },
    watched: { label: 'Watched', className: 'status-watched' },
  };
  const { label, className } = map[status];
  return (
    <span className={`status-pill px-2 py-1 text-[10px] font-medium rounded-full ${className}`}>
      {label}
    </span>
  );
}