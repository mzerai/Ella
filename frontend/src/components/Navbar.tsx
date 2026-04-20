/**
 * Top navigation bar with LearnLab logo and navigation.
 */

import Link from "next/link";
import EllaAvatar from "./EllaAvatar";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-ella-gray-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <img
            src="/assets/logo_learnlab_icon.png"
            alt="LearnLab"
            className="h-8"
          />
          <span className="font-heading text-xl text-ella-gray-900">
            ELLA
          </span>
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-6">
          <Link
            href="/courses"
            className="text-sm font-medium text-ella-gray-700 hover:text-ella-amber-600 transition-colors"
          >
            Cours
          </Link>
          <Link
            href="/chat"
            className="flex items-center gap-2 text-sm font-medium text-ella-gray-700 hover:text-ella-amber-600 transition-colors"
          >
            <EllaAvatar size="sm" />
            <span className="hidden sm:inline">Parler à ELLA</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
