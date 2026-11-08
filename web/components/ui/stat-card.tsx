import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
    label?: string;
  };
  accent?: "primary" | "amber" | "rose" | "sky" | "zinc";
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  accent = "primary",
  className,
}: StatCardProps) {
  // Styles du médaillon d'icône avec survol doux et palette sémantique
  const iconContainerStyles = {
    primary: "bg-primary-soft text-primary border border-primary/20 group-hover:scale-105 group-hover:shadow-xs",
    amber: "bg-accent-soft text-accent border border-accent/20 group-hover:scale-105 group-hover:shadow-xs",
    rose: "bg-danger-soft text-danger border border-danger/20 group-hover:scale-105 group-hover:shadow-xs",
    sky: "bg-info-soft text-info border border-info/20 group-hover:scale-105 group-hover:shadow-xs",
    zinc: "bg-surface-muted text-muted border border-border group-hover:scale-105 group-hover:shadow-xs",
  };

  // Bordure douce au survol alignée sur la couleur de la métrique
  const hoverBorderStyles = {
    primary: "hover:border-primary/40",
    amber: "hover:border-accent/40",
    rose: "hover:border-danger/40",
    sky: "hover:border-info/40",
    zinc: "hover:border-border",
  };

  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-card border border-border bg-surface p-3.5 sm:p-5 shadow-card transition-colors hover:border-primary/30",
        hoverBorderStyles[accent],
        className
      )}
    >
      {/* Ligne d'en-tête : Titre & Médaillon d'icône */}
      <div className="flex items-start justify-between gap-2 sm:gap-3">
        <div className="min-w-0 flex-1">
          <p
            title={title}
            className="text-label font-medium leading-snug text-muted line-clamp-2 sm:line-clamp-1"
          >
            {title}
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-lg sm:text-2xl font-semibold leading-tight tracking-tight text-foreground tabular-nums break-words">
              {value}
            </span>
          </div>
        </div>

        {icon && (
          <div
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-control transition-colors [&>svg]:h-4 [&>svg]:w-4",
              iconContainerStyles[accent]
            )}
          >
            {icon}
          </div>
        )}
      </div>

      {/* Zone inférieure : Sous-titre et/ou Badge pilule de tendance */}
      {(subtitle || trend) && (
        <div className="mt-3 pt-2.5 border-t border-border flex flex-wrap items-center justify-between gap-2 text-label">
          {subtitle && (
            <p title={subtitle} className="min-w-0 flex-1 basis-full sm:basis-auto text-caption leading-snug text-muted line-clamp-2 sm:line-clamp-1">
              {subtitle}
            </p>
          )}

          {trend && (
            <div
              className={cn(
                "inline-flex items-center gap-1 rounded-control px-2 py-1 text-caption font-medium border shrink-0",
                trend.isPositive
                  ? "bg-success-soft text-success border-success/20"
                  : "bg-danger-soft text-danger border-danger/20"
              )}
            >
              {trend.isPositive ? (
                <TrendingUp className="h-3 w-3 shrink-0 text-success" />
              ) : (
                <TrendingDown className="h-3 w-3 shrink-0 text-danger" />
              )}
              <span>{trend.value}</span>
              {trend.label && (
                <span className="text-muted text-caption ml-0.5 font-normal">
                  {trend.label}
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
