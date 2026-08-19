export default function Skeleton({ className = '' }) {
  return (
    <div className={`animate-pulse rounded-lg bg-white/5 ${className}`} aria-hidden="true" />
  );
}
