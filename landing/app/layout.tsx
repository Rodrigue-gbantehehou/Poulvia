import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Poulvia — Le suivi simple de votre élevage avicole",
  description:
    "Suivez les bandes, la production, les stocks, les soins et les finances de votre exploitation avicole avec Poulvia, sur le web et bientôt sur Android.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any", type: "image/x-icon" },
      { url: "/icon.png", sizes: "64x64", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  keywords: [
    "aviculture",
    "élevage avicole",
    "poules pondeuses",
    "poulets de chair",
    "gestion de ferme",
    "plateaux 30 oeufs",
    "logiciel avicole Bénin",
    "Afrique de l'Ouest",
    "FCFA",
    "MTN MoMo",
    "Moov Money",
    "prophylaxie aviaire",
    "Poulvia",
  ],
  authors: [{ name: "Poulvia" }],
  creator: "Poulvia",
  publisher: "Poulvia",
  metadataBase: new URL("https://poulvia.com"),
  openGraph: {
    title: "Poulvia — Le suivi simple de votre élevage avicole",
    description:
      "Suivez les bandes, la production, les stocks, les soins et les finances de votre exploitation avicole.",
    url: "https://poulvia.com",
    siteName: "Poulvia",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Poulvia — Gestion Avicole Professionnelle",
    description:
      "Le logiciel de suivi conçu pour les exploitations avicoles en Afrique de l'Ouest.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "Poulvia",
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web, Android",
              description:
                "Logiciel de gestion pour exploitations avicoles : suivi des bandes, de la production selon le type d'élevage, de la santé, des stocks et de la trésorerie.",
            }),
          }}
        />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-primary selection:text-white">
        {children}
      </body>
    </html>
  );
}
