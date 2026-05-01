import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ALLOWED_IMAGE_MODELS = new Set([
  "google/gemini-2.5-flash-image",          // Nano Banana (cepat & murah)
  "google/gemini-3.1-flash-image-preview",  // Nano Banana 2 (cepat + kualitas pro)
  "google/gemini-3-pro-image-preview",      // Pro (kualitas terbaik, lambat)
]);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { poseStyle, tema, profilePhoto, profileName, profileJabatan, profileUnit, imageModel } = await req.json();

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

    const selectedImageModel = ALLOWED_IMAGE_MODELS.has(imageModel)
      ? imageModel
      : "google/gemini-3.1-flash-image-preview";

    // === STEP 1: Generate text content ===
    const styleDescriptions: Record<string, string> = {
      melarang: "tegas, serius, peringatan keras, gaya larangan/pencegahan",
      humanis: "hangat, ramah, empati, penuh perhatian, motivasi positif, gaya humanis",
      religius: "bijak, spiritual, penuh hikmah, mengajak refleksi, gaya religius",
      himbauan: "edukatif, mengingatkan, persuasif, gaya himbauan kepolisian",
    };
    const styleDesc = styleDescriptions[poseStyle] || styleDescriptions.humanis;

    const textPrompt = `Kamu kreator konten media sosial Polri. Buat teks poster Facebook gaya: ${styleDesc}. Tema: ${tema || "kepolisian"}.
Buat singkat, padat, dan powerful. Maksimal 1-2 kalimat saja per bagian.

Format WAJIB:
HEADER: [judul 2-4 kata HURUF BESAR singkat dan impactful]
PESAN: [1-2 kalimat singkat powerful saja, bukan paragraf panjang]
TAMBAHAN: [1 kalimat call-to-action singkat]`;

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

    // === STEP 2: AI EDIT user photo ===
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

KOMPOSISI POSTER (PENTING — agar teks tidak menabrak wajah):
- Orang ditempatkan di BAGIAN BAWAH poster. Ujung atas KEPALA orang harus berada sekitar 50-55% dari atas poster.
- Crop dari dada/pinggang ke atas kepala. Bahu mengisi lebar tengah.
- SELURUH separuh ATAS poster (50% atas) HARUS berupa background/scene SAJA tanpa orang.
- Sisi KIRI di sekitar dada/bahu ada area gelap halus untuk quote kecil.
- Bagian PALING BAWAH ada gradasi gelap untuk nama.
- Pencahayaan WAJAH dan TUBUH konsisten dengan BACKGROUND.

POSE & BACKGROUND (sesuai tema "${tema}", gaya ${poseStyle}):
${poseAndSceneMap[poseStyle] || poseAndSceneMap.humanis}

Hasil akhir: satu poster fotografis sinematik realistis kualitas profesional, color graded, depth of field, seperti hasil shooting studio + compositing desainer pro — BUKAN foto ditempel.`;

    const editResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: selectedImageModel,
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
      console.log("Edited photo generated:", !!editedPhotoUrl, "model:", selectedImageModel);
    } else {
      const errText = await editResponse.text();
      console.error("Image edit failed:", editResponse.status, errText);
      if (editResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Terlalu banyak request. Coba lagi sebentar.", creditStatus: "rate_limited" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (editResponse.status === 402) {
        return new Response(JSON.stringify({ error: "Kredit AI habis. Tambah kredit di workspace.", creditStatus: "exhausted" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    return new Response(JSON.stringify({
      editedPhotoUrl,
      headerText,
      pesanUtama,
      pesanTambahan,
      modelUsed: selectedImageModel,
      creditStatus: "ok",
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
