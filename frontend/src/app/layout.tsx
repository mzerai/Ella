import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "ELLA — ESPRIT LearnLab Arena",
  description:
    "Plateforme d'apprentissage immersif par l'IA — Apprenez le Prompt Engineering avec ELLA, votre sherpa pédagogique.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        <Navbar />
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  );
}
