import { useEffect, useRef, useCallback } from "react";
import { Download, Eye, Loader2 } from "lucide-react";

interface CanvasPreviewProps {
  profilePhoto: string | null;
  profileName: string;
  profileJabatan: string;
  profileUnit: string;
  headerText: string;
  pesanUtama: string;
  pesanTambahan: string;
  poseStyle: string;
  generated: boolean;
  aiBackground: string | null;
  isLoadingAI: boolean;
}

const W = 1080;
const H = 1350;

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, lineHeight: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

const CanvasPreview = ({
  profilePhoto, profileName, profileJabatan, profileUnit,
  headerText, pesanUtama, pesanTambahan, poseStyle, generated,
  aiBackground, isLoadingAI
}: CanvasPreviewProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawCanvas = useCallback((bgImg?: HTMLImageElement, profileImg?: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, W, H);

    // === AI POSTER as FULL background (orang + scene sudah menyatu dari AI) ===
    if (profileImg) {
      const scale = Math.max(W / profileImg.width, H / profileImg.height);
      const bw = profileImg.width * scale;
      const bh = profileImg.height * scale;
      ctx.drawImage(profileImg, (W - bw) / 2, (H - bh) / 2, bw, bh);
    } else if (bgImg) {
      const scale = Math.max(W / bgImg.width, H / bgImg.height);
      const bw = bgImg.width * scale;
      const bh = bgImg.height * scale;
      ctx.drawImage(bgImg, (W - bw) / 2, (H - bh) / 2, bw, bh);
    } else {
      const bgGrad = ctx.createLinearGradient(0, 0, W, H);
      bgGrad.addColorStop(0, "#1a1a2e");
      bgGrad.addColorStop(0.5, "#16213e");
      bgGrad.addColorStop(1, "#0f3460");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);
    }

    // Subtle left-side darken for text legibility (poster sudah ada gradasi dari AI)
    const leftBlend = ctx.createLinearGradient(0, 0, W * 0.6, 0);
    leftBlend.addColorStop(0, "rgba(0,0,0,0.45)");
    leftBlend.addColorStop(0.7, "rgba(0,0,0,0.15)");
    leftBlend.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = leftBlend;
    ctx.fillRect(0, 0, W, H);

    // Top gradient for header readability
    const topGrad = ctx.createLinearGradient(0, 0, 0, 350);
    topGrad.addColorStop(0, "rgba(0,0,0,0.65)");
    topGrad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = topGrad;
    ctx.fillRect(0, 0, W, 350);

    // Bottom gradient for name area
    const botGrad = ctx.createLinearGradient(0, H - 350, 0, H);
    botGrad.addColorStop(0, "rgba(0,0,0,0)");
    botGrad.addColorStop(0.5, "rgba(0,0,0,0.7)");
    botGrad.addColorStop(1, "rgba(0,0,0,0.95)");
    ctx.fillStyle = botGrad;
    ctx.fillRect(0, H - 350, W, 350);

    // === HEADER TEXT (top, centered — di ATAS subjek, area aman besar) ===
    // Header dibatasi MAX 2 baris dengan font lebih kecil agar tidak menabrak wajah
    if (headerText) {
      ctx.textAlign = "center";
      ctx.font = "900 60px 'Arial Black', Impact, sans-serif";
      ctx.shadowColor = "rgba(0,0,0,0.9)";
      ctx.shadowBlur = 14;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 3;

      const maxW = W * 0.9;
      let headerLines = wrapText(ctx, headerText.toUpperCase(), maxW, 68);
      // Batasi maksimal 2 baris — sisanya dipotong dengan "…"
      if (headerLines.length > 2) {
        headerLines = [headerLines[0], headerLines.slice(1).join(" ")];
        // Truncate baris ke-2 jika terlalu panjang
        while (ctx.measureText(headerLines[1]).width > maxW && headerLines[1].length > 0) {
          headerLines[1] = headerLines[1].slice(0, -2) + "…";
        }
      }
      const startY = 90;
      headerLines.forEach((line, i) => {
        ctx.fillStyle = i === headerLines.length - 1 && headerLines.length > 1 ? "#f5c518" : "#ffffff";
        ctx.fillText(line, W / 2, startY + i * 68);
      });
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    }

    // Hitung tinggi header aktual (max 2 baris @ 68px)
    const headerHeight = headerText ? Math.min(2, wrapText(ctx, headerText.toUpperCase(), W * 0.9, 68).length) * 68 : 0;

    // === PESAN UTAMA (kiri, kecil, italic — di area aman kiri) ===
    if (pesanUtama) {
      ctx.textAlign = "left";
      ctx.font = "italic 22px Arial, sans-serif";
      ctx.shadowColor = "rgba(0,0,0,0.9)";
      ctx.shadowBlur = 6;

      const maxW = W * 0.42;
      const msgLines = wrapText(ctx, `"${pesanUtama}"`, maxW, 30);
      const startY = 90 + headerHeight + 40;
      msgLines.forEach((line, i) => {
        ctx.fillStyle = "#f0f0f0";
        ctx.fillText(line, 50, startY + i * 30);
      });

      ctx.shadowBlur = 0;
    }

    // === PESAN TAMBAHAN (kiri, di bawah pesan utama) ===
    if (pesanTambahan) {
      ctx.textAlign = "left";
      ctx.font = "bold 26px Arial, sans-serif";
      ctx.fillStyle = "#f5c518";
      ctx.shadowColor = "rgba(0,0,0,0.9)";
      ctx.shadowBlur = 6;

      const maxW = W * 0.45;
      const lines = wrapText(ctx, pesanTambahan, maxW, 34);
      const pesanOffset = pesanUtama ? wrapText(ctx, `"${pesanUtama}"`, W * 0.42, 30).length * 30 + 30 : 0;
      const startY = 90 + headerHeight + 40 + pesanOffset + 20;
      lines.forEach((line, i) => {
        ctx.fillText(line, 50, startY + i * 34);
      });

      ctx.shadowBlur = 0;
    }

    // === BOTTOM: Name, Rank, Unit (centered) ===
    if (profileName || profileJabatan || profileUnit) {
      // Gold divider line
      ctx.strokeStyle = "#f5c518";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(W / 2 - 120, H - 200);
      ctx.lineTo(W / 2 + 120, H - 200);
      ctx.stroke();

      if (profileName) {
        ctx.textAlign = "center";
        ctx.font = "900 42px 'Arial Black', Impact, sans-serif";
        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = "rgba(0,0,0,0.8)";
        ctx.shadowBlur = 6;
        ctx.fillText(profileName.toUpperCase(), W / 2, H - 140);
        ctx.shadowBlur = 0;
      }

      if (profileJabatan || profileUnit) {
        ctx.textAlign = "center";
        ctx.font = "500 22px Arial, sans-serif";
        ctx.fillStyle = "#e0e0e0";
        const subtitle = [profileJabatan, profileUnit].filter(Boolean).join(" — ");
        ctx.fillText(subtitle, W / 2, H - 100);
      }
    }

  }, [headerText, pesanUtama, pesanTambahan, profileName, profileJabatan, profileUnit]);

  useEffect(() => {
    if (!generated) return;
    const loadAndDraw = async () => {
      let bgImg: HTMLImageElement | undefined;
      let profileImg: HTMLImageElement | undefined;
      if (aiBackground) bgImg = await loadImage(aiBackground);
      if (profilePhoto) profileImg = await loadImage(profilePhoto);
      drawCanvas(bgImg, profileImg);
    };
    loadAndDraw();
  }, [generated, aiBackground, drawCanvas, profilePhoto]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `polri-content-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="newspaper-card rounded-xl p-6 space-y-4">
      <h2 className="font-serif-display text-lg font-bold text-foreground flex items-center gap-2 border-b border-border pb-3">
        <Eye className="w-5 h-5 text-primary" />
        Preview Konten
      </h2>

      <div className="relative rounded-lg overflow-hidden border border-border bg-muted/30">
        <canvas ref={canvasRef} width={W} height={H} className="w-full h-auto" />
        {!generated && !isLoadingAI && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/70 gap-2">
            <p className="text-muted-foreground text-sm italic">Upload foto profil, isi tema, pilih gaya</p>
            <p className="text-muted-foreground text-sm italic">lalu klik "Generate Konten AI"</p>
          </div>
        )}
        {isLoadingAI && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 gap-3">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-sm text-primary font-medium">AI sedang membuat konten...</p>
            <p className="text-xs text-muted-foreground">Membuat teks + background (15-40 detik)</p>
          </div>
        )}
      </div>

      {generated && (
        <button onClick={handleDownload}
          className="w-full py-3 rounded-lg font-semibold text-sm bg-secondary text-secondary-foreground hover:opacity-90 transition-all flex items-center justify-center gap-2">
          <Download className="w-4 h-4" />
          Download HD (PNG)
        </button>
      )}
    </div>
  );
};

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export default CanvasPreview;
