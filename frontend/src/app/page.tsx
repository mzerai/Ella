import Link from "next/link";
import EllaAvatar from "@/components/EllaAvatar";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-ella-dark pt-20 pb-16 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-ella-accent/10 rounded-full blur-[100px]" />
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="flex flex-col items-center text-center">
            <div className="mb-6 animate-fade-in shadow-2xl rounded-full p-1 bg-white/5">
              <EllaAvatar size="lg" className="scale-110" />
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 animate-slide-up leading-tight">
              Apprends en pratiquant,<br />
              <span className="text-ella-accent">coaché par Ella.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-ella-dark-text/80 mb-10 max-w-2xl leading-relaxed animate-slide-up [animation-delay:0.1s]">
              Ella est ton coach pédagogique intelligent. Elle t'accompagne dans chaque cours, 
              comprend où tu en es, et te guide vers la maîtrise — à ton rythme, sans jamais te laisser seul.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 animate-slide-up [animation-delay:0.2s]">
              <Link
                href="/courses"
                className="btn-primary text-lg !py-3 !px-8 shadow-xl shadow-ella-accent/30"
              >
                Découvrir les cours
              </Link>
              <Link
                href="/chat"
                className="btn-outline-white text-lg !py-3 !px-8"
              >
                Parler à Ella
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="ella-card border-t-4 border-ella-primary h-full flex flex-col">
              <div className="w-10 h-10 bg-ella-primary-bg rounded-lg flex items-center justify-center text-ella-primary mb-4 font-bold">1</div>
              <h3 className="text-lg font-bold text-ella-gray-900 mb-3">Cours immersifs</h3>
              <p className="text-sm text-ella-gray-700 leading-relaxed">
                Des contenus structurés par des experts, conçus pour être compris — pas juste lus. Chaque module te prépare à la pratique.
              </p>
            </div>
            
            <div className="ella-card border-t-4 border-ella-accent h-full flex flex-col">
              <div className="w-10 h-10 bg-ella-accent-bg rounded-lg flex items-center justify-center text-ella-accent mb-4 font-bold">2</div>
              <h3 className="text-lg font-bold text-ella-gray-900 mb-3">Labs interactifs</h3>
              <p className="text-sm text-ella-gray-700 leading-relaxed">
                Apprends en faisant. Écris, expérimente, teste tes idées en conditions réelles. Le savoir se construit par l'action.
              </p>
            </div>
            
            <div className="ella-card border-t-4 border-ella-primary h-full flex flex-col">
              <div className="w-10 h-10 bg-ella-primary-bg rounded-lg flex items-center justify-center text-ella-primary mb-4 font-bold">3</div>
              <h3 className="text-lg font-bold text-ella-gray-900 mb-3">Ella, ton coach IA</h3>
              <p className="text-sm text-ella-gray-700 leading-relaxed">
                Ella comprend ta progression, répond à tes questions, critique ton travail et te pousse à t'améliorer. Comme un mentor, mais disponible 24/7.
              </p>
            </div>

            <div className="ella-card border-t-4 border-ella-accent h-full flex flex-col">
              <div className="w-10 h-10 bg-ella-accent-bg rounded-lg flex items-center justify-center text-ella-accent mb-4 font-bold">4</div>
              <h3 className="text-lg font-bold text-ella-gray-900 mb-3">Évaluation bienveillante</h3>
              <p className="text-sm text-ella-gray-700 leading-relaxed">
                Pas de jugement, pas de notes sèches. Ella te montre ce qui marche, ce qui manque, et comment progresser. Chaque tentative te rapproche du but.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Ella Teaser Section */}
      <section className="py-20 bg-ella-dark text-white overflow-hidden relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 backdrop-blur-sm shadow-2xl flex flex-col md:flex-row items-center gap-8">
            <div className="shrink-0">
              <EllaAvatar size="lg" className="ring-4 ring-white/10" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <p className="text-xl md:text-2xl font-medium leading-relaxed italic mb-8 text-ella-dark-text">
                "Salut ! Moi c'est Ella. Je ne te donnerai jamais la réponse — mais je vais te guider jusqu'à ce que tu la trouves toi-même. Que tu sois étudiant, ingénieur ou manager, je m'adapte à ton niveau et à ton rythme. Prêt à apprendre autrement ?"
              </p>
              <Link
                href="/courses/prompt-engineering"
                className="btn-primary inline-flex items-center gap-2 text-lg !py-3 !px-8"
              >
                Commencer maintenant
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 7l5 5m0 0l-5 5m5-5H6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-ella-gray-200 py-8 mt-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img src="/assets/logo_learnlab_icon.png" alt="LearnLab" className="h-6 opacity-80" />
            <span className="text-sm text-ella-gray-500 font-medium tracking-tight">Ella — Esprit LearnLab Assistant</span>
          </div>
          <div className="flex items-center gap-4">
            <img src="/assets/logo_esprit.png" alt="ESPRIT School of Engineering" className="h-10 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer" />
          </div>
          <p className="text-xs text-ella-gray-400">© 2025 ESPRIT School of Engineering. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
