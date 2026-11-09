"use client";

import React from "react";

export interface EggChartPoint {
  date: string;
  goodEggs: number | null;
  crackedEggs: number | null;
  abnormalEggs: number | null;
}

interface EggProductionChartProps {
  points: EggChartPoint[];
  isLoading?: boolean;
  error?: string | null;
  title?: string;
  startDate?: string;
  endDate?: string;
}

type ChartSeries = {
  key: "goodEggs" | "crackedEggs" | "abnormalEggs";
  label: string;
  color: string;
};

type ChartCoordinate = {
  x: number;
  y: number | null;
  date: string;
  value: number | null;
};

const SERIES: ChartSeries[] = [
  { key: "goodEggs", label: "Œufs normaux", color: "#168653" },
  { key: "crackedEggs", label: "Œufs fêlés", color: "#d34a45" },
  { key: "abnormalEggs", label: "Autres œufs anormaux", color: "#d28a18" },
];

function makeSmoothPaths(points: ChartCoordinate[]): string[] {
  const segments: ChartCoordinate[][] = [];
  let current: ChartCoordinate[] = [];

  for (const point of points) {
    if (point.y === null) {
      if (current.length > 0) segments.push(current);
      current = [];
      continue;
    }
    current.push(point);
  }
  if (current.length > 0) segments.push(current);

  return segments.map((segment) => {
    if (segment.length === 1) {
      return `M ${segment[0].x} ${segment[0].y}`;
    }

    let path = `M ${segment[0].x} ${segment[0].y}`;
    for (let index = 0; index < segment.length - 1; index += 1) {
      const previous = segment[Math.max(0, index - 1)];
      const start = segment[index];
      const end = segment[index + 1];
      const next = segment[Math.min(segment.length - 1, index + 2)];
      const control1X = start.x + (end.x - previous.x) / 6;
      const control1Y = start.y! + (end.y! - previous.y!) / 6;
      const control2X = end.x - (next.x - start.x) / 6;
      const control2Y = end.y! - (next.y! - start.y!) / 6;
      path += ` C ${control1X} ${control1Y}, ${control2X} ${control2Y}, ${end.x} ${end.y}`;
    }
    return path;
  });
}

export function EggProductionChart({
  points,
  isLoading = false,
  error = null,
  title = "Production d'œufs",
  startDate,
  endDate,
}: EggProductionChartProps) {
  const observations = new Map(points.map((point) => [point.date, point]));
  const plotPoints: Array<{ date: string; point: EggChartPoint | null }> = [];
  if (points.length > 0) {
    const firstDate = startDate || points[0].date;
    const lastDate = endDate || points[points.length - 1].date;
    const cursor = new Date(`${firstDate}T12:00:00Z`);
    const last = new Date(`${lastDate}T12:00:00Z`);
    while (cursor <= last) {
      const date = cursor.toISOString().slice(0, 10);
      plotPoints.push({ date, point: observations.get(date) ?? null });
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
  }

  const allValues = points.flatMap((point) => SERIES.map(({ key }) => point[key] ?? 0));
  const max = Math.max(...allValues, 0);
  const width = 640;
  const height = 220;
  const padX = 58;
  const padY = 22;
  const usableHeight = height - padY * 2;
  const seriesCoordinates = SERIES.map((series) => ({
    ...series,
    coordinates: plotPoints.map(({ date, point }, index): ChartCoordinate => {
      const x = plotPoints.length <= 1
        ? width / 2
        : padX + (index * (width - padX * 2)) / (plotPoints.length - 1);
      const value = point?.[series.key] ?? null;
      const y = value === null
        ? null
        : height - padY - (max > 0 ? (Math.max(0, value) / max) * usableHeight : 0);
      return { x, y, date, value };
    }),
  }));

  const label = (date: string) => new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(`${date}T12:00:00`));
  const number = (value: number) => new Intl.NumberFormat("fr-FR").format(value);
  const ticks = max > 0 ? [max, max / 2, 0] : [0];
  const ariaDescription = seriesCoordinates
    .map(({ label: seriesLabel, coordinates }) =>
      `${seriesLabel}: ${coordinates
        .filter((coordinate) => coordinate.value !== null)
        .map((coordinate) => `${label(coordinate.date)} ${number(coordinate.value!)}`)
        .join(", ")}`,
    )
    .join(". ");

  return (
    <section className="rounded-card border border-border bg-surface p-4 shadow-card sm:p-5" aria-label={title}>
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          <p className="text-caption text-muted">Production quotidienne par qualité d’œuf</p>
        </div>
        {max > 0 && (
          <span className="text-caption font-medium text-muted">{number(max)} œufs max.</span>
        )}
      </div>

      <div className="mb-3 flex flex-wrap gap-x-4 gap-y-2" aria-label="Légende du graphique">
        {SERIES.map((series) => (
          <span key={series.key} className="inline-flex items-center gap-1.5 text-caption text-muted">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: series.color }} aria-hidden="true" />
            {series.label}
          </span>
        ))}
      </div>

      {isLoading ? (
        <div className="h-48 animate-pulse rounded-xl bg-surface-muted" role="status" aria-label="Chargement du graphique" />
      ) : error ? (
        <div className="flex h-48 items-center justify-center rounded-xl border border-danger/20 bg-danger-soft px-4 text-center text-sm text-danger">{error}</div>
      ) : points.length === 0 ? (
        <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-border px-4 text-center text-sm text-muted">Aucune donnée de production sur cette période.</div>
      ) : (
        <div className="w-full">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="h-48 w-full overflow-visible"
            role="img"
            aria-label={`Évolution de la production. ${ariaDescription}`}
          >
            {ticks.map((tick, index) => {
              const y = padY + (usableHeight * index) / Math.max(1, ticks.length - 1);
              return (
                <g key={`${tick}-${index}`}>
                  <line x1={padX} x2={width - padX} y1={y} y2={y} className="stroke-border" strokeDasharray="3 5" />
                  <text x={padX - 8} y={y + 4} textAnchor="end" className="fill-muted" fontSize="11">
                    {number(tick)}
                  </text>
                </g>
              );
            })}

            {seriesCoordinates.map((series) => {
              const paths = makeSmoothPaths(series.coordinates);
              return (
                <g key={series.key}>
                  {paths.map((path, index) => (
                    <path
                      key={`${series.key}-${index}`}
                      d={path}
                      fill="none"
                      stroke={series.color}
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  ))}
                  {series.coordinates.filter((coordinate) => coordinate.y !== null).map((coordinate) => (
                    <circle
                      key={`${series.key}-${coordinate.date}`}
                      cx={coordinate.x}
                      cy={coordinate.y!}
                      r="4"
                      fill="var(--color-surface)"
                      stroke={series.color}
                      strokeWidth="2.5"
                    >
                      <title>{`${series.label}, ${label(coordinate.date)} : ${number(coordinate.value ?? 0)} œufs`}</title>
                    </circle>
                  ))}
                </g>
              );
            })}
          </svg>
          <div className="-mt-1 flex justify-between px-2 text-caption text-muted">
            {plotPoints.filter((_, index) =>
              index === 0 || index === plotPoints.length - 1 || index === Math.floor((plotPoints.length - 1) / 2),
            ).map((point) => <span key={point.date}>{label(point.date)}</span>)}
          </div>
        </div>
      )}
    </section>
  );
}
