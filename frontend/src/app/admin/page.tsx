"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const ADMIN_EMAILS = ["mourad.zerai@gmail.com"];

const LAB_NAMES: { [key: string]: string } = {
    "01_zero_shot": "Zero-Shot",
    "02_few_shot": "Few-Shot",
    "03_chain_of_thought": "Chain-of-Thought",
    "04_system_prompts": "System Prompts",
    "05_structured_output": "Structured Output",
    "rl_00_culture": "RL — Culture",
    "rl_01_bellman": "RL — Bellman",
    "rl_02_planning": "RL — Planification",
    "rl_03_td_mc": "RL — TD/MC",
    "rl_04_control": "RL — Contrôle",
    "rl_05_deep_rl": "RL — Deep RL",
};

interface AdminStats {
    total_students: number;
    recent_signups: number;
    total_attempts: number;
    total_conversations: number;
    top_students: Array<{
        user_id: string;
        name: string;
        email: string;
        attempts: number;
        unique_labs: number;
        avg_best_score: number;
    }>;
    recent_activity: Array<{
        student_name: string;
        student_email: string;
        lab_id: string;
        mission_id: string;
        course_id: string;
        score: number;
        max_score: number;
        created_at: string;
    }>;
    lab_summary: Array<{
        lab_id: string;
        course_id: string;
        total_attempts: number;
        unique_students: number;
        avg_score: number;
        max_score_achieved: number;
    }>;
}

function AdminContent() {
    const { user } = useAuth();
    const router = useRouter();
    const supabase = createClient();
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user) return;
        if (!ADMIN_EMAILS.includes(user.email || "")) {
            router.push("/");
            return;
        }

        const fetchStats = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) throw new Error("No session");

                const response = await fetch(`${API_BASE_URL}/api/admin/stats`, {
                    headers: {
                        "Authorization": `Bearer ${session.access_token}`,
                        "Content-Type": "application/json",
                    },
                });

                if (!response.ok) {
                    const err = await response.json().catch(() => ({}));
                    throw new Error(err.detail || `HTTP ${response.status}`);
                }

                const data = await response.json();
                setStats(data);
            } catch (err: any) {
                setError(err.message || "Erreur de chargement");
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [user]);

    if (!user || !ADMIN_EMAILS.includes(user.email || "")) {
        return null;
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-ella-gray-100 border-t-ella-accent rounded-full animate-spin mb-4" />
                <p className="text-ella-gray-400 font-bold uppercase tracking-widest text-[10px]">Chargement analytics...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="bg-ella-accent/5 border border-ella-accent/20 text-ella-accent p-4 rounded-xl font-bold">
                    Erreur : {error}
                </div>
            </div>
        );
    }

    if (!stats) return null;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            <header className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">🛡️</span>
                    <h1 className="text-2xl font-bold text-ella-gray-900">Admin — Analytics ELLA</h1>
                </div>
                <p className="text-sm text-ella-gray-500 font-medium">Vue d'ensemble de l'activité étudiante sur la plateforme.</p>
            </header>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white border border-ella-gray-200 rounded-2xl p-5 shadow-sm">
                    <p className="text-[10px] font-black text-ella-gray-400 uppercase tracking-widest mb-1">Étudiants</p>
                    <p className="text-3xl font-black text-ella-primary">{stats.total_students}</p>
                    <p className="text-xs text-ella-gray-400 mt-1">+{stats.recent_signups} cette semaine</p>
                </div>
                <div className="bg-white border border-ella-gray-200 rounded-2xl p-5 shadow-sm">
                    <p className="text-[10px] font-black text-ella-gray-400 uppercase tracking-widest mb-1">Tentatives</p>
                    <p className="text-3xl font-black text-ella-gray-900">{stats.total_attempts}</p>
                </div>
                <div className="bg-white border border-ella-gray-200 rounded-2xl p-5 shadow-sm">
                    <p className="text-[10px] font-black text-ella-gray-400 uppercase tracking-widest mb-1">Conversations</p>
                    <p className="text-3xl font-black text-ella-gray-900">{stats.total_conversations}</p>
                </div>
                <div className="bg-white border border-ella-gray-200 rounded-2xl p-5 shadow-sm">
                    <p className="text-[10px] font-black text-ella-gray-400 uppercase tracking-widest mb-1">Labs actifs</p>
                    <p className="text-3xl font-black text-ella-accent">{stats.lab_summary.length}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Lab Summary */}
                <div>
                    <h2 className="text-lg font-bold text-ella-gray-900 mb-4">Performance par lab</h2>
                    <div className="bg-white border border-ella-gray-200 rounded-2xl overflow-hidden shadow-sm">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-ella-gray-50 text-left">
                                    <th className="px-4 py-3 text-[10px] font-black text-ella-gray-400 uppercase tracking-widest">Lab</th>
                                    <th className="px-4 py-3 text-[10px] font-black text-ella-gray-400 uppercase tracking-widest text-center">Étudiants</th>
                                    <th className="px-4 py-3 text-[10px] font-black text-ella-gray-400 uppercase tracking-widest text-center">Tentatives</th>
                                    <th className="px-4 py-3 text-[10px] font-black text-ella-gray-400 uppercase tracking-widest text-center">Moy.</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.lab_summary.map((lab) => (
                                    <tr key={lab.lab_id} className="border-t border-ella-gray-100 hover:bg-ella-gray-50/50">
                                        <td className="px-4 py-3">
                                            <span className="font-bold text-ella-gray-900">{LAB_NAMES[lab.lab_id] || lab.lab_id}</span>
                                            <span className={`ml-2 text-[10px] font-black px-2 py-0.5 rounded-full ${lab.course_id === "rl" ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700"}`}>
                                                {lab.course_id === "rl" ? "RL" : "PE"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center font-bold text-ella-gray-600">{lab.unique_students}</td>
                                        <td className="px-4 py-3 text-center font-bold text-ella-gray-600">{lab.total_attempts}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`font-black ${lab.avg_score >= 7 ? "text-emerald-600" : lab.avg_score >= 5 ? "text-amber-600" : "text-ella-accent"}`}>
                                                {lab.avg_score}/10
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {stats.lab_summary.length === 0 && (
                                    <tr><td colSpan={4} className="px-4 py-8 text-center text-ella-gray-400">Aucune donnée</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Top Students */}
                <div>
                    <h2 className="text-lg font-bold text-ella-gray-900 mb-4">Top étudiants</h2>
                    <div className="bg-white border border-ella-gray-200 rounded-2xl overflow-hidden shadow-sm">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-ella-gray-50 text-left">
                                    <th className="px-4 py-3 text-[10px] font-black text-ella-gray-400 uppercase tracking-widest">Étudiant</th>
                                    <th className="px-4 py-3 text-[10px] font-black text-ella-gray-400 uppercase tracking-widest text-center">Labs</th>
                                    <th className="px-4 py-3 text-[10px] font-black text-ella-gray-400 uppercase tracking-widest text-center">Tentatives</th>
                                    <th className="px-4 py-3 text-[10px] font-black text-ella-gray-400 uppercase tracking-widest text-center">Moy.</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.top_students.map((student, i) => (
                                    <tr key={student.user_id} className="border-t border-ella-gray-100 hover:bg-ella-gray-50/50">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-ella-primary/10 text-ella-primary flex items-center justify-center text-xs font-black">
                                                    {i + 1}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-ella-gray-900 text-sm">{student.name || "Sans nom"}</p>
                                                    <p className="text-[10px] text-ella-gray-400 truncate max-w-[150px]">{student.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-center font-bold text-ella-gray-600">{student.unique_labs}</td>
                                        <td className="px-4 py-3 text-center font-bold text-ella-gray-600">{student.attempts}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`font-black ${student.avg_best_score >= 7 ? "text-emerald-600" : student.avg_best_score >= 5 ? "text-amber-600" : "text-ella-accent"}`}>
                                                {student.avg_best_score}/10
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {stats.top_students.length === 0 && (
                                    <tr><td colSpan={4} className="px-4 py-8 text-center text-ella-gray-400">Aucune donnée</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="mt-8">
                <h2 className="text-lg font-bold text-ella-gray-900 mb-4">Activité récente</h2>
                <div className="bg-white border border-ella-gray-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="divide-y divide-ella-gray-100">
                        {stats.recent_activity.map((activity, i) => (
                            <div key={i} className="px-5 py-3 flex items-center justify-between hover:bg-ella-gray-50/50">
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${activity.course_id === "rl" ? "bg-emerald-400" : "bg-blue-400"}`} />
                                    <div>
                                        <span className="font-bold text-ella-gray-900 text-sm">{activity.student_name || "Inconnu"}</span>
                                        <span className="text-ella-gray-400 text-sm mx-2">→</span>
                                        <span className="text-sm text-ella-gray-600">{LAB_NAMES[activity.lab_id] || activity.lab_id}</span>
                                        <span className="text-ella-gray-300 text-sm mx-1">·</span>
                                        <span className="text-xs text-ella-gray-400">{activity.mission_id}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`font-black text-sm ${activity.score >= 7 ? "text-emerald-600" : activity.score >= 5 ? "text-amber-600" : "text-ella-accent"}`}>
                                        {activity.score}/{activity.max_score}
                                    </span>
                                    <span className="text-xs text-ella-gray-400 min-w-[80px] text-right">
                                        {new Date(activity.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {stats.recent_activity.length === 0 && (
                            <div className="px-5 py-8 text-center text-ella-gray-400">Aucune activité</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function AdminPage() {
    return <AdminContent />;
}
