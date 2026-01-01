import { useState } from "react";
import { Menu, X } from "lucide-react";
import { NavLink } from "./NavLink";
import EmergencyTrigger from "./EmergencyTrigger";

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="w-full bg-neutral-950 border-b border-red-900 shadow-[0_0_30px_rgba(255,0,0,0.25)] relative overflow-hidden">
      {/* Electric pulse line */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-red-600 to-transparent animate-pulse" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-5">
            <div className="relative text-lg font-bold tracking-widest text-red-500 select-none">
              <span className="relative z-10">HRIDAYA&nbsp;RAKSHAK</span>
              <span className="absolute inset-0 blur-lg text-red-600 opacity-60">
                HRIDAYA&nbsp;RAKSHAK
              </span>
            </div>

            {/* Desktop nav */}
            <nav
              className="hidden md:flex items-center gap-4 text-red-400 text-sm"
              aria-label="Main navigation"
            >
              <NavLink to="/">Dashboard</NavLink>
              <NavLink to="/arduino">Device</NavLink>
              <NavLink to="/hospitals">Hospitals</NavLink>
              <NavLink to="/alerts">Alerts</NavLink>
            </nav>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <EmergencyTrigger />
              <button className="px-3 py-1.5 text-xs font-semibold rounded-md border border-red-700 text-red-300 bg-red-950/40 hover:bg-red-900 hover:shadow-[0_0_14px_rgba(255,0,0,0.5)] transition">
                Analyze
              </button>
            </div>

            {/* Mobile menu toggle */}
            <button
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="p-2 rounded-md text-red-400 hover:bg-red-950 focus:outline-none focus:ring-2 focus:ring-red-600 md:hidden"
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-neutral-950 border-t border-red-900 shadow-inner">
          <div className="px-4 pt-3 pb-4 space-y-2 text-red-400">
            <EmergencyTrigger />
            <NavLink to="/" className="block">Dashboard</NavLink>
            <NavLink to="/arduino" className="block">Device</NavLink>
            <NavLink to="/hospitals" className="block">Hospitals</NavLink>
            <NavLink to="/alerts" className="block">Alerts</NavLink>
          </div>
        </div>
      )}
    </header>
  );
}
