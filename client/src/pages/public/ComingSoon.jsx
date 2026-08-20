export default function ComingSoon({ title }) {
  return (
    <div className="container" style={{ padding: "60px 0", textAlign: "center" }}>
      <h1>{title}</h1>
      <p style={{ color: "var(--color-text-muted)" }}>
        This page is built in a later week of the Business Catalogue project.
      </p>
    </div>
  );
}
