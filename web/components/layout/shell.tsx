"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { BottomNav } from "./bottom-nav";
import Image from "next/image";

export function Shell({ children }: { children: React.ReactNode }) {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !token) {
      router.push("/login");
    }
  }, [isLoading, token, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="relative flex h-16 w-16 animate-bounce items-center justify-center overflow-hidden rounded-2xl bg-surface p-1 shadow-lg border border-border">
            <Image src="/logo.png" alt="Poulvia" width={56} height={56} className="h-full w-full object-contain" priority />
          </div>
          <p className="text-xs font-semibold text-muted">
            Chargement de Poulvia...
          </p>
        </div>
      </div>
    );
  }

  if (!token) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto p-3 sm:p-6 lg:p-8 pb-28 sm:pb-32 lg:pb-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
      <BottomNav onOpenMenu={() => setSidebarOpen(true)} />
    </div>
  );
}

