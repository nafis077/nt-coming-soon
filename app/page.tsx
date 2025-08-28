import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Mail, Clock, Instagram, Facebook, Twitter, Linkedin, Sparkles, CheckCircle2, ArrowRight, MapPin } from "lucide-react";

// Fallback UI primitives (no external UI lib needed)
type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { className?: string };
const Button: React.FC<ButtonProps> = ({ className = "", ...props }) => (
  <button {...props} className={`px-4 py-2 text-sm font-medium rounded-xl ${className}`} />
);

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & { className?: string };
const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className = "", ...props }, ref) => (
  <input ref={ref} {...props} className={`h-10 w-full rounded-md border border-black/10 bg-white/90 dark:bg-white/5 dark:border-white/10 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/40 ${className}`} />
));
Input.displayName = "Input";

// --- Helper: simple email regex ---
const isEmail = (v: string) => /\S+@\S+\.\S+/.test(v);

// --- Change your brand info here ---
const BRAND = {
  name: "NT TECH INNOVATION",
  tagline: "WHERE INNOVATION KNOWS NO LIMITS",
  launchDate: new Date("2025-12-01T00:00:00"), // Set your actual launch date
  socials: {
    instagram: "https://www.instagram.com/nttechinnovation/",
    facebook: "https://www.facebook.com/NTTechInnovation",
    twitter: "https://x.com/Innovation40594",
    linkedin: "https://www.linkedin.com/company/nt-tech-innovation",
  },
  previewImage: "https://scontent.fzyl2-2.fna.fbcdn.net/v/t39.30808-6/491924909_516905228159662_1402206316496236924_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeGIsGh5QD-62DxM-fT4_soq6uUcPaBP127q5Rw9oE_Xbt_JUADiEw0yqgBlj_aJ_pe6Q8njQcQeFvfj9a8q_kZZ&_nc_ohc=NU3BpCT2eg8Q7kNvwHGRBth&_nc_oc=AdkQ03DgOF4qhYjfRpQXg5jJPuf6m8pu6DbDaazsWD_jkBD3JodKKVlKCgnfcdR2uHg&_nc_zt=23&_nc_ht=scontent.fzyl2-2.fna&_nc_gid=U4nnPIMYlQ02rc49RE13GA&oh=00_AfWv7kFLHgd68dpwVOGW1s9WrLMTiIE8BonARepTxmTGTg&oe=68B67396",
};

// --- Backend endpoint (SQL storage) ---
const API_WAITLIST = "/api/waitlist";

// --- Countdown hook ---
function useCountdown(target: Date) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const diff = Math.max(0, target.getTime() - now.getTime());
  const seconds = Math.floor(diff / 1000) % 60;
  const minutes = Math.floor(diff / (1000 * 60)) % 60;
  const hours = Math.floor(diff / (1000 * 60 * 60)) % 24;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  return { days, hours, minutes, seconds, done: diff === 0 };
}

// --- Number tile ---
const TimeTile: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <div className="flex flex-col items-center rounded-2xl border bg-white/60 dark:bg-white/5 dark:border-white/10 px-6 py-4 shadow-sm backdrop-blur">
    <div className="text-4xl font-bold tabular-nums">{String(value).padStart(2, "0")}</div>
    <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
  </div>
);

// --- Feature bullet ---
const Bullet: React.FC<{ text: string }> = ({ text }) => (
  <div className="flex items-center gap-2 text-sm text-muted-foreground">
    <CheckCircle2 className="h-4 w-4" />
    <span>{text}</span>
  </div>
);

// --- 3D floating image (PNG/SVG)
const FloatingImage: React.FC<{ src: string; alt?: string; className?: string; delay?: number }> = ({ src, alt = "decorative-image", className = "", delay = 0 }) => (
  <motion.img
    src={src}
    alt={alt}
    initial={{ y: 0, opacity: 0.95 }}
    animate={{ y: [0, -8, 0] }}
    transition={{ duration: 6, delay, repeat: Infinity }}
    className={className}
    style={{ filter: "drop-shadow(0 12px 24px rgba(2,6,23,0.25))" }}
  />
);

// --- Main Component ---
export default function ComingSoon() {
  const { days, hours, minutes, seconds } = useCountdown(BRAND.launchDate);
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const disabled = useMemo(() => !isEmail(email), [email]);

  // Only show socials that are actually active (truthy URL)
  const activeSocials = [
    { href: BRAND.socials.instagram, Icon: Instagram, label: "Instagram" },
    { href: BRAND.socials.facebook, Icon: Facebook, label: "Facebook" },
    { href: BRAND.socials.twitter, Icon: Twitter, label: "Twitter/X" },
    { href: BRAND.socials.linkedin, Icon: Linkedin, label: "LinkedIn" },
  ].filter((s) => !!s.href);

  const onNotify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled || loading) return;

    const normalized = email.trim().toLowerCase();

    // helper: preview fallback (no backend)
    const previewFallback = () => {
      try {
        if (typeof window !== "undefined") {
          const key = "waitlist_emails";
          const prev = JSON.parse(localStorage.getItem(key) || "[]");
          const exists = prev.some((x: any) => (x.email || "").toLowerCase() === normalized);
          if (exists) {
            setIsError(false);
            setMsg("You're already on the list.");
            return;
          }
          prev.push({ email: normalized, at: new Date().toISOString() });
          localStorage.setItem(key, JSON.stringify(prev));
        }
      } catch {}
      setIsError(false);
      setMsg("Thanks! You’re on the list.");
      setEmail("");
    };

    try {
      setLoading(true);
      const res = await fetch(API_WAITLIST, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalized }),
      });
      if (res.status === 409) {
        setIsError(false);
        setMsg("You're already on the list.");
      } else if (res.ok) {
        setIsError(false);
        setMsg("Thanks! You’re on the list.");
        setEmail("");
      } else if (res.status === 404 || res.status === 405) {
        // likely running in preview with no API route
        previewFallback();
      } else {
        const data = await res.json().catch(() => null);
        setIsError(true);
        setMsg(data?.message || "Something went wrong. Please try again.");
      }
    } catch (err) {
      // network/CORS in preview -> simulate success
      previewFallback();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-[#F2F7FF] to-white dark:from-[#0A1224] dark:to-black">
      {/* Glow blobs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity }}
        className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-blue-600/20 blur-3xl"
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 10, 0] }}
        transition={{ duration: 7, repeat: Infinity }}
        className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-sky-400/20 blur-3xl"
      />

      {/* Content container */}
      <div className="relative mx-auto flex max-w-6xl flex-col items-center px-6 py-10 md:py-16">
        {/* Hero */}
        <main className="mt-14 w-full md:mt-24">
          {/* Brand badge */}
          <div className="relative">
            <div className="mx-auto -mt-6 mb-10 w-fit rounded-[2rem] border border-white/40 bg-white/80 px-4 py-2 shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-white/10">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-gradient-to-br from-blue-600 to-sky-400 p-[2px]">
                  <div className="rounded-full bg-white p-[2px]">
                    <img src="https://scontent.fzyl2-2.fna.fbcdn.net/v/t39.30808-6/503559310_122104114418891884_5081715316251962298_n.jpg?_nc_cat=110&ccb=1-7&_nc_sid=a5f93a&_nc_eui2=AeHzK3LxXt5xweYFUm3MJxhuDUA1aZVD0zgNQDVplUPTOEoQivH1YH2oWbcNUREKoIpvD1bio8B7hFtRYLaErsHu&_nc_ohc=HnUBHdyiHCUQ7kNvwGdk75j&_nc_oc=AdkNOIyPbRNMSr2crkYtIeuCpoQqhFpXHFDDDCHehhXgEjcsxj_vSYbEM_LieqQ7ECk&_nc_zt=23&_nc_ht=scontent.fzyl2-2.fna&_nc_gid=VMGVfEnr5Z6yjrvFqRak4Q&oh=00_AfUPMMlmdXgh5hIQ7PGpHKLkrJH0WmT0Ya-05Ic1mM_uRQ&oe=68B65BC0" alt="logo" className="h-8 w-8 rounded-full object-cover" />
                  </div>
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-xs font-extrabold tracking-widest text-slate-800 dark:text-white/90">{BRAND.name}</span>
                  <span className="text-[8.2px] leading-none tracking-wide text-slate-500 dark:text-white/70">{BRAND.tagline}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Centered hero like the reference */}
          <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-5 text-center">
            <FloatingImage src="https://cdn3d.iconscout.com/3d/premium/thumb/thumbs-up-hand-gesture-3d-icon-png-download-2764517.png" alt="Thumbs up 3D" className="h-20 md:h-24" />
            <div className="text-[11px] font-semibold tracking-widest text-slate-500">WE'RE STILL</div>
            <h2 className="text-5xl md:text-7xl font-extrabold leading-tight">
              <span className="bg-gradient-to-b from-blue-600 to-sky-400 bg-clip-text text-transparent">Cooking Our Website.</span>
            </h2>
            <p className="max-w-xl text-base text-slate-600 dark:text-slate-300">
              We are going to launch our website very soon. Stay tuned.
            </p>

            {/* Notify pill form */}
            <form onSubmit={onNotify} className="mt-2 w-full max-w-xl">
              <div className="rounded-full p-[2px] bg-gradient-to-r from-blue-600/40 via-sky-400/40 to-blue-600/40">
                <div className="flex items-center rounded-full bg-[#0D1323] text-white ring-1 ring-black/5 px-3 py-3 focus-within:ring-2 focus-within:ring-blue-500/30">
                  <div className="mr-2 grid h-10 w-10 place-items-center rounded-full bg-white/10 border border-white/10 backdrop-blur">
                    <Mail className="h-4 w-4" />
                  </div>
                  <Input
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email address"
                    className="mx-1 flex-1 h-11 border-0 rounded-[14px] bg-white/90 text-slate-900 placeholder:text-slate-500 px-4 focus:ring-2 focus:ring-blue-500/30"
                  />
                  <Button type="submit" disabled={disabled || loading} aria-label="Notify me" className="group ml-2 flex items-center gap-2 rounded-[16px] bg-white px-5 py-3 text-slate-900 hover:bg-slate-100 shadow transition-transform active:scale-[0.98]">
                    {loading ? "Sending..." : "Notify Me"}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
              </div>
            </form>
            {msg && (
              <p className={`text-sm ${isError ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}>{msg}</p>
            )}

            {/* Decorative 3D shapes */}
            <div className="pointer-events-none absolute -left-24 bottom-12 hidden md:block -rotate-12">
              <FloatingImage src="https://cdn3d.iconscout.com/3d/premium/thumb/hald-pipe-shape-3d-icon-png-download-12195146.png" alt="3D half-pipe shape" className="h-24 w-24" />
            </div>
            <div className="pointer-events-none absolute -right-24 bottom-6 hidden md:block rotate-12">
              <FloatingImage src="https://cdn3d.iconscout.com/3d/premium/thumb/patterned-sphere-2-3d-icon-png-download-8599660.png" alt="Patterned sphere 3D" className="h-24 w-24" />
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="mt-16 w-full border-t pt-8">
          <div className="flex flex-col items-center gap-6 text-sm md:flex-row md:justify-between">
            <div className="flex items-center gap-3 opacity-80">
              {activeSocials.map(({ href, Icon, label }) => (
                <a key={label} href={href} aria-label={label} target="_blank" rel="noopener noreferrer" className="grid h-9 w-9 place-items-center rounded-full bg-white/70 shadow hover:bg-white">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
            <div className="flex flex-col items-center gap-1 md:items-end text-slate-700 dark:text-slate-300">
              <a href="mailto:hello@nttechinnovation.com" className="inline-flex items-center gap-2 hover:underline">
                <Mail className="h-4 w-4" /> hello@nttechinnovation.com
              </a>
              <div className="inline-flex items-start gap-2 max-w-md text-center md:text-right">
                <MapPin className="h-4 w-4 mt-0.5" />
                <span>Level 7D, Silicon Tower, Hi-Tech Park, Rajshahi, Bangladesh.</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
