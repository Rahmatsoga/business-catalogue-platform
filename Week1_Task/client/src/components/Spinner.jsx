export default function Spinner({ label = "Loading..." }) {
  return (
    <div className="loading-screen" role="status" aria-live="polite">
      {label}
    </div>
  );
}
