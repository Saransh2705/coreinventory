"use client";

import { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { Palette, Moon, Sun, Monitor, Check } from "lucide-react";

const COLOR_THEMES = [
  { id: "default", label: "Blue", color: "hsl(221, 83%, 53%)", hex: "#3b82f6" },
  { id: "rose", label: "Rose", color: "hsl(346, 77%, 50%)", hex: "#e11d48" },
  { id: "violet", label: "Violet", color: "hsl(263, 70%, 58%)", hex: "#8b5cf6" },
  { id: "emerald", label: "Emerald", color: "hsl(160, 84%, 39%)", hex: "#10b981" },
  { id: "amber", label: "Amber", color: "hsl(25, 95%, 53%)", hex: "#f97316" },
  { id: "teal", label: "Teal", color: "hsl(173, 80%, 36%)", hex: "#14b8a6" },
  { id: "slate", label: "Slate", color: "hsl(215, 16%, 47%)", hex: "#64748b" },
  { id: "midnight", label: "Midnight", color: "hsl(221, 83%, 53%)", hex: "#3b82f6" },
] as const;

function updateFavicon(hex: string) {
  const svg = `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="6" fill="${hex}"/>
    <path d="M16 7L9 11V21L16 25L23 21V11L16 7Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M16 16L23 12" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M16 16V25" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M16 16L9 12" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
  const encoded = `data:image/svg+xml,${encodeURIComponent(svg)}`;
  // Remove all existing icon links
  document.querySelectorAll<HTMLLinkElement>("link[rel='icon'], link[rel='shortcut icon']").forEach((el) => el.remove());
  const link = document.createElement("link");
  link.rel = "icon";
  link.type = "image/svg+xml";
  link.href = encoded;
  document.head.appendChild(link);
}

const MODE_OPTIONS = [
  { id: "light", label: "Light", icon: Sun },
  { id: "dark", label: "Dark", icon: Moon },
  { id: "system", label: "System", icon: Monitor },
] as const;

export default function ThemePicker() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [colorTheme, setColorTheme] = useState("default");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("color-theme");
    if (saved) {
      setColorTheme(saved);
      document.documentElement.setAttribute("data-color-theme", saved === "default" ? "" : saved);
      const found = COLOR_THEMES.find((ct) => ct.id === saved);
      if (found) updateFavicon(found.hex);
    } else {
      updateFavicon(COLOR_THEMES[0].hex);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const applyColorTheme = (id: string) => {
    setColorTheme(id);
    localStorage.setItem("color-theme", id);
    document.documentElement.setAttribute("data-color-theme", id === "default" ? "" : id);
    const found = COLOR_THEMES.find((ct) => ct.id === id);
    if (found) updateFavicon(found.hex);
  };

  if (!mounted) {
    return (
      <div className="w-9 h-9 flex items-center justify-center rounded-md text-muted-foreground">
        <Palette className="w-[18px] h-[18px]" />
      </div>
    );
  }

  const currentMode = theme || "system";

  return (
    <div className="relative" ref={ref}>
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(!open)}
        className="w-9 h-9 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        aria-label="Theme settings"
      >
        <Palette className="w-[18px] h-[18px]" />
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 4, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.96 }}
              transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="absolute right-0 top-full mt-2 w-64 bg-popover border border-border rounded-lg shadow-xl z-50 overflow-hidden"
            >
              {/* Mode Section */}
              <div className="p-3 pb-2">
                <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Appearance
                </span>
                <div className="flex gap-1 mt-2">
                  {MODE_OPTIONS.map((mode) => {
                    const Icon = mode.icon;
                    const isActive = currentMode === mode.id;
                    return (
                      <button
                        key={mode.id}
                        onClick={() => setTheme(mode.id)}
                        className={`flex-1 flex items-center justify-center gap-1.5 h-8 rounded-md text-xs font-medium transition-all ${
                          isActive
                            ? "bg-accent text-accent-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {mode.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="h-px bg-border mx-3" />

              {/* Color Section */}
              <div className="p-3 pt-2">
                <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Accent Color
                </span>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {COLOR_THEMES.map((ct) => {
                    const isActive = colorTheme === ct.id;
                    return (
                      <button
                        key={ct.id}
                        onClick={() => applyColorTheme(ct.id)}
                        className={`group flex flex-col items-center gap-1.5 p-2 rounded-lg transition-all ${
                          isActive
                            ? "bg-muted ring-1 ring-accent/40"
                            : "hover:bg-muted/60"
                        }`}
                        title={ct.label}
                      >
                        <div className="relative">
                          <div
                            className="w-7 h-7 rounded-full shadow-sm ring-1 ring-black/5 transition-transform group-hover:scale-110"
                            style={{ backgroundColor: ct.color }}
                          />
                          {isActive && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute inset-0 flex items-center justify-center"
                            >
                              <Check className="w-3.5 h-3.5 text-white drop-shadow-sm" />
                            </motion.div>
                          )}
                        </div>
                        <span className={`text-[10px] leading-none ${
                          isActive ? "text-foreground font-medium" : "text-muted-foreground"
                        }`}>
                          {ct.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Preview Strip */}
              <div className="px-3 pb-3">
                <div className="rounded-md bg-muted/50 border border-border p-2.5 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-md bg-accent flex items-center justify-center shrink-0">
                    <span className="text-accent-foreground text-xs font-bold">Aa</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-foreground truncate">Theme Preview</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      {COLOR_THEMES.find((ct) => ct.id === colorTheme)?.label} · {currentMode === "system" ? `System (${resolvedTheme})` : currentMode === "dark" ? "Dark" : "Light"}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-success" />
                    <div className="w-2 h-2 rounded-full bg-warning" />
                    <div className="w-2 h-2 rounded-full bg-destructive" />
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
