"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://app.poulvia.com";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const links = [
    ["Fonctionnalités", "/#suivi"],
    ["Comment ça marche", "/#demarrage"],
    ["Application Android", "/beta-android"],
  ];

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5" aria-label="Poulvia, accueil">
          <Image src="/logo.png" alt="" width={38} height={38} priority className="h-9 w-9 rounded-lg object-contain" />
          <span className="text-xl font-bold tracking-tight text-foreground">Poul<span className="text-primary">via</span></span>
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {links.map(([label, href]) => <Link key={label} href={href} className="text-sm font-medium text-muted transition hover:text-primary">{label}</Link>)}
        </nav>
        <div className="hidden items-center gap-5 md:flex">
          <a href={`${appUrl}/login`} className="text-sm font-semibold text-foreground hover:text-primary">Connexion</a>
          <a href={`${appUrl}/register`} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-hover">Créer un compte <ArrowRight className="h-4 w-4" /></a>
        </div>
        <button type="button" onClick={() => setOpen(!open)} className="rounded-lg p-2 text-foreground hover:bg-primary-soft md:hidden" aria-expanded={open} aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && <div className="border-t border-border bg-surface px-4 py-4 shadow-lg md:hidden"><nav className="mx-auto flex max-w-7xl flex-col gap-1">{links.map(([label, href]) => <Link key={label} href={href} onClick={() => setOpen(false)} className="rounded-lg px-3 py-3 text-sm font-medium text-foreground hover:bg-primary-soft">{label}</Link>)}<a href={`${appUrl}/login`} className="rounded-lg px-3 py-3 text-sm font-medium text-foreground hover:bg-primary-soft">Connexion</a><a href={`${appUrl}/register`} className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white">Créer un compte <ArrowRight className="h-4 w-4" /></a></nav></div>}
    </header>
  );
}
