import React from "react";
import Image from "next/image";
import { Egg, Utensils, HeartPulse, Wallet, Check, Bird } from "lucide-react";

export function SimpleFeatures() {
  return (
    <section id="simple-features" className="py-16 md:py-24 bg-surface border-b border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading in plain language */}
        <div className="max-w-2xl mx-auto text-center space-y-3 mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-soft text-primary text-xs font-semibold">
            <span>Simple et efficace</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Les opérations essentielles de votre élevage
          </h2>

          <p className="text-sm sm:text-base text-muted">
            Poulvia rassemble le suivi des bandes, les soins programmés et la gestion quotidienne,
            avec la production d’œufs pour les fermes qui en font.
          </p>
        </div>

        {/* Egg production is relevant to layer and mixed farms. */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-16 rounded-2xl border border-border bg-background p-6 sm:p-8">
          <div className="lg:col-span-6 space-y-4">
            <div className="h-10 w-10 rounded-xl bg-accent-soft flex items-center justify-center text-accent">
              <Egg className="h-5 w-5" />
            </div>

            <h3 className="text-xl font-bold text-foreground">
              Pour les pondeuses : suivez les œufs ramassés
            </h3>

            <p className="text-sm text-muted leading-relaxed">
              Dans une ferme de pondeuses ou mixte, enregistrez la collecte. Poulvia calcule le
              nombre de plateaux de 30 et les œufs restants en vrac.
            </p>

            <ul className="space-y-2 text-xs text-foreground">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary shrink-0 stroke-[2.5]" />
                <span>Fini les calculs de tête compliqués</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary shrink-0 stroke-[2.5]" />
                <span>Sachez facilement si vos poules pondent bien chaque jour</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary shrink-0 stroke-[2.5]" />
                <span>Retrouvez les quantités collectées par jour</span>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-6">
            <div className="rounded-xl overflow-hidden border border-border shadow-xs aspect-[4/3] relative">
              <Image
                src="/images/egg-trays.jpg"
                alt="Rangement des œufs dans les plateaux alvéolés de 30 œufs"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Other core operations apply to layer, broiler and mixed farms. */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {/* Feature 2: Feed */}
          <div className="rounded-2xl border border-border bg-background p-6 space-y-3.5">
            <div className="h-10 w-10 rounded-xl bg-warning-soft flex items-center justify-center text-warning">
              <Utensils className="h-5 w-5" />
            </div>

            <h3 className="text-base font-bold text-foreground">
              2. Suivez vos sacs d’aliments
            </h3>

            <p className="text-xs sm:text-sm text-muted leading-relaxed">
              Enregistrez les aliments et intrants disponibles, puis notez les distributions pour
              suivre les mouvements de stock.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-background p-6 space-y-3.5">
            <div className="h-10 w-10 rounded-xl bg-primary-soft flex items-center justify-center text-primary">
              <Bird className="h-5 w-5" />
            </div>

            <h3 className="text-base font-bold text-foreground">
              Suivez vos bandes et leurs effectifs
            </h3>

            <p className="text-xs sm:text-sm text-muted leading-relaxed">
              Enregistrez les mouvements et les mortalités pour garder un historique des effectifs
              de vos bandes.
            </p>
          </div>

          {/* Feature 3: Health */}
          <div className="rounded-2xl border border-border bg-background p-6 space-y-3.5">
            <div className="h-10 w-10 rounded-xl bg-danger-soft flex items-center justify-center text-danger">
              <HeartPulse className="h-5 w-5" />
            </div>

            <h3 className="text-base font-bold text-foreground">
              Consultez vos soins programmés
            </h3>

            <p className="text-xs sm:text-sm text-muted leading-relaxed">
              Ajoutez les soins et vaccins à votre suivi sanitaire, puis consultez les éléments à
              venir ou en retard dans l’application.
            </p>
          </div>

          {/* Feature 4: Money */}
          <div className="rounded-2xl border border-border bg-background p-6 space-y-3.5">
            <div className="h-10 w-10 rounded-xl bg-primary-soft flex items-center justify-center text-primary">
              <Wallet className="h-5 w-5" />
            </div>

            <h3 className="text-base font-bold text-foreground">
              4. Gardez le compte de votre argent
            </h3>

            <p className="text-xs sm:text-sm text-muted leading-relaxed">
              Enregistrez les recettes de vos ventes et les dépenses de l’exploitation en Francs
              CFA.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
