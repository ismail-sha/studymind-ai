export default function TopBar({ title, subtitle, actions }) {
  return (
    <div className="topbar">
      <div>
        <h2 style={{ fontSize: 17, fontWeight: 700, margin: 0 }}>{title}</h2>
        {subtitle && (
          <div className="text-xs text-muted mt-1">{subtitle}</div>
        )}
      </div>
      {actions && (
        <div className="flex-center gap-3">{actions}</div>
      )}
    </div>
  );
}
