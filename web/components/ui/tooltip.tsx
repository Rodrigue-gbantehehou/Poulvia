"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TooltipContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const TooltipContext = React.createContext<TooltipContextType | undefined>(
  undefined
);

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function Tooltip({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);

  return (
    <TooltipContext.Provider value={{ open, setOpen }}>
      <div
        className="relative inline-flex"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        {children}
      </div>
    </TooltipContext.Provider>
  );
}

export function TooltipTrigger({
  children,
  className,
  asChild = false,
}: {
  children: React.ReactNode;
  className?: string;
  asChild?: boolean;
}) {
  if (asChild && React.isValidElement(children)) {
    return children;
  }

  return <span className={cn("inline-flex", className)}>{children}</span>;
}

export function TooltipContent({
  children,
  className,
  side = "right",
}: {
  children: React.ReactNode;
  className?: string;
  side?: "top" | "right" | "bottom" | "left";
}) {
  const context = React.useContext(TooltipContext);
  if (!context?.open) return null;

  const sideClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2.5",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2.5",
  };

  return (
    <div
      role="tooltip"
      className={cn(
        "pointer-events-none absolute z-50 whitespace-nowrap rounded-lg bg-[#0f241a] dark:bg-surface px-3 py-1.5 text-xs font-semibold text-white shadow-xl border border-white/15 dark:border-border animate-in fade-in zoom-in-95 duration-150 select-none",
        sideClasses[side],
        className
      )}
    >
      {children}
    </div>
  );
}
