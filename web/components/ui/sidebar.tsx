"use client";

import * as React from "react";
import { PanelLeft, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

const SIDEBAR_COOKIE_NAME = "poulvia_sidebar_state";
const SIDEBAR_KEYBOARD_SHORTCUT = "b";
const SIDEBAR_CHANGE_EVENT = "poulvia:sidebar-change";

function subscribeToSidebar(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(SIDEBAR_CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(SIDEBAR_CHANGE_EVENT, callback);
  };
}

function getSidebarSnapshot(defaultOpen: boolean) {
  try {
    const saved = localStorage.getItem(SIDEBAR_COOKIE_NAME);
    return saved === null ? defaultOpen : saved === "true";
  } catch {
    return defaultOpen;
  }
}

interface SidebarContextValue {
  state: "expanded" | "collapsed";
  open: boolean;
  setOpen: (open: boolean | ((value: boolean) => boolean)) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean | ((value: boolean) => boolean)) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
}

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

export function useSidebar(): SidebarContextValue {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }
  return context;
}

interface SidebarProviderProps {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

export function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  className,
  style,
  children,
}: SidebarProviderProps) {
  const [isMobile, setIsMobile] = React.useState(false);
  const [openMobile, setOpenMobile] = React.useState(false);

  const storedOpen = React.useSyncExternalStore(
    subscribeToSidebar,
    () => getSidebarSnapshot(defaultOpen),
    () => defaultOpen
  );
  const open = openProp !== undefined ? openProp : storedOpen;

  const setOpen = React.useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const openState = typeof value === "function" ? value(open) : value;
      if (setOpenProp) {
        setOpenProp(openState);
      }

      try {
        localStorage.setItem(SIDEBAR_COOKIE_NAME, String(openState));
      } catch {
        // Ignorer si localStorage indisponible
      }
      window.dispatchEvent(new Event(SIDEBAR_CHANGE_EVENT));
    },
    [setOpenProp, open]
  );

  // Détection mobile (écran < 1024px)
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggleSidebar = React.useCallback(() => {
    if (isMobile) {
      setOpenMobile((prev) => !prev);
    } else {
      setOpen((prev) => !prev);
    }
  }, [isMobile, setOpen]);

  // Raccourci clavier Ctrl+B ou Cmd+B
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar]);

  const state = open ? "expanded" : "collapsed";

  const contextValue = React.useMemo<SidebarContextValue>(
    () => ({
      state,
      open,
      setOpen,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar,
    }),
    [state, open, setOpen, isMobile, openMobile, toggleSidebar]
  );

  return (
    <SidebarContext.Provider value={contextValue}>
      <div
        style={style}
        className={cn(
          "group/sidebar-wrapper flex min-h-screen w-full bg-background",
          className
        )}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: "left" | "right";
  variant?: "sidebar" | "floating" | "inset";
  collapsible?: "offcanvas" | "icon" | "none";
}

export const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  (
    {
      side = "left",
      variant = "sidebar",
      collapsible = "icon",
      className,
      children,
      ...props
    },
    ref
  ) => {
    const { isMobile, state, openMobile, setOpenMobile } = useSidebar();

    // Mode mobile (tiroir / drawer off-canvas)
    if (isMobile) {
      return (
        <>
          {openMobile && (
            <div
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity lg:hidden animate-in fade-in duration-200"
              onClick={() => setOpenMobile(false)}
            />
          )}
          <aside
            ref={ref}
            data-mobile="true"
            className={cn(
              "fixed top-0 bottom-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col rounded-r-3xl border-r border-white/10 bg-gradient-to-b from-[#1b4331] via-[#163627] to-[#11291d] text-white shadow-2xl transition-transform duration-300 ease-in-out lg:hidden",
              openMobile ? "translate-x-0" : "-translate-x-full",
              className
            )}
            {...props}
          >
            {children}
          </aside>
        </>
      );
    }

    // Mode desktop avec pliable icon
    const isCollapsed = state === "collapsed" && collapsible === "icon";

    return (
      <aside
        ref={ref}
        data-state={state}
        data-collapsible={collapsible}
        className={cn(
          "relative hidden lg:flex flex-col border-r border-white/10 bg-gradient-to-b from-[#1b4331] via-[#163627] to-[#11291d] text-white transition-[width] duration-300 ease-in-out shrink-0 select-none",
          isCollapsed ? "w-[72px]" : "w-64",
          className
        )}
        {...props}
      >
        {children}
      </aside>
    );
  }
);
Sidebar.displayName = "Sidebar";

export const SidebarTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, onClick, ...props }, ref) => {
  const { toggleSidebar, state } = useSidebar();

  return (
    <button
      ref={ref}
      type="button"
      aria-label="Basculer la barre latérale"
      title={state === "collapsed" ? "Agrandir le menu (Ctrl+B)" : "Réduire le menu (Ctrl+B)"}
      onClick={(e) => {
        onClick?.(e);
        toggleSidebar();
      }}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-lg p-1.5 text-white/70 hover:bg-white/10 hover:text-white transition-colors cursor-pointer",
        className
      )}
      {...props}
    >
      {state === "collapsed" ? (
        <PanelLeftOpen className="h-4 w-4" />
      ) : (
        <PanelLeftClose className="h-4 w-4" />
      )}
      <span className="sr-only">Basculer la barre latérale</span>
    </button>
  );
});
SidebarTrigger.displayName = "SidebarTrigger";

export const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("flex flex-col gap-2 p-3 border-b border-white/10", className)}
      {...props}
    />
  );
});
SidebarHeader.displayName = "SidebarHeader";

export const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-1 scrollbar-thin",
        className
      )}
      {...props}
    />
  );
});
SidebarContent.displayName = "SidebarContent";

export const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("flex flex-col gap-2 p-3 border-t border-white/10", className)}
      {...props}
    />
  );
});
SidebarFooter.displayName = "SidebarFooter";

export const SidebarGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("relative flex w-full min-w-0 flex-col p-1", className)}
      {...props}
    />
  );
});
SidebarGroup.displayName = "SidebarGroup";

export const SidebarGroupLabel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const { state } = useSidebar();
  if (state === "collapsed") {
    return <div className="mx-auto my-2 h-px w-6 bg-white/15" />;
  }

  return (
    <div
      ref={ref}
      className={cn(
        "px-2 pb-1.5 text-[10px] font-bold tracking-wider uppercase text-white/50 truncate",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
SidebarGroupLabel.displayName = "SidebarGroupLabel";

export const SidebarGroupContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("w-full space-y-1", className)}
      {...props}
    />
  );
});
SidebarGroupContent.displayName = "SidebarGroupContent";

export const SidebarMenu = React.forwardRef<
  HTMLUListElement,
  React.HTMLAttributes<HTMLUListElement>
>(({ className, ...props }, ref) => {
  return (
    <ul
      ref={ref}
      className={cn("flex w-full min-w-0 flex-col gap-1 list-none p-0 m-0", className)}
      {...props}
    />
  );
});
SidebarMenu.displayName = "SidebarMenu";

export const SidebarMenuItem = React.forwardRef<
  HTMLLIElement,
  React.HTMLAttributes<HTMLLIElement>
>(({ className, ...props }, ref) => {
  return (
    <li
      ref={ref}
      className={cn("group/menu-item relative list-none", className)}
      {...props}
    />
  );
});
SidebarMenuItem.displayName = "SidebarMenuItem";

export interface SidebarMenuButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  isActive?: boolean;
  tooltip?: string;
}

export const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  SidebarMenuButtonProps
>(
  (
    {
      asChild = false,
      isActive = false,
      tooltip,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const { state, isMobile } = useSidebar();
    const isCollapsed = state === "collapsed" && !isMobile;

    const buttonClass = cn(
      "group relative flex w-full items-center rounded-2xl text-xs font-semibold transition-all duration-150 active:scale-[0.98] outline-none",
      isCollapsed
        ? "h-11 w-11 mx-auto justify-center p-0"
        : "gap-3 px-3.5 py-2.5",
      isActive
        ? "bg-white/15 text-white font-bold"
        : "text-white/75 hover:bg-white/10 hover:text-white",
      className
    );

    const content = (
      <>
        {/* Barre indicateur actif gauche (mode étendu) */}
        {isActive && !isCollapsed && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-accent shadow-[0_0_8px_rgba(221,166,75,0.9)]" />
        )}

        {/* Puce d'état actif sur l'icône (mode replié) */}
        {isActive && isCollapsed && (
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-accent shadow-[0_0_6px_rgba(221,166,75,0.9)]" />
        )}

        {children}

        {/* Puce droite de validation active (mode étendu) */}
        {isActive && !isCollapsed && (
          <span className="ml-auto h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_6px_rgba(221,166,75,0.9)]" />
        )}
      </>
    );

    if (isCollapsed && tooltip) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <button ref={ref} className={buttonClass} {...props}>
              {content}
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">{tooltip}</TooltipContent>
        </Tooltip>
      );
    }

    return (
      <button ref={ref} className={buttonClass} {...props}>
        {content}
      </button>
    );
  }
);
SidebarMenuButton.displayName = "SidebarMenuButton";

export const SidebarSeparator = React.forwardRef<
  HTMLHRElement,
  React.HTMLAttributes<HTMLHRElement>
>(({ className, ...props }, ref) => {
  return (
    <hr
      ref={ref}
      className={cn("my-2 h-px w-full bg-white/10 border-0", className)}
      {...props}
    />
  );
});
SidebarSeparator.displayName = "SidebarSeparator";
