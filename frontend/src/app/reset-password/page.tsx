"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ResetPasswordPage() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const supabase = createClient();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError("Les mots de passe ne correspondent pas.");
            return;
        }

        setIsLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({ password });
            if (error) {
                setError(error.message);
            } else {
                setSuccess(true);
                setTimeout(() => router.push("/"), 2000);
            }
        } catch {
            setError("Une erreur est survenue.");
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-[calc(100vh-5rem)] bg-ella-gray-50 flex items-center justify-center p-4">
                <div className="w-full max-w-md animate-slide-up">
                    <div className="bg-white rounded-2xl p-6 shadow-2xl border border-ella-gray-100 text-center">
                        <span className="text-3xl mb-3 block">✅</span>
                        <h1 className="text-lg font-bold text-ella-gray-900 mb-2">Mot de passe modifié !</h1>
                        <p className="text-sm text-ella-gray-500 font-medium">Redirection en cours...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-5rem)] bg-ella-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md animate-slide-up">
                <div className="bg-white rounded-2xl p-6 shadow-2xl border border-ella-gray-100">
                    <h1 className="text-lg font-bold text-ella-gray-900 text-center mb-1">Nouveau mot de passe</h1>
                    <p className="text-sm text-ella-gray-500 font-medium text-center mb-5">Choisis un nouveau mot de passe pour ton compte.</p>

                    {error && (
                        <div className="bg-ella-accent/5 border border-ella-accent/20 text-ella-accent text-sm font-bold p-3 rounded-xl mb-3 animate-shake">{error}</div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-3">
                        <div>
                            <label className="block text-[10px] font-black text-ella-gray-400 uppercase tracking-widest mb-1 ml-1">Nouveau mot de passe</label>
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
                                className="w-full bg-ella-gray-50 border border-ella-gray-200 focus:border-ella-accent focus:ring-4 focus:ring-ella-accent/10 rounded-xl px-4 py-2.5 text-sm font-medium transition-all outline-none"
                                placeholder="Minimum 6 caractères" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-ella-gray-400 uppercase tracking-widest mb-1 ml-1">Confirmer</label>
                            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required
                                className="w-full bg-ella-gray-50 border border-ella-gray-200 focus:border-ella-accent focus:ring-4 focus:ring-ella-accent/10 rounded-xl px-4 py-2.5 text-sm font-medium transition-all outline-none"
                                placeholder="••••••••" />
                        </div>
                        <button type="submit" disabled={isLoading}
                            className="w-full btn-primary !py-3 !rounded-xl shadow-lg shadow-ella-accent/20 flex items-center justify-center gap-3 disabled:opacity-50 !mt-4">
                            {isLoading ? (<div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />) : "Changer le mot de passe"}
                        </button>
                    </form>

                    <p className="text-sm text-ella-gray-500 font-medium text-center mt-4">
                        <Link href="/login" className="text-ella-accent font-bold hover:underline">Retour à la connexion</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
