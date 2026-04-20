/**
 * Landing page — introduces ELLA and links to courses.
 */

import Link from "next/link";
import EllaAvatar from "@/components/EllaAvatar";

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
      {/* Hero */}
      <div className="text-center animate-fade-in">
        <EllaAvatar size="lg" className="mx-auto mb-6" />
        <h1 className="font-heading text-4xl sm:text-5xl text-ella-gray-900 mb-4">
          Apprends en faisant,<br />guidé par ELLA.
        </h1>
        <p className="text-lg text-ella-gray-700 max-w-2xl mx-auto mb-8 leading-relaxed">
          ELLA est ton sherpa pédagogique. Elle t'accompagne dans des labs
          interactifs, critique tes prompts, et te guide vers la maîtrise —
          sans jamais te donner la réponse.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/courses" className="btn-primary text-center">
            Explorer les cours
          </Link>
          <Link href="/chat" className="btn-secondary text-center">
            Parler à ELLA
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-20 animate-slide-up">
        <div className="text-center p-6">
          <div className="w-12 h-12 rounded-xl bg-ella-amber-100 flex items-center justify-center mx-auto mb-4">
            <span className="text-ella-amber-600 text-xl">✦</span>
          </div>
          <h3 className="font-body font-medium text-base mb-2">
            Labs interactifs
          </h3>
          <p className="text-sm text-ella-gray-700 leading-relaxed">
            Écris des prompts, vois le résultat en temps réel, et itère
            avec le feedback d'ELLA.
          </p>
        </div>
        <div className="text-center p-6">
          <div className="w-12 h-12 rounded-xl bg-ella-teal-50 flex items-center justify-center mx-auto mb-4">
            <span className="text-ella-teal-600 text-xl">◈</span>
          </div>
          <h3 className="font-body font-medium text-base mb-2">
            Évaluation bienveillante
          </h3>
          <p className="text-sm text-ella-gray-700 leading-relaxed">
            ELLA ne juge pas — elle t'aide à comprendre pourquoi ton
            prompt marche ou pas.
          </p>
        </div>
        <div className="text-center p-6">
          <div className="w-12 h-12 rounded-xl bg-ella-coral-50 flex items-center justify-center mx-auto mb-4">
            <span className="text-ella-coral-400 text-xl">◆</span>
          </div>
          <h3 className="font-body font-medium text-base mb-2">
            Pour tous les profils
          </h3>
          <p className="text-sm text-ella-gray-700 leading-relaxed">
            Ingénieurs, managers, analystes — chaque mission est adaptée
            à votre contexte professionnel.
          </p>
        </div>
      </div>

      {/* ELLA personality teaser */}
      <div className="mt-20 max-w-xl mx-auto animate-slide-up">
        <div className="ella-bubble">
          <div className="flex items-start gap-3">
            <EllaAvatar size="sm" />
            <div>
              <p className="text-sm font-medium text-ella-amber-800 mb-1">
                ELLA
              </p>
              <p className="text-sm text-ella-gray-800 leading-relaxed">
                Salut ! Moi c'est ELLA, ta sherpa en prompt engineering.
                Je ne te donnerai jamais la réponse — mais je vais te guider
                jusqu'à ce que tu la trouves toi-même. Prêt à relever le
                défi ?
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
