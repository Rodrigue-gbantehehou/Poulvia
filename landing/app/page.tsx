import Image from "next/image";
import Link from "next/link";
import {
  ArrowDownRight,
  ArrowRight,
  Apple,
  Bird,
  Egg,
  HeartPulse,
  Play,
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
    title: "Suivez bandes et production",
    text: "Consultez les effectifs et les mouvements de vos bandes, puis enregistrez les collectes d’œufs de vos pondeuses.",
    tag: "Élevages · Ponte",
  },
  {
    icon: HeartPulse,
    number: "02",
    title: "Gérez stocks et santé",
    text: "Suivez les aliments et les intrants disponibles, consignez les soins et repérez les échéances sanitaires.",
    tag: "Stocks · Soins",
  },
  {
    icon: Wallet,
    number: "03",
    title: "Suivez vos finances",
    text: "Enregistrez les ventes et les dépenses pour garder une vue claire sur la trésorerie de l’exploitation.",
    tag: "Recettes · Dépenses",
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
                <a href={`${appUrl}/register`} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-hover">
                  Créer mon compte <ArrowRight className="h-4 w-4" />
                </a>
                <a href={`${appUrl}/login`} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-5 text-sm font-semibold text-foreground transition hover:bg-surface-hover">
                  Me connecter <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[16rem] sm:max-w-[20rem] lg:max-w-[22rem]">
              <Image
                src="/images/poulvia-interface-accent-crop.png"
                alt="Interfaces de Poulvia sur ordinateur et téléphone, avec le tableau de bord de l’exploitation"
                width={2738}
                height={3626}
                priority
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="relative h-auto w-full mix-blend-multiply drop-shadow-[0_18px_28px_rgba(0,0,0,0.14)]"
              />
            </div>
          </div>
          <a href="#suivi" className="mx-auto mt-20 hidden w-fit items-center gap-2 text-xs font-semibold text-muted hover:text-primary md:flex">Découvrir Poulvia <ArrowDownRight className="h-4 w-4" /></a>
        </section>

        <section id="suivi" className="scroll-mt-20 bg-surface py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-[.2em] text-accent">Un outil pour vos opérations</p>
              <h2 className="mt-4 max-w-xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Les informations clés de votre ferme, réunies.</h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-muted">Chaque élevage a son rythme. Poulvia vous aide à consigner les opérations et à retrouver leur historique, depuis votre espace web ou votre téléphone.</p>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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

        <section aria-labelledby="aperçu-poulvia" className="relative overflow-hidden bg-background py-16 sm:py-20 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-xs font-bold uppercase tracking-[.2em] text-accent">Web & mobile</p>
              <h2 id="aperçu-poulvia" className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Votre exploitation, claire sur chaque écran.
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-muted">
                Retrouvez le tableau de bord Poulvia sur ordinateur et sur téléphone : les indicateurs et le suivi de la ponte restent accessibles où que vous soyez.
              </p>
            </div>
            <div className="relative mx-auto mt-10 max-w-5xl sm:mt-14">
              <div className="pointer-events-none absolute inset-x-12 bottom-4 top-8 rounded-full bg-primary/10 blur-3xl" />
              <Image
                src="/images/poulvia-dashboard-devices.png"
                alt="Aperçu du tableau de bord Poulvia affiché sur ordinateur et téléphone"
                width={2000}
                height={1134}
                sizes="(max-width: 768px) 100vw, 1152px"
                className="relative h-auto w-full"
              />
            </div>
          </div>
        </section>

        <section id="demarrage" className="scroll-mt-24 bg-primary py-16 text-white md:py-20">
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[.9fr_1.1fr] lg:px-8">
            <div className="relative aspect-[1.45/1] overflow-hidden rounded-2xl">
              <Image
                src="/images/poultry-farm.png"
                alt="Poules pondeuses dans un bâtiment d’élevage avicole"
                fill
                sizes="(max-width: 1024px) 100vw, 42vw"
                className="object-cover"
              />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[.2em] text-white/65">Pour commencer</p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">Une mise en route simple, à votre rythme.</h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-white/75">Créez l’espace de votre exploitation, ajoutez vos bandes, puis consignez les opérations au fil des journées.</p>
              <div className="mt-8 grid gap-6 sm:grid-cols-3 sm:gap-5">
                {steps.map(([number, title, text]) => <article key={number} className="border-l border-white/25 pl-4"><span className="font-mono text-xs font-semibold text-accent">{number}</span><h3 className="mt-3 text-sm font-semibold">{title}</h3><p className="mt-2 text-xs leading-5 text-white/70">{text}</p></article>)}
              </div>
            </div>
          </div>
        </section>

        <section id="application-mobile" className="scroll-mt-24 bg-surface py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 md:grid-cols-[.8fr_1.2fr] md:items-end">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.2em] text-accent">Poulvia sur mobile</p>
                <h2 className="mt-4 max-w-xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Le suivi de votre ferme vous accompagne.</h2>
              </div>
              <p className="max-w-xl text-sm leading-7 text-muted md:justify-self-end">La version Android est en bêta et réservée aux testeurs invités. Les informations d’accès sont communiquées directement aux personnes qui participent au test.</p>
            </div>
            <div className="mt-8 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-semibold text-muted">Les stores ne sont pas encore disponibles</p>
                <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                <button type="button" disabled aria-disabled="true" className="inline-flex min-h-[60px] cursor-not-allowed items-center justify-center gap-3 rounded-xl border border-border bg-background px-5 text-left opacity-60">
                  <Apple className="h-6 w-6 shrink-0 text-foreground" />
                  <span><span className="block text-[10px] text-muted">Bientôt sur</span><span className="block text-sm font-semibold text-foreground">App Store</span></span>
                </button>
                <button type="button" disabled aria-disabled="true" className="inline-flex min-h-[60px] cursor-not-allowed items-center justify-center gap-3 rounded-xl border border-border bg-background px-5 text-left opacity-60">
                  <Play className="h-5 w-5 shrink-0 fill-current text-foreground" />
                  <span><span className="block text-[10px] text-muted">Bientôt sur</span><span className="block text-sm font-semibold text-foreground">Google Play</span></span>
                </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
