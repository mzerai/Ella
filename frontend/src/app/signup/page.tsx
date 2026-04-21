"use client";

import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import Link from "next/link";
import EllaAvatar from "@/components/EllaAvatar";

export default function SignupPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { signUp } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        
        if (password !== confirmPassword) {
            setError("Les mots de passe ne correspondent pas.");
            return;
        }

        setIsLoading(true);

        try {
            const { error } = await signUp(email, password, fullName);
            if (error) {
                setError(error);
            } else {
                setSuccess(true);
            }
        } catch (err) {
            setError("Une erreur est survenue lors de l'inscription.");
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-ella-gray-50 flex items-center justify-center p-4">
                <div className="w-full max-w-md text-center animate-slide-up">
                    <div className="bg-white rounded-3xl p-10 shadow-2xl border border-ella-gray-100">
                        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="text-3xl">📧</span>
                        </div>
                        <h1 className="text-2xl font-bold text-ella-gray-900 mb-4">Vérifie ta boîte email !</h1>
                        <p className="text-ella-gray-500 font-medium mb-8 leading-relaxed">
                            Nous t'avons envoyé un lien de confirmation à <span className="text-ella-gray-900 font-bold">{email}</span>. Clique sur le lien pour activer ton compte.
                        </p>
                        <Link href="/login" className="btn-primary w-full !py-4 !rounded-2xl inline-block">
                            Retour à la connexion
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-ella-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md animate-slide-up">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white shadow-xl mb-6 ring-8 ring-ella-primary/5">
                        <EllaAvatar size="lg" />
                    </div>
                </div>

                <div className="bg-white rounded-3xl p-8 md:p-10 shadow-2xl border border-ella-gray-100">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-ella-gray-900 mb-2">Bienvenue !</h1>
                        <p className="text-sm text-ella-gray-500 font-medium">Crée ton compte et commence à apprendre avec Ella.</p>
                    </div>

                    {error && (
                        <div className="bg-ella-accent/5 border border-ella-accent/20 text-ella-accent text-sm font-bold p-4 rounded-xl mb-6 animate-shake">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-black text-ella-gray-400 uppercase tracking-widest mb-1.5 ml-1">Nom complet</label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                                className="w-full bg-ella-gray-50 border border-ella-gray-200 focus:border-ella-accent focus:ring-4 focus:ring-ella-accent/10 rounded-2xl px-5 py-3 text-sm font-medium transition-all outline-none"
                                placeholder="Jean Dupont"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-ella-gray-400 uppercase tracking-widest mb-1.5 ml-1">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full bg-ella-gray-50 border border-ella-gray-200 focus:border-ella-accent focus:ring-4 focus:ring-ella-accent/10 rounded-2xl px-5 py-3 text-sm font-medium transition-all outline-none"
                                placeholder="nom@exemple.com"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-ella-gray-400 uppercase tracking-widest mb-1.5 ml-1">Mot de passe</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full bg-ella-gray-50 border border-ella-gray-200 focus:border-ella-accent focus:ring-4 focus:ring-ella-accent/10 rounded-2xl px-5 py-3 text-sm font-medium transition-all outline-none"
                                placeholder="Minimum 6 caractères"
                                minLength={6}
                            />
                        </div>

                        <div className="pb-2">
                            <label className="block text-[10px] font-black text-ella-gray-400 uppercase tracking-widest mb-1.5 ml-1">Confirmer mot de passe</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className="w-full bg-ella-gray-50 border border-ella-gray-200 focus:border-ella-accent focus:ring-4 focus:ring-ella-accent/10 rounded-2xl px-5 py-3 text-sm font-medium transition-all outline-none"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full btn-primary !py-4 !rounded-2xl shadow-xl shadow-ella-accent/20 flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : "Créer mon compte"}
                        </button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-ella-gray-100 text-center">
                        <p className="text-sm text-ella-gray-500 font-medium">
                            Déjà un compte ?{" "}
                            <Link href="/login" className="text-ella-accent font-bold hover:underline">Se connecter</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
