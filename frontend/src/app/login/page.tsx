"use client";

import { useState, Suspense } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { signIn } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get("redirect") || "/";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            const { error } = await signIn(email, password);
            if (error) {
                setError("Email ou mot de passe incorrect.");
            } else {
                router.push(redirect);
            }
        } catch (err) {
            setError("Une erreur est survenue.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md animate-slide-up">
            <div className="bg-white rounded-2xl p-6 shadow-2xl border border-ella-gray-100">
                <h1 className="text-lg font-bold text-ella-gray-900 text-center mb-1">Content de te revoir !</h1>
                <p className="text-sm text-ella-gray-500 font-medium text-center mb-5">Connecte-toi pour reprendre ton apprentissage.</p>

                {error && (
                    <div className="bg-ella-accent/5 border border-ella-accent/20 text-ella-accent text-sm font-bold p-3 rounded-xl mb-3 flex items-center gap-2 animate-shake">
                        <span>⚠️</span>{error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                        <label className="block text-[10px] font-black text-ella-gray-400 uppercase tracking-widest mb-1 ml-1">Email</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                            className="w-full bg-ella-gray-50 border border-ella-gray-200 focus:border-ella-accent focus:ring-4 focus:ring-ella-accent/10 rounded-xl px-4 py-2.5 text-sm font-medium transition-all outline-none"
                            placeholder="nom@exemple.com" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-ella-gray-400 uppercase tracking-widest mb-1 ml-1">Mot de passe</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                            className="w-full bg-ella-gray-50 border border-ella-gray-200 focus:border-ella-accent focus:ring-4 focus:ring-ella-accent/10 rounded-xl px-4 py-2.5 text-sm font-medium transition-all outline-none"
                            placeholder="••••••••" />
                    </div>
                    <div className="flex justify-end"><Link href="/forgot-password" className="text-xs font-bold text-ella-gray-400 hover:text-ella-accent transition-colors">Mot de passe oublié ?</Link></div>
                    <button type="submit" disabled={isLoading}
                        className="w-full btn-primary !py-3 !rounded-xl shadow-lg shadow-ella-accent/20 flex items-center justify-center gap-3 disabled:opacity-50 !mt-4">
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : "Se connecter"}
                    </button>
                </form>

                <p className="text-sm text-ella-gray-500 font-medium text-center mt-4">
                    Pas encore de compte ? <Link href="/signup" className="text-ella-accent font-bold hover:underline">S&apos;inscrire</Link>
                </p>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <div className="min-h-[calc(100vh-5rem)] bg-ella-gray-50 flex items-center justify-center p-4">
            <Suspense fallback={
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-ella-gray-200 border-t-ella-accent rounded-full animate-spin mb-4" />
                </div>
            }>
                <LoginForm />
            </Suspense>
        </div>
    );
}
