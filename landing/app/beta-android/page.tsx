import type { Metadata } from "next";
import Image from "next/image";
import {
  ArrowRight,
  Bird,
  Download,
  Egg,
  ExternalLink,
  Info,
  Smartphone,
  Stethoscope,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Bêta Android | Poulvia",
  description: "Découvrez les fonctions de Poulvia sur Android et les étapes pour installer la version bêta.",
  alternates: { canonical: "/beta-android" },
};

const apkUrl = process.env.NEXT_PUBLIC_ANDROID_APK_URL;

const features = [
  {
    icon: Bird,
    title: "Vos bandes",
    text: "Consultez les effectifs et retrouvez les mouvements de vos lots.",
  },
  {
    icon: Egg,
    title: "Vos collectes",
    text: "Enregistrez la production et suivez les œufs par journée.",
  },
  {
    icon: Stethoscope,
    title: "Vos opérations",
    text: "Retrouvez les outils de suivi des stocks et des soins de la ferme.",
  },
];

const installSteps = [
  ["01", "Téléchargez le fichier", "Utilisez le lien officiel Poulvia lorsque le fichier APK sera disponible."],
  ["02", "Ouvrez le fichier APK", "Retrouvez-le dans les téléchargements de votre téléphone Android."],
  ["03", "Confirmez l’installation", "Si Android le demande, autorisez temporairement l’installation depuis votre navigateur."],
];

export default function AndroidBetaPage() {
  return (
    <div className="min-h-screen overflow-hidden bg-background">
      <Navbar />
      <main>
        <section className="relative px-4 pb-20 pt-32 sm:px-6 md:pb-28 md:pt-40 lg:px-8">
          <div className="pointer-events-none absolute -right-32 top-20 h-[30rem] w-[30rem] rounded-full bg-accent-soft/70 blur-3xl" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.02fr_.98fr] lg:gap-16">
            <div className="max-w-2xl">
              <h1 className="mt-5 text-4xl font-semibold leading-[1.08] tracking-[-.045em] text-foreground sm:text-5xl lg:text-[4.25rem]">
                Poulvia vous accompagne aussi sur Android.
              </h1>
              <p className="mt-6 max-w-xl text-base leading-8 text-muted sm:text-lg">
                La version mobile Poulvia est en préparation. Découvrez les fonctions prévues et les étapes d’installation avant de télécharger la bêta Android.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                {apkUrl ? (
                  <a href={apkUrl} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-hover">
                    <Download className="h-4 w-4" /> Télécharger la bêta Android <ExternalLink className="h-4 w-4" />
                  </a>
                ) : (
                  <a href="#telechargement" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-hover">
                    Voir l’état du téléchargement <ArrowRight className="h-4 w-4" />
                  </a>
                )}
                <a href="#installation" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-5 text-sm font-semibold text-foreground transition hover:bg-surface-hover">
                  Comment l’installer ?
                </a>
              </div>
              <p className="mt-4 max-w-xl text-xs leading-5 text-muted">
                  {apkUrl
                    ? "Le téléchargement est fourni depuis le lien officiel Poulvia."
                    : "Le fichier APK n’est pas encore disponible. Cette page indiquera ici quand le téléchargement sera prêt."}
              </p>
            </div>

            <div className="relative mx-auto w-full max-w-[12rem] sm:max-w-[14rem] lg:max-w-[16rem]">
              <div className="pointer-events-none absolute inset-6 rounded-full bg-primary/10 blur-3xl" />
              <Image
                src="/images/poulvia-android-mockup-crop.png"
                alt="Maquette de téléphone affichant l’écran de démarrage Poulvia"
                width={1687}
                height={3245}
                sizes="(max-width: 640px) 224px, (max-width: 1024px) 272px, 320px"
                priority
                className="relative h-auto w-full mix-blend-multiply drop-shadow-[0_24px_48px_rgba(21,70,50,.16)]"
              />
            </div>
          </div>
        </section>

        <section className="bg-surface py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[.18em] text-accent">Dans la bêta</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Les suivis essentiels, sur votre téléphone.</h2>
            </div>
            <div className="mt-9 grid gap-7 sm:grid-cols-3 sm:gap-8">
              {features.map(({ icon: Icon, title, text }) => (
                <article key={title} className="pt-2">
                  <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                  <h3 className="mt-4 font-semibold text-foreground">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted">{text}</p>
                </article>
              ))}
            </div>
            <div className="mt-8 flex gap-3 text-sm leading-6 text-muted">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-info" aria-hidden="true" />
              <p>La version bêta évolue encore. Certaines fonctions et présentations peuvent changer au fil des retours.</p>
            </div>
          </div>
        </section>

        <section id="installation" className="scroll-mt-24 bg-primary-soft py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[.18em] text-accent">Installation</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Installer la bêta Android</h2>
              <p className="mt-3 text-sm leading-7 text-muted">Quand le fichier APK sera disponible, vous pourrez l’installer directement sur votre appareil, en dehors de Google Play.</p>
            </div>
            <div className="mt-9 grid gap-7 sm:grid-cols-3 sm:gap-8">
              {installSteps.map(([number, title, text]) => (
                <article key={number}>
                  <span className="font-mono text-2xl font-semibold tracking-tight text-primary/55">{number}</span>
                  <h3 className="mt-3 font-semibold text-foreground">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted">{text}</p>
                </article>
              ))}
            </div>
            <p className="mt-8 max-w-3xl text-xs leading-5 text-muted">
              Pour votre sécurité, installez uniquement un fichier obtenu depuis un lien officiel Poulvia. Android peut afficher une demande d’autorisation selon le téléphone.
            </p>
          </div>
        </section>

        <section id="telechargement" className="scroll-mt-24 bg-background py-14 sm:py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-5 pb-8 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.18em] text-accent">Téléchargement</p>
                <h2 className="mt-2 text-xl font-semibold text-foreground">{apkUrl ? "La bêta est prête à installer." : "Le fichier APK n’est pas encore disponible."}</h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
                  {apkUrl
                    ? "Téléchargez l’application depuis le lien officiel Poulvia, puis suivez les étapes d’installation ci-dessus."
                    : "Le lien de téléchargement apparaîtra sur cette page dès que le fichier Android sera publié."}
                </p>
              </div>
              {apkUrl ? (
                <a href={apkUrl} className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary-hover">
                  <Download className="h-4 w-4" /> Télécharger l’APK
                </a>
              ) : (
                <span aria-disabled="true" className="inline-flex min-h-12 shrink-0 cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-primary/55 px-5 text-sm font-semibold text-white">
                  <Download className="h-4 w-4" /> Téléchargement indisponible
                </span>
              )}
            </div>

            <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-semibold text-foreground">Vous pouvez déjà utiliser Poulvia sur le web.</h2>
                <p className="mt-1 text-sm text-muted">Connectez-vous ou créez votre espace depuis un navigateur.</p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <a href={`${process.env.NEXT_PUBLIC_APP_URL || "https://app.poulvia.com"}/login`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-foreground hover:bg-surface-hover">Connexion</a>
                <a href={`${process.env.NEXT_PUBLIC_APP_URL || "https://app.poulvia.com"}/register`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover">Créer un compte <ArrowRight className="h-4 w-4" /></a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
