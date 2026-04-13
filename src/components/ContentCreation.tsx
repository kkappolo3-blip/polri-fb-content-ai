import { useState } from "react";
import { Wand2, PenLine } from "lucide-react";

const POSE_STYLES = [
  { id: "melarang", emoji: "🚫", label: "Melarang", desc: "Tegas & Pencegahan" },
  { id: "humanis", emoji: "🤝", label: "Humanis", desc: "Hangat & Motivasi" },
  { id: "religius", emoji: "🕌", label: "Religius", desc: "Bijak & Spiritual" },
  { id: "himbauan", emoji: "💡", label: "Himbauan", desc: "Edukatif & Persuasif" },
];

export interface ContentData {
  tema: string;
  poseStyle: string;
}

interface ContentCreationProps {
  content: ContentData;
  onContentChange: (c: ContentData) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

const ContentCreation = ({ content, onContentChange, onGenerate, isGenerating }: ContentCreationProps) => {
  const set = (key: keyof ContentData, val: string) => onContentChange({ ...content, [key]: val });

  const inputClass =
    "w-full px-4 py-2.5 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all";

  return (
    <div className="newspaper-card rounded-xl p-6 space-y-6">
      <h2 className="font-serif-display text-lg font-bold text-foreground flex items-center gap-2 border-b border-border pb-3">
        <PenLine className="w-5 h-5 text-primary" />
        Buat Konten
      </h2>

      {/* Tema */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-foreground block">📝 Tema Konten</label>
        <input type="text" placeholder="Contoh: Anti Narkoba, Mudik Aman, Jaga Keluarga..."
          value={content.tema} onChange={(e) => set("tema", e.target.value)}
          className={inputClass} />
        <p className="text-xs text-muted-foreground italic">AI akan membuat teks konten berdasarkan tema ini</p>
      </div>

      {/* Gaya */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-foreground block">🎨 Gaya Konten</label>
        <div className="grid grid-cols-2 gap-3">
          {POSE_STYLES.map((pose) => (
            <button key={pose.id}
              onClick={() => set("poseStyle", pose.id)}
              className={`rounded-lg p-3 text-left transition-all border ${
                content.poseStyle === pose.id
                  ? "border-primary bg-primary/10 shadow-sm"
                  : "border-border hover:border-primary/30 bg-background"
              }`}>
              <span className="text-xl block mb-1">{pose.emoji}</span>
              <span className="text-sm font-semibold text-foreground block">{pose.label}</span>
              <span className="text-[10px] text-muted-foreground">{pose.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Generate */}
      <button onClick={onGenerate}
        disabled={isGenerating || !content.tema}
        className="w-full py-3.5 rounded-lg font-semibold text-sm bg-primary text-primary-foreground transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
        <Wand2 className="w-4 h-4" />
        {isGenerating ? "AI sedang bekerja..." : "✨ Generate Konten AI"}
      </button>
      {!content.tema && (
        <p className="text-xs text-center text-muted-foreground">Masukkan tema terlebih dahulu</p>
      )}
    </div>
  );
};

export default ContentCreation;
