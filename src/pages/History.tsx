import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, History as HistoryIcon, CheckCircle2, XCircle, AlertCircle, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { IMAGE_MODELS } from "@/components/ContentCreation";

interface UsageRow {
  id: string;
  model: string;
  status: string;
  prompt_preview: string | null;
  created_at: string;
}

const STATUS_META: Record<string, { label: string; icon: any; cls: string }> = {
  success: { label: "Sukses", icon: CheckCircle2, cls: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" },
  exhausted: { label: "Kredit habis", icon: XCircle, cls: "bg-destructive/10 text-destructive border-destructive/30" },
  rate_limited: { label: "Rate limit", icon: AlertCircle, cls: "bg-amber-500/10 text-amber-600 border-amber-500/30" },
  error: { label: "Error", icon: XCircle, cls: "bg-muted text-muted-foreground border-border" },
};

const modelLabel = (id: string) =>
  IMAGE_MODELS.find((m) => m.id === id)?.label ?? id;

const History = () => {
  const [rows, setRows] = useState<UsageRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("ai_usage_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) console.error(error);
      setRows((data as UsageRow[]) ?? []);
      setLoading(false);
    };
    load();
  }, []);

  const total = rows.length;
  const success = rows.filter((r) => r.status === "success").length;
  const failed = total - success;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-muted text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali
          </Link>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <HistoryIcon className="w-6 h-6 text-primary" /> Riwayat Penggunaan AI
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Total request</p>
          <p className="text-2xl font-bold">{total}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Sukses</p>
          <p className="text-2xl font-bold text-emerald-600">{success}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Gagal / habis</p>
          <p className="text-2xl font-bold text-destructive">{failed}</p>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mb-3">
        ℹ️ Lovable AI Gateway tidak mengirim biaya per request, jadi kolom "kredit terpakai" tidak ditampilkan. 1 baris = 1 percobaan generate.
      </p>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground flex items-center justify-center gap-2">
            <Clock className="w-4 h-4 animate-spin" /> Memuat...
          </div>
        ) : rows.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            Belum ada riwayat. Coba generate satu poster dulu.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left">
                <tr>
                  <th className="p-3 font-semibold">Tanggal</th>
                  <th className="p-3 font-semibold">Model</th>
                  <th className="p-3 font-semibold">Status</th>
                  <th className="p-3 font-semibold">Tema</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const meta = STATUS_META[r.status] ?? STATUS_META.error;
                  const Icon = meta.icon;
                  const d = new Date(r.created_at);
                  return (
                    <tr key={r.id} className="border-t border-border">
                      <td className="p-3 whitespace-nowrap text-muted-foreground">
                        {d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                        <span className="text-xs block">
                          {d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </td>
                      <td className="p-3 font-medium">{modelLabel(r.model)}</td>
                      <td className="p-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md border text-xs ${meta.cls}`}>
                          <Icon className="w-3 h-3" /> {meta.label}
                        </span>
                      </td>
                      <td className="p-3 text-muted-foreground truncate max-w-[200px]">
                        {r.prompt_preview || "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
