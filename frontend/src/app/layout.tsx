import type { Metadata } from "next";
// @ts-ignore
import "./globals.css";
import Navbar from "@/components/Navbar";
import { AuthProvider } from "@/components/AuthProvider";

export const metadata: Metadata = {
  title: "Ella — ESPRIT LearnLab Arena",
  description:
    "Plateforme d'apprentissage immersif par l'IA — Apprenez le Prompt Engineering avec Ella, votre sherpa pédagogique.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        <AuthProvider>
          <Navbar />
          <main className="min-h-screen">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
