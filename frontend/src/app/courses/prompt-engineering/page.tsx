/**
 * Prompt Engineering course page — learning path with modules and labs.
 */

"use client";

import { useEffect, useState } from "react";
import { Settings } from "lucide-react";
import EllaAvatar from "@/components/EllaAvatar";
import { listPELabs, type PELab } from "@/lib/api";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/components/AuthProvider";
import ProfileModal, { type ProfileType } from "@/components/ProfileModal";

const modules = [
  {
    number: "01",
    lab_id: "01_zero_shot",
    title: "Zero-Shot Prompting",
    description:
      "Apprenez à obtenir des résultats du LLM sans fournir d'exemples, uniquement par la qualité de vos instructions.",
    concept: "Les 4C : Contexte, Consigne, Contraintes, Format de sortie.",
    status: "in-progress",
  },
  {
    number: "02",
    lab_id: "02_few_shot",
    title: "Few-Shot Prompting",
    description:
      "Sélectionnez et formatez des exemples qui guident le LLM vers le comportement désiré.",
    concept: "Les 5 règles d'or des exemples.",
    status: "not-started",
  },
  {
    number: "03",
    lab_id: "03_chain_of_thought",
    title: "Chain-of-Thought",
    description:
      "Forcez le LLM à expliciter son raisonnement pour améliorer la fiabilité sur les tâches complexes.",
    concept: "3 niveaux : déclencheur simple, étapes imposées, few-shot CoT.",
    status: "not-started",
  },
  {
    number: "04",
    lab_id: "04_system_prompts",
    title: "System Prompts",
    description:
      "Configurez le comportement global du LLM : personnalité, contraintes, format, garde-fous de sécurité.",
    concept: "Les 6 sections : identité, périmètre, ton, format, sécurité, cas limites.",
    status: "not-started",
  },
  {
    number: "05",
    lab_id: "05_structured_output",
    title: "Structured Output",
    description:
      "Obtenez des sorties structurées et parsables — JSON, CSV, tableaux — pour intégrer un LLM dans un pipeline.",
    concept: "Schéma, types, validation, fallback en code.",
    status: "not-started",
  },
];

function CourseContent() {
  const { user } = useAuth();
  const [labs, setLabs] = useState<PELab[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [profile, setProfile] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("ellaUserProfile");
  });
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(() => {
    if (typeof window === "undefined") return false;
    return !localStorage.getItem("ellaUserProfile");
  });
  const isAdmin = user?.email === "mourad.zerai@gmail.com";

  const handleProfileSelect = (newProfile: ProfileType) => {
    localStorage.setItem("ellaUserProfile", newProfile);
    setProfile(newProfile);
    setIsProfileModalOpen(false);
  };

  useEffect(() => {
    // Register completion tracking
    const updateProgress = () => {
        try {
            const completed = JSON.parse(localStorage.getItem("ellaCompletedLessons") || "[]");
            setCompletedLessons(completed);
        } catch (e) {
            console.error("Failed to load progress", e);
        }
    };

    updateProgress();
    // Listen for changes (though mostly on same page here)
    window.addEventListener('storage', updateProgress);
    return () => window.removeEventListener('storage', updateProgress);
  }, []);

  useEffect(() => {
    listPELabs()
      .then((data) => setLabs(data.labs))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Course Header Band */}
      <header className="bg-gradient-to-br from-ella-dark to-ella-primary-dark text-white pt-12 pb-16 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-ella-accent/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <Link href="/" className="text-white/50 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors">Catalogue</Link>
            <span className="text-white/20 text-xs">/</span>
            <span className="text-white/90 text-xs font-bold uppercase tracking-widest">Prompt Engineering</span>
          </div>
          <div className="flex items-center gap-4 mb-6">
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight">Prompt Engineering</h1>
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-white/70 hover:text-white"
              title="Changer de profil"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
          <p className="text-ella-dark-text/70 max-w-2xl text-lg leading-relaxed font-medium">
            Maîtrisez l'art de piloter les Large Language Models (LLM) avec précision pour transformer vos idées en résultats concrets.
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 -mt-10 pb-20 w-full relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Module List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-black text-ella-gray-400 uppercase tracking-widest">Le parcours d'apprentissage</h2>
            </div>
            
            {modules.map((mod, index) => (
              <div
                key={mod.lab_id}
                className="bg-white rounded-[2rem] border border-ella-gray-200 p-6 flex flex-col md:flex-row md:items-center gap-6 transition-all hover:shadow-2xl hover:shadow-ella-gray-900/5 group"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 font-black text-2xl shadow-lg transition-transform group-hover:scale-110
                  ${mod.status === 'in-progress' ? 'bg-ella-accent text-white shadow-ella-accent/20' : 
                    mod.status === 'completed' ? 'bg-ella-success text-white' : 'bg-ella-gray-50 text-ella-gray-300 border border-ella-gray-100'}`}>
                  {mod.number}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-ella-gray-900 mb-1.5">{mod.title}</h3>
                  <p className="text-sm text-ella-gray-500 line-clamp-2 md:line-clamp-1 font-medium italic mb-4 md:mb-0 opacity-80">{mod.description}</p>
                </div>
                
                <div className="flex items-center gap-2">
                    <Link
                        href={`/courses/prompt-engineering/modules/${mod.lab_id}`}
                        className="btn-secondary !text-xs !py-3 !px-5 !rounded-xl font-black bg-ella-primary/5 text-ella-primary hover:bg-ella-primary hover:text-white border-none shadow-none"
                    >
                        Leçon
                    </Link>
                    {isAdmin || completedLessons.includes(mod.lab_id) ? (
                        <Link
                            href={`/courses/prompt-engineering/labs/${mod.lab_id}`}
                            className="btn-primary !text-xs !py-3 !px-5 !rounded-xl font-black shadow-lg shadow-ella-accent/10"
                        >
                            Lab
                        </Link>
                    ) : (
                        <button
                            disabled
                            className="btn-primary !text-xs !py-3 !px-5 !rounded-xl font-black opacity-30 grayscale cursor-not-allowed flex items-center gap-2"
                            title="Complétez la leçon pour débloquer le Lab"
                        >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3"></path></svg>
                            Lab
                        </button>
                    )}
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Ella Welcome */}
            <div className="bg-white border-2 border-ella-primary/10 rounded-[2rem] p-6 shadow-xl shadow-ella-primary/5 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-ella-primary/5 rounded-full -mr-12 -mt-12"></div>
              <div className="flex items-center gap-3 mb-4 relative z-10">
                <EllaAvatar size="sm" />
                <h4 className="font-black text-ella-gray-900 uppercase tracking-widest text-[10px]">Le mot d'Ella</h4>
              </div>
              <p className="text-sm text-ella-gray-700 leading-relaxed font-bold italic relative z-10">
                "Content de te voir ici ! Chaque module commence par une leçon interactive. C'est là que nous allons discuter pour valider tes bases avant de passer à l'action dans le Lab."
              </p>
            </div>

            {/* Course Progress */}
            <div className="bg-white border border-ella-gray-200 rounded-[2rem] p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-black text-ella-gray-900 uppercase tracking-widest text-[10px]">Ma Progression</h4>
                <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-ella-primary">
                        {Math.round((completedLessons.length / modules.length) * 100)}%
                    </span>
                </div>
              </div>
              <div className="w-full h-3 bg-ella-gray-100 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-ella-primary transition-all duration-1000" 
                    style={{ width: `${isAdmin ? 100 : (completedLessons.length / modules.length) * 100}%` }}
                ></div>
              </div>
              <div className="mt-4 flex justify-between text-[10px] uppercase tracking-widest font-black text-ella-gray-400">
                <span>{isAdmin ? modules.length : completedLessons.length}/{modules.length} Modules</span>
                <span>{isAdmin ? 0 : modules.length - completedLessons.length} restants</span>
              </div>
            </div>

            {/* Help Card */}
            <Link href="/chat" className="group block p-6 bg-ella-accent rounded-[2rem] text-white hover:bg-ella-accent-dark transition-all shadow-2xl shadow-ella-accent/30 active:scale-95">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-2xl group-hover:rotate-12 transition-transform">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-base font-black uppercase tracking-tight leading-none mb-1">Un blocage ?</h4>
                  <p className="text-xs text-white/70 font-bold uppercase tracking-widest">Parler à Ella</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </main>

      {/* Error state */}
      {error && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-8">
          <div className="bg-ella-accent/5 border border-ella-accent/20 text-ella-accent text-sm font-bold p-6 rounded-[2rem] flex items-center gap-4">
             <span className="text-2xl">😴</span>
             <p>Désolé {error}. Ella fait une petite sieste...</p>
          </div>
        </div>
      )}

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onSelect={handleProfileSelect}
      />
    </div>
  );
}

export default function PromptEngineeringCourse() {
  return (
    <ProtectedRoute>
      <CourseContent />
    </ProtectedRoute>
  );
}
