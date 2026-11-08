"use client";

import React from "react";

export interface EggChartPoint {
  date: string;
  goodEggs: number | null;
}

interface EggProductionChartProps {
  points: EggChartPoint[];
  isLoading?: boolean;
  error?: string | null;
  title?: string;
  startDate?: string;
  endDate?: string;
}

export function EggProductionChart({
  points,
  isLoading = false,
  error = null,
  title = "Production d'œufs",
  startDate,
  endDate,
}: EggProductionChartProps) {
  const observations = new Map(points.map((point) => [point.date, point.goodEggs]));
  const plotPoints: EggChartPoint[] = [];
  if (points.length > 0) {
    const cursor = new Date(`${startDate ?? points[0].date}T12:00:00Z`);
    const last = new Date(`${endDate ?? points[points.length - 1].date}T12:00:00Z`);
    while (cursor <= last) {
      const date = cursor.toISOString().slice(0, 10);
      plotPoints.push({ date, goodEggs: observations.get(date) ?? null });
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
  }
  const values = points.flatMap((point) => point.goodEggs === null ? [] : [Math.max(0, point.goodEggs)]);
  const max = Math.max(...values, 0);
  const width = 640;
  const height = 190;
  const padX = 24;
  const padY = 18;
  const usableHeight = height - padY * 2;
  const coords = plotPoints.map((point, index) => {
    const x = plotPoints.length <= 1 ? width / 2 : padX + (index * (width - padX * 2)) / (plotPoints.length - 1);
    const y = point.goodEggs === null ? null : height - padY - (max > 0 ? (Math.max(0, point.goodEggs) / max) * usableHeight : 0);
    return { x, y, point };
  });
  const lineSegments: string[] = [];
  let currentSegment: string[] = [];
  for (const { x, y } of coords) {
    if (y === null) {
      if (currentSegment.length > 1) lineSegments.push(currentSegment.join(" "));
      currentSegment = [];
    } else {
      currentSegment.push(`${x},${y}`);
    }
  }
  if (currentSegment.length > 1) lineSegments.push(currentSegment.join(" "));
  const label = (date: string) => new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit" }).format(new Date(`${date}T12:00:00`));

  return (
    <section className="rounded-2xl border border-border bg-surface p-4 sm:p-5" aria-label={title}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-foreground">{title}</h2>
          <p className="text-xs text-muted">Œufs bons par jour · 7 derniers jours</p>
        </div>
        <span className="text-xs font-semibold text-primary">{max ? `${new Intl.NumberFormat("fr-FR").format(max)} max.` : ""}</span>
      </div>

      {isLoading ? (
        <div className="h-48 animate-pulse rounded-xl bg-surface-muted" role="status" aria-label="Chargement du graphique" />
      ) : error ? (
        <div className="flex h-48 items-center justify-center rounded-xl border border-danger/20 bg-danger-soft px-4 text-center text-sm text-danger">{error}</div>
      ) : points.length === 0 ? (
        <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-border px-4 text-center text-sm text-muted">Aucune donnée de production sur cette période.</div>
      ) : (
        <div className="w-full">
          <svg viewBox={`0 0 ${width} ${height}`} className="h-44 w-full overflow-visible" role="img" aria-label={`Évolution de la production : ${points.map((p) => `${label(p.date)} ${p.goodEggs} œufs`).join(", ")}`}>
            {[0, 1, 2].map((line) => {
              const y = padY + (usableHeight * line) / 2;
              return <line key={line} x1={padX} x2={width - padX} y1={y} y2={y} className="stroke-border" strokeDasharray="3 5" />;
            })}
            {lineSegments.map((segment, index) => <polyline key={index} points={segment} fill="none" className="stroke-primary" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />)}
            {coords.filter(({ y }) => y !== null).map(({ x, y, point }) => (
              <g key={point.date}>
                <circle cx={x} cy={y!} r="5" className="fill-surface stroke-primary" strokeWidth="3">
                  <title>{`${label(point.date)} : ${new Intl.NumberFormat("fr-FR").format(point.goodEggs ?? 0)} œufs`}</title>
                </circle>
              </g>
            ))}
          </svg>
          <div className="-mt-1 flex justify-between px-2 text-[10px] text-muted">
            {plotPoints.filter((_, index) => index === 0 || index === plotPoints.length - 1 || index === Math.floor((plotPoints.length - 1) / 2)).map((point) => <span key={point.date}>{label(point.date)}</span>)}
          </div>
        </div>
      )}
    </section>
  );
}
