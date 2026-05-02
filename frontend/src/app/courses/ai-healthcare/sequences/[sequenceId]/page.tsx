"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import Notebook from "@/components/Notebook";
import EllaAvatar from "@/components/EllaAvatar";
import EllaCoachingPanel from "@/components/EllaCoachingPanel";
import { useAuth } from "@/components/AuthProvider";
import { getHealthcareSequenceCells, type ModuleData } from "@/lib/api";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import AccessCodeGate from "@/components/AccessCodeGate";

const SEQUENCE_NAMES: Record<string, string> = {
  "00_healthcare_intro": "Cadrage : IA et Santé",
  "01_medical_cv": "Vision par Ordinateur Médicale",
  "02_clinical_nlp": "NLP Clinique et Extraction",
  "03_ethics_privacy": "Éthique et Confidentialité",
  "04_predictive_risk": "Risque Prédictif et Décision",
  "05_regulatory_compliance": "Réglementation et Conformité",
};

function SequenceContent() {
  const params = useParams();
  const { firstName } = useAuth();
  const sequenceId = params.sequenceId as string;
  const [sequence, setSequence] = useState<ModuleData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lang, setLang] = useState<"fr" | "en">("fr");

  useEffect(() => {
    getHealthcareSequenceCells(sequenceId)
      .then(setSequence)
      .catch((err) => {
        console.error("Error loading Healthcare sequence:", err);
        setError(err.message);
      });
  }, [sequenceId]);

  return (
    <div className="bg-white min-h-screen ella-protected-content">
      {/* Header Navigation */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-30 mb-8">
        <Link href="/courses/ai-healthcare" className="text-slate-400 hover:text-teal-600 transition-all p-2 -ml-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"></path>
          </svg>
        </Link>
        <div className="text-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
            Sequence — AI for Healthcare
          </p>
          <h2 className="text-base font-black text-slate-900 leading-none">
            {sequence?.title?.[lang] || SEQUENCE_NAMES[sequenceId] || sequenceId}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLang("fr")}
            className={`px-3 py-1 text-[10px] rounded-full font-black transition-all ${
              lang === "fr"
                ? "bg-teal-600 text-white shadow-lg shadow-teal-600/20"
                : "bg-slate-100 text-slate-400 hover:bg-slate-200"
            }`}
          >
            FR
          </button>
          <button
            onClick={() => setLang("en")}
            className={`px-3 py-1 text-[10px] rounded-full font-black transition-all ${
              lang === "en"
                ? "bg-teal-600 text-white shadow-lg shadow-teal-600/20"
                : "bg-slate-100 text-slate-400 hover:bg-slate-200"
            }`}
          >
            EN
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Sequence Intro */}
        <header className="mb-12">
          <div className="flex items-start gap-4 md:gap-6 bg-gradient-to-br from-teal-50 via-white to-white border border-teal-500/10 rounded-[2.5rem] p-6 md:p-10 shadow-xl shadow-teal-500/5">
            <div className="shrink-0 p-2 bg-white rounded-2xl shadow-sm border border-teal-500/10">
              <EllaAvatar size="lg" />
            </div>
            <div className="flex-1">
              <div className="mb-4">
                <span className="bg-teal-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest mb-4 inline-block shadow-lg shadow-teal-600/20">
                   Séquence Active
                </span>
                <h1 className="text-3xl font-black text-slate-900 leading-tight">
                  {sequence?.title?.[lang] || SEQUENCE_NAMES[sequenceId] || sequenceId}
                </h1>
              </div>
              <p className="text-base font-bold text-slate-600 leading-relaxed max-w-2xl">
                {lang === "fr"
                  ? <>Prêt pour cette séquence{firstName ? <>, <span className="font-bold text-teal-600">{firstName}</span></> : null} ? Nous allons approfondir les applications de l'IA en milieu clinique. N'oubliez pas : chaque checkpoint est une opportunité de valider vos acquis.</>
                  : <>Ready for this sequence{firstName ? <>, <span className="font-bold text-teal-600">{firstName}</span></> : null}? We'll dive deep into clinical AI applications. Remember: each checkpoint is an opportunity to validate your learning.</>
                }
              </p>
            </div>
          </div>
        </header>

        {/* Error state */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-bold p-6 rounded-3xl mb-12 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-xl shadow-sm">&#x26A0;&#xFE0F;</div>
            <p>{lang === "fr" ? "Impossible de charger la séquence :" : "Failed to load sequence:"} {error}</p>
          </div>
        )}

        {/* Loading state */}
        {!sequence && !error && (
          <div className="flex flex-col items-center py-24 gap-6">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-slate-100 border-t-teal-500 rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <EllaAvatar size="sm" className="scale-75 opacity-50" />
              </div>
            </div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest animate-pulse">
              Chargement de la séquence...
            </p>
          </div>
        )}

        {/* Notebook */}
        {sequence && (
          <Notebook
            cells={sequence.cells}
            moduleId={sequenceId}
            lang={lang}
            courseId="healthcare"
          />
        )}
      </div>

      <EllaCoachingPanel
        courseId="healthcare"
        pageId={sequenceId}
        pageTitle={sequence?.title?.[lang] || SEQUENCE_NAMES[sequenceId] || sequenceId}
        pageType="lesson"
        lang={lang}
        studentFirstName={firstName}
      />
    </div>
  );
}

export default function HealthcareSequencePage() {
  return (
    <ProtectedRoute>
      <AccessCodeGate courseId="healthcare" courseTitle="Workshop : AI for Healthcare" accentColor="green">
        <SequenceContent />
      </AccessCodeGate>
    </ProtectedRoute>
  );
}
