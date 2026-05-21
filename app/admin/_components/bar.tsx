type BarRow = {
  label: string;
  count: number;
  highlight?: boolean;
};

export function BarChart({
  rows,
  total,
  sort = true,
}: {
  rows: BarRow[];
  total: number;
  /** Sort by count desc; pass false to preserve input order */
  sort?: boolean;
}) {
  const sorted = sort ? [...rows].sort((a, b) => b.count - a.count) : rows;
  const max = Math.max(1, ...sorted.map((r) => r.count));
  return (
    <div className="grid gap-2">
      {sorted.map((row) => {
        const pct = total > 0 ? Math.round((row.count / total) * 100) : 0;
        const fill = (row.count / max) * 100;
        return (
          <div key={row.label} className="grid grid-cols-[1fr_auto] gap-3">
            <div>
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-helper-text text-lk-ink">
                  {row.label}
                </span>
                <span className="text-helper-text text-lk-ink-muted">
                  {row.count} · {pct}%
                </span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-lk-line">
                <div
                  className={`h-full rounded-full ${row.highlight ? "bg-lk-accent" : "bg-lk-ink"}`}
                  style={{ width: `${fill}%` }}
                  aria-hidden
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
