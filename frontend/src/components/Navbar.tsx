"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import EllaAvatar from "./EllaAvatar";

export default function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { href: "/courses", label: "Cours" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-ella-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <img
            src="/assets/logo_learnlab_icon.png"
            alt="LearnLab"
            className="h-7"
          />
          <div className="flex flex-col hidden xs:flex">
            <span className="font-body font-bold text-base text-ella-gray-900 leading-tight">
              Ella
            </span>
            <span className="text-[10px] text-ella-gray-500 leading-tight">
              Esprit LearnLab Assistant
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-bold transition-all py-1 ${pathname.startsWith(link.href)
                  ? "text-ella-accent border-b-2 border-ella-accent"
                  : "text-ella-gray-500 hover:text-ella-accent"
                }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/chat"
            className="flex items-center gap-2 bg-ella-accent hover:bg-ella-accent-dark text-white text-sm font-bold px-4 py-2 rounded-full transition-all active:scale-95 shadow-lg shadow-ella-accent/20"
          >
            <EllaAvatar size="sm" className="!w-5 !h-5 ring-1 ring-white/30" />
            <span className="hidden sm:inline">Parler à Ella</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}