"use client";

import { useState } from "react";

// Deterministic gradient tile used when a product has no image (or it fails to load).
const palettes = [
  ["#6a4cff", "#2a1b8f"],
  ["#1fb6ff", "#1b3a8f"],
  ["#ff5c8a", "#6a1b5a"],
  ["#22c58b", "#0f4d4a"],
  ["#ffb020", "#8f3b1b"],
  ["#9b5cff", "#3d1b6a"],
];

export function ProductImage({ src, name, id, className = "" }: { src: string | null; name: string; id: number; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (src && !failed) {
    return (
      // Digiseller already serves resized images; next/image optimization adds nothing here.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        loading="lazy"
        onError={() => setFailed(true)}
        className={`h-full w-full object-cover ${className}`}
      />
    );
  }
  const [a, b] = palettes[id % palettes.length];
  const initials = name
    .replace(/[^\p{Letter}\p{Number}\s]/gu, " ")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
  return (
    <div
      role="img"
      aria-label={name}
      className={`relative flex h-full w-full items-center justify-center overflow-hidden ${className}`}
      style={{ background: `radial-gradient(120% 90% at 20% 10%, ${a}, ${b})` }}
    >
      <div className="absolute -right-6 -bottom-6 h-28 w-28 rounded-full bg-white/10" />
      <div className="absolute -top-8 -left-4 h-20 w-20 rounded-full bg-white/10" />
      <span className="relative text-4xl font-extrabold tracking-tight text-white/90">{initials}</span>
    </div>
  );
}
