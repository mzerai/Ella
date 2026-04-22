"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface CertificateData {
    valid: boolean;
    certificate_id: string;
    student_name?: string;
    course_title?: string;
    score?: number;
    competencies?: string[];
    issued_at?: string;
}

export default function VerifyPage() {
    const params = useParams();
    const certId = params.id as string;
    const [data, setData] = useState<CertificateData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_BASE_URL}/api/certificates/verify/${certId}`)
            .then(res => res.json())
            .then(setData)
            .catch(() => setData({ valid: false, certificate_id: certId }))
            .finally(() => setLoading(false));
    }, [certId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-ella-gray-50 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-ella-gray-100 border-t-ella-accent rounded-full animate-spin" />
            </div>
        );
    }

    if (!data || !data.valid) {
        return (
            <div className="min-h-screen bg-ella-gray-50 flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-2xl border border-ella-gray-100 text-center">
                    <span className="text-4xl mb-4 block">⛔</span>
                    <h1 className="text-xl font-bold text-ella-gray-900 mb-2">Certificat non trouvé</h1>
                    <p className="text-sm text-ella-gray-500">
                        Le certificat avec l'identifiant <span className="font-mono text-xs bg-ella-gray-100 px-2 py-1 rounded">{certId}</span> n'existe pas ou a été révoqué.
                    </p>
                </div>
            </div>
        );
    }

    const issuedDate = data.issued_at
        ? new Date(data.issued_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
        : "";

    return (
        <div className="min-h-screen bg-ella-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-white rounded-2xl p-8 shadow-2xl border border-ella-gray-100">
                <div className="text-center mb-6">
                    <span className="text-4xl mb-3 block">✅</span>
                    <h1 className="text-xl font-bold text-ella-gray-900 mb-1">Certificat vérifié</h1>
                    <p className="text-sm text-ella-gray-500">Ce certificat est authentique et a été délivré par ESPRIT LearnLab Arena.</p>
                </div>

                <div className="bg-ella-gray-50 rounded-xl p-6 space-y-4">
                    <div>
                        <p className="text-[10px] font-black text-ella-gray-400 uppercase tracking-widest mb-1">Titulaire</p>
                        <p className="text-lg font-bold text-ella-gray-900">{data.student_name}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-ella-gray-400 uppercase tracking-widest mb-1">Formation</p>
                        <p className="font-bold text-ella-gray-900">{data.course_title}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-ella-gray-400 uppercase tracking-widest mb-1">Score</p>
                        <p className="font-bold text-ella-gray-900">{data.score}/10</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-ella-gray-400 uppercase tracking-widest mb-1">Date de délivrance</p>
                        <p className="font-bold text-ella-gray-900">{issuedDate}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-ella-gray-400 uppercase tracking-widest mb-1">Compétences attestées</p>
                        <ul className="space-y-1 mt-2">
                            {data.competencies?.map((comp, i) => (
                                <li key={i} className="text-sm text-ella-gray-700 flex items-start gap-2">
                                    <span className="text-ella-accent mt-0.5">•</span>
                                    {comp}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="mt-6 text-center">
                    <p className="text-[10px] font-black text-ella-gray-400 uppercase tracking-widest mb-1">Identifiant unique</p>
                    <p className="font-mono text-xs bg-ella-gray-100 px-3 py-2 rounded-lg inline-block">{data.certificate_id}</p>
                </div>

                <div className="mt-6 pt-6 border-t border-ella-gray-100 text-center">
                    <p className="text-xs text-ella-gray-400">
                        ESPRIT School of Engineering — AI & Digital Learning Directorate
                    </p>
                    <p className="text-xs text-ella-gray-400">
                        Signataire : Prof. Tahar Benlakhdar, CEO ESPRIT Group
                    </p>
                </div>
            </div>
        </div>
    );
}
