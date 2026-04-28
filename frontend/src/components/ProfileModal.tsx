"use client";

import { useEffect, useState } from "react";
import { Landmark, Factory, Monitor, ShoppingCart, Heart, GraduationCap, Wheat, HardHat, Hotel, Wrench } from "lucide-react";
import EllaAvatar from "./EllaAvatar";

export type ProfileType = "engineering" | "business" | "health" | "finance" | "marketing" | "humanities";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (profile: ProfileType) => void;
  courseId?: string;
}

const PROFILES: Array<{
  id: ProfileType;
  icon: string;
  title: string;
  subtitle: string;
  description: string;
}> = [
  {
    id: "engineering",
    icon: "</>",
    title: "Ingénierie",
    subtitle: "DATA, DEV & SYSTÈMES",
    description: "Missions orientées technique, déploiement et architecture.",
  },
  {
    id: "business",
    icon: "💼",
    title: "Business & Management",
    subtitle: "STRATÉGIE & OPÉRATIONS",
    description: "Missions orientées décisionnelle, marketing et produit.",
  },
  {
    id: "health",
    icon: "🏥",
    title: "Santé & Biotech",
    subtitle: "MÉDICAL & RECHERCHE",
    description: "Missions orientées santé publique, données cliniques et recherche biomédicale.",
  },
  {
    id: "finance",
    icon: "📈",
    title: "Finance & Fintech",
    subtitle: "BANQUE & INVESTISSEMENT",
    description: "Missions orientées analyse financière, gestion de risques et marchés.",
  },
  {
    id: "marketing",
    icon: "📣",
    title: "Marketing & Communication",
    subtitle: "CONTENU & STRATÉGIE DIGITALE",
    description: "Missions orientées copywriting, campagnes digitales et analytics.",
  },
  {
    id: "humanities",
    icon: "📚",
    title: "Sciences Humaines & Éducation",
    subtitle: "PÉDAGOGIE & RECHERCHE",
    description: "Missions orientées enseignement, analyse de textes et sciences sociales.",
  },
];

const AILE_PROFILES: Array<{
  id: ProfileType;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  description: string;
}> = [
  {
    id: "finance",
    icon: <Landmark className="w-6 h-6" />,
    title: "Banque & Finance",
    subtitle: "SECTEUR BANCAIRE & FINANCIER",
    description: "Scoring crédit, conformité BCT, fintech, gestion des risques.",
  },
  {
    id: "engineering",
    icon: <Factory className="w-6 h-6" />,
    title: "Industrie & Manufacturing",
    subtitle: "PRODUCTION & SUPPLY CHAIN",
    description: "Câblage automobile, textile, agroalimentaire, maintenance prédictive.",
  },
  {
    id: "marketing",
    icon: <Monitor className="w-6 h-6" />,
    title: "IT & Télécoms",
    subtitle: "TECH & DIGITAL",
    description: "Développement logiciel, télécommunications, startups, nearshoring.",
  },
  {
    id: "business",
    icon: <ShoppingCart className="w-6 h-6" />,
    title: "Commerce & Services",
    subtitle: "DISTRIBUTION & CONSEIL",
    description: "Grande distribution, import-export, services aux entreprises.",
  },
  {
    id: "health",
    icon: <Heart className="w-6 h-6" />,
    title: "Santé & Pharma",
    subtitle: "MÉDICAL & PHARMACEUTIQUE",
    description: "Hôpitaux, cliniques, industrie pharmaceutique, tourisme médical.",
  },
  {
    id: "humanities",
    icon: <GraduationCap className="w-6 h-6" />,
    title: "Éducation & Formation",
    subtitle: "ENSEIGNEMENT & EDTECH",
    description: "Universités, formation professionnelle, e-learning, EdTech.",
  },
  {
    id: "engineering",
    icon: <Wheat className="w-6 h-6" />,
    title: "Agriculture & Agroalimentaire",
    subtitle: "PRODUCTION & EXPORT",
    description: "Oléiculture, céréales, agrumes, transformation alimentaire, smart farming.",
  },
  {
    id: "engineering",
    icon: <HardHat className="w-6 h-6" />,
    title: "BTP & Immobilier",
    subtitle: "CONSTRUCTION & INFRASTRUCTURE",
    description: "Bâtiment, travaux publics, promotion immobilière, projets d'infrastructure.",
  },
  {
    id: "business",
    icon: <Hotel className="w-6 h-6" />,
    title: "Tourisme & Hôtellerie",
    subtitle: "HOSPITALITY & LOISIRS",
    description: "Hôtels, agences de voyage, tourisme médical, événementiel.",
  },
  {
    id: "business",
    icon: <Wrench className="w-6 h-6" />,
    title: "Autre secteur",
    subtitle: "TOUS SECTEURS",
    description: "Énergie, transport, logistique, administration publique, ou tout autre secteur.",
  },
];

export default function ProfileModal({ isOpen, onClose, onSelect, courseId }: ProfileModalProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isOpen || !isMounted) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className={`relative bg-white w-full rounded-3xl overflow-hidden shadow-2xl border border-ella-gray-100 animate-slide-up ${courseId === "aile" ? "max-w-5xl" : "max-w-3xl"}`}>
        <div className="p-8 md:p-10">
          <div className="flex flex-col items-center text-center mb-10">
            <div className="w-16 h-16 bg-ella-accent/5 rounded-full flex items-center justify-center mb-6">
              <EllaAvatar size="md" />
            </div>
            <h2 className="text-3xl font-bold text-ella-gray-900 mb-2">
              {courseId === "aile" ? "Quel est votre secteur ?" : "Quel est ton profil ?"}
            </h2>
            <p className="text-ella-gray-500">
              {courseId === "aile"
                ? "ELLA adaptera les cas pratiques et missions à votre contexte sectoriel."
                : "Ella adaptera les missions à ton contexte professionnel pour un apprentissage plus pertinent."}
            </p>
          </div>

          <div className={`grid gap-4 mb-6 ${courseId === "aile" ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5" : "grid-cols-2 sm:grid-cols-3"}`}>
            {(courseId === "aile" ? AILE_PROFILES : PROFILES).map((p, i) => (
              <button
                key={`${p.id}-${i}`}
                onClick={() => onSelect(p.id)}
                className="group bg-white hover:border-ella-accent border border-ella-gray-200 rounded-2xl p-5 transition-all text-left flex flex-col gap-3 active:scale-[0.98] shadow-sm hover:shadow-md"
              >
                <div className="w-10 h-10 bg-ella-gray-50 group-hover:bg-ella-accent/10 rounded-xl flex items-center justify-center text-xl group-hover:scale-110 transition-all">
                  {p.icon}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-ella-gray-900 mb-0.5 group-hover:text-ella-accent transition-colors leading-tight">{p.title}</h3>
                  <p className="text-[9px] text-ella-gray-400 leading-relaxed uppercase tracking-widest font-black mb-1">{p.subtitle}</p>
                  <p className="text-xs text-ella-gray-600 leading-relaxed">{p.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-ella-gray-300 hover:text-ella-accent transition-colors p-2"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
        </button>
      </div>
    </div>
  );
}
