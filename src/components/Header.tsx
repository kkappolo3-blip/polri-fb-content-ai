import { Newspaper, Sparkles } from "lucide-react";

interface HeaderProps {
  contentCount: number;
}

const Header = ({ contentCount }: HeaderProps) => {
  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

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

      <div className="flex justify-center mt-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="w-4 h-4 text-accent" />
          <span>Konten dibuat: <strong className="text-foreground">{contentCount}</strong></span>
        </div>
      </div>
    </header>
  );
};

export default Header;
