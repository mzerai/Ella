"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import EllaAvatar from "./EllaAvatar";
import ProfileModal from "./ProfileModal";
import { useAuth } from "@/components/AuthProvider";

export default function Navbar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const savedProfile = localStorage.getItem("ellaUserProfile");
    if (savedProfile) {
      setProfile(savedProfile);
    }
  }, []);

  const handleProfileSelect = (p: "engineering" | "business") => {
    localStorage.setItem("ellaUserProfile", p);
    setProfile(p);
    setIsModalOpen(false);
    window.location.reload(); // Refresh to apply context globally
  };

  const navLinks = [
    { href: "/", label: "Catalogue" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-[80] bg-white/80 backdrop-blur-md border-b border-ella-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 md:gap-3 group">
            {/* LearnLab Icon */}
            <div className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-white shadow-lg shadow-ella-gray-200 border border-ella-gray-100 flex items-center justify-center p-1.5 transition-transform duration-300 group-hover:scale-110">
               <img src="/assets/logo_learnlab_icon.png" alt="LearnLab" className="w-full h-full object-contain" />
            </div>

            {/* Text Identity */}
            <div className="flex flex-col">
              <span className="text-xs md:text-sm font-black text-ella-gray-900 tracking-tight leading-none">
                ESPRIT <span className="text-ella-primary">LearnLab</span> Arena
              </span>
              <span className="text-[10px] md:text-sm font-black tracking-widest text-ella-accent leading-none mt-1">
                ELLA
              </span>
            </div>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-bold transition-all py-1 ${pathname === link.href || (link.href === "/" && pathname.startsWith("/courses"))
                  ? "text-ella-accent border-b-2 border-ella-accent"
                  : "text-ella-gray-500 hover:text-ella-accent"
                  }`}
              >
                {link.label}
              </Link>
            ))}

            {user ? (
              <div className="flex items-center gap-4">
                <Link
                  href="/chat"
                  className="flex items-center gap-2 bg-ella-accent hover:bg-ella-accent-dark text-white text-sm font-bold px-5 py-2.5 rounded-full transition-all active:scale-95 shadow-lg shadow-ella-accent/20"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
                  Ella AI
                </Link>

                <div className="relative group/user">
                  <button className="w-10 h-10 rounded-full bg-ella-gray-100 border border-ella-gray-200 flex items-center justify-center text-ella-gray-700 font-black text-sm uppercase transition-all hover:border-ella-accent relative">
                    {user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0) || "?"}
                    {user?.email === "mourad.zerai@gmail.com" && (
                        <span className="absolute -top-1 -right-1 text-[8px] bg-ella-accent text-white px-1.5 py-0.5 rounded-full shadow-sm border border-white">Admin</span>
                    )}
                  </button>
                  
                  <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover/user:opacity-100 group-hover/user:visible transition-all translate-y-2 group-hover/user:translate-y-0">
                    <div className="bg-white rounded-2xl shadow-2xl border border-ella-gray-100 p-2 min-w-[200px]">
                      <div className="px-4 py-3 border-b border-ella-gray-50 mb-1">
                        <p className="text-xs font-black text-ella-gray-400 uppercase tracking-widest mb-0.5">Connecté en tant que</p>
                        <p className="text-sm font-bold text-ella-gray-900 truncate">{user.user_metadata?.full_name || user.email}</p>
                      </div>
                      <Link href="/dashboard" className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-ella-gray-600 hover:bg-ella-gray-50 rounded-xl transition-all">
                        📊 Dashboard
                      </Link>
                      {user?.email === "mourad.zerai@gmail.com" && (
                        <Link href="/admin" className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-ella-gray-600 hover:bg-ella-gray-50 rounded-xl transition-all">
                          🛡️ Admin
                        </Link>
                      )}
                      <button 
                        onClick={() => signOut()}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-ella-accent hover:bg-ella-accent/5 rounded-xl transition-all text-left"
                      >
                        🚪 Déconnexion
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-6">
                <Link href="/login" className="text-sm font-bold text-ella-gray-500 hover:text-ella-gray-900 transition-colors">
                  Connexion
                </Link>
                <Link href="/signup" className="bg-ella-accent hover:bg-ella-accent-dark text-white text-sm font-bold px-6 py-2.5 rounded-full transition-all active:scale-95 shadow-lg shadow-ella-accent/20">
                  S'inscrire
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-ella-gray-500"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-ella-gray-100 p-4 space-y-4 animate-slide-up">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMenuOpen(false)}
              className="block px-4 py-2 text-base font-bold text-ella-gray-600 rounded-xl hover:bg-ella-gray-50"
            >
              {link.label}
            </Link>
          ))}
          <hr className="border-ella-gray-50" />
          {user ? (
            <>
              <Link
                href="/dashboard"
                onClick={() => setIsMenuOpen(false)}
                className="block px-4 py-2 text-base font-bold text-ella-gray-600 rounded-xl hover:bg-ella-gray-50"
              >
                📊 Dashboard
              </Link>
              {user?.email === "mourad.zerai@gmail.com" && (
                <Link
                  href="/admin"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-2 text-base font-bold text-ella-gray-600 rounded-xl hover:bg-ella-gray-50"
                >
                  🛡️ Admin
                </Link>
              )}
              <button
                onClick={() => {
                  signOut();
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-base font-bold text-ella-accent rounded-xl hover:bg-ella-accent/5"
              >
                🚪 Déconnexion
              </button>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <Link
                href="/login"
                onClick={() => setIsMenuOpen(false)}
                className="text-center py-3 text-sm font-bold text-ella-gray-700 bg-ella-gray-100 rounded-2xl"
              >
                Connexion
              </Link>
              <Link
                href="/signup"
                onClick={() => setIsMenuOpen(false)}
                className="text-center py-3 text-sm font-bold text-white bg-ella-accent rounded-2xl"
              >
                S'inscrire
              </Link>
            </div>
          )}
        </div>
      )}

      <ProfileModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSelect={handleProfileSelect} 
      />
    </nav>
  );
}