"use client";

import { useState, Suspense } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import EllaAvatar from "@/components/EllaAvatar";

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
            setError("Une erreur est survenue lors de la connexion.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md animate-slide-up">
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white shadow-xl shadow-ella-accent/5 mb-6 ring-8 ring-ella-accent/5">
                    <EllaAvatar size="lg" />
                </div>
            </div>

            <div className="bg-white rounded-3xl p-8 md:p-10 shadow-2xl shadow-ella-gray-900/5 border border-ella-gray-100">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-ella-gray-900 mb-2">Content de te revoir !</h1>
                    <p className="text-sm text-ella-gray-500 font-medium">Connecte-toi pour reprendre ton apprentissage avec Ella.</p>
                </div>

                {error && (
                    <div className="bg-ella-accent/5 border border-ella-accent/20 text-ella-accent text-sm font-bold p-4 rounded-xl mb-6 flex items-center gap-3 animate-shake">
                        <span>⚠️</span>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-[10px] font-black text-ella-gray-400 uppercase tracking-widest mb-2 ml-1">Email</label>
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
                        <label className="block text-[10px] font-black text-ella-gray-400 uppercase tracking-widest mb-2 ml-1">Mot de passe</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full bg-ella-gray-50 border border-ella-gray-200 focus:border-ella-accent focus:ring-4 focus:ring-ella-accent/10 rounded-2xl px-5 py-3 text-sm font-medium transition-all outline-none"
                            placeholder="••••••••"
                        />
                    </div>

                    <div className="flex justify-end">
                        <Link href="/forgot-password" className="text-xs font-bold text-ella-gray-400 hover:text-ella-accent transition-colors">Mot de passe oublié ?</Link>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full btn-primary !py-4 !rounded-2xl shadow-xl shadow-ella-accent/20 flex items-center justify-center gap-3 disabled:opacity-50 disabled:scale-100"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : "Se connecter"}
                    </button>
                </form>

                <div className="mt-8 pt-8 border-t border-ella-gray-100 text-center">
                    <p className="text-sm text-ella-gray-500 font-medium">
                        Pas encore de compte ?{" "}
                        <Link href="/signup" className="text-ella-accent font-bold hover:underline">S'inscrire</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-ella-gray-50 flex items-center justify-center p-4">
            <Suspense fallback={
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-ella-gray-200 border-t-ella-accent rounded-full animate-spin mb-4" />
                    <p className="text-ella-gray-400 font-bold uppercase tracking-widest text-[10px]">Chargement...</p>
                </div>
            }>
                <LoginForm />
            </Suspense>
        </div>
    );
}
