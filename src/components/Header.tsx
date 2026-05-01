import { Newspaper, Sparkles, AlertTriangle, CheckCircle2, HelpCircle, Clock, History as HistoryIcon } from "lucide-react";
import { Link } from "react-router-dom";

interface HeaderProps {
  contentCount: number;
  creditStatus: "unknown" | "ok" | "rate_limited" | "exhausted";
}

const Header = ({ contentCount, creditStatus }: HeaderProps) => {
  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const creditMeta = {
    unknown: {
      icon: HelpCircle,
      label: "Kredit AI: belum dicek",
      hint: "Generate sekali untuk cek status",
      cls: "bg-muted text-muted-foreground border-border",
    },
    ok: {
      icon: CheckCircle2,
      label: "Kredit AI: tersedia",
      hint: "Siap generate",
      cls: "bg-green-500/10 text-green-700 border-green-500/30 dark:text-green-400",
    },
    rate_limited: {
      icon: Clock,
      label: "Rate limit tercapai",
      hint: "Tunggu beberapa detik",
      cls: "bg-amber-500/10 text-amber-700 border-amber-500/30 dark:text-amber-400",
    },
    exhausted: {
      icon: AlertTriangle,
      label: "Kredit AI HABIS — top up sekarang",
      hint: "Settings → Workspace → Plans & Credits",
      cls: "bg-destructive/10 text-destructive border-destructive/40",
    },
  }[creditStatus] ?? {
    icon: HelpCircle,
    label: "Kredit AI: belum dicek",
    hint: "",
    cls: "bg-muted text-muted-foreground border-border",
  };

  const Icon = creditMeta.icon;

  return (
    <header className="mb-6 md:mb-8">
      <div className="text-center py-4 border-b border-foreground/10">
        <p className="text-xs text-muted-foreground tracking-widest uppercase mb-2">{today}</p>
        <div className="newspaper-divider mb-3" />
        <div className="flex items-center justify-center gap-3">
          <Newspaper className="w-8 h-8 text-primary" />
          <h1 className="font-serif-display text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            FB Content <span className="text-primary">AI Pro</span>
          </h1>
          <span className="px-2 py-0.5 text-[10px] font-bold bg-primary text-primary-foreground rounded uppercase tracking-wider">
            PRO
          </span>
        </div>
        <p className="text-sm text-muted-foreground mt-1 italic">
          Kreator Konten Visual Premium — Kepolisian Republik Indonesia
        </p>
        <div className="newspaper-divider mt-3" />
      </div>

      <div className="flex flex-col sm:flex-row justify-center items-center gap-3 mt-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="w-4 h-4 text-accent" />
          <span>Konten dibuat: <strong className="text-foreground">{contentCount}</strong></span>
        </div>

        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium ${creditMeta.cls}`}>
          <Icon className="w-3.5 h-3.5" />
          <span>{creditMeta.label}</span>
          <span className="opacity-70 hidden sm:inline">· {creditMeta.hint}</span>
        </div>

        <Link
          to="/history"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border text-xs font-medium hover:bg-muted transition"
        >
          <HistoryIcon className="w-3.5 h-3.5" />
          Riwayat AI
        </Link>
      </div>
    </header>
  );
};

export default Header;
