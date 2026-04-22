"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase";
import Link from "next/link";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [sent, setSent] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const supabase = createClient();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
            });
            if (error) { setError(error.message); } else { setSent(true); }
        } catch { setError("Une erreur est survenue."); }
        finally { setIsLoading(false); }
    };

    if (sent) {
        return (
            <div className="min-h-[calc(100vh-5rem)] bg-ella-gray-50 flex items-center justify-center p-4">
                <div className="w-full max-w-md animate-slide-up">
                    <div className="bg-white rounded-2xl p-6 shadow-2xl border border-ella-gray-100 text-center">
                        <span className="text-3xl mb-3 block">📧</span>
                        <h1 className="text-lg font-bold text-ella-gray-900 mb-2">Email envoyé !</h1>
                        <p className="text-sm text-ella-gray-500 font-medium mb-5">Un lien de réinitialisation a été envoyé à <span className="font-bold text-ella-gray-900">{email}</span>.</p>
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
                    <h1 className="text-lg font-bold text-ella-gray-900 text-center mb-1">Mot de passe oublié</h1>
                    <p className="text-sm text-ella-gray-500 font-medium text-center mb-5">Entre ton email pour recevoir un lien de réinitialisation.</p>
                    {error && (<div className="bg-ella-accent/5 border border-ella-accent/20 text-ella-accent text-sm font-bold p-3 rounded-xl mb-3 animate-shake">{error}</div>)}
                    <form onSubmit={handleSubmit} className="space-y-3">
                        <div>
                            <label className="block text-[10px] font-black text-ella-gray-400 uppercase tracking-widest mb-1 ml-1">Email</label>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-ella-gray-50 border border-ella-gray-200 focus:border-ella-accent focus:ring-4 focus:ring-ella-accent/10 rounded-xl px-4 py-2.5 text-sm font-medium transition-all outline-none" placeholder="nom@exemple.com" />
                        </div>
                        <button type="submit" disabled={isLoading} className="w-full btn-primary !py-3 !rounded-xl shadow-lg shadow-ella-accent/20 flex items-center justify-center gap-3 disabled:opacity-50 !mt-4">
                            {isLoading ? (<div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />) : "Envoyer le lien"}
                        </button>
                    </form>
                    <p className="text-sm text-ella-gray-500 font-medium text-center mt-4"><Link href="/login" className="text-ella-accent font-bold hover:underline">Retour à la connexion</Link></p>
                </div>
            </div>
        </div>
    );
}
