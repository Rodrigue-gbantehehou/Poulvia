import Image from "next/image";
import Link from "next/link";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://app.poulvia.com";

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr] lg:px-8">
        <div>
          <Link href="/" className="inline-flex items-center gap-2.5"><Image src="/logo.png" alt="" width={34} height={34} className="h-8 w-8 object-contain" /><span className="text-lg font-bold text-foreground">Poulvia</span></Link>
          <p className="mt-4 max-w-sm text-sm leading-6 text-muted">Un outil de suivi pour les exploitations avicoles, accessible sur le web et bientôt en bêta sur Android.</p>
        </div>
        <div><h2 className="text-xs font-bold uppercase tracking-[.16em] text-foreground">Explorer</h2><div className="mt-4 flex flex-col gap-3 text-sm text-muted"><Link href="/#suivi" className="hover:text-primary">Fonctionnalités</Link><Link href="/#demarrage" className="hover:text-primary">Comment ça marche</Link><Link href="/beta-android" className="hover:text-primary">Bêta Android</Link></div></div>
        <div><h2 className="text-xs font-bold uppercase tracking-[.16em] text-foreground">Mon espace</h2><div className="mt-4 flex flex-col gap-3 text-sm text-muted"><a href={`${appUrl}/login`} className="hover:text-primary">Connexion</a><a href={`${appUrl}/register`} className="hover:text-primary">Créer un compte</a><a href="mailto:contact@poulvia.com" className="hover:text-primary">Nous contacter</a></div></div>
      </div>
      <div className="border-t border-border"><div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-muted sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8"><span>© {new Date().getFullYear()} Poulvia. Tous droits réservés.</span><span>Conçu pour accompagner les élevages avicoles.</span></div></div>
    </footer>
  );
}
