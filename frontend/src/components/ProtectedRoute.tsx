"use client";

import { useAuth } from "@/components/AuthProvider";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // Only redirect if we ARE NOT loading AND there is NO user
        if (!loading && !user) {
            router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
        }
    }, [user, loading, router, pathname]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-white">
                <div className="w-12 h-12 border-4 border-ella-gray-100 border-t-ella-accent rounded-full animate-spin mb-4" />
                <div className="animate-pulse text-ella-gray-500 font-bold uppercase tracking-widest text-xs">Chargement sécurisé...</div>
            </div>
        );
    }

    if (!user) return null;

    return <>{children}</>;
}
