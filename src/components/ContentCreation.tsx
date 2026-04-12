import { useState } from "react";
import { Wand2 } from "lucide-react";

const POSE_STYLES = [
  { id: "melarang", emoji: "🚫", label: "Melarang", desc: "Heroic Stop" },
  { id: "humanis", emoji: "🤝", label: "Humanis", desc: "Friendly Greeting" },
  { id: "religius", emoji: "🕌", label: "Religius", desc: "Religious Gesture" },
  { id: "himbauan", emoji: "💡", label: "Himbauan", desc: "Wise Advice" },
];

export interface ContentData {
  tema: string;
  caption: string;
  poseStyle: string;
  headerText: string;
  pesanUtama: string;
  pesanTambahan: string;
}

interface ContentCreationProps {
  content: ContentData;
  onContentChange: (c: ContentData) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

const StepBadge = ({ n, active }: { n: number; active: boolean }) => (
  <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold mr-2 transition-all ${active ? 'bg-gradient-to-r from-primary to-accent text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
    {n}
  </span>
);

const ContentCreation = ({ content, onContentChange, onGenerate, isGenerating }: ContentCreationProps) => {
  const [activeStep, setActiveStep] = useState(1);
  const set = (key: keyof ContentData, val: string) => onContentChange({ ...content, [key]: val });

  return (
    <div className="glass-strong rounded-3xl p-6 space-y-6">
      {/* Step 1 */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center cursor-pointer" onClick={() => setActiveStep(1)}>
          <StepBadge n={1} active={activeStep >= 1} />
          Tema & Gaya Konten
        </h3>
        {activeStep >= 1 && (
          <div className="space-y-4 pl-9">
            <input
              type="text"
              placeholder="Tema konten (mis: Anti Narkoba)"
              value={content.tema}
              onChange={(e) => set("tema", e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-input/50 border border-border/50 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
            <textarea
              placeholder="Caption Facebook..."
              value={content.caption}
              onChange={(e) => set("caption", e.target.value)}
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl bg-input/50 border border-border/50 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
            />
            <div className="grid grid-cols-2 gap-3">
              {POSE_STYLES.map((pose) => (
                <button
                  key={pose.id}
                  onClick={() => { set("poseStyle", pose.id); setActiveStep(2); }}
                  className={`group relative rounded-2xl p-4 text-left transition-all duration-300 border ${
                    content.poseStyle === pose.id
                      ? "border-primary/60 glow-amber bg-primary/10"
                      : "border-border/40 hover:border-primary/30 bg-muted/30 hover:bg-muted/50"
                  }`}
                >
                  <span className="text-2xl block mb-1">{pose.emoji}</span>
                  <span className="text-sm font-semibold text-foreground block">{pose.label}</span>
                  <span className="text-[10px] text-muted-foreground">{pose.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Step 2 */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center cursor-pointer" onClick={() => setActiveStep(2)}>
          <StepBadge n={2} active={activeStep >= 2} />
          Teks Konten
        </h3>
        {activeStep >= 2 && (
          <div className="space-y-3 pl-9">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Header (Judul Besar)</label>
              <input
                type="text"
                placeholder="STOP NARKOBA!"
                value={content.headerText}
                onChange={(e) => set("headerText", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-input/50 border border-border/50 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Pesan Utama</label>
              <textarea
                placeholder="Narkoba merusak masa depan bangsa. Jauhi narkoba, jaga keluarga Anda."
                value={content.pesanUtama}
                onChange={(e) => set("pesanUtama", e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl bg-input/50 border border-border/50 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Pesan Tambahan (Opsional)</label>
              <input
                type="text"
                placeholder="Hubungi: 110"
                value={content.pesanTambahan}
                onChange={(e) => set("pesanTambahan", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-input/50 border border-border/50 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
          </div>
        )}
      </div>

      {/* Step 3 */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center">
          <StepBadge n={3} active={activeStep >= 2} />
          Generate Konten
        </h3>
        <div className="pl-9">
          <button
            onClick={() => { onGenerate(); setActiveStep(3); }}
            disabled={isGenerating || !content.headerText}
            className="w-full py-3.5 rounded-2xl font-semibold text-sm bg-gradient-to-r from-primary via-accent to-primary text-primary-foreground transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 animate-shimmer"
          >
            <Wand2 className="w-4 h-4" />
            {isGenerating ? "Generating..." : "✨ Generate Konten HD"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContentCreation;
