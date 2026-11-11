"use client";

import React from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PageHeaderProps {
  title: string;
  mobileTitle?: string;
  subtitle?: React.ReactNode;
  badge?: React.ReactNode;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  backHref?: string;
  inlineOnMobile?: boolean;
  className?: string;
}

export function PageHeader({
  title,
  mobileTitle,
  subtitle,
  badge,
  icon,
  actions,
  backHref,
  inlineOnMobile = false,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        inlineOnMobile
          ? "flex flex-row items-center justify-between gap-2 pb-4 sm:pb-5"
          : "flex-col items-stretch gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between sm:pb-5",
        className
      )}
    >
      {/* Gauche : Retour optionnel + Icône + Titre & Sous-titre */}
      <div className={cn("flex min-w-0 items-center gap-3", inlineOnMobile && "flex-1")}>
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
            <h1 className={cn("text-xl sm:text-2xl font-semibold tracking-tight text-foreground truncate", inlineOnMobile && "text-lg sm:text-2xl")}>
              {mobileTitle ? (
                <>
                  <span className="sm:hidden">{mobileTitle}</span>
                  <span className="hidden sm:inline">{title}</span>
                </>
              ) : title}
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

      {/* Les actions restent à côté du titre lorsque l'option mobile inline est activée. */}
      {actions && (
        <div className={inlineOnMobile
          ? "flex w-auto shrink-0 flex-nowrap items-center justify-end gap-2"
          : "flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto sm:shrink-0"}>
          {actions}
        </div>
      )}
    </div>
  );
}
