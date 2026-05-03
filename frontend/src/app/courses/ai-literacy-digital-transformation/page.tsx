"use client";

import Link from "next/link";
import { BookOpen, Target, ArrowRight, CheckCircle, Shield } from "lucide-react";

const COURSE_BASE = "/courses/ai-literacy-digital-transformation";

const SEQUENCES = [
  {
    id: "00_course_positioning",
    title: "Positionnement du cours",
    description: "Introduction aux enjeux de la littératie IA et transformation digitale.",
    duration: "15 min",
    isLab: false,
  },
  {
    id: "00_ai_literacy_framing_lab",
    title: "Lab 0 : Cadrage AI Literacy",
    description: "Activité de cadrage : évaluez votre compréhension actuelle de l'IA.",
    duration: "20 min",
    isLab: true,
  },
  {
    id: "01_understand_ai_without_jargon",
    title: "Module 1 : Comprendre l'IA sans jargon",
    description: "Démystifier les concepts clés de l'IA pour tous.",
    duration: "45 min",
    isLab: false,
  },
  {
    id: "01_explain_ai_without_jargon_lab",
    title: "Lab 1 : Expliquer l'IA simplement",
    description: "Mise en pratique : vulgarisation d'un concept IA complexe.",
    duration: "30 min",
    isLab: true,
  },
  {
    id: "02_daily_generative_ai_work",
    title: "Module 2 : Usage quotidien de l'IA Générative",
    description: "Comment l'IA générative change votre manière de travailler.",
    duration: "1h",
    isLab: false,
  },
  {
    id: "02_daily_ai_use_control_lab",
    title: "Lab 2 : Maîtrise de l'usage quotidien",
    description: "Audit de vos tâches et potentiel d'automatisation IA.",
    duration: "30 min",
    isLab: true,
  },
  {
    id: "03_practical_prompting_business_work",
    title: "Module 3 : Prompt Engineering Pratique",
    description: "Techniques de prompting pour des résultats business concrets.",
    duration: "1h",
    isLab: false,
  },
  {
    id: "03_prompting_business_brief_lab",
    title: "Lab 3 : Briefing Business par Prompting",
    description: "Création de prompts complexes pour des livrables professionnels.",
    duration: "45 min",
    isLab: true,
  },
  {
    id: "04_identify_ai_opportunities_department",
    title: "Module 4 : Identifier les opportunités IA",
    description: "Méthodologie pour détecter les cas d'usage dans votre département.",
    duration: "1h",
    isLab: false,
  },
  {
    id: "04_ai_opportunity_canvas_lab",
    title: "Lab 4 : AI Opportunity Canvas",
    description: "Conception d'une fiche projet pour une opportunité IA identifiée.",
    duration: "45 min",
    isLab: true,
  },
  {
    id: "05_risks_ethics_data_responsible_use",
    title: "Module 5 : Risques, Éthique et Usage Responsable",
    description: "Comprendre les limites et les devoirs de l'utilisateur IA.",
    duration: "1h",
    isLab: false,
  },
  {
    id: "05_responsible_ai_use_lab",
    title: "Lab 5 : Audit d'usage responsable",
    description: "Analyse des risques sur un cas d'usage concret.",
    duration: "30 min",
    isLab: true,
  },
  {
    id: "06_from_individual_use_to_digital_transformation",
    title: "Module 6 : De l'usage individuel à la transformation digitale",
    description: "Passer à l'échelle : vision globale et roadmap.",
    duration: "1h",
    isLab: false,
  },
  {
    id: "06_digital_transformation_roadmap_lab",
    title: "Lab 6 : Roadmap de Transformation Digitale",
    description: "Élaboration d'une stratégie de déploiement IA à l'échelle.",
    duration: "1h",
    isLab: true,
  }
];

export default function LiteracyLanding() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-slate-900 sm:text-5xl mb-4">
            AI Literacy & Digital Transformation
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Maîtrisez les fondamentaux de l&apos;IA et devenez acteur de la transformation digitale dans votre organisation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <BookOpen className="w-8 h-8 text-indigo-600 mb-4" />
            <h3 className="font-bold text-slate-900 mb-2">Pédagogie Ella</h3>
            <p className="text-sm text-slate-500">Un accompagnement pas à pas par votre coach IA dédiée.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <Target className="w-8 h-8 text-indigo-600 mb-4" />
            <h3 className="font-bold text-slate-900 mb-2">Orientation Business</h3>
            <p className="text-sm text-slate-500">Des cas d&apos;usage concrets et immédiatement applicables.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <Shield className="w-8 h-8 text-indigo-600 mb-4" />
            <h3 className="font-bold text-slate-900 mb-2">Sécurité & Éthique</h3>
            <p className="text-sm text-slate-500">Protection des données et usage responsable blindé.</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
          <div className="bg-indigo-600 px-8 py-4 text-white">
            <h2 className="text-xl font-bold">Programme du Workshop</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {SEQUENCES.map((seq) => (
              <div key={seq.id} className="p-6 hover:bg-slate-50 transition-colors group">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                        {seq.isLab ? "LAB PRATIQUE" : "SÉQUENCE"}
                      </span>
                      <span className="text-xs text-slate-400">{seq.duration}</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">{seq.title}</h3>
                    <p className="text-slate-500 text-sm mt-1">{seq.description}</p>
                  </div>
                  <Link
                    href={seq.isLab ? `${COURSE_BASE}/labs/${seq.id}` : `${COURSE_BASE}/sequences/${seq.id}`}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0"
                  >
                    Démarrer <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 p-6 bg-amber-50 rounded-xl border border-amber-200 flex gap-4">
          <CheckCircle className="w-6 h-6 text-amber-600 shrink-0" />
          <p className="text-sm text-amber-800">
            <strong>Note de sécurité :</strong> Pour garantir l&apos;intégrité pédagogique, le copier-coller est désactivé sur l&apos;ensemble du contenu. Vos réponses doivent être originales pour être validées par Ella.
          </p>
        </div>
      </div>
    </div>
  );
}
