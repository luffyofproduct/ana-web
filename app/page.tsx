"use client";

import { useState, useEffect, useRef } from "react";

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  primary: "#004a30",
  primaryContainer: "#006442",
  surface: "#ffffff",
  surfaceLow: "#f6f3ee",
  surfaceHigh: "#ebe8e3",
  surfaceHighest: "#e5e2dd",
  onSurface: "#1c1c19",
  onSurfaceVariant: "#44483d",
  tertiary: "#5f3600",
  tertiaryFixed: "#ffdcbd",
  outlineVariant: "#c4c8ba",
};

// ─── Geometric SVG patterns ───────────────────────────────────────────────────

// 8-pointed Islamic star tile
const StarPatternBg = ({ opacity = 0.035, color = C.primary }) => {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80'><g fill='none' stroke='${encodeURIComponent(color)}' stroke-width='0.8' opacity='1'><polygon points='40,4 47,20 64,20 51,30 56,47 40,37 24,47 29,30 16,20 33,20'/><polygon points='40,74 47,58 64,58 51,50 56,33 40,43 24,33 29,50 16,58 33,58' transform='rotate(180,40,40)'/><line x1='40' y1='0' x2='40' y2='80'/><line x1='0' y1='40' x2='80' y2='40'/></g></svg>`;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundImage: `url("data:image/svg+xml,${svg}")`,
        backgroundRepeat: "repeat",
        opacity,
        pointerEvents: "none",
      }}
    />
  );
};

// Diamond grid pattern
const DiamondPatternBg = ({ opacity = 0.04, color = C.primary }) => {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60'><path d='M30 2 L58 30 L30 58 L2 30 Z' fill='none' stroke='${encodeURIComponent(color)}' stroke-width='0.7'/></svg>`;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundImage: `url("data:image/svg+xml,${svg}")`,
        backgroundRepeat: "repeat",
        opacity,
        pointerEvents: "none",
      }}
    />
  );
};

// Hexagonal lattice
const HexPatternBg = ({ opacity = 0.04, color = C.tertiary }) => {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='70' height='80'><polygon points='35,2 67,20 67,56 35,74 3,56 3,20' fill='none' stroke='${encodeURIComponent(color)}' stroke-width='0.7'/></svg>`;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundImage: `url("data:image/svg+xml,${svg}")`,
        backgroundRepeat: "repeat",
        opacity,
        pointerEvents: "none",
      }}
    />
  );
};

// Large decorative Arabic numeral / letter as section watermark
function ArabicWatermark({ text, top, right, left, size = "18rem", opacity = 0.045 }: {
  text: string; top?: string; right?: string; left?: string; size?: string; opacity?: number;
}) {
  return (
    <div
      className="arabic"
      style={{
        position: "absolute",
        top,
        right,
        left,
        fontSize: size,
        lineHeight: 1,
        color: C.primary,
        opacity,
        pointerEvents: "none",
        userSelect: "none",
        fontWeight: 700,
        zIndex: 0,
      }}
    >
      {text}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <main style={{ backgroundColor: C.surface, overflowX: "hidden" }}>
      <Nav />
      <Hero />
      <Features />
      <Problem />
      <WhoItsFor />
      <WaitlistCTA />
      <Footer />
    </main>
  );
}

// ─── Nav ──────────────────────────────────────────────────────────────────────
function Nav() {
  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
      backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
      // Warm parchment-to-white gradient with a subtle green tint at top
      background: "linear-gradient(180deg, rgba(246,243,238,0.92) 0%, rgba(255,255,255,0.75) 100%)",
      // Soft geometric-inspired bottom line using tertiary gold
      borderBottom: `1px solid rgba(95,54,0,0.08)`,
    }}>
      <div style={{
        maxWidth: "1120px", margin: "0 auto", padding: "0 2rem",
        height: "68px", display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        {/* Logo */}
        <div style={{ width: "96px", height: "36px", backgroundColor: "#000", borderRadius: "4px" }} />

        {/* CTA */}
        <a href="#waitlist">
          <button style={{
            background: `linear-gradient(135deg, ${C.primary} 0%, ${C.primaryContainer} 100%)`,
            color: "#fff", border: "none", borderRadius: "1.5rem",
            padding: "0.5rem 1.375rem", fontSize: "0.875rem", fontWeight: 600,
            cursor: "pointer", letterSpacing: "0.01em", fontFamily: "var(--font-manrope)",
          }} className="btn-primary">
            Join waitlist
          </button>
        </a>
      </div>
    </nav>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section style={{
      position: "relative", minHeight: "100vh", display: "flex",
      flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "9rem 2rem 7rem", textAlign: "center",
      backgroundColor: C.surface, overflow: "hidden",
    }}>
      <StarPatternBg opacity={0.04} />
      <ArabicWatermark text="أنا" top="-2rem" right="-2rem" size="22rem" opacity={0.04} />
      <ArabicWatermark text="عربي" top="60%" left="-3rem" size="16rem" opacity={0.03} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: "780px", margin: "0 auto" }}>
        {/* Arab diaspora flags — marquee */}
        <div style={{
          overflow: "hidden", marginBottom: "2.25rem", width: "100%",
          padding: "1rem 0",
          WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)",
          maskImage: "linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)",
        }}>
          <div className="flag-marquee-track">
            {[
              "🇱🇧","🇸🇾","🇵🇸","🇯🇴","🇪🇬","🇸🇦","🇦🇪","🇮🇶",
              "🇾🇪","🇱🇾","🇹🇳","🇩🇿","🇲🇦","🇸🇩","🇸🇴","🇩🇯",
              "🇰🇼","🇧🇭","🇶🇦","🇴🇲","🇰🇲","🇲🇷",
              /* duplicate for seamless loop */
              "🇱🇧","🇸🇾","🇵🇸","🇯🇴","🇪🇬","🇸🇦","🇦🇪","🇮🇶",
              "🇾🇪","🇱🇾","🇹🇳","🇩🇿","🇲🇦","🇸🇩","🇸🇴","🇩🇯",
              "🇰🇼","🇧🇭","🇶🇦","🇴🇲","🇰🇲","🇲🇷",
            ].map((flag, i) => (
              <span key={i} className="flag-item flag-item--hero">
                {flag}
              </span>
            ))}
          </div>
        </div>

        <h1 className="font-display hero-h1" style={{
          fontSize: "clamp(2rem, 8vw, 4.5rem)", fontWeight: 400,
          lineHeight: 1.1, letterSpacing: "-0.025em", color: C.onSurface,
          marginBottom: "1.75rem",
        }}>
          <span style={{ color: C.primary }}>Speak the Arabic</span>
          <br />
          you've always understood.
        </h1>

        <p style={{
          fontSize: "1.125rem", lineHeight: 1.8, color: C.onSurfaceVariant,
          maxWidth: "540px", margin: "0 auto 3rem",
        }}>
          Ana turns the content you already love into vocabulary that sticks —
          built for heritage speakers ready to go from understanding to fully expressing themselves.
        </p>

        <WaitlistForm />
        <p style={{ marginTop: "1rem", fontSize: "0.8rem", color: C.onSurfaceVariant, opacity: 0.6 }}>
          No spam. Unsubscribe anytime.
        </p>
      </div>

      {/* Decorative bottom fade */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: "120px",
        background: `linear-gradient(to bottom, transparent, ${C.surfaceLow})`,
        pointerEvents: "none",
      }} />
    </section>
  );
}

// ─── Features / Demo ──────────────────────────────────────────────────────────
const FEATURES = [
  {
    id: "dialect",
    label: "Your dialect",
    title: "Arabic isn't one language. Learn the version that's yours.",
    body: "Choose from Modern Standard Arabic or the dialect your family speaks — Levantine, Egyptian, Gulf, or Darija. Every word you learn is tuned to how your people actually talk.",
    preview: <DialectPreview />,
  },
  {
    id: "content",
    label: "Your content",
    title: "Learn from what you already watch, read, and listen to.",
    body: "Connect your YouTube, podcasts, and articles. Ana identifies the vocabulary you're missing from the subjects you actually care about — your profession, your interests, your world.",
    preview: <ContentPreview />,
  },
  {
    id: "flashcards",
    label: "Study material",
    title: "Flashcards built to actually stick.",
    body: "It's not just what you memorize — it's how. Every word comes with its root forms, conjugations, context sentence, and word type. Reviewed at the right intervals so you never forget.",
    preview: <FlashcardPreview />,
  },
  {
    id: "practice",
    label: "Practice",
    title: "From memorizing to expressing — out loud.",
    body: "Practice real conversations in your dialect. Speak, get corrected, try again. You'll practice the exact vocabulary you've been studying — until saying it stops feeling like a translation and starts feeling like you.",
    preview: <PracticePreview />,
  },
];

function Features() {
  const [active, setActive] = useState(0);
  const f = FEATURES[active];

  return (
    <section style={{
      position: "relative", overflow: "hidden",
      backgroundColor: C.surfaceLow,
      padding: "3rem 2rem 0",
    }}>
      <DiamondPatternBg opacity={0.05} color={C.primary} />
      <ArabicWatermark text="تعلّم" top="10%" right="-1rem" size="20rem" opacity={0.04} />
      <div style={{ position: "relative", zIndex: 1, maxWidth: "860px", margin: "0 auto", textAlign: "center" }}>

        {/* Tab nav — liquid glass pills */}
        <div style={{
          display: "inline-flex", gap: "0.25rem",
          justifyContent: "center", marginBottom: "2.5rem",
          background: "rgba(255,255,255,0.45)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderRadius: "2rem",
          padding: "0.3rem",
          border: "1px solid rgba(255,255,255,0.75)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)",
        }}>
          {FEATURES.map((feat, i) => (
            <button
              key={feat.id}
              onClick={() => setActive(i)}
              style={{
                padding: "0.5rem 1.25rem", borderRadius: "1.75rem", border: "none",
                cursor: "pointer", fontSize: "0.9375rem", fontWeight: 600,
                fontFamily: "var(--font-manrope)",
                transition: "all 0.2s ease",
                ...(active === i ? {
                  background: `linear-gradient(135deg, ${C.primary} 0%, ${C.primaryContainer} 100%)`,
                  color: "#fff",
                  boxShadow: "0 2px 12px rgba(0,74,48,0.35), inset 0 1px 0 rgba(255,255,255,0.15)",
                } : {
                  backgroundColor: "transparent",
                  color: C.onSurfaceVariant,
                }),
              }}
            >
              {feat.label}
            </button>
          ))}
        </div>

        {/* Feature copy — centered */}
        <h2 className="font-display" style={{
          fontSize: "clamp(1.5rem, 3.5vw, 2.25rem)", fontWeight: 700,
          lineHeight: 1.2, color: C.onSurface, marginBottom: "1rem",
        }}>
          {f.title}
        </h2>
        <p style={{
          fontSize: "1.0625rem", lineHeight: 1.8, color: C.onSurfaceVariant,
          maxWidth: "560px", margin: "0 auto 3.5rem",
        }}>
          {f.body}
        </p>

        {/* Phone + platform orbit */}
        <div style={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "center", minHeight: "720px", width: "100%" }}>

          {/* Platform icons — only shown on Your content tab */}
          {f.id === "content" && (
            <>
              {/* Left column: YouTube, Chrome, WhatsApp */}
              {[
                { label: "YouTube", bg: "#FF0000", top: "80px", left: "40px",
                  icon: <svg viewBox="0 0 24 24" fill="white" width="26" height="26"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg> },
                { label: "Chrome", bg: "#1a73e8", top: "calc(50% - 26px)", left: "15px",
                  icon: <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.75" strokeLinecap="round" width="26" height="26"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/><line x1="2" y1="12" x2="22" y2="12"/></svg> },
                { label: "WhatsApp", bg: "#25D366", bottom: "80px", left: "40px",
                  icon: <svg viewBox="0 0 24 24" fill="white" width="26" height="26"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg> },
              ].map((p) => (
                <div key={p.label} style={{ position: "absolute", top: p.top, bottom: (p as any).bottom, left: p.left, zIndex: 3, animation: `platformFloat${p.label} 4s ease-in-out infinite` }}>
                  <div title={p.label} style={{
                    width: "52px", height: "52px", borderRadius: "50%",
                    backgroundColor: p.bg ?? "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.15), 0 0 0 4px rgba(255,255,255,0.6)",
                    overflow: "hidden",
                  }}>
                    {p.icon}
                  </div>
                </div>
              ))}

              {/* Right column: X, Spotify, Apple Podcasts */}
              {[
                { label: "X", bg: "#000000", top: "100px", right: "40px",
                  icon: <svg viewBox="0 0 24 24" fill="white" width="24" height="24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
                { label: "Spotify", bg: "#1DB954", top: "calc(50% - 26px)", right: "15px",
                  icon: <svg viewBox="0 0 24 24" fill="white" width="26" height="26"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg> },
                { label: "Podcasts", bg: "#9933CC", bottom: "100px", right: "40px",
                  icon: <svg viewBox="0 0 24 24" fill="white" width="26" height="26"><path d="M12 1a11 11 0 100 22A11 11 0 0012 1zm0 2a9 9 0 110 18A9 9 0 0112 3zm0 2a7 7 0 100 14A7 7 0 0012 5zm0 2a5 5 0 110 10A5 5 0 0112 7zm0 2a3 3 0 100 6 3 3 0 000-6zm0 1.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm0 4.25v3.5a.75.75 0 001.5 0v-3.5a.75.75 0 00-1.5 0z"/></svg> },
              ].map((p) => (
                <div key={p.label} style={{ position: "absolute", top: p.top, bottom: (p as any).bottom, right: p.right, zIndex: 3 }}>
                  <div title={p.label} style={{
                    width: "52px", height: "52px", borderRadius: "50%",
                    backgroundColor: p.bg,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.15), 0 0 0 4px rgba(255,255,255,0.6)",
                    overflow: "hidden",
                  }}>
                    {p.icon}
                  </div>
                </div>
              ))}
            </>
          )}

          {/* Phone */}
          <div style={{ position: "relative", zIndex: 2 }}>
            <PhoneMockup size="large">{f.preview}</PhoneMockup>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Phone mockup wrapper ─────────────────────────────────────────────────────
function PhoneMockup({ children, size = "normal" }: { children: React.ReactNode; size?: "normal" | "large" }) {
  const w = size === "large" ? 340 : 300;
  const scale = w / 300;
  return (
    <div style={{ position: "relative", display: "inline-flex", justifyContent: "center" }}>
      {/* Outer frame — light silver */}
      <div style={{
        backgroundColor: "#e9e8ea",
        borderRadius: `${52*scale}px`,
        padding: `${13*scale}px`,
        boxShadow: `
          0 ${32*scale}px ${64*scale}px rgba(0,0,0,0.12),
          0 ${8*scale}px ${24*scale}px rgba(0,0,0,0.07),
          0 0 0 1px rgba(0,0,0,0.06)
        `,
        width: `${w}px`,
      }}>
        {/* Screen */}
        <div style={{
          backgroundColor: C.surface,
          borderRadius: `${40*scale}px`,
          overflow: "hidden",
          position: "relative",
          minHeight: `${580*scale}px`,
          display: "flex",
          flexDirection: "column",
        }}>
          {/* Dynamic Island */}
          <div style={{
            position: "absolute", top: `${14*scale}px`, left: "50%", transform: "translateX(-50%)",
            width: `${88*scale}px`, height: `${26*scale}px`,
            backgroundColor: "#000", borderRadius: `${16*scale}px`, zIndex: 10,
          }} />
          {/* Status bar */}
          <div style={{
            height: `${52*scale}px`, flexShrink: 0,
            display: "flex", alignItems: "flex-end", justifyContent: "space-between",
            padding: `0 ${22*scale}px ${6*scale}px`,
          }}>
            <span style={{ fontSize: `${12*scale}px`, fontWeight: 600, fontFamily: "var(--font-inter)", color: C.onSurface }}>9:41</span>
            <span style={{ fontSize: `${11*scale}px`, color: C.onSurface, letterSpacing: "-0.01em" }}>▲ ◀ ◼</span>
          </div>
          {/* Content */}
          <div style={{ flex: 1, padding: `0 ${16*scale}px ${20*scale}px`, overflow: "hidden" }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Feature preview mocks ────────────────────────────────────────────────────

function ContentPreview() {
  const featured = {
    gradient: `linear-gradient(160deg, #004a30 0%, #006442 60%, #1a7a50 100%)`,
    emoji: "💼",
    tag: "Business",
    platform: "▶ YouTube · 14 min",
    title: "كيف تبني شركة ناجحة من الصفر",
    channel: "بزنس بالعربي",
  };

  const row1 = [
    { gradient: `linear-gradient(160deg, #6b21a8 0%, #9333ea 100%)`, emoji: "🎙️", title: "التكنولوجيا والمستقبل", meta: "Ep. 32 · 41 min", platform: "Podcast" },
    { gradient: `linear-gradient(160deg, #0369a1 0%, #38bdf8 100%)`, emoji: "📰", title: "فن الإقناع في العمل", meta: "5 min read", platform: "Article" },
    { gradient: `linear-gradient(160deg, #1d1d1d 0%, #374151 100%)`, emoji: "𝕏", title: "أهم مصطلحات التقنية", meta: "847 reposts", platform: "X" },
  ];

  const row2 = [
    { gradient: `linear-gradient(160deg, #92400e 0%, #d97706 100%)`, emoji: "🍽️", title: "وصفات المطبخ الشامي", meta: "22 min", platform: "YouTube" },
    { gradient: `linear-gradient(160deg, #065f46 0%, #059669 100%)`, emoji: "🕌", title: "فقه المعاملات اليومية", meta: "Ep. 8", platform: "Podcast" },
    { gradient: `linear-gradient(160deg, #1e3a5f 0%, #2563eb 100%)`, emoji: "📖", title: "قصص النجاح العربية", meta: "8 min read", platform: "Article" },
  ];

  return (
    <div style={{ width: "100%", fontFamily: "var(--font-inter)" }}>
      {/* Header */}
      <div style={{ marginBottom: "0.875rem" }}>
        <p style={{ fontSize: "0.75rem", fontWeight: 700, color: C.tertiary, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Discover
        </p>
      </div>

      {/* Featured hero card */}
      <div style={{
        borderRadius: "1.125rem", overflow: "hidden",
        background: featured.gradient,
        marginBottom: "0.625rem",
        padding: "1.25rem",
        display: "flex", flexDirection: "column", justifyContent: "space-between",
        minHeight: "148px", position: "relative",
      }}>
        {/* Big emoji watermark */}
        <div style={{
          position: "absolute", right: "1rem", top: "50%", transform: "translateY(-50%)",
          fontSize: "3.5rem", opacity: 0.25, pointerEvents: "none", lineHeight: 1,
        }}>
          {featured.emoji}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{
            fontSize: "0.6rem", fontWeight: 700, backgroundColor: "rgba(255,255,255,0.2)",
            color: "#fff", borderRadius: "1rem", padding: "0.2rem 0.5rem", letterSpacing: "0.06em",
          }}>{featured.tag}</span>
          <span style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.6)", fontWeight: 500 }}>{featured.platform}</span>
        </div>
        <div>
          <p className="arabic" style={{
            fontSize: "1.0625rem", color: "#fff", lineHeight: 1.4,
            marginBottom: "0.25rem", fontWeight: 600,
          }}>{featured.title}</p>
          <p style={{ fontSize: "0.6875rem", color: "rgba(255,255,255,0.6)" }}>{featured.channel}</p>
        </div>
      </div>

      {/* Horizontal row 1 */}
      <p style={{ fontSize: "0.625rem", fontWeight: 700, color: C.onSurfaceVariant, letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: "0.4rem" }}>
        Based on your interests
      </p>
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.625rem", overflowX: "auto", scrollbarWidth: "none", msOverflowStyle: "none" } as React.CSSProperties}>
        {row1.map((item) => (
          <div key={item.title} style={{
            borderRadius: "1rem", overflow: "hidden",
            background: item.gradient, flexShrink: 0,
            width: "120px", height: "106px",
            padding: "0.625rem",
            display: "flex", flexDirection: "column", justifyContent: "space-between",
            position: "relative",
          }}>
            <div style={{
              position: "absolute", right: "0.5rem", top: "0.375rem",
              fontSize: "1.75rem", opacity: 0.2, lineHeight: 1,
            }}>{item.emoji}</div>
            <span style={{
              fontSize: "0.55rem", fontWeight: 700, color: "rgba(255,255,255,0.75)",
              backgroundColor: "rgba(0,0,0,0.2)", borderRadius: "1rem",
              padding: "0.1rem 0.4rem", alignSelf: "flex-start",
            }}>{item.platform}</span>
            <div>
              <p className="arabic" style={{ fontSize: "0.8125rem", color: "#fff", lineHeight: 1.3, marginBottom: "0.1rem", fontWeight: 600 }}>{item.title}</p>
              <p style={{ fontSize: "0.55rem", color: "rgba(255,255,255,0.55)" }}>{item.meta}</p>
            </div>
          </div>
        ))}
        <div style={{ flexShrink: 0, width: "24px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ color: C.outlineVariant, fontSize: "1.25rem" }}>›</span>
        </div>
      </div>

      {/* Horizontal row 2 */}
      <p style={{ fontSize: "0.625rem", fontWeight: 700, color: C.onSurfaceVariant, letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: "0.4rem" }}>
        Trending in the Arab world
      </p>
      <div style={{ display: "flex", gap: "0.5rem", overflowX: "auto", scrollbarWidth: "none", msOverflowStyle: "none" } as React.CSSProperties}>
        {row2.map((item) => (
          <div key={item.title} style={{
            borderRadius: "1rem", overflow: "hidden",
            background: item.gradient, flexShrink: 0,
            width: "120px", height: "106px",
            padding: "0.625rem",
            display: "flex", flexDirection: "column", justifyContent: "space-between",
            position: "relative",
          }}>
            <div style={{
              position: "absolute", right: "0.5rem", top: "0.375rem",
              fontSize: "1.75rem", opacity: 0.2, lineHeight: 1,
            }}>{item.emoji}</div>
            <span style={{
              fontSize: "0.55rem", fontWeight: 700, color: "rgba(255,255,255,0.75)",
              backgroundColor: "rgba(0,0,0,0.2)", borderRadius: "1rem",
              padding: "0.1rem 0.4rem", alignSelf: "flex-start",
            }}>{item.platform}</span>
            <div>
              <p className="arabic" style={{ fontSize: "0.8125rem", color: "#fff", lineHeight: 1.3, marginBottom: "0.1rem", fontWeight: 600 }}>{item.title}</p>
              <p style={{ fontSize: "0.55rem", color: "rgba(255,255,255,0.55)" }}>{item.meta}</p>
            </div>
          </div>
        ))}
        <div style={{ flexShrink: 0, width: "24px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ color: C.outlineVariant, fontSize: "1.25rem" }}>›</span>
        </div>
      </div>
    </div>
  );
}

function DialectPreview() {
  const [selected, setSelected] = useState("levantine");
  const dialects = [
    { id: "msa",       label: "Modern Standard", arabic: "الفصحى",   flags: "🌍",             region: "Universal Arabic" },
    { id: "levantine", label: "Levantine",        arabic: "الشامية",  flags: "🇸🇾 🇱🇧 🇵🇸 🇯🇴", region: "Syria · Lebanon · Palestine · Jordan" },
    { id: "egyptian",  label: "Egyptian",         arabic: "المصرية",  flags: "🇪🇬",             region: "Egypt" },
    { id: "gulf",      label: "Gulf",             arabic: "الخليجية", flags: "🇸🇦 🇦🇪 🇰🇼 🇶🇦", region: "Saudi Arabia · UAE · Kuwait · Qatar" },
    { id: "darija",    label: "Darija",           arabic: "الدارجة",  flags: "🇲🇦 🇩🇿 🇹🇳",    region: "Morocco · Algeria · Tunisia" },
  ];
  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column" }}>
      <p style={{ fontSize: "0.75rem", fontWeight: 600, color: C.tertiary, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.375rem" }}>Your dialect</p>
      <p className="font-display" style={{ fontSize: "1rem", fontWeight: 700, color: C.onSurface, marginBottom: "1rem", lineHeight: 1.3 }}>Which Arabic feels like home?</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {dialects.map((d) => (
          <div
            key={d.id}
            onClick={() => setSelected(d.id)}
            style={{
              borderRadius: "1rem", padding: "0.75rem 1rem", cursor: "pointer",
              backgroundColor: selected === d.id ? C.primary : C.surfaceLow,
              display: "flex", justifyContent: "space-between", alignItems: "center",
              transition: "all 0.15s",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.2rem" }}>
                <p style={{ fontSize: "0.9rem", fontWeight: 600, color: selected === d.id ? "#fff" : C.onSurface }}>{d.label}</p>
                <span style={{ fontSize: "0.875rem" }}>{d.flags}</span>
              </div>
              <p style={{ fontSize: "0.6875rem", color: selected === d.id ? "rgba(255,255,255,0.6)" : C.onSurfaceVariant }}>{d.region}</p>
            </div>
            <span className="arabic" style={{ fontSize: "1.1rem", color: selected === d.id ? "rgba(255,255,255,0.9)" : C.primary }}>{d.arabic}</span>
          </div>
        ))}
      </div>
      <button style={{
        marginTop: "1.25rem", width: "100%",
        background: `linear-gradient(135deg, ${C.primary}, ${C.primaryContainer})`,
        color: "#fff", border: "none", borderRadius: "0.875rem",
        padding: "0.875rem", fontSize: "0.9375rem", fontWeight: 700,
        fontFamily: "var(--font-manrope)", cursor: "pointer",
      }}>
        Continue →
      </button>
    </div>
  );
}

function FlashcardPreview() {
  const [flipped, setFlipped] = useState(false);
  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.875rem" }}>
        <p style={{ fontSize: "0.75rem", fontWeight: 600, color: C.tertiary, letterSpacing: "0.08em", textTransform: "uppercase" }}>Study</p>
        <span style={{ fontSize: "0.6875rem", color: C.onSurfaceVariant }}>12 / 24 cards</span>
      </div>
      {/* Progress bar */}
      <div style={{ height: "4px", backgroundColor: C.surfaceHigh, borderRadius: "2px", marginBottom: "1.25rem" }}>
        <div style={{ height: "100%", width: "50%", background: `linear-gradient(90deg, ${C.primary}, ${C.primaryContainer})`, borderRadius: "2px" }} />
      </div>

      <div
        onClick={() => setFlipped(!flipped)}
        style={{
          width: "100%", borderRadius: "1.25rem", cursor: "pointer",
          backgroundColor: flipped ? C.primary : C.surfaceLow,
          padding: "1.75rem", transition: "background-color 0.3s",
          marginBottom: "1rem",
        }}
      >
        {!flipped ? (
          <div style={{ textAlign: "center" }}>
            <p className="arabic" style={{ fontSize: "2.75rem", color: C.primary, marginBottom: "0.5rem" }}>قاوَمَ</p>
            <p style={{ fontSize: "0.75rem", color: C.onSurfaceVariant, fontWeight: 500 }}>Tap to reveal</p>
          </div>
        ) : (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
              <div>
                <p className="arabic" style={{ fontSize: "1.75rem", color: "#fff", marginBottom: "0.25rem" }}>قاوَمَ</p>
                <p style={{ fontSize: "1rem", fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>to resist</p>
              </div>
              <span style={{ fontSize: "0.6875rem", fontWeight: 700, backgroundColor: "rgba(255,255,255,0.15)", color: "#fff", borderRadius: "1rem", padding: "0.2rem 0.6rem" }}>Verb</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
              {[
                { label: "Past", arabic: "قاوَمَ" },
                { label: "Present", arabic: "يُقاوِمُ" },
                { label: "Command", arabic: "قاوِمْ" },
                { label: "Verbal noun", arabic: "مُقاوَمة" },
              ].map((form) => (
                <div key={form.label} style={{ backgroundColor: "rgba(255,255,255,0.1)", borderRadius: "0.75rem", padding: "0.5rem 0.75rem" }}>
                  <p style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.55)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.2rem" }}>{form.label}</p>
                  <p className="arabic" style={{ fontSize: "1rem", color: "#fff" }}>{form.arabic}</p>
                </div>
              ))}
            </div>
            <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.6)", marginTop: "1rem", fontStyle: "italic" }}>
              "ما قدرش يقاوم" — from Paranormal, Episode 2
            </p>
          </div>
        )}
      </div>
      <p style={{ fontSize: "0.6875rem", color: C.onSurfaceVariant, opacity: 0.6, textAlign: "center", marginBottom: "1rem" }}>
        {flipped ? "How well did you know it?" : "Tap the card to reveal"}
      </p>
      {flipped && (
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {[
            { label: "Again", color: "#dc2626", bg: "#fef2f2" },
            { label: "Hard", color: "#d97706", bg: "#fffbeb" },
            { label: "Good", color: C.primary, bg: C.surfaceLow },
            { label: "Easy", color: "#059669", bg: "#f0fdf4" },
          ].map((btn) => (
            <button key={btn.label} onClick={() => setFlipped(false)} style={{
              flex: 1, border: "none", borderRadius: "0.75rem",
              padding: "0.625rem 0", fontSize: "0.75rem", fontWeight: 700,
              backgroundColor: btn.bg, color: btn.color, cursor: "pointer",
              fontFamily: "var(--font-manrope)",
            }}>{btn.label}</button>
          ))}
        </div>
      )}
    </div>
  );
}

function PracticePreview() {
  const messages = [
    { from: "prompt", text: "كيف كان يومك في العمل؟", translation: "How was your day at work?" },
    { from: "user", text: "كان يوماً صعباً، لكن...", translation: "It was a hard day, but..." },
    { from: "tutor", text: 'جيد! بدلاً من "صعباً" جرّب "مرهقاً" — أكثر تعبيراً 👌', translation: null },
    { from: "user", text: "شكراً، سأحاول مرة أخرى", translation: "Thanks, I'll try again" },
    { from: "tutor", text: "ممتاز! نطقك يتحسن كثيراً 🎯", translation: null },
  ];
  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
        <p style={{ fontSize: "0.75rem", fontWeight: 600, color: C.tertiary, letterSpacing: "0.08em", textTransform: "uppercase" }}>Practice</p>
        <span style={{
          fontSize: "0.6rem", fontWeight: 700, backgroundColor: C.surfaceLow,
          color: C.primary, borderRadius: "1rem", padding: "0.2rem 0.6rem",
        }}>Levantine 🇱🇧</span>
      </div>

      {/* Scenario chip */}
      <div style={{
        backgroundColor: C.surfaceLow, borderRadius: "0.875rem",
        padding: "0.625rem 0.875rem", marginBottom: "1rem",
      }}>
        <p style={{ fontSize: "0.6875rem", color: C.onSurfaceVariant, lineHeight: 1.4 }}>
          📍 Scenario: <span style={{ fontWeight: 600, color: C.onSurface }}>Talking to a colleague about your workday</span>
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem", flex: 1, marginBottom: "1rem" }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.from === "user" ? "flex-end" : "flex-start" }}>
            <div style={{
              maxWidth: "85%", borderRadius: "1rem", padding: "0.625rem 0.875rem",
              backgroundColor: m.from === "user" ? C.primary : m.from === "tutor" ? C.tertiaryFixed : C.surfaceLow,
            }}>
              <p className="arabic" style={{ fontSize: "0.875rem", color: m.from === "user" ? "#fff" : m.from === "tutor" ? C.tertiary : C.onSurface, lineHeight: 1.5 }}>{m.text}</p>
              {m.translation && <p style={{ fontSize: "0.6rem", color: m.from === "user" ? "rgba(255,255,255,0.6)" : C.onSurfaceVariant, marginTop: "0.2rem" }}>{m.translation}</p>}
            </div>
          </div>
        ))}
      </div>
      {/* Mic button */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div style={{
          width: "48px", height: "48px", borderRadius: "50%",
          background: `linear-gradient(135deg, ${C.primary}, ${C.primaryContainer})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: `0 0 0 8px ${C.primary}22`,
        }}>
          <svg width="20" height="20" fill="#fff" viewBox="0 0 24 24">
            <path d="M12 1a4 4 0 0 1 4 4v6a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4zm-1 17.93V21h-2v2h6v-2h-2v-2.07A8 8 0 0 0 20 11h-2a6 6 0 0 1-12 0H4a8 8 0 0 0 7 7.93z"/>
          </svg>
        </div>
      </div>
    </div>
  );
}

// ─── Problem ──────────────────────────────────────────────────────────────────
function Problem() {
  const [activeCard, setActiveCard] = useState(0);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observers = cardRefs.current.map((el, i) => {
      if (!el) return null;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveCard(i); },
        { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
      );
      obs.observe(el);
      return obs;
    });
    return () => observers.forEach(o => o?.disconnect());
  }, []);

  const cards = [
    {
      number: "01", label: "The feeling",
      headline: "You understand every word.",
      text: "Your parents speak to you in Arabic. You get it all. You answer in English — and something is lost.",
      bg: C.surfaceLow, dark: false,
    },
    {
      number: "02", label: "The plateau",
      headline: "Apps didn't cut it.",
      text: "You tried Duolingo. Textbook phrases that never come up in real life. You plateaued, got bored, gave up.",
      bg: C.surfaceHighest, dark: false,
    },
    {
      number: "03", label: "The gap",
      headline: "What you need isn't in any curriculum.",
      text: "It's in your family's stories, the shows they watch, the culture they carry.",
      bg: "#0d2118", dark: true,
    },
  ];

  return (
    <section style={{ position: "relative", backgroundColor: C.surface }}>
      {/* Clipped bg patterns — isolated so sticky works on siblings */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", zIndex: 0, pointerEvents: "none" }}>
        <StarPatternBg opacity={0.03} color={C.tertiary} />
        <ArabicWatermark text="فهم" top="20%" left="-2rem" size="18rem" opacity={0.04} />
      </div>

      <div style={{ display: "flex", flexDirection: "row", maxWidth: "1080px", margin: "0 auto", position: "relative", zIndex: 1 }}>

        {/* ── Left: sticky, full viewport height ── */}
        <div style={{
          position: "sticky", top: 0, height: "100vh", flexShrink: 0,
          width: "42%", display: "flex", alignItems: "center",
          padding: "0 3rem 0 2rem",
        }}>
          <div>
            <h2 className="font-display" style={{
              fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 700,
              lineHeight: 1.2, color: C.onSurface, marginBottom: "1.25rem",
            }}>
              You understand more than you think.
            </h2>
            <p className="font-display" style={{
              fontSize: "clamp(1.25rem, 2.5vw, 1.625rem)", fontWeight: 400,
              color: C.onSurfaceVariant,
            }}>
              Saying it is the hard part.
            </p>
          </div>
        </div>

        {/* ── Right: scrollable cards, each 55vh ── */}
        <div style={{ flex: 1, padding: "10vh 2rem 20vh 0" }}>
          {cards.map((card, i) => (
            <div
              key={i}
              ref={el => { cardRefs.current[i] = el; }}
              style={{ height: "55vh", display: "flex", alignItems: "center" }}
            >
              <div style={{
                width: "100%",
                opacity: activeCard === i ? 1 : 0.4,
                transform: activeCard === i ? "scale(1)" : "scale(0.95)",
                transition: "opacity 0.5s ease-in-out, transform 0.5s ease-in-out",
                backgroundColor: card.bg,
                borderRadius: "1.5rem",
                padding: "2.5rem",
                minHeight: "300px",
                display: "flex", flexDirection: "column", justifyContent: "space-between",
                boxShadow: activeCard === i
                  ? "0 12px 48px rgba(0,0,0,0.12)"
                  : "0 2px 12px rgba(0,0,0,0.05)",
              }}>
                {/* Step number */}
                <div style={{
                  width: "2.25rem", height: "2.25rem", borderRadius: "50%",
                  border: `1.5px solid ${card.dark ? "rgba(255,255,255,0.2)" : C.outlineVariant}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.8125rem", fontWeight: 600,
                  color: card.dark ? "rgba(255,255,255,0.45)" : C.onSurfaceVariant,
                  fontFamily: "var(--font-inter)",
                }}>
                  {card.number}
                </div>
                {/* Content */}
                <div>
                  <p style={{
                    fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.1em",
                    textTransform: "uppercase", marginBottom: "0.875rem",
                    color: card.dark ? "rgba(255,255,255,0.35)" : C.tertiary,
                  }}>
                    {card.label}
                  </p>
                  <p className="font-display" style={{
                    fontSize: "clamp(1.25rem, 2vw, 1.625rem)", fontWeight: 700,
                    lineHeight: 1.25, marginBottom: "0.75rem",
                    color: card.dark ? "#fff" : C.onSurface,
                  }}>
                    {card.headline}
                  </p>
                  <p style={{
                    fontSize: "1.0625rem", lineHeight: 1.8,
                    color: card.dark ? "rgba(255,255,255,0.65)" : C.onSurfaceVariant,
                  }}>
                    {card.text}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Who it's for ─────────────────────────────────────────────────────────────
function WhoItsFor() {
  return (
    <section style={{ position: "relative", backgroundColor: C.surfaceLow, padding: "7rem 2rem", overflow: "hidden" }}>
      <HexPatternBg opacity={0.06} color={C.tertiary} />
      <ArabicWatermark text="تراث" top="5%" right="-1rem" size="18rem" opacity={0.05} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: "760px", margin: "0 auto" }}>
        <h2 className="font-display" style={{
          fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 700, lineHeight: 1.2,
          color: C.onSurface, marginBottom: "0.75rem",
        }}>
          Built for the in-between.
        </h2>
        <p className="font-display" style={{
          fontSize: "clamp(1.25rem, 2.5vw, 1.625rem)", fontWeight: 400,
          color: C.onSurfaceVariant, marginBottom: "3.5rem",
        }}>
          Heritage speakers who almost have it.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem" }}>
          {[
            {
              arabic: "أفهم كل شيء",
              translation: "I understand everything",
              body: "You grew up hearing Arabic at home. You get every word your parents say. But when you try to speak, something freezes.",
            },
            {
              arabic: "أريد أن أتواصل",
              translation: "I want to connect",
              body: "Your grandparents, your cousins back home — the conversations that matter most are in Arabic.",
            },
            {
              arabic: "لغتي، تراثي",
              translation: "My language, my heritage",
              body: "This isn't just about vocabulary. It's about owning a part of yourself that never quite felt fully yours.",
            },
          ].map((p) => (
            <div key={p.arabic} style={{
              backgroundColor: C.surface, borderRadius: "1.25rem", padding: "2rem",
              boxShadow: "0px 20px 40px rgba(28,28,25,0.05)",
            }}>
              <p className="arabic" style={{ fontSize: "1.5rem", color: C.primary, marginBottom: "0.25rem" }}>{p.arabic}</p>
              <p style={{ fontSize: "0.75rem", color: C.tertiary, fontWeight: 500, marginBottom: "1.25rem", fontStyle: "italic" }}>{p.translation}</p>
              <p style={{ fontSize: "0.9375rem", lineHeight: 1.75, color: C.onSurfaceVariant }}>{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Waitlist CTA ─────────────────────────────────────────────────────────────
function WaitlistCTA() {
  return (
    <section id="waitlist" style={{
      position: "relative", padding: "9rem 2rem", backgroundColor: C.surface,
      textAlign: "center", overflow: "hidden",
    }}>
      <DiamondPatternBg opacity={0.04} color={C.primary} />
      <ArabicWatermark text="ابدأ" top="10%" left="50%" size="20rem" opacity={0.035} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: "560px", margin: "0 auto" }}>
        <p className="arabic" style={{ fontSize: "2rem", color: C.primary, marginBottom: "1.5rem", opacity: 0.75 }}>
          ابدأ رحلتك
        </p>
        <h2 className="font-display" style={{
          fontSize: "clamp(1.875rem, 4.5vw, 3rem)", fontWeight: 400, lineHeight: 1.1,
          color: C.onSurface, marginBottom: "1.25rem", letterSpacing: "-0.02em",
        }}>
          Be first to express yourself.
        </h2>
        <p style={{
          fontSize: "1.0625rem", lineHeight: 1.8, color: C.onSurfaceVariant, marginBottom: "2.75rem",
        }}>
          Ana is in early development. Join the waitlist and we'll reach out when we're ready to welcome our first users.
        </p>
        <WaitlistForm />
        <p style={{ marginTop: "1rem", fontSize: "0.8rem", color: C.onSurfaceVariant, opacity: 0.55 }}>
          No spam. Unsubscribe anytime.
        </p>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  const cols = [
    {
      heading: "Product",
      links: ["Features", "How it works", "Dialects", "Study system", "Speaking practice", "Pricing"],
    },
    {
      heading: "Company",
      links: ["About", "Our story", "Blog", "Careers", "Press"],
    },
    {
      heading: "Community",
      links: ["For heritage speakers", "For parents", "For educators", "Ambassador program"],
    },
    {
      heading: "Support",
      links: ["Help center", "Contact us", "Privacy policy", "Terms of service"],
    },
  ];

  const textMuted = "rgba(235,232,227,0.45)";
  const textSub   = "rgba(235,232,227,0.7)";
  const textMain  = "rgba(235,232,227,0.92)";

  return (
    <footer style={{
      position: "relative", overflow: "hidden",
      // Deep heritage green gradient — dark forest floor rising to midnight canopy
      background: `linear-gradient(175deg, #0a1f14 0%, #0d2318 40%, #071510 100%)`,
    }}>
      {/* Subtle geometric pattern overlay */}
      <DiamondPatternBg opacity={0.06} color="#ffffff" />
      {/* Warm glow from bottom-center — the "oasis" light source */}
      <div style={{
        position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: "600px", height: "300px", pointerEvents: "none",
        background: `radial-gradient(ellipse at center bottom, rgba(0,100,66,0.18) 0%, transparent 70%)`,
      }} />
      {/* Tertiary gold accent line at top */}
      <div style={{
        height: "2px",
        background: `linear-gradient(90deg, transparent 0%, ${C.tertiary} 30%, ${C.tertiaryFixed} 50%, ${C.tertiary} 70%, transparent 100%)`,
        opacity: 0.5,
      }} />

      {/* Main footer body */}
      <div style={{ position: "relative", zIndex: 1, maxWidth: "1120px", margin: "0 auto", padding: "5rem 2rem 3rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1fr", gap: "3rem" }} className="footer-grid">

          {/* Brand column */}
          <div>
            <div style={{ width: "96px", height: "36px", backgroundColor: "#000", borderRadius: "4px", marginBottom: "1rem" }} />
            <p style={{ fontSize: "0.9375rem", color: textSub, lineHeight: 1.75, marginBottom: "2rem", maxWidth: "220px" }}>
              Learn to express yourself in the Arabic your family speaks.
            </p>
            {/* Social icons */}
            <div style={{ display: "flex", gap: "0.875rem" }}>
              {[
                { label: "X", path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.736-8.847L1.254 2.25H8.08l4.253 5.622 5.91-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" },
                { label: "IG", path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" },
                { label: "TK", path: "M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V9.05a8.16 8.16 0 0 0 4.77 1.52V7.14a4.85 4.85 0 0 1-1-.45z" },
              ].map((s) => (
                <a key={s.label} href="#" style={{
                  width: "36px", height: "36px", borderRadius: "0.625rem",
                  backgroundColor: "rgba(255,255,255,0.07)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  textDecoration: "none",
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill={textSub}>
                    <path d={s.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {cols.map((col) => (
            <div key={col.heading}>
              <p className="font-display" style={{
                fontSize: "0.8125rem", fontWeight: 700, color: textMain,
                letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "1.25rem",
              }}>
                {col.heading}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                {col.links.map((link) => (
                  <a key={link} href="#" style={{
                    fontSize: "0.9375rem", color: textMuted, textDecoration: "none",
                    transition: "color 0.15s",
                  }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = textMain)}
                    onMouseLeave={(e) => (e.currentTarget.style.color = textMuted)}
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{
        position: "relative", zIndex: 1,
        borderTop: "1px solid rgba(255,255,255,0.07)",
        maxWidth: "1120px", margin: "0 auto",
        padding: "1.5rem 2rem",
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem",
      }}>
        <p style={{ fontSize: "0.8125rem", color: textMuted }}>
          © {new Date().getFullYear()} Ana. Built for the diaspora.
        </p>
        <div style={{ display: "flex", gap: "1.5rem" }}>
          {["Privacy policy", "Terms of service", "Cookie settings"].map((link) => (
            <a key={link} href="#" style={{ fontSize: "0.8125rem", color: textMuted, textDecoration: "none" }}>{link}</a>
          ))}
        </div>
      </div>
      <style>{`
        @media (max-width: 860px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 480px) {
          .footer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </footer>
  );
}

// ─── Waitlist form ────────────────────────────────────────────────────────────
function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Something went wrong.");
        setStatus("error");
      } else {
        setStatus("success");
        setEmail("");
      }
    } catch {
      setErrorMsg("Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div style={{
        backgroundColor: C.surfaceLow, borderRadius: "1.25rem",
        padding: "1.5rem 2rem", display: "inline-block",
      }}>
        <p className="font-display" style={{ fontWeight: 700, color: C.primary, fontSize: "1.125rem" }}>
          You're on the list.
        </p>
        <p style={{ fontSize: "0.875rem", color: C.onSurfaceVariant, marginTop: "0.25rem" }}>
          We'll be in touch when Ana is ready for you.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{
      display: "flex", gap: "0.75rem", flexWrap: "wrap",
      justifyContent: "center", maxWidth: "480px", margin: "0 auto",
    }}>
      <input
        type="email" required placeholder="your@email.com"
        value={email}
        onChange={(e) => { setEmail(e.target.value); if (status === "error") setStatus("idle"); }}
        className="waitlist-input"
        style={{
          flex: "1 1 220px", backgroundColor: C.surfaceLow, border: "none",
          borderRadius: "0.75rem", padding: "0.875rem 1.25rem", fontSize: "1rem",
          color: C.onSurface, fontFamily: "var(--font-inter)",
        }}
      />
      <button type="submit" disabled={status === "loading"} className="btn-primary" style={{
        background: `linear-gradient(135deg, ${C.primary} 0%, ${C.primaryContainer} 100%)`,
        color: "#fff", border: "none", borderRadius: "0.75rem",
        padding: "0.875rem 1.75rem", fontSize: "1rem", fontWeight: 600,
        fontFamily: "var(--font-manrope)", cursor: status === "loading" ? "wait" : "pointer",
        whiteSpace: "nowrap", opacity: status === "loading" ? 0.7 : 1,
      }}>
        {status === "loading" ? "Joining…" : "Join the waitlist"}
      </button>
      {status === "error" && (
        <p style={{ width: "100%", textAlign: "center", fontSize: "0.875rem", color: "#b91c1c" }}>
          {errorMsg}
        </p>
      )}
    </form>
  );
}
