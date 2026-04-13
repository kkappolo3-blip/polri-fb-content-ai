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

    ctx.clearRect(0, 0, W, H);

    // Background
    if (bgImg) {
      const scale = Math.max(W / bgImg.width, H / bgImg.height);
      const bw = bgImg.width * scale;
      const bh = bgImg.height * scale;
      ctx.drawImage(bgImg, (W - bw) / 2, (H - bh) / 2, bw, bh);
    } else {
      const bgGrad = ctx.createLinearGradient(0, 0, W, H);
      bgGrad.addColorStop(0, "#1a365d");
      bgGrad.addColorStop(0.5, "#2d4a7a");
      bgGrad.addColorStop(1, "#1a365d");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);
    }

    // Overlays
    const leftW = W * 0.45;
    const leftGrad = ctx.createLinearGradient(0, 0, leftW + 80, 0);
    leftGrad.addColorStop(0, "rgba(0,0,0,0.5)");
    leftGrad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = leftGrad;
    ctx.fillRect(0, 0, leftW + 80, H);

    const rightGrad = ctx.createLinearGradient(leftW - 40, 0, W, 0);
    rightGrad.addColorStop(0, "rgba(0,0,0,0)");
    rightGrad.addColorStop(0.3, "rgba(0,0,0,0.55)");
    rightGrad.addColorStop(1, "rgba(0,0,0,0.7)");
    ctx.fillStyle = rightGrad;
    ctx.fillRect(leftW - 40, 0, W - leftW + 40, H);

    const topGrad = ctx.createLinearGradient(0, 0, 0, 180);
    topGrad.addColorStop(0, "rgba(0,0,0,0.6)");
    topGrad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = topGrad;
    ctx.fillRect(0, 0, W, 180);

    const botGrad = ctx.createLinearGradient(0, H - 200, 0, H);
    botGrad.addColorStop(0, "rgba(0,0,0,0)");
    botGrad.addColorStop(1, "rgba(0,0,0,0.7)");
    ctx.fillStyle = botGrad;
    ctx.fillRect(0, H - 200, W, 200);

    // Corner accents
    ctx.strokeStyle = "#c9a84c";
    ctx.lineWidth = 3;
    const cs = 40, m = 25;
    ctx.beginPath(); ctx.moveTo(m, m + cs); ctx.lineTo(m, m); ctx.lineTo(m + cs, m); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(W - m - cs, m); ctx.lineTo(W - m, m); ctx.lineTo(W - m, m + cs); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(m, H - m - cs); ctx.lineTo(m, H - m); ctx.lineTo(m + cs, H - m); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(W - m - cs, H - m); ctx.lineTo(W - m, H - m); ctx.lineTo(W - m, H - m - cs); ctx.stroke();

    // LEFT: Profile Photo
    if (profileImg) {
      const photoSize = 300;
      const cx = leftW / 2;
      const cy = H / 2 - 40;

      ctx.save();
      ctx.shadowColor = "rgba(201, 168, 76, 0.5)";
      ctx.shadowBlur = 30;
      ctx.beginPath();
      ctx.arc(cx, cy, photoSize / 2 + 6, 0, Math.PI * 2);
      ctx.strokeStyle = "#c9a84c";
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, photoSize / 2, 0, Math.PI * 2);
      ctx.clip();
      const s = Math.min(profileImg.width, profileImg.height);
      const sx = (profileImg.width - s) / 2;
      const sy = (profileImg.height - s) / 2;
      ctx.drawImage(profileImg, sx, sy, s, s, cx - photoSize / 2, cy - photoSize / 2, photoSize, photoSize);
      ctx.restore();

      if (profileName) {
        ctx.font = "bold 26px Inter, sans-serif";
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.fillText(profileName, cx, cy + photoSize / 2 + 45);
      }
      if (profileJabatan) {
        ctx.font = "500 20px Inter, sans-serif";
        ctx.fillStyle = "#c9a84c";
        ctx.textAlign = "center";
        ctx.fillText(profileJabatan, cx, cy + photoSize / 2 + 75);
      }
      if (profileUnit) {
        ctx.font = "400 17px Inter, sans-serif";
        ctx.fillStyle = "#b0bec5";
        ctx.textAlign = "center";
        ctx.fillText(profileUnit, cx, cy + photoSize / 2 + 100);
      }
    } else {
      const cx = leftW / 2;
      const cy = H / 2;
      ctx.beginPath();
      ctx.arc(cx, cy, 110, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.05)";
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.15)";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.font = "72px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("👤", cx, cy);
    }

    // RIGHT: Text Content
    const textX = leftW + 50;
    const textMaxW = W - textX - 50;

    if (headerText) {
      ctx.font = "bold 52px Inter, sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "left";
      const headerLines = wrapText(ctx, headerText.toUpperCase(), textMaxW);
      headerLines.forEach((line, i) => {
        ctx.fillText(line, textX, 310 + i * 66);
      });
      const headerBottom = 310 + headerLines.length * 66 + 8;
      ctx.fillStyle = "#c9a84c";
      ctx.fillRect(textX, headerBottom, 70, 3);
    }

    if (pesanUtama) {
      ctx.font = "500 28px Inter, sans-serif";
      ctx.fillStyle = "#e0c97f";
      ctx.textAlign = "left";
      const msgLines = wrapText(ctx, pesanUtama, textMaxW);
      msgLines.forEach((line, i) => {
        ctx.fillText(line, textX, 550 + i * 40);
      });
    }

    if (pesanTambahan) {
      ctx.font = "400 20px Inter, sans-serif";
      ctx.fillStyle = "#b0bec5";
      ctx.textAlign = "left";
      ctx.fillText(pesanTambahan, textX, 800);
    }

    // POLRI Badge
    const badgeY = H - 90;
    ctx.fillStyle = "#c9a84c";
    roundRect(ctx, W / 2 - 85, badgeY, 170, 40, 20);
    ctx.fill();
    ctx.font = "bold 16px Inter, sans-serif";
    ctx.fillStyle = "#1a365d";
    ctx.textAlign = "center";
    ctx.fillText("⭐ POLRI ⭐", W / 2, badgeY + 26);

  }, [profilePhoto, profileName, profileJabatan, profileUnit, headerText, pesanUtama, pesanTambahan, poseStyle]);

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
          <div className="absolute inset-0 flex items-center justify-center bg-background/70">
            <p className="text-muted-foreground text-sm italic">Klik "Generate" untuk membuat konten</p>
          </div>
        )}
        {isLoadingAI && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 gap-3">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-sm text-primary font-medium">AI sedang membuat gambar...</p>
            <p className="text-xs text-muted-foreground">Proses ini memakan waktu 10-30 detik</p>
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
