"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import Link from "next/link";

export default function SignupPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
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
            const { error, hasSession } = await signUp(email, password, fullName);
            if (error) { setError(error); } else if (hasSession) { router.push("/courses"); } else { setSuccess(true); }
        } catch (err) {
            setError("Une erreur est survenue.");
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-[calc(100vh-5rem)] bg-ella-gray-50 flex items-center justify-center p-4">
                <div className="w-full max-w-md text-center animate-slide-up">
                    <div className="bg-white rounded-2xl p-8 shadow-2xl border border-ella-gray-100">
                        <span className="text-3xl mb-3 block">📧</span>
                        <h1 className="text-lg font-bold text-ella-gray-900 mb-2">Lien envoyé !</h1>
                        <p className="text-ella-gray-500 font-medium mb-5 text-sm">Confirmation envoyée à <span className="text-ella-gray-900 font-bold">{email}</span>.</p>
                        <Link href="/login" className="btn-primary w-full !py-3 !rounded-xl inline-block">Retour à la connexion</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-5rem)] bg-ella-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md animate-slide-up">
                <div className="bg-white rounded-2xl p-6 shadow-2xl border border-ella-gray-100">
                    <h1 className="text-lg font-bold text-ella-gray-900 text-center mb-4">Créer un compte Ella</h1>
                    {error && (<div className="bg-ella-accent/5 border border-ella-accent/20 text-ella-accent text-sm font-bold p-3 rounded-xl mb-3 animate-shake">{error}</div>)}
                    <form onSubmit={handleSubmit} className="space-y-3">
                        <div>
                            <label className="block text-[10px] font-black text-ella-gray-400 uppercase tracking-widest mb-1 ml-1">Nom complet</label>
                            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="w-full bg-ella-gray-50 border border-ella-gray-200 focus:border-ella-accent focus:ring-4 focus:ring-ella-accent/10 rounded-xl px-4 py-2.5 text-sm font-medium transition-all outline-none" placeholder="Jean Dupont" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-ella-gray-400 uppercase tracking-widest mb-1 ml-1">Email</label>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-ella-gray-50 border border-ella-gray-200 focus:border-ella-accent focus:ring-4 focus:ring-ella-accent/10 rounded-xl px-4 py-2.5 text-sm font-medium transition-all outline-none" placeholder="nom@exemple.com" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-ella-gray-400 uppercase tracking-widest mb-1 ml-1">Mot de passe</label>
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="w-full bg-ella-gray-50 border border-ella-gray-200 focus:border-ella-accent focus:ring-4 focus:ring-ella-accent/10 rounded-xl px-4 py-2.5 text-sm font-medium transition-all outline-none" placeholder="Minimum 6 caractères" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-ella-gray-400 uppercase tracking-widest mb-1 ml-1">Confirmer</label>
                            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="w-full bg-ella-gray-50 border border-ella-gray-200 focus:border-ella-accent focus:ring-4 focus:ring-ella-accent/10 rounded-xl px-4 py-2.5 text-sm font-medium transition-all outline-none" placeholder="••••••••" />
                        </div>
                        <button type="submit" disabled={isLoading} className="w-full btn-primary !py-3 !rounded-xl shadow-lg shadow-ella-accent/20 flex items-center justify-center gap-3 disabled:opacity-50 !mt-4">
                            {isLoading ? (<div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />) : "Créer mon compte"}
                        </button>
                    </form>
                    <p className="text-sm text-ella-gray-500 font-medium text-center mt-4">Déjà un compte ? <Link href="/login" className="text-ella-accent font-bold hover:underline">Se connecter</Link></p>
                </div>
            </div>
        </div>
    );
}
