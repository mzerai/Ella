"use client";

import { useEffect, useRef } from "react";
import { Download, X } from "lucide-react";
import confetti from "canvas-confetti";

interface CelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownloadCertificate: () => void;
  courseTitle: string;
  lang: "fr" | "en";
  accentColor?: "amber" | "blue";
}

function launchCelebration() {
  const duration = 3000;
  const end = Date.now() + duration;
  const interval = setInterval(() => {
    if (Date.now() > end) {
      clearInterval(interval);
      return;
    }
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.6 },
      zIndex: 10000,
    });
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.6 },
      zIndex: 10000,
    });
  }, 250);
}

export default function CelebrationModal({
  isOpen,
  onClose,
  onDownloadCertificate,
  courseTitle,
  lang,
  accentColor = "blue",
}: CelebrationModalProps) {
  const hasLaunched = useRef(false);

  useEffect(() => {
    if (isOpen && !hasLaunched.current) {
      hasLaunched.current = true;
      launchCelebration();
    }
    if (!isOpen) {
      hasLaunched.current = false;
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const btnClass =
    accentColor === "amber"
      ? "bg-amber-500 hover:bg-amber-600 shadow-amber-500/20"
      : "bg-ella-primary hover:bg-ella-primary-dark shadow-ella-primary/20";

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Content */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden animate-slide-up">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-ella-gray-400 hover:text-ella-gray-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Video */}
        <div className="w-full bg-black">
          <video
            src="/assets/video_ella.mp4"
            autoPlay
            controls
            playsInline
            className="w-full max-h-[340px] object-contain"
          />
        </div>

        {/* Text + Buttons */}
        <div className="p-8 text-center">
          <h2 className="text-2xl font-black text-ella-gray-900 mb-2">
            {lang === "fr" ? "Félicitations !" : "Congratulations!"}
          </h2>
          <p className="text-sm text-ella-gray-500 font-medium mb-6">
            {lang === "fr"
              ? `Vous avez complété le cours ${courseTitle}. Votre certificat est prêt !`
              : `You have completed the ${courseTitle} course. Your certificate is ready!`}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={onDownloadCertificate}
              className={`flex items-center justify-center gap-2 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all active:scale-95 ${btnClass}`}
            >
              <Download className="w-4 h-4" />
              {lang === "fr" ? "Télécharger mon certificat" : "Download my certificate"}
            </button>
            <button
              onClick={onClose}
              className="text-sm font-bold text-ella-gray-500 hover:text-ella-gray-700 py-3 px-6 rounded-xl transition-colors"
            >
              {lang === "fr" ? "Fermer" : "Close"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
