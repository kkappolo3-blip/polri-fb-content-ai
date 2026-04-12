import { useEffect, useRef, useCallback } from "react";
import { Download, Eye } from "lucide-react";

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
}

const W = 1080;
const H = 1440;

const POSE_COLORS: Record<string, { bg1: string; bg2: string }> = {
  melarang: { bg1: "#7f1d1d", bg2: "#1e1b4b" },
  humanis: { bg1: "#1e3a5f", bg2: "#0f172a" },
  religius: { bg1: "#14532d", bg2: "#1e1b4b" },
  himbauan: { bg1: "#78350f", bg2: "#0f172a" },
};

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

const CanvasPreview = ({
  profilePhoto, profileName, profileJabatan, profileUnit,
  headerText, pesanUtama, pesanTambahan, poseStyle, generated
}: CanvasPreviewProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const colors = POSE_COLORS[poseStyle] || POSE_COLORS.melarang;

    // Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, W, H);
    bgGrad.addColorStop(0, "#0f172a");
    bgGrad.addColorStop(0.3, colors.bg1);
    bgGrad.addColorStop(0.7, colors.bg2);
    bgGrad.addColorStop(1, "#0f172a");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Decorative geometric elements
    ctx.globalAlpha = 0.06;
    ctx.strokeStyle = "#f59e0b";
    ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.arc(W / 2, H / 2, 200 + i * 80, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Top dark overlay gradient
    const topGrad = ctx.createLinearGradient(0, 0, 0, 400);
    topGrad.addColorStop(0, "rgba(0,0,0,0.7)");
    topGrad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = topGrad;
    ctx.fillRect(0, 0, W, 400);

    // Bottom dark overlay gradient
    const botGrad = ctx.createLinearGradient(0, H - 500, 0, H);
    botGrad.addColorStop(0, "rgba(0,0,0,0)");
    botGrad.addColorStop(1, "rgba(0,0,0,0.8)");
    ctx.fillStyle = botGrad;
    ctx.fillRect(0, H - 500, W, 500);

    // Corner accents
    const cornerSize = 60;
    ctx.strokeStyle = "#f59e0b";
    ctx.lineWidth = 3;
    // Top-left
    ctx.beginPath();
    ctx.moveTo(40, 40 + cornerSize); ctx.lineTo(40, 40); ctx.lineTo(40 + cornerSize, 40);
    ctx.stroke();
    // Top-right
    ctx.beginPath();
    ctx.moveTo(W - 40 - cornerSize, 40); ctx.lineTo(W - 40, 40); ctx.lineTo(W - 40, 40 + cornerSize);
    ctx.stroke();
    // Bottom-left
    ctx.beginPath();
    ctx.moveTo(40, H - 40 - cornerSize); ctx.lineTo(40, H - 40); ctx.lineTo(40 + cornerSize, H - 40);
    ctx.stroke();
    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(W - 40 - cornerSize, H - 40); ctx.lineTo(W - 40, H - 40); ctx.lineTo(W - 40, H - 40 - cornerSize);
    ctx.stroke();

    // Header text
    if (headerText) {
      ctx.font = "bold 64px Poppins, sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      const headerLines = wrapText(ctx, headerText.toUpperCase(), W - 160);
      headerLines.forEach((line, i) => {
        ctx.fillText(line, W / 2, 140 + i * 78);
      });
    }

    // Profile photo (centered)
    const drawProfile = (img?: HTMLImageElement) => {
      const photoSize = 280;
      const cx = W / 2;
      const cy = H / 2 - 60;

      // Glow ring
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, photoSize / 2 + 12, 0, Math.PI * 2);
      ctx.strokeStyle = "#f59e0b";
      ctx.lineWidth = 4;
      ctx.shadowColor = "#f59e0b";
      ctx.shadowBlur = 30;
      ctx.stroke();
      ctx.restore();

      // Clip circle & draw image
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, photoSize / 2, 0, Math.PI * 2);
      ctx.clip();
      if (img) {
        const s = Math.min(img.width, img.height);
        const sx = (img.width - s) / 2;
        const sy = (img.height - s) / 2;
        ctx.drawImage(img, sx, sy, s, s, cx - photoSize / 2, cy - photoSize / 2, photoSize, photoSize);
      } else {
        ctx.fillStyle = "#1e293b";
        ctx.fillRect(cx - photoSize / 2, cy - photoSize / 2, photoSize, photoSize);
        ctx.font = "bold 80px Poppins, sans-serif";
        ctx.fillStyle = "#475569";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("👤", cx, cy);
      }
      ctx.restore();
    };

    // Pesan utama (amber/gold)
    const msgY = H / 2 + 200;
    if (pesanUtama) {
      ctx.font = "600 32px Poppins, sans-serif";
      ctx.fillStyle = "#fbbf24";
      ctx.textAlign = "center";
      const msgLines = wrapText(ctx, pesanUtama, W - 160);
      msgLines.forEach((line, i) => {
        ctx.fillText(line, W / 2, msgY + i * 44);
      });
    }

    // Pesan tambahan
    if (pesanTambahan) {
      ctx.font = "400 24px Poppins, sans-serif";
      ctx.fillStyle = "#94a3b8";
      ctx.textAlign = "center";
      ctx.fillText(pesanTambahan, W / 2, msgY + 160);
    }

    // POLRI badge
    const badgeY = H - 200;
    ctx.fillStyle = "#f59e0b";
    const badgeW = 160;
    const badgeH = 40;
    const badgeX = W / 2 - badgeW / 2;
    roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 20);
    ctx.fill();
    ctx.font = "bold 18px Poppins, sans-serif";
    ctx.fillStyle = "#0f172a";
    ctx.textAlign = "center";
    ctx.fillText("⭐ POLRI ⭐", W / 2, badgeY + 27);

    // Name and jabatan
    if (profileName) {
      ctx.font = "bold 28px Poppins, sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.fillText(profileName, W / 2, H - 130);
    }
    if (profileJabatan || profileUnit) {
      ctx.font = "400 20px Poppins, sans-serif";
      ctx.fillStyle = "#94a3b8";
      ctx.textAlign = "center";
      const sub = [profileJabatan, profileUnit].filter(Boolean).join(" • ");
      ctx.fillText(sub, W / 2, H - 95);
    }

    // Load and draw profile photo
    if (profilePhoto) {
      const img = new Image();
      img.onload = () => drawProfile(img);
      img.src = profilePhoto;
    } else {
      drawProfile();
    }
  }, [profilePhoto, profileName, profileJabatan, profileUnit, headerText, pesanUtama, pesanTambahan, poseStyle]);

  useEffect(() => {
    if (generated) drawCanvas();
  }, [generated, drawCanvas]);

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
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="w-full h-auto"
        />
        {!generated && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm">
            <p className="text-muted-foreground text-sm">Klik "Generate" untuk membuat konten</p>
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

export default CanvasPreview;
