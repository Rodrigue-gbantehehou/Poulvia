import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Download, ExternalLink, Info, Smartphone } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Bêta Android | Poulvia",
  description: "Découvrez la bêta Android de Poulvia et les étapes à connaître avant son installation.",
  alternates: { canonical: "/beta-android" },
};

const apkUrl = process.env.NEXT_PUBLIC_ANDROID_APK_URL;

export default function AndroidBetaPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="px-4 pb-20 pt-32 sm:px-6 md:pt-40 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-primary"><ArrowLeft className="h-4 w-4" /> Retour à l’accueil</Link>
          <div className="mt-8 grid gap-12 lg:grid-cols-[1.1fr_.9fr] lg:items-start">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent-soft px-3 py-1.5 text-xs font-bold text-primary"><Smartphone className="h-3.5 w-3.5" /> Version bêta Android</span>
              <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-[-.04em] text-foreground sm:text-5xl">Poulvia vous accompagne aussi sur Android.</h1>
              <p className="mt-5 max-w-xl text-base leading-8 text-muted">La version mobile est en bêta. Cette page vous présente son objectif et les étapes d’installation avant de télécharger le fichier Android.</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a href="#installation" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-white hover:bg-primary-hover">Voir les étapes d’installation <ArrowRight className="h-4 w-4" /></a>
                <a href="mailto:contact@poulvia.com?subject=Question%20sur%20la%20b%C3%AAta%20Android%20Poulvia" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-5 text-sm font-semibold text-foreground hover:bg-surface-hover">Contacter l’équipe Poulvia <ArrowRight className="h-4 w-4" /></a>
              </div>
              {!apkUrl && <p className="mt-3 text-xs text-muted">Le fichier d’installation n’est pas encore relié à cette page.</p>}
            </div>
            <aside className="rounded-3xl border border-border bg-surface p-6 shadow-sm sm:p-8">
              <p className="text-xs font-bold uppercase tracking-[.18em] text-accent">À quoi sert l’application ?</p>
              <h2 className="mt-3 text-xl font-semibold text-foreground">Le suivi de votre ferme depuis votre téléphone.</h2>
              <ul className="mt-6 space-y-4 text-sm text-muted">
                {["Consulter et enregistrer les opérations de l’exploitation", "Suivre les bandes, les stocks et les soins", "Retrouver les outils adaptés aux élevages de pondeuses, de chair ou mixtes"].map((item) => <li key={item} className="flex gap-3"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><span className="leading-6">{item}</span></li>)}
              </ul>
              <div className="mt-7 rounded-2xl border border-info/20 bg-info-soft p-4"><div className="flex gap-3"><Info className="mt-0.5 h-4 w-4 shrink-0 text-info" /><p className="text-xs leading-5 text-foreground">Une version bêta peut encore évoluer. Certaines fonctions ou présentations peuvent changer au fil des retours.</p></div></div>
            </aside>
          </div>

          <section id="installation" className="mt-16 scroll-mt-28 border-t border-border pt-12">
            <p className="text-xs font-bold uppercase tracking-[.18em] text-accent">Installation</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">Comment installer le fichier Android</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">Lorsque le fichier APK sera disponible, vous pourrez l’installer directement sur un appareil Android. L’installation se fera en dehors de Google Play.</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[["01", "Téléchargez l’APK", "Utilisez le bouton de téléchargement sur cette page lorsque le fichier sera publié."], ["02", "Ouvrez le fichier", "Depuis les téléchargements de votre téléphone, appuyez sur le fichier Poulvia."], ["03", "Autorisez cette source si besoin", "Android peut demander d’autoriser temporairement l’installation depuis votre navigateur ou gestionnaire de fichiers."]].map(([number, title, text]) => <article key={number} className="rounded-2xl border border-border bg-surface p-5"><span className="font-mono text-xs font-semibold text-accent">{number}</span><h3 className="mt-4 font-semibold text-foreground">{title}</h3><p className="mt-2 text-sm leading-6 text-muted">{text}</p></article>)}
            </div>
            <p className="mt-5 max-w-3xl text-xs leading-5 text-muted">N’autorisez cette installation que si vous avez obtenu le fichier depuis le lien officiel Poulvia. Les intitulés et réglages Android peuvent varier selon le téléphone.</p>
            <div className="mt-8 rounded-2xl border border-border bg-surface p-6 sm:flex sm:items-center sm:justify-between sm:gap-6">
              <div><h3 className="font-semibold text-foreground">Prêt à installer la bêta ?</h3><p className="mt-1 text-sm text-muted">Le téléchargement s’effectuera depuis le lien officiel Poulvia.</p></div>
              {apkUrl ? (
                <a href={apkUrl} className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover sm:mt-0"><Download className="h-4 w-4" /> Télécharger la bêta Android <ExternalLink className="h-4 w-4" /></a>
              ) : (
                <span aria-disabled="true" className="mt-4 inline-flex min-h-11 cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-primary/55 px-4 text-sm font-semibold text-white sm:mt-0"><Download className="h-4 w-4" /> Téléchargement bientôt disponible</span>
              )}
            </div>
            {!apkUrl && <p className="mt-3 text-xs text-muted">Le fichier d’installation n’est pas encore relié à cette page.</p>}
          </section>
          <div className="mt-12 rounded-2xl bg-primary-soft p-6 sm:flex sm:items-center sm:justify-between sm:gap-6"><div><h2 className="font-semibold text-foreground">Vous préférez commencer sur le web ?</h2><p className="mt-1 text-sm text-muted">Connectez-vous à votre espace Poulvia depuis un navigateur.</p></div><a href={`${process.env.NEXT_PUBLIC_APP_URL || "https://app.poulvia.com"}/login`} className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover sm:mt-0">Accéder à Poulvia <ArrowRight className="h-4 w-4" /></a></div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
