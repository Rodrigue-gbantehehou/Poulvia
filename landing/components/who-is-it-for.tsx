import React from "react";
import { UserCheck, Shield, Stethoscope, Users } from "lucide-react";

export function WhoIsItFor() {
  const profiles = [
    {
      icon: <UserCheck className="h-6 w-6 text-primary" />,
      title: "Éleveurs & Propriétaires",
      description:
        "Consultez le suivi des bandes, des stocks et des opérations enregistrées pour votre exploitation.",
    },
    {
      icon: <Users className="h-6 w-6 text-accent" />,
      title: "Gérants & Équipes d'exploitation",
      description:
        "Enregistrez les opérations confiées à votre équipe selon les accès accordés par le propriétaire.",
    },
    {
      icon: <Stethoscope className="h-6 w-6 text-rose-600" />,
      title: "Vétérinaires & Consultants Avicoles",
      description:
        "Un membre ayant un rôle adapté peut consulter les informations sanitaires auxquelles il a été autorisé à accéder.",
    },
    {
      icon: <Shield className="h-6 w-6 text-emerald-600" />,
      title: "Coopératives & Multi-sites",
      description:
        "Organisez le suivi des exploitations et bâtiments accessibles à votre compte, avec des permissions attribuées aux membres.",
    },
  ];

  return (
    <section id="who-is-it-for" className="py-20 bg-surface-muted border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-soft px-3 py-1 text-xs font-bold text-primary">
            <span>Pour Qui ?</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
            Un suivi partagé selon les responsabilités
          </h2>
          <p className="text-sm sm:text-base text-muted leading-relaxed">
            Les propriétaires et leurs collaborateurs retrouvent les informations utiles à leur rôle
            dans l’exploitation.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {profiles.map((p, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-border bg-surface p-6 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="h-12 w-12 rounded-xl bg-surface-muted flex items-center justify-center mb-4">
                  {p.icon}
                </div>
                <h3 className="text-base font-bold text-foreground mb-2">
                  {p.title}
                </h3>
                <p className="text-xs text-muted leading-relaxed">
                  {p.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
