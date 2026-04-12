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
const H = 1440;

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
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

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
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

    // Clear
    ctx.clearRect(0, 0, W, H);

    // Background
    if (bgImg) {
      // Draw AI background covering full canvas
      const scale = Math.max(W / bgImg.width, H / bgImg.height);
      const bw = bgImg.width * scale;
      const bh = bgImg.height * scale;
      ctx.drawImage(bgImg, (W - bw) / 2, (H - bh) / 2, bw, bh);
    } else {
      // Fallback gradient
      const bgGrad = ctx.createLinearGradient(0, 0, W, H);
      bgGrad.addColorStop(0, "#0f172a");
      bgGrad.addColorStop(0.5, "#1e3a5f");
      bgGrad.addColorStop(1, "#0f172a");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);
    }

    // === SPLIT LAYOUT: Photo LEFT, Text RIGHT ===

    // Dark overlay on left side for photo area
    const leftW = W * 0.45;
    const leftGrad = ctx.createLinearGradient(0, 0, leftW + 80, 0);
    leftGrad.addColorStop(0, "rgba(0,0,0,0.6)");
    leftGrad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = leftGrad;
    ctx.fillRect(0, 0, leftW + 80, H);

    // Dark overlay on right side for text
    const rightGrad = ctx.createLinearGradient(leftW - 40, 0, W, 0);
    rightGrad.addColorStop(0, "rgba(0,0,0,0)");
    rightGrad.addColorStop(0.3, "rgba(0,0,0,0.65)");
    rightGrad.addColorStop(1, "rgba(0,0,0,0.8)");
    ctx.fillStyle = rightGrad;
    ctx.fillRect(leftW - 40, 0, W - leftW + 40, H);

    // Top gradient overlay
    const topGrad = ctx.createLinearGradient(0, 0, 0, 200);
    topGrad.addColorStop(0, "rgba(0,0,0,0.7)");
    topGrad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = topGrad;
    ctx.fillRect(0, 0, W, 200);

    // Bottom gradient overlay
    const botGrad = ctx.createLinearGradient(0, H - 250, 0, H);
    botGrad.addColorStop(0, "rgba(0,0,0,0)");
    botGrad.addColorStop(1, "rgba(0,0,0,0.8)");
    ctx.fillStyle = botGrad;
    ctx.fillRect(0, H - 250, W, 250);

    // Corner accents (amber)
    ctx.strokeStyle = "#f59e0b";
    ctx.lineWidth = 3;
    const cs = 50;
    const m = 30;
    // TL
    ctx.beginPath(); ctx.moveTo(m, m + cs); ctx.lineTo(m, m); ctx.lineTo(m + cs, m); ctx.stroke();
    // TR
    ctx.beginPath(); ctx.moveTo(W - m - cs, m); ctx.lineTo(W - m, m); ctx.lineTo(W - m, m + cs); ctx.stroke();
    // BL
    ctx.beginPath(); ctx.moveTo(m, H - m - cs); ctx.lineTo(m, H - m); ctx.lineTo(m + cs, H - m); ctx.stroke();
    // BR
    ctx.beginPath(); ctx.moveTo(W - m - cs, H - m); ctx.lineTo(W - m, H - m); ctx.lineTo(W - m, H - m - cs); ctx.stroke();

    // === LEFT SIDE: Profile Photo ===
    if (profileImg) {
      const photoSize = 320;
      const cx = leftW / 2;
      const cy = H / 2 - 40;

      // Glow ring
      ctx.save();
      ctx.shadowColor = "#f59e0b";
      ctx.shadowBlur = 40;
      ctx.beginPath();
      ctx.arc(cx, cy, photoSize / 2 + 8, 0, Math.PI * 2);
      ctx.strokeStyle = "#f59e0b";
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.restore();

      // Outer ring
      ctx.beginPath();
      ctx.arc(cx, cy, photoSize / 2 + 4, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255,255,255,0.3)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Clip and draw photo
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, photoSize / 2, 0, Math.PI * 2);
      ctx.clip();
      const s = Math.min(profileImg.width, profileImg.height);
      const sx = (profileImg.width - s) / 2;
      const sy = (profileImg.height - s) / 2;
      ctx.drawImage(profileImg, sx, sy, s, s, cx - photoSize / 2, cy - photoSize / 2, photoSize, photoSize);
      ctx.restore();

      // Name below photo
      if (profileName) {
        ctx.font = "bold 28px Poppins, sans-serif";
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.fillText(profileName, cx, cy + photoSize / 2 + 50);
      }
      if (profileJabatan) {
        ctx.font = "500 20px Poppins, sans-serif";
        ctx.fillStyle = "#fbbf24";
        ctx.textAlign = "center";
        ctx.fillText(profileJabatan, cx, cy + photoSize / 2 + 82);
      }
      if (profileUnit) {
        ctx.font = "400 18px Poppins, sans-serif";
        ctx.fillStyle = "#94a3b8";
        ctx.textAlign = "center";
        ctx.fillText(profileUnit, cx, cy + photoSize / 2 + 110);
      }
    } else {
      // Placeholder
      const cx = leftW / 2;
      const cy = H / 2;
      ctx.beginPath();
      ctx.arc(cx, cy, 120, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.05)";
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.15)";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.font = "80px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("👤", cx, cy);
    }

    // === RIGHT SIDE: Text Content ===
    const textX = leftW + 60;
    const textMaxW = W - textX - 60;

    // Header text (white, bold, large)
    if (headerText) {
      ctx.font = "bold 56px Poppins, sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "left";
      const headerLines = wrapText(ctx, headerText.toUpperCase(), textMaxW);
      headerLines.forEach((line, i) => {
        ctx.fillText(line, textX, 320 + i * 70);
      });

      // Accent line under header
      const headerBottom = 320 + headerLines.length * 70 + 10;
      ctx.fillStyle = "#f59e0b";
      ctx.fillRect(textX, headerBottom, 80, 4);
    }

    // Pesan utama (amber/gold)
    if (pesanUtama) {
      const msgStartY = 560;
      ctx.font = "500 30px Poppins, sans-serif";
      ctx.fillStyle = "#fbbf24";
      ctx.textAlign = "left";
      const msgLines = wrapText(ctx, pesanUtama, textMaxW);
      msgLines.forEach((line, i) => {
        ctx.fillText(line, textX, msgStartY + i * 42);
      });
    }

    // Pesan tambahan
    if (pesanTambahan) {
      ctx.font = "400 22px Poppins, sans-serif";
      ctx.fillStyle = "#cbd5e1";
      ctx.textAlign = "left";
      ctx.fillText(pesanTambahan, textX, 820);
    }

    // === POLRI Badge bottom center ===
    const badgeY = H - 100;
    ctx.fillStyle = "#f59e0b";
    roundRect(ctx, W / 2 - 90, badgeY, 180, 44, 22);
    ctx.fill();
    ctx.font = "bold 18px Poppins, sans-serif";
    ctx.fillStyle = "#0f172a";
    ctx.textAlign = "center";
    ctx.fillText("⭐ POLRI ⭐", W / 2, badgeY + 29);

  }, [profilePhoto, profileName, profileJabatan, profileUnit, headerText, pesanUtama, pesanTambahan, poseStyle]);

  useEffect(() => {
    if (!generated) return;

    const loadAndDraw = async () => {
      let bgImg: HTMLImageElement | undefined;
      let profileImg: HTMLImageElement | undefined;

      if (aiBackground) {
        bgImg = await loadImage(aiBackground);
      }
      if (profilePhoto) {
        profileImg = await loadImage(profilePhoto);
      }
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
    <div className="glass-strong rounded-3xl p-6 space-y-4">
      <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
        <Eye className="w-5 h-5 text-primary" />
        Preview Konten
      </h2>

      <div className="relative rounded-2xl overflow-hidden border border-border/40 bg-muted/20">
        <canvas ref={canvasRef} width={W} height={H} className="w-full h-auto" />
        {!generated && !isLoadingAI && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm">
            <p className="text-muted-foreground text-sm">Klik "Generate" untuk membuat konten</p>
          </div>
        )}
        {isLoadingAI && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm gap-3">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-sm text-primary font-medium">AI sedang membuat gambar...</p>
            <p className="text-xs text-muted-foreground">Proses ini memakan waktu 10-30 detik</p>
          </div>
        )}
      </div>

      {generated && (
        <button
          onClick={handleDownload}
          className="w-full py-3 rounded-2xl font-semibold text-sm bg-gradient-to-r from-secondary to-secondary/80 text-secondary-foreground hover:shadow-lg hover:shadow-secondary/20 transition-all flex items-center justify-center gap-2"
        >
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
