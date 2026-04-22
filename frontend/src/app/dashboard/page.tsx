"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase";
import EllaAvatar from "@/components/EllaAvatar";
import ScoreBadge from "@/components/ScoreBadge";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function CertificatesSection() {
    const { user } = useAuth();
    const supabase = createClient();
    const [certificates, setCertificates] = useState<Array<{id: string; course_id: string; course_title: string; score: number; issued_at: string}>>([]);
    const [eligibility, setEligibility] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const headers = { "Authorization": `Bearer ${session.access_token}`, "Content-Type": "application/json" };

            try {
                // Fetch existing certificates
                const certsRes = await fetch(`${API_BASE_URL}/api/certificates/my-certificates`, { headers });
                const certsData = await certsRes.json();
                setCertificates(certsData.certificates || []);

                // Check eligibility for each course
                const elig: Record<string, any> = {};
                for (const courseId of ["pe", "rl"]) {
                    const res = await fetch(`${API_BASE_URL}/api/certificates/eligibility/${courseId}`, { headers });
                    elig[courseId] = await res.json();
                }
                setEligibility(elig);
            } catch (err) {
                console.error("Error fetching certificates:", err);
            }
            setLoading(false);
        };
        fetchData();
    }, [user]);

    const handleGenerate = async (courseId: string) => {
        setGenerating(courseId);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        try {
            const res = await fetch(`${API_BASE_URL}/api/certificates/generate/${courseId}`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${session.access_token}` },
            });
            if (res.ok) {
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `ELLA_Certificate_${courseId}.pdf`;
                a.click();
                URL.revokeObjectURL(url);
                // Refresh page to show the new certificate in the list
                window.location.reload();
            }
        } catch (err) {
            console.error("Error generating certificate:", err);
        }
        setGenerating(null);
    };

    const handleDownload = async (certId: string, courseId: string) => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const res = await fetch(`${API_BASE_URL}/api/certificates/generate/${courseId}`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${session.access_token}` },
        });
        if (res.ok) {
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `ELLA_Certificate_${courseId}.pdf`;
            a.click();
            URL.revokeObjectURL(url);
        }
    };

    if (loading) return null;

    const hasCerts = certificates.length > 0;
    const hasEligible = Object.values(eligibility).some((e: any) => e.eligible && !certificates.find((c: any) => c.course_id === e.course_id));

    if (!hasCerts && !hasEligible) return null;

    return (
        <div className="mb-8">
            <h2 className="text-xl font-bold text-ella-gray-900 mb-4">Mes certificats</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Existing certificates */}
                {certificates.map(cert => (
                    <div key={cert.id} className="bg-white border border-ella-gray-200 rounded-2xl p-6 shadow-sm">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <p className="text-[10px] font-black text-ella-gray-400 uppercase tracking-widest mb-1">Certificat obtenu</p>
                                <p className="font-bold text-ella-gray-900">{cert.course_title}</p>
                            </div>
                            <span className="text-sm font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">{cert.score}/10</span>
                        </div>
                        <p className="text-xs text-ella-gray-400 mb-4">Délivré le {new Date(cert.issued_at).toLocaleDateString("fr-FR")}</p>
                        <button
                            onClick={() => handleDownload(cert.id, cert.course_id)}
                            className="w-full text-sm font-bold text-ella-accent border border-ella-accent/20 hover:bg-ella-accent/5 rounded-xl py-2.5 transition-all"
                        >
                            Télécharger le PDF
                        </button>
                    </div>
                ))}

                {/* Eligible but not yet generated */}
                {Object.entries(eligibility).map(([courseId, elig]: [string, any]) => {
                    if (!elig.eligible || certificates.find(c => c.course_id === courseId)) return null;
                    return (
                        <div key={courseId} className="bg-white border-2 border-dashed border-ella-accent/30 rounded-2xl p-6">
                            <p className="text-[10px] font-black text-ella-accent uppercase tracking-widest mb-1">Certificat disponible !</p>
                            <p className="font-bold text-ella-gray-900 mb-1">{courseId === "pe" ? "Prompt Engineering & Outils IA" : "Reinforcement Learning"}</p>
                            <p className="text-xs text-ella-gray-400 mb-4">Score moyen : {elig.average}/10</p>
                            <button
                                onClick={() => handleGenerate(courseId)}
                                disabled={generating === courseId}
                                className="w-full btn-primary !py-2.5 !rounded-xl !text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {generating === courseId ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : "Générer mon certificat"}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

interface LabAttempt {
    id: string;
    lab_id: string;
    mission_id: string;
    total_score: number;
    max_score: number;
    created_at: string;
    course_id?: string;
}

interface LabStats {
    lab_id: string;
    title: string;
    course_id: string;
    attempts: number;
    bestScore: number;
    maxScore: number;
    lastAttempt: string;
}

const PE_LAB_TITLES: { [key: string]: string } = {
    "01_zero_shot": "Zero-Shot Prompting",
    "02_few_shot": "Few-Shot Prompting",
    "03_chain_of_thought": "Chain-of-Thought",
    "04_system_prompts": "System Prompts",
    "05_structured_output": "Structured Output",
};

const RL_MODULE_TITLES: { [key: string]: string } = {
    "rl_00_culture": "Culture RL",
    "rl_01_bellman": "Fondements — Bellman",
    "rl_02_planning": "Planification",
    "rl_03_td_mc": "TD(0) & Monte Carlo",
    "rl_04_control": "Contrôle sans modèle",
    "rl_05_deep_rl": "Vers le Deep RL",
};

function detectCourse(labId: string, courseId?: string): string {
    if (courseId) return courseId;
    if (labId.startsWith("rl_")) return "rl";
    return "pe";
}

function getLabTitle(labId: string, courseId: string): string {
    if (courseId === "rl") return RL_MODULE_TITLES[labId] || labId;
    return PE_LAB_TITLES[labId] || labId;
}

function getLabLink(labId: string, courseId: string): string {
    if (courseId === "rl") return `/courses/reinforcement-learning/modules/${labId}`;
    return `/courses/prompt-engineering/labs/${labId}`;
}

function CourseSection({ title, icon, stats, accentColor }: {
    title: string;
    icon: string;
    stats: LabStats[];
    accentColor: string;
}) {
    if (stats.length === 0) return null;

    return (
        <div className="mb-10">
            <div className="flex items-center gap-3 mb-5">
                <span className="text-2xl">{icon}</span>
                <h2 className="text-xl font-bold text-ella-gray-900">{title}</h2>
                <span className="text-xs font-black text-ella-gray-400 bg-ella-gray-100 px-3 py-1 rounded-full">
                    {stats.length} lab{stats.length > 1 ? "s" : ""}
                </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stats.map((lab) => (
                    <div key={`${lab.course_id}-${lab.lab_id}`} className={`bg-white border border-ella-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group border-b-4 ${accentColor}`}>
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-10 h-10 rounded-xl bg-ella-primary/10 text-ella-primary flex items-center justify-center font-bold text-xs">
                                {lab.lab_id.slice(0, 2).replace("rl", "RL").replace("0", "")}
                            </div>
                            <ScoreBadge score={lab.bestScore} maxScore={lab.maxScore} />
                        </div>

                        <h3 className="font-bold text-ella-gray-900 mb-1 group-hover:text-ella-primary transition-colors">
                            {lab.title}
                        </h3>
                        <p className="text-xs text-ella-gray-400 mb-6">
                            {lab.attempts} tentative{lab.attempts > 1 ? "s" : ""} · Dernier essai {new Date(lab.lastAttempt).toLocaleDateString()}
                        </p>

                        <Link
                            href={getLabLink(lab.lab_id, lab.course_id)}
                            className="inline-flex items-center gap-2 text-sm font-black text-ella-accent hover:gap-3 transition-all"
                        >
                            Continuer
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 7l5 5-5 5M6 7l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3"></path></svg>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
}

function DashboardContent() {
    const { user } = useAuth();
    const supabase = createClient();
    const [peStats, setPeStats] = useState<LabStats[]>([]);
    const [rlStats, setRlStats] = useState<LabStats[]>([]);
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

            const pe: { [key: string]: LabStats } = {};
            const rl: { [key: string]: LabStats } = {};

            for (const attempt of (attempts as LabAttempt[])) {
                const courseId = detectCourse(attempt.lab_id, attempt.course_id);
                const bucket = courseId === "rl" ? rl : pe;

                if (!bucket[attempt.lab_id]) {
                    bucket[attempt.lab_id] = {
                        lab_id: attempt.lab_id,
                        title: getLabTitle(attempt.lab_id, courseId),
                        course_id: courseId,
                        attempts: 0,
                        bestScore: 0,
                        maxScore: attempt.max_score,
                        lastAttempt: attempt.created_at,
                    };
                }
                const lab = bucket[attempt.lab_id];
                lab.attempts += 1;
                if (attempt.total_score > lab.bestScore) {
                    lab.bestScore = attempt.total_score;
                }
            }

            setPeStats(Object.values(pe));
            setRlStats(Object.values(rl));
            setLoading(false);
        };

        fetchProgress();
    }, [user]);

    const allStats = [...peStats, ...rlStats];
    const totalAttempts = allStats.reduce((acc, curr) => acc + curr.attempts, 0);
    const avgScore = allStats.length > 0
        ? Math.round(allStats.reduce((acc, curr) => acc + (curr.bestScore / curr.maxScore) * 10, 0) / allStats.length)
        : 0;

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
            <header className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-ella-gray-900 mb-2">Mon tableau de bord</h1>
                    <p className="text-sm text-ella-gray-500 font-medium">Suis ta progression dans tous tes cours.</p>
                </div>
                <div className="bg-white border border-ella-gray-200 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
                    <div className="p-1 overflow-visible">
                        <EllaAvatar size="md" />
                    </div>
                    <div>
                        <p className="text-xs font-black text-ella-gray-400 uppercase tracking-widest">Message d'Ella</p>
                        <p className="text-sm font-bold text-ella-gray-700 italic">
                            {allStats.length > 0 ? "Voici ta progression. Continue comme ça !" : "Pas encore de tentatives. Lance-toi !"}
                        </p>
                    </div>
                </div>
            </header>

            <CertificatesSection />

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white border border-ella-gray-200 rounded-2xl p-6 shadow-sm">
                    <p className="text-[10px] font-black text-ella-gray-400 uppercase tracking-widest mb-1">Cours actifs</p>
                    <p className="text-2xl font-black text-ella-primary">
                        {(peStats.length > 0 ? 1 : 0) + (rlStats.length > 0 ? 1 : 0)}
                    </p>
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
                    <p className="text-[10px] font-black text-ella-gray-400 uppercase tracking-widest mb-1">Labs complétés</p>
                    <p className="text-2xl font-black text-ella-gray-900">{allStats.length}</p>
                </div>
            </div>

            {/* Course Sections */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white border border-ella-gray-200 rounded-2xl h-48 animate-pulse" />
                    ))}
                </div>
            ) : allStats.length === 0 ? (
                <div className="bg-ella-gray-50 border-2 border-dashed border-ella-gray-200 rounded-2xl p-10 text-center">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                        <EllaAvatar size="md" />
                    </div>
                    <h3 className="text-xl font-bold text-ella-gray-900 mb-2">Aucun lab commencé</h3>
                    <p className="text-ella-gray-500 mb-8 max-w-sm mx-auto">
                        Choisis un cours dans le catalogue et commence à pratiquer avec Ella.
                    </p>
                    <Link href="/" className="btn-primary px-8">Voir le catalogue</Link>
                </div>
            ) : (
                <>
                    <CourseSection
                        title="Prompt Engineering"
                        icon="✍️"
                        stats={peStats}
                        accentColor="border-b-blue-200"
                    />
                    <CourseSection
                        title="Reinforcement Learning"
                        icon="🧠"
                        stats={rlStats}
                        accentColor="border-b-emerald-200"
                    />
                </>
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
