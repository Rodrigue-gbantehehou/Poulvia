"use client";

import React, { useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

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

const SERIES = [
  { key: "goodEggs", label: "Œufs normaux", color: "#168653" },
  { key: "crackedEggs", label: "Œufs fêlés", color: "#d34a45" },
  { key: "abnormalEggs", label: "Autres œufs anormaux", color: "#d28a18" },
] as const;

function formatDate(date: string) {
  const parsed = new Date(`${date}T12:00:00`);
  return Number.isNaN(parsed.getTime())
    ? date
    : new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit" }).format(parsed);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(value);
}

export function EggProductionChart({
  points,
  isLoading = false,
  error = null,
  title = "Production d'œufs",
  startDate,
  endDate,
}: EggProductionChartProps) {
  const chartData = useMemo(() => {
    if (points.length === 0) return [];

    const observations = new Map(points.map((point) => [point.date, point]));
    const first = new Date(`${startDate || points[0].date}T12:00:00Z`);
    const last = new Date(`${endDate || points[points.length - 1].date}T12:00:00Z`);
    if (Number.isNaN(first.getTime()) || Number.isNaN(last.getTime()) || first > last) {
      return points.map((point) => ({ ...point, label: formatDate(point.date) }));
    }

    const days: EggChartPoint[] = [];
    const cursor = new Date(first);
    while (cursor <= last) {
      const date = cursor.toISOString().slice(0, 10);
      const observation = observations.get(date);
      days.push(observation ?? { date, goodEggs: null, crackedEggs: null, abnormalEggs: null });
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }

    return days.map((point) => ({ ...point, label: formatDate(point.date) }));
  }, [points, startDate, endDate]);

  const max = Math.max(0, ...points.flatMap((point) =>
    SERIES.map(({ key }) => point[key] ?? 0),
  ));
  const ariaDescription = SERIES.map(({ key, label }) =>
    `${label}: ${points.map((point) => `${formatDate(point.date)} ${formatNumber(point[key] ?? 0)}`).join(", ")}`,
  ).join(". ");

  return (
    <section className="rounded-card border border-border bg-surface p-4 shadow-card sm:p-5" aria-label={title}>
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          <p className="text-caption text-muted">Production quotidienne par qualité d’œuf</p>
        </div>
        {max > 0 && <span className="text-caption font-medium text-muted">{formatNumber(max)} œufs max.</span>}
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
        <div className="h-48 w-full" role="img" aria-label={`Évolution de la production. ${ariaDescription}`}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: 4 }}>
              <CartesianGrid stroke="var(--border-color)" strokeDasharray="3 5" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                minTickGap={24}
                tickMargin={8}
              />
              <YAxis
                domain={[0, Math.max(1, max)]}
                allowDecimals={false}
                tickFormatter={(value: number) => formatNumber(value)}
                tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={42}
              />
              <Tooltip
                labelFormatter={(value) => formatDate(String(value))}
                formatter={(value, name) => [`${formatNumber(Number(value))} œufs`, String(name)]}
                contentStyle={{
                  backgroundColor: "var(--bg-surface)",
                  border: "1px solid var(--border-color)",
                  borderRadius: 12,
                  boxShadow: "0 8px 24px rgb(0 0 0 / 10%)",
                  fontSize: 12,
                }}
                labelStyle={{ color: "var(--text-primary)", fontWeight: 600, marginBottom: 4 }}
              />
              <Line type="monotone" dataKey="goodEggs" name="Œufs normaux" stroke={SERIES[0].color} strokeWidth={2.5} dot={chartData.filter((point) => point.goodEggs !== null).length === 1 ? { r: 3 } : false} activeDot={{ r: 4 }} connectNulls isAnimationActive={false} />
              <Line type="monotone" dataKey="crackedEggs" name="Œufs fêlés" stroke={SERIES[1].color} strokeWidth={2.5} dot={chartData.filter((point) => point.crackedEggs !== null).length === 1 ? { r: 3 } : false} activeDot={{ r: 4 }} connectNulls isAnimationActive={false} />
              <Line type="monotone" dataKey="abnormalEggs" name="Autres œufs anormaux" stroke={SERIES[2].color} strokeWidth={2.5} dot={chartData.filter((point) => point.abnormalEggs !== null).length === 1 ? { r: 3 } : false} activeDot={{ r: 4 }} connectNulls isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
          {points.length === 1 && (
            <p className="mt-1 text-center text-caption text-muted">
              Ajoutez un relevé sur une autre journée pour afficher l’évolution.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
