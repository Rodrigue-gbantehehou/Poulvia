import Image from "next/image";
import Link from "next/link";
import {
  ArrowDownRight,
  ArrowRight,
  Bird,
  Egg,
  HeartPulse,
  Package,
  Smartphone,
  Wallet,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://app.poulvia.com";

const capabilities = [
  {
    icon: Bird,
    number: "01",
    title: "Suivez vos bandes",
    text: "Retrouvez les effectifs et les mouvements de chaque bande au fil de l’élevage.",
    tag: "Pondeuses · Chair · Mixte",
  },
  {
    icon: Egg,
    number: "02",
    title: "Notez les collectes",
    text: "Pour les élevages de pondeuses, enregistrez les œufs et retrouvez leur conversion en plateaux de 30.",
    tag: "Production d’œufs",
  },
  {
    icon: Package,
    number: "03",
    title: "Gardez un œil sur les stocks",
    text: "Suivez les aliments et les intrants disponibles ainsi que leurs mouvements.",
    tag: "Stocks de la ferme",
  },
  {
    icon: HeartPulse,
    number: "04",
    title: "Organisez le suivi sanitaire",
    text: "Consignez les soins et consultez les éléments sanitaires à venir ou en retard.",
    tag: "Soins & vaccins",
  },
  {
    icon: Wallet,
    number: "05",
    title: "Suivez recettes et dépenses",
    text: "Enregistrez les ventes et les dépenses de l’exploitation en francs CFA.",
    tag: "Trésorerie en FCFA",
  },
];

const steps = [
  ["01", "Créez votre ferme", "Donnez un nom à votre exploitation et organisez vos bâtiments."],
  ["02", "Ajoutez vos bandes", "Précisez le type d’élevage, l’effectif initial et la date d’arrivée."],
  ["03", "Enregistrez les opérations", "Notez les événements de la journée depuis le web ou l’application mobile."],
];

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-hidden bg-background">
      <Navbar />
      <main>
        <section className="relative px-4 pb-20 pt-32 sm:px-6 md:pb-28 md:pt-40 lg:px-8">
          <div className="pointer-events-none absolute -right-32 top-20 h-[30rem] w-[30rem] rounded-full bg-accent-soft/70 blur-3xl" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.02fr_.98fr] lg:gap-16">
            <div className="max-w-2xl">
           
              <h1 className="text-4xl font-semibold leading-[1.08] tracking-[-0.045em] text-foreground sm:text-5xl lg:text-[4.25rem]">
                Votre élevage, <span className="text-primary">mieux suivi</span> chaque jour.
              </h1>
              <p className="mt-6 max-w-xl text-base leading-8 text-muted sm:text-lg">
                Poulvia rassemble les informations de votre ferme pour vous aider à suivre les bandes, la production, les stocks, les soins et les finances.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link href="/beta-android" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-hover">
                  <Smartphone className="h-4 w-4" /> Découvrir la bêta Android <ArrowRight className="h-4 w-4" />
                </Link>
                <a href={`${appUrl}/login`} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-5 text-sm font-semibold text-foreground transition hover:bg-surface-hover">
                  Accéder à Poulvia sur le web <ArrowRight className="h-4 w-4" />
                </a>
              </div>
              <div className="mt-6 flex items-center gap-2 text-xs text-muted">
                <span className="rounded-full bg-primary-soft px-2.5 py-1 font-semibold text-primary">Pensé pour le terrain</span>
                Pondeuses, poulets de chair et élevages mixtes
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[34rem]">
              <div className="absolute -left-5 top-12 z-10 hidden rounded-2xl border border-border bg-surface p-4 shadow-lg sm:block">
                <span className="block text-[10px] font-semibold uppercase tracking-[.16em] text-muted">Votre activité</span>
                <span className="mt-1 block text-sm font-semibold text-foreground">Au même endroit</span>
              </div>
              <div className="relative aspect-[1.02/1] overflow-hidden rounded-[2rem] border border-white/70 bg-primary shadow-[0_30px_80px_-35px_rgba(21,70,50,.45)]">
                <Image src="/images/farmer-hero.jpg" alt="Éleveur consultant Poulvia sur son téléphone dans son exploitation" fill priority sizes="(max-width: 1024px) 100vw, 45vw" className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/85 via-primary/5 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8">
                  <span className="text-xs font-medium uppercase tracking-[.2em] text-white/75">L’essentiel de la ferme</span>
                  <p className="mt-2 max-w-sm text-2xl font-semibold leading-tight sm:text-3xl">Des informations utiles, prêtes quand vous en avez besoin.</p>
                </div>
              </div>
              <div className="absolute -bottom-5 right-5 flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 shadow-xl sm:right-8">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent"><Egg className="h-5 w-5" /></span>
                <span><span className="block text-xs font-semibold text-foreground">Une ferme, plusieurs suivis</span><span className="block text-[11px] text-muted">Web · Application Android</span></span>
              </div>
            </div>
          </div>
          <a href="#suivi" className="mx-auto mt-20 hidden w-fit items-center gap-2 text-xs font-semibold text-muted hover:text-primary md:flex">Découvrir Poulvia <ArrowDownRight className="h-4 w-4" /></a>
        </section>

        <section id="suivi" className="scroll-mt-20 bg-surface py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 md:grid-cols-[.8fr_1.2fr] md:items-end">
              <div><p className="text-xs font-bold uppercase tracking-[.2em] text-accent">Un outil pour vos opérations</p><h2 className="mt-4 max-w-xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Les informations clés de votre ferme, réunies.</h2></div>
              <p className="max-w-xl text-sm leading-7 text-muted md:justify-self-end">Chaque élevage a son rythme. Poulvia vous aide à consigner les opérations et à retrouver leur historique, depuis votre espace web ou votre téléphone.</p>
            </div>
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {capabilities.map(({ icon: Icon, number, title, text, tag }) => (
                <article key={number} className="group rounded-2xl border border-border bg-background p-6 transition hover:-translate-y-1 hover:border-primary/25 hover:shadow-lg">
                  <div className="flex items-start justify-between"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary"><Icon className="h-5 w-5" /></span><span className="font-mono text-xs text-muted/60">{number}</span></div>
                  <h3 className="mt-6 text-lg font-semibold text-foreground">{title}</h3>
                  <p className="mt-2 min-h-[3.5rem] text-sm leading-6 text-muted">{text}</p>
                  <span className="mt-5 inline-flex rounded-full border border-border bg-surface px-3 py-1 text-[11px] font-semibold text-primary">{tag}</span>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="demarrage" className="scroll-mt-24 py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-[2rem] bg-primary px-6 py-12 text-white sm:px-10 md:px-14 md:py-16">
              <div className="grid gap-10 lg:grid-cols-[.85fr_1.15fr] lg:items-end">
                <div><p className="text-xs font-bold uppercase tracking-[.2em] text-white/65">Pour commencer</p><h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">Une mise en route simple, à votre rythme.</h2><p className="mt-4 max-w-md text-sm leading-7 text-white/75">Créez l’espace de votre exploitation, ajoutez vos bandes, puis consignez les opérations au fil des journées.</p></div>
                <div className="grid gap-3 sm:grid-cols-3">
                  {steps.map(([number, title, text]) => <div key={number} className="rounded-2xl border border-white/15 bg-white/[.07] p-5"><span className="font-mono text-xs text-accent">{number}</span><h3 className="mt-4 text-sm font-semibold">{title}</h3><p className="mt-2 text-xs leading-5 text-white/70">{text}</p></div>)}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-border bg-[#f2f0e8] py-16 md:py-20">
          <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
            <div className="max-w-2xl"><p className="text-xs font-bold uppercase tracking-[.2em] text-accent">Adapté aux pratiques locales</p><h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Des repères familiers pour gérer au quotidien.</h2><p className="mt-3 text-sm leading-7 text-muted">Plateaux de 30 œufs, aliments en sacs ou en kilogrammes, et suivi financier en francs CFA.</p></div>
          </div>
        </section>

        <section className="py-20 md:py-28">
          <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-soft text-accent"><Smartphone className="h-7 w-7" /></span>
            <p className="mt-6 text-xs font-bold uppercase tracking-[.2em] text-accent">Poulvia sur Android</p>
            <h2 className="mx-auto mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Emportez le suivi de votre ferme avec vous.</h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-muted">La version bêta Android se prépare. Découvrez son fonctionnement et les étapes d’installation avant le téléchargement.</p>
            <Link href="/beta-android" className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary-hover">Découvrir la bêta Android <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
