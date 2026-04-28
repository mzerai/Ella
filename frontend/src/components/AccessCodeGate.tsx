"use client";

import { useEffect, useState } from "react";
import { Lock, CheckCircle, AlertCircle } from "lucide-react";
import EllaAvatar from "./EllaAvatar";
import { checkCourseAccess, verifyAccessCode } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";

interface AccessCodeGateProps {
  courseId: string;
  courseTitle: string;
  children: React.ReactNode;
  accentColor?: "amber" | "blue" | "green";
}

export default function AccessCodeGate({
  courseId,
  courseTitle,
  children,
  accentColor = "blue",
}: AccessCodeGateProps) {
  const { user } = useAuth();
  const [checking, setChecking] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const isAdmin = user?.email === "mourad.zerai@gmail.com";

  useEffect(() => {
    if (!user) return;

    // Admin bypasses access codes
    if (isAdmin) {
      setHasAccess(true);
      setChecking(false);
      return;
    }

    checkCourseAccess(courseId)
      .then((resp) => {
        setHasAccess(resp.has_access);
      })
      .catch(() => {
        setHasAccess(false);
      })
      .finally(() => {
        setChecking(false);
      });
  }, [user, courseId, isAdmin]);

  const handleSubmit = async () => {
    if (!code.trim() || submitting) return;
    setSubmitting(true);
    setError("");

    try {
      const resp = await verifyAccessCode(code, courseId);
      if (resp.success) {
        setSuccess(true);
        setTimeout(() => {
          setHasAccess(true);
        }, 1000);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Une erreur est survenue.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (checking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="w-12 h-12 border-4 border-ella-gray-100 border-t-ella-primary rounded-full animate-spin" />
      </div>
    );
  }

  // Access granted
  if (hasAccess) {
    return <>{children}</>;
  }

  // Accent color classes
  const accentClasses = {
    amber: {
      button: "bg-amber-500 hover:bg-amber-600 shadow-amber-500/20",
      ring: "focus:ring-amber-500/20 focus:border-amber-500",
      badge: "bg-amber-50 text-amber-700 border-amber-200",
    },
    blue: {
      button: "bg-ella-primary hover:bg-ella-primary-dark shadow-ella-primary/20",
      ring: "focus:ring-ella-primary/20 focus:border-ella-primary",
      badge: "bg-ella-primary-bg text-ella-primary border-ella-primary/20",
    },
    green: {
      button: "bg-green-600 hover:bg-green-700 shadow-green-600/20",
      ring: "focus:ring-green-600/20 focus:border-green-600",
      badge: "bg-green-50 text-green-700 border-green-200",
    },
  };

  const colors = accentClasses[accentColor];

  // Access code form
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-ella-gray-50">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl border border-ella-gray-100 p-8 md:p-10">
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="mb-4">
              <EllaAvatar size="lg" />
            </div>
            <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border mb-4 ${colors.badge}`}>
              {courseTitle}
            </span>
            <div className="w-12 h-12 rounded-2xl bg-ella-gray-50 flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-ella-gray-400" />
            </div>
            <h2 className="text-xl font-black text-ella-gray-900 mb-2">
              Code d'accès requis
            </h2>
            <p className="text-sm text-ella-gray-500 font-medium">
              Ce cours nécessite un code d'accès pour être débloqué.
            </p>
          </div>

          {/* Success state */}
          {success ? (
            <div className="flex flex-col items-center gap-3 py-4">
              <CheckCircle className="w-10 h-10 text-green-500" />
              <p className="text-sm font-bold text-green-700">Cours débloqué avec succès !</p>
            </div>
          ) : (
            <>
              {/* Code input */}
              <div className="space-y-4">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.toUpperCase());
                    setError("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSubmit();
                  }}
                  placeholder="XXXX-XXXX-XXXX"
                  className={`w-full bg-ella-gray-50 border border-ella-gray-200 rounded-xl px-4 py-3 text-center text-lg font-mono font-bold tracking-widest outline-none transition-all ${colors.ring}`}
                  disabled={submitting}
                  autoFocus
                />

                {/* Error */}
                {error && (
                  <div className="flex items-center gap-2 text-sm text-red-600 font-bold bg-red-50 rounded-xl px-4 py-3">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                  </div>
                )}

                {/* Submit button */}
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !code.trim()}
                  className={`w-full text-white font-bold py-3 rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed ${colors.button}`}
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      Vérification...
                    </span>
                  ) : (
                    "Débloquer le cours"
                  )}
                </button>
              </div>

              {/* Help text */}
              <p className="text-xs text-ella-gray-400 text-center mt-6 font-medium">
                Le code vous a été communiqué par votre formateur ou administrateur.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
