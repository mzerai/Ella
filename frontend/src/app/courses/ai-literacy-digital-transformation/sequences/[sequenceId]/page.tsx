"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import Notebook from "@/components/Notebook";
import EllaAvatar from "@/components/EllaAvatar";
import EllaCoachingPanel from "@/components/EllaCoachingPanel";
import { useAuth } from "@/components/AuthProvider";
import { getLiteracyModuleCells, type ModuleData } from "@/lib/api";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import AccessCodeGate from "@/components/AccessCodeGate";

const COURSE_BASE = "/courses/ai-literacy-digital-transformation";

const SEQUENCE_NAMES: Record<string, string> = {
  "00_course_positioning": "Positionnement du cours",
  "01_understand_ai_without_jargon": "Comprendre l'IA sans jargon",
  "02_daily_generative_ai_work": "Usage quotidien de l'IA Générative",
  "03_practical_prompting_business_work": "Prompt Engineering Pratique",
  "04_identify_ai_opportunities_department": "Identifier les opportunités IA",
  "05_risks_ethics_data_responsible_use": "Risques, Éthique et Usage Responsable",
  "06_from_individual_use_to_digital_transformation": "De l'usage individuel à la transformation digitale",
};

function SequenceContent() {
  const params = useParams();
  const { firstName } = useAuth();
  const sequenceId = params.sequenceId as string;
  const [sequence, setSequence] = useState<ModuleData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lang, setLang] = useState<"fr" | "en">("fr");

  useEffect(() => {
    getLiteracyModuleCells(sequenceId)
      .then(setSequence)
      .catch((err) => {
        console.error("Error loading Literacy sequence:", err);
        setError(err.message);
      });
  }, [sequenceId]);

  return (
    <div className="bg-white min-h-screen ella-protected-content">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-30 mb-8">
        <Link href={COURSE_BASE} className="text-slate-400 hover:text-indigo-600 transition-all p-2 -ml-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"></path>
          </svg>
        </Link>
        <div className="text-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
            Sequence — AI Literacy & Transformation
          </p>
          <h2 className="text-base font-black text-slate-900 leading-none">
            {sequence?.title?.[lang] || SEQUENCE_NAMES[sequenceId] || sequenceId}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setLang("fr")} className={`px-3 py-1 text-[10px] rounded-full font-black transition-all ${lang === "fr" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "bg-slate-100 text-slate-400 hover:bg-slate-200"}`}>FR</button>
          <button onClick={() => setLang("en")} className={`px-3 py-1 text-[10px] rounded-full font-black transition-all ${lang === "en" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "bg-slate-100 text-slate-400 hover:bg-slate-200"}`}>EN</button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <header className="mb-12">
          <div className="flex items-start gap-4 md:gap-6 bg-gradient-to-br from-indigo-50 via-white to-white border border-indigo-500/10 rounded-[2.5rem] p-6 md:p-10 shadow-xl shadow-indigo-500/5">
            <div className="shrink-0 p-2 bg-white rounded-2xl shadow-sm border border-indigo-500/10">
              <EllaAvatar size="lg" />
            </div>
            <div className="flex-1">
              <div className="mb-4">
                <span className="bg-indigo-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest mb-4 inline-block shadow-lg shadow-indigo-600/20">
                   Séquence Active
                </span>
                <h1 className="text-3xl font-black text-slate-900 leading-tight">
                  {sequence?.title?.[lang] || SEQUENCE_NAMES[sequenceId] || sequenceId}
                </h1>
              </div>
              <p className="text-base font-bold text-slate-600 leading-relaxed max-w-2xl">
                {lang === "fr"
                  ? <>Prêt pour cette séquence{firstName ? <>, <span className="font-bold text-indigo-600">{firstName}</span></> : null} ? Nous allons explorer les fondamentaux de la littératie IA.</>
                  : <>Ready for this sequence{firstName ? <>, <span className="font-bold text-indigo-600">{firstName}</span></> : null}? We&apos;ll explore the fundamentals of AI literacy.</>
                }
              </p>
            </div>
          </div>
        </header>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-bold p-6 rounded-3xl mb-12 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-xl shadow-sm">&#x26A0;&#xFE0F;</div>
            <p>{lang === "fr" ? "Impossible de charger la séquence :" : "Failed to load sequence:"} {error}</p>
          </div>
        )}

        {!sequence && !error && (
          <div className="flex flex-col items-center py-24 gap-6">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-slate-100 border-t-indigo-500 rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <EllaAvatar size="sm" className="scale-75 opacity-50" />
              </div>
            </div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest animate-pulse">Chargement de la séquence...</p>
          </div>
        )}

        {sequence && (
          <Notebook cells={sequence.cells} moduleId={sequenceId} lang={lang} courseId="literacy" />
        )}
      </div>

      <EllaCoachingPanel courseId="literacy" pageId={sequenceId} pageTitle={sequence?.title?.[lang] || SEQUENCE_NAMES[sequenceId] || sequenceId} pageType="lesson" lang={lang} studentFirstName={firstName} />
    </div>
  );
}

export default function LiteracySequencePage() {
  return (
    <ProtectedRoute>
      <AccessCodeGate courseId="literacy" courseTitle="Workshop : AI Literacy & Transformation" accentColor="indigo">
        <SequenceContent />
      </AccessCodeGate>
    </ProtectedRoute>
  );
}
