import { Shield, Sparkles } from "lucide-react";

interface HeaderProps {
  contentCount: number;
}

const Header = ({ contentCount }: HeaderProps) => {
  return (
    <header className="glass-strong rounded-2xl p-4 md:p-6 mb-6 md:mb-8">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center animate-pulse-glow">
              <Shield className="w-7 h-7 text-primary-foreground" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
                FB CONTENT <span className="gradient-text">AI PRO</span>
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-full uppercase tracking-wider">
                PRO
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Kreator Konten Visual Premium Polri</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="glass rounded-xl px-4 py-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Konten Dibuat</p>
              <p className="text-lg font-bold gradient-text leading-tight">{contentCount}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
