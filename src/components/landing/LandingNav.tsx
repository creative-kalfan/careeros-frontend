import { Link } from "@tanstack/react-router";
import { ArrowRight, Compass } from "lucide-react";

export function LandingNav() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#302E29] bg-[#11110F]/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-[#1A1916] border border-[#302E29] flex items-center justify-center text-[#315CFF] group-hover:border-[#315CFF]/40 transition">
            <Compass className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold tracking-tight text-[#F3F0E8]">CareerOS</span>
            <span className="hidden sm:inline text-[11px] font-medium px-2 py-0.5 rounded-md bg-[#1A1916] border border-[#302E29] text-[#A8A49A]">
              Career Intelligence
            </span>
          </div>
        </Link>

        {/* Action CTAs */}
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="rounded-lg px-3 py-1.5 text-xs sm:text-sm font-medium text-[#A8A49A] hover:text-[#F3F0E8] hover:bg-[#1A1916] transition"
          >
            Sign In
          </Link>
          <Link
            to="/signup"
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#315CFF] px-3.5 sm:px-4 py-1.5 text-xs sm:text-sm font-medium text-[#F3F0E8] hover:bg-[#274BDB] transition shadow-sm whitespace-nowrap"
          >
            <span>Create Account</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
