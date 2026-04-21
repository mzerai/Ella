"use client";

import { useEffect, useState } from "react";
import EllaAvatar from "./EllaAvatar";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (profile: "engineering" | "business") => void;
}

export default function ProfileModal({ isOpen, onClose, onSelect }: ProfileModalProps) {
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
      <div className="relative bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border border-ella-gray-100 animate-slide-up">
        <div className="p-8 md:p-10">
          <div className="flex flex-col items-center text-center mb-10">
            <div className="w-16 h-16 bg-ella-accent/5 rounded-full flex items-center justify-center mb-6">
              <EllaAvatar size="md" />
            </div>
            <h2 className="text-3xl font-bold text-ella-gray-900 mb-2">Quel est ton profil ?</h2>
            <p className="text-ella-gray-500">
              Ella adaptera les missions à ton contexte professionnel pour un apprentissage plus pertinent.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            <button
              onClick={() => onSelect("engineering")}
              className="group bg-white hover:border-ella-accent border border-ella-gray-200 rounded-2xl p-6 transition-all text-left flex items-start gap-4 active:scale-[0.98] shadow-sm hover:shadow-md"
            >
              <div className="w-12 h-12 bg-ella-gray-50 group-hover:bg-ella-accent/10 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-all">
                {"</>"}
              </div>
              <div>
                <h3 className="font-bold text-ella-gray-900 mb-1 group-hover:text-ella-accent transition-colors">Ingénierie</h3>
                <p className="text-[10px] text-ella-gray-400 leading-relaxed uppercase tracking-widest font-black mb-1">DATA, DEV & SYSTÈMES</p>
                <p className="text-sm text-ella-gray-600 leading-relaxed">
                  Missions orientées technique, déploiement et architecture.
                </p>
              </div>
            </button>

            <button
              onClick={() => onSelect("business")}
              className="group bg-white hover:border-ella-accent border border-ella-gray-200 rounded-2xl p-6 transition-all text-left flex items-start gap-4 active:scale-[0.98] shadow-sm hover:shadow-md"
            >
              <div className="w-12 h-12 bg-ella-gray-50 group-hover:bg-ella-accent/10 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-all">
                💼
              </div>
              <div>
                <h3 className="font-bold text-ella-gray-900 mb-1 group-hover:text-ella-accent transition-colors">Business & Management</h3>
                <p className="text-[10px] text-ella-gray-400 leading-relaxed uppercase tracking-widest font-black mb-1">STRATÉGIE & OPÉRATIONS</p>
                <p className="text-sm text-ella-gray-600 leading-relaxed">
                  Missions orientées décisionnelle, marketing et produit.
                </p>
              </div>
            </button>
          </div>

          <div className="p-6 bg-ella-gray-50 rounded-2xl border border-ella-gray-100">
            <p className="text-[10px] font-black text-ella-gray-400 uppercase tracking-[0.2em] mb-4 text-center">Bientôt disponibles</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {["Santé 🏥", "Finance 📈", "Marketing 📣", "S. Humaines 📚"].map((p) => (
                <div key={p} className="text-center p-2 rounded-lg bg-white border border-ella-gray-200 text-[10px] text-ella-gray-400 font-bold">
                  {p}
                </div>
              ))}
            </div>
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
