import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { poseStyle, tema, profilePhoto, profileName, profileJabatan, profileUnit } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!profilePhoto) {
      return new Response(JSON.stringify({ error: "Foto profil wajib di-upload!" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // === STEP 1: Generate text content ===
    const styleDescriptions: Record<string, string> = {
      melarang: "tegas, serius, peringatan keras, gaya larangan/pencegahan",
      humanis: "hangat, ramah, empati, penuh perhatian, motivasi positif, gaya humanis",
      religius: "bijak, spiritual, penuh hikmah, mengajak refleksi, gaya religius",
      himbauan: "edukatif, mengingatkan, persuasif, gaya himbauan kepolisian",
    };
    const styleDesc = styleDescriptions[poseStyle] || styleDescriptions.humanis;

    const textPrompt = `Kamu kreator konten media sosial Polri. Buat teks poster Facebook gaya: ${styleDesc}. Tema: ${tema || "kepolisian"}.
Buat HIDUP, ENERGIK, viral. Bukan duka cita.

Format WAJIB:
HEADER: [judul 3-6 kata HURUF BESAR impactful]
PESAN: [pesan utama 2-3 kalimat powerful]
TAMBAHAN: [1 kalimat call-to-action]`;

    const textResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "user", content: textPrompt }],
      }),
    });

    let headerText = "POLRI HADIR UNTUK ANDA";
    let pesanUtama = "Keamanan tanggung jawab kita bersama.";
    let pesanTambahan = "Hubungi 110 untuk bantuan.";

    if (textResponse.ok) {
      const textData = await textResponse.json();
      const rawText = textData.choices?.[0]?.message?.content || "";
      console.log("AI text:", rawText);
      headerText = rawText.match(/HEADER:\s*(.+)/i)?.[1]?.trim() || headerText;
      pesanUtama = rawText.match(/PESAN:\s*(.+)/i)?.[1]?.trim() || pesanUtama;
      pesanTambahan = rawText.match(/TAMBAHAN:\s*(.+)/i)?.[1]?.trim() || pesanTambahan;
    }

    // === STEP 2: AI EDIT user photo - keep face/uniform/name tag, ONLY change pose + background ===
    const poseAndSceneMap: Record<string, string> = {
      melarang: `Pose: berdiri tegas dan berwibawa, tangan menunjuk ke depan atau bersedekap, ekspresi serius dan tegas seperti memberi peringatan. Background: suasana malam dramatis dengan lampu polisi merah-biru samar di kejauhan, jalan kota Indonesia, pencahayaan sinematik moody.`,
      humanis: `Pose: berdiri ramah dengan senyum hangat, tangan terbuka mengundang atau di dada, ekspresi penuh empati dan bersahabat. Background: suasana desa/kampung Indonesia yang hangat saat golden hour, cahaya matahari sore lembut, suasana komunitas yang damai.`,
      religius: `Pose: berdiri tenang dan khidmat, tangan di dada atau gestur menghormat lembut, ekspresi bijak dan penuh refleksi. Background: suasana tenang dengan cahaya keemasan lembut dari atas, latar masjid atau alam yang damai, atmosfer spiritual.`,
      himbauan: `Pose: berdiri profesional dan percaya diri, tangan terbuka seolah memberi himbauan/edukasi kepada masyarakat, ekspresi meyakinkan. Background: suasana resmi bersih, gedung pemerintahan Indonesia atau langit biru cerah, pencahayaan terang profesional.`,
    };

    const editPrompt = `Buat POSTER UTUH siap publikasi Facebook (rasio vertikal 4:5) untuk himbauan Polri dengan tema "${tema}".

Gunakan orang di foto ini sebagai subjek utama poster.

ATURAN MUTLAK — JANGAN DILANGGAR:
- WAJAH orang HARUS PERSIS SAMA dengan foto asli — identitas, fitur wajah, kulit, rambut, kumis/jenggot identik. Jangan ubah wajah.
- SERAGAM POLRI dipertahankan persis — warna, model, kerah, lengan, kancing.
- NAMETAG di dada, PANGKAT di pundak, LENCANA, EMBLEM, TOPI, dan semua ATRIBUT dipertahankan persis seperti foto asli.
- JANGAN render teks/huruf/tulisan/logo apapun di dalam gambar (teks akan ditambahkan terpisah di atas).

KOMPOSISI POSTER (PENTING — agar menyatu, bukan tempelan):
- Orang ditempatkan di sisi KANAN poster, dari pinggang/dada ke atas, mengisi sekitar 55-65% lebar.
- Sisi KIRI poster adalah ruang kosong yang menyatu — gradasi gelap ke transparan menuju subjek — untuk ruang teks (jangan tulis teksnya, hanya sediakan ruang gelap halus).
- Bagian BAWAH ada ruang gelap halus untuk nama (jangan tulis namanya).
- Pencahayaan WAJAH dan TUBUH harus konsisten dengan pencahayaan BACKGROUND (arah cahaya, warna, bayangan sama) — jangan terlihat seperti cut-out yang ditempel. Gunakan rim light, ambient occlusion, color grading menyeluruh.
- Tepi tubuh menyatu lembut dengan background (tidak ada outline tajam, tidak ada bayangan kotak).

POSE & BACKGROUND (sesuai tema "${tema}", gaya ${poseStyle}):
${poseAndSceneMap[poseStyle] || poseAndSceneMap.humanis}

Hasil akhir: satu poster fotografis sinematik realistis kualitas profesional, color graded, depth of field, seperti hasil shooting studio + compositing desainer pro — BUKAN foto ditempel.`;

    const editResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [{
          role: "user",
          content: [
            { type: "text", text: editPrompt },
            { type: "image_url", image_url: { url: profilePhoto } },
          ],
        }],
        modalities: ["image", "text"],
      }),
    });

    let editedPhotoUrl: string | null = null;

    if (editResponse.ok) {
      const editData = await editResponse.json();
      editedPhotoUrl = editData.choices?.[0]?.message?.images?.[0]?.image_url?.url || null;
      console.log("Edited photo generated:", !!editedPhotoUrl);
    } else {
      const errText = await editResponse.text();
      console.error("Image edit failed:", editResponse.status, errText);
      if (editResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Terlalu banyak request. Coba lagi sebentar." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (editResponse.status === 402) {
        return new Response(JSON.stringify({ error: "Kredit AI habis. Tambah kredit di workspace." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    return new Response(JSON.stringify({
      editedPhotoUrl,
      headerText,
      pesanUtama,
      pesanTambahan,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-poster error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
