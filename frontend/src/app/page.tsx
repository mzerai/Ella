"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import EllaAvatar from "@/components/EllaAvatar";
import ProfileModal from "@/components/ProfileModal";

type Category = "Foundation" | "Leadership" | "Industry" | "Tech";

interface Course {
  id: string;
  title: string;
  description: string;
  category: Category;
  duration: string;
  available: boolean;
  link: string;
  image: string;
  categoryStyles: {
    bg: string;
    text: string;
  };
}

const COURSES: Course[] = [
  {
    id: "pe",
    title: "Prompt Engineering & AI Tools",
    description: "Maîtrisez l'art de communiquer avec les LLM. 10 missions pratiques, coaching IA personnalisé.",
    category: "Foundation",
    duration: "5 sessions · 15h",
    available: true,
    link: "/courses/prompt-engineering",
    image: "/assets/courses/prompt-engineering.jpg",
    categoryStyles: { bg: "bg-blue-50", text: "text-blue-700" },
  },
  {
    id: "rl",
    title: "Reinforcement Learning",
    description: "Explorez les algorithmes RL avec des labs interactifs : de Bellman à DQN, 8 algorithmes en 6 modules avec coaching IA.",
    category: "Foundation",
    duration: "6 modules · 15h",
    available: true,
    link: "/courses/reinforcement-learning",
    image: "/assets/courses/reinforcement-learning.jpg",
    categoryStyles: { bg: "bg-blue-50", text: "text-blue-700" },
  },
  {
    id: "data-lit",
    title: "Data Literacy for Managers",
    description: "Lisez les données, challengez les résultats, prenez des décisions éclairées. La culture data.",
    category: "Foundation",
    duration: "1 jour · 6h",
    available: false,
    link: "#",
    image: "/assets/courses/data-literacy.jpg",
    categoryStyles: { bg: "bg-blue-50", text: "text-blue-700" },
  },
  {
    id: "exec-ai",
    title: "Executive AI Leadership",
    description: "Comprenez l'IA à un niveau stratégique. Définissez votre feuille de route IA et pilotez la transformation.",
    category: "Leadership",
    duration: "2 jours · 12h",
    available: true,
    link: "/courses/ai-leadership",
    image: "/assets/courses/executive-ai.jpg",
    categoryStyles: { bg: "bg-amber-50", text: "text-amber-700" },
  },
  {
    id: "fin-ai",
    title: "AI for Finance & Banking",
    description: "Scoring crédit, détection de fraude, conformité réglementaire. L'IA pour le secteur financier.",
    category: "Industry",
    duration: "4 jours · 24h",
    available: true,
    link: "/courses/ai-finance-banking",
    image: "/assets/courses/ai-finance.jpg",
    categoryStyles: { bg: "bg-amber-50", text: "text-amber-700" },
  },
  {
    id: "ind-ai",
    title: "Industrial AI 4.0",
    description: "Maintenance prédictive, contrôle qualité, optimisation de production. L'IA au service de l'industrie.",
    category: "Industry",
    duration: "4 jours · 24h",
    available: true,
    link: "/courses/ai-manufacturing",
    image: "/assets/courses/industrial-ai.jpg",
    categoryStyles: { bg: "bg-emerald-50", text: "text-emerald-700" },
  },
  {
    id: "health-ai",
    title: "AI for Healthcare",
    description: "Diagnostic assisté, NLP clinique, éthique et conformité. L'IA au service du patient.",
    category: "Industry",
    duration: "4 jours · 24h",
    available: true,
    link: "/courses/ai-healthcare",
    image: "/assets/courses/ai-healthcare.jpg",
    categoryStyles: { bg: "bg-teal-50", text: "text-teal-700" },
  },
  {
    id: "agentic",
    title: "Agentic AI for Enterprise",
    description: "Agents autonomes, multi-agents, RAG avancé. Construisez des systèmes IA qui agissent.",
    category: "Tech",
    duration: "5 jours · 30h",
    available: true,
    link: "/courses/agentic-ai",
    image: "/assets/courses/agentic-ai.jpg",
    categoryStyles: { bg: "bg-purple-50", text: "text-purple-700" },
  },
  {
    id: "ops",
    title: "MLOps & LLMOps",
    description: "CI/CD pour ML, monitoring de modèles, infrastructure. Du prototype à la production.",
    category: "Tech",
    duration: "4 jours · 24h",
    available: false,
    link: "#",
    image: "/assets/courses/mlops.jpg",
    categoryStyles: { bg: "bg-purple-50", text: "text-purple-700" },
  },
];

export default function HomePage() {
  const router = useRouter();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [pendingCourseLink, setPendingCourseLink] = useState<string | null>(null);

  const handleCourseClick = (course: Course) => {
    if (!course.available) return;

    // ProfileModal is only relevant for PE course (engineering vs business missions)
    if (course.id === "pe") {
      const savedProfile = localStorage.getItem("ellaUserProfile");
      if (!savedProfile) {
        setPendingCourseLink(course.link);
        setIsProfileModalOpen(true);
        return;
      }
    }

    router.push(course.link);
  };

  const handleProfileSelect = (profile: "engineering" | "business") => {
    localStorage.setItem("ellaUserProfile", profile);
    setIsProfileModalOpen(false);
    if (pendingCourseLink) {
      router.push(pendingCourseLink);
    }
  };

  const playEllaJingle = () => {
    const audio = new Audio("/assets/ella_gingle.mp3");
    audio.volume = 0.7;
    audio.play().catch(() => {});
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-ella-dark to-ella-primary-dark pt-12 pb-10 relative overflow-hidden flex items-center min-h-[35vh] md:min-h-[40vh]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 w-full text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            <div className="shrink-0 animate-fade-in order-2 md:order-1 relative cursor-pointer" onClick={playEllaJingle}>
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-ella-accent/10 blur-3xl"></div>
              <EllaAvatar size="xl" className="relative z-10" />
            </div>
            
            <div className="flex-1 order-1 md:order-2">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 animate-slide-up leading-tight">
                Apprends en pratiquant,<br />
                <span className="text-ella-accent">coaché par Ella.</span>
              </h1>
              
              <p className="text-base md:text-lg text-ella-dark-text/80 mb-6 max-w-2xl leading-relaxed animate-slide-up [animation-delay:0.1s]">
                La plateforme d'apprentissage immersif d'ESPRIT. <br className="hidden md:block" />
                Des cours interactifs, des labs pratiques, et Ella — ton coach IA personnel.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 animate-slide-up [animation-delay:0.2s] justify-center md:justify-start">
                <a
                  href="#catalog"
                  className="btn-primary !text-base !font-bold !py-3 !px-8 shadow-xl shadow-ella-accent/30"
                >
                  Découvrir les formations
                </a>
                <Link
                  href="/chat"
                  className="btn-outline-white !text-base !font-bold !py-3 !px-8"
                >
                  Parler à Ella
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Course catalog Section */}
      <section id="catalog" className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="mb-6 text-center md:text-left">
            <h2 className="text-3xl font-bold text-ella-gray-900 mb-1">Nos formations</h2>
            <p className="text-sm text-ella-gray-500 font-medium">Des parcours conçus par des experts, enrichis par l'IA</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {COURSES.map((course) => (
              <div
                key={course.id}
                onClick={() => handleCourseClick(course)}
                className={`group bg-white rounded-2xl overflow-hidden border border-ella-gray-200 transition-all flex flex-col h-full ${
                  course.available 
                    ? "cursor-pointer hover:border-ella-primary/30 hover:shadow-xl hover:shadow-ella-primary/5 hover:-translate-y-1" 
                    : "scale-[0.98]"
                }`}
              >
                {/* Image Container 16:9 */}
                <div className="relative aspect-video overflow-hidden">
                  <img 
                    src={course.image} 
                    alt={course.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {course.available && (
                    <div className="absolute top-3 left-3">
                      <span className="bg-ella-accent text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                        Disponible
                      </span>
                    </div>
                  )}
                  {!course.available && (
                    <div className="absolute top-3 left-3">
                      <span className="bg-ella-gray-200 text-ella-gray-500 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                        Bientôt
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="p-5 flex flex-col flex-1">
                  <div className="mb-3">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${course.categoryStyles.bg} ${course.categoryStyles.text}`}>
                      {course.category}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-ella-gray-900 mb-2 leading-tight group-hover:text-ella-primary transition-colors">
                    {course.title}
                  </h3>
                  
                  <p className="text-sm text-ella-gray-500 leading-relaxed mb-6 line-clamp-2">
                    {course.description}
                  </p>
                  
                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-ella-gray-100 italic">
                    <span className="text-[11px] font-bold text-ella-gray-400">
                      {course.duration}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ella Teaser Section (Light Gray) */}
      <section className="py-12 bg-ella-gray-50 border-t border-ella-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="bg-white border border-ella-gray-200 rounded-[2rem] p-6 md:p-10 text-center md:text-left flex flex-col md:flex-row items-center gap-6 md:gap-10 shadow-xl shadow-ella-gray-900/5">
            <div className="shrink-0">
              <EllaAvatar size="xl" className="ring-8 ring-ella-primary/5 shadow-2xl" />
            </div>
            <div className="flex-1">
              <p className="text-xl md:text-2xl font-medium leading-relaxed italic mb-8 text-ella-gray-700">
                "Salut ! Moi c'est Ella. Quel que soit ton domaine, je m'adapte à ton niveau et à ton rythme. Je ne te donnerai jamais la réponse — mais je vais te guider jusqu'à ce que tu la trouves toi-même. Prêt à apprendre autrement ?"
              </p>
              <Link
                href="/chat"
                className="btn-primary inline-flex items-center gap-3 text-lg !py-4 !px-10 shadow-2xl shadow-ella-accent/30 active:scale-95 transition-all"
              >
                Parler à Ella
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer (Dark) */}
      <footer className="bg-ella-dark py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="flex items-center gap-3">
              <img src="/assets/logo_learnlab_icon.png" alt="LearnLab" className="h-6 opacity-80 brightness-0 invert" />
              <span className="text-xs font-bold text-ella-dark-text/40 uppercase tracking-widest">Esprit LearnLab Assistant</span>
            </div>
            <p className="text-[10px] text-ella-dark-text/30 font-medium">© 2025 ESPRIT School of Engineering. Tous droits réservés.</p>
          </div>
          
          <div className="flex items-center gap-6">
            <img src="/assets/logo_esprit.png" alt="ESPRIT" className="h-10 brightness-0 invert opacity-40 hover:opacity-100 transition-all" />
          </div>
        </div>
      </footer>

      <ProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
        onSelect={handleProfileSelect} 
      />
    </div>
  );
}
