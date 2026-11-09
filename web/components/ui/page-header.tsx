"use client";

import React from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PageHeaderProps {
  title: string;
  subtitle?: React.ReactNode;
  badge?: React.ReactNode;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  backHref?: string;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  badge,
  icon,
  actions,
  backHref,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-stretch gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between sm:pb-5",
        className
      )}
    >
      {/* Gauche : Retour optionnel + Icône + Titre & Sous-titre */}
      <div className="flex min-w-0 items-center gap-3">
        {backHref && (
          <Link
            href={backHref}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control border border-border bg-surface text-foreground hover:bg-surface-hover transition-colors cursor-pointer"
            title="Retour"
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>
        )}

        {icon && (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-primary-soft text-primary">
            {icon}
          </div>
        )}

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground truncate">
              {title}
            </h1>
            {badge}
          </div>
          {subtitle && (
            <div className="text-label font-normal text-muted truncate leading-snug">
              {subtitle}
            </div>
          )}
        </div>
      </div>

      {/* Les actions passent sur une ligne distincte sur petit écran. */}
      {actions && (
        <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto sm:shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}
