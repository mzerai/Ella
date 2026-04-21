"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase";
import EllaAvatar from "@/components/EllaAvatar";
import ScoreBadge from "@/components/ScoreBadge";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";

interface LabAttempt {
    id: string;
    lab_id: string;
    mission_id: string;
    total_score: number;
    max_score: number;
    created_at: string;
}

interface LabStats {
    lab_id: string;
    title: string;
    attempts: number;
    bestScore: number;
    maxScore: number;
    lastAttempt: string;
}

const LAB_TITLES: { [key: string]: string } = {
    "01_zero_shot": "Zero-Shot Prompting",
    "02_few_shot": "Few-Shot Prompting",
    "03_chain_of_thought": "Chain-of-Thought",
    "04_system_prompts": "System Prompts",
    "05_structured_output": "Structured Output",
};

function DashboardContent() {
    const { user } = useAuth();
    const supabase = createClient();
    const [stats, setStats] = useState<LabStats[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProgress = async () => {
            if (!user) return;

            const { data: attempts, error } = await supabase
                .from("lab_attempts")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });

            if (error) {
                console.error("Error fetching attempts:", error);
                setLoading(false);
                return;
            }

            // Group by lab_id
            const grouped = (attempts as LabAttempt[]).reduce((acc, curr) => {
                if (!acc[curr.lab_id]) {
                    acc[curr.lab_id] = {
                        lab_id: curr.lab_id,
                        title: LAB_TITLES[curr.lab_id] || curr.lab_id,
                        attempts: 0,
                        bestScore: 0,
                        maxScore: curr.max_score,
                        lastAttempt: curr.created_at,
                    };
                }
                const lab = acc[curr.lab_id];
                lab.attempts += 1;
                if (curr.total_score > lab.bestScore) {
                    lab.bestScore = curr.total_score;
                }
                return acc;
            }, {} as { [key: string]: LabStats });

            setStats(Object.values(grouped));
            setLoading(false);
        };

        fetchProgress();
    }, [user, supabase]);

    const totalAttempts = stats.reduce((acc, curr) => acc + curr.attempts, 0);
    const avgScore = stats.length > 0 
        ? Math.round(stats.reduce((acc, curr) => acc + (curr.bestScore / curr.maxScore) * 10, 0) / stats.length) 
        : 0;

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
            <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-ella-gray-900 mb-2">Mon tableau de bord</h1>
                    <p className="text-ella-gray-500 font-medium">Suis ta progression et tes performances dans les labs.</p>
                </div>
                <div className="bg-white border border-ella-gray-200 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
                    <EllaAvatar size="md" />
                    <div>
                        <p className="text-xs font-black text-ella-gray-400 uppercase tracking-widest">Message d'Ella</p>
                        <p className="text-sm font-bold text-ella-gray-700 italic">
                            {stats.length > 0 ? "Voici ta progression. Continue comme ça !" : "Pas encore de tentatives. Lance-toi !"}
                        </p>
                    </div>
                </div>
            </header>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                <div className="bg-white border border-ella-gray-200 rounded-2xl p-6 shadow-sm">
                    <p className="text-[10px] font-black text-ella-gray-400 uppercase tracking-widest mb-1">Missions</p>
                    <p className="text-2xl font-black text-ella-primary">{stats.length}</p>
                </div>
                <div className="bg-white border border-ella-gray-200 rounded-2xl p-6 shadow-sm">
                    <p className="text-[10px] font-black text-ella-gray-400 uppercase tracking-widest mb-1">Tentatives</p>
                    <p className="text-2xl font-black text-ella-gray-900">{totalAttempts}</p>
                </div>
                <div className="bg-white border border-ella-gray-200 rounded-2xl p-6 shadow-sm">
                    <p className="text-[10px] font-black text-ella-gray-400 uppercase tracking-widest mb-1">Score Moyen</p>
                    <div className="flex items-center gap-2">
                        <p className="text-2xl font-black text-ella-accent">{avgScore}</p>
                        <span className="text-xs font-bold text-ella-gray-400">/ 10</span>
                    </div>
                </div>
                <div className="bg-white border border-ella-gray-200 rounded-2xl p-6 shadow-sm">
                    <p className="text-[10px] font-black text-ella-gray-400 uppercase tracking-widest mb-1">Temps Appris</p>
                    <p className="text-2xl font-black text-ella-gray-900">{stats.length * 3}h</p>
                </div>
            </div>

            {/* Lab Progress */}
            <h2 className="text-xl font-bold text-ella-gray-900 mb-6">Progression par Lab</h2>
            
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white border border-ella-gray-200 rounded-2xl h-48 animate-pulse" />
                    ))}
                </div>
            ) : stats.length === 0 ? (
                <div className="bg-ella-gray-50 border-2 border-dashed border-ella-gray-200 rounded-3xl p-12 text-center">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <EllaAvatar size="md" />
                    </div>
                    <h3 className="text-xl font-bold text-ella-gray-900 mb-2">Aucun lab commencé</h3>
                    <p className="text-ella-gray-500 mb-8 max-w-sm mx-auto">
                        Choisis un module dans le catalogue et commence à pratiquer avec Ella pour voir tes scores ici.
                    </p>
                    <Link href="/" className="btn-primary px-8">Voir le catalogue</Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {stats.map((lab) => (
                        <div key={lab.lab_id} className="bg-white border border-ella-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group border-b-4 border-b-ella-primary/20">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-10 h-10 rounded-xl bg-ella-primary/10 text-ella-primary flex items-center justify-center font-bold">
                                    {lab.lab_id.slice(0, 2)}
                                </div>
                                <ScoreBadge score={lab.bestScore} maxScore={lab.maxScore} />
                            </div>
                            
                            <h3 className="font-bold text-ella-gray-900 mb-1 group-hover:text-ella-primary transition-colors">
                                {lab.title}
                            </h3>
                            <p className="text-xs text-ella-gray-400 mb-6">
                                {lab.attempts} tentative{lab.attempts > 1 ? 's' : ''} · Dernier essai {new Date(lab.lastAttempt).toLocaleDateString()}
                            </p>
                            
                            <Link 
                                href={`/courses/prompt-engineering/labs/${lab.lab_id}`}
                                className="inline-flex items-center gap-2 text-sm font-black text-ella-accent hover:gap-3 transition-all"
                            >
                                Continuer le lab
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 7l5 5-5 5M6 7l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3"></path></svg>
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function DashboardPage() {
    return (
        <ProtectedRoute>
            <DashboardContent />
        </ProtectedRoute>
    );
}
