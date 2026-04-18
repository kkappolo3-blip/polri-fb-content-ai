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

    // === STEP 2: AI EDIT user photo - transform style based on theme ===
    const editStyleMap: Record<string, string> = {
      melarang: `Transform this person into a CINEMATIC POLICE POSTER style. Keep the EXACT same face, same identity, same person — do NOT change facial features. Dress them in a professional Indonesian Polri (Police) uniform (light brown/khaki shirt with rank insignia). Place them in a dramatic urban night scene with dim red/blue police lights in the background. Pose: serious, authoritative, arms crossed or hand near belt, looking straight ahead with stern expression. Cinematic lighting, sharp focus on face, shallow depth of field, photorealistic editorial poster quality. Vertical portrait composition.`,
      humanis: `Transform this person into a WARM HUMANIST POLICE POSTER style. Keep the EXACT same face, same identity — do NOT change facial features. Dress them in a friendly Indonesian Polri (Police) uniform (light brown shirt). Place them in a warm Indonesian community/village setting with golden hour sunlight. Pose: smiling warmly, hand on chest or open gesture, friendly approachable expression. Soft warm cinematic lighting, photorealistic, suitable as Facebook poster. Vertical portrait.`,
      religius: `Transform this person into a SPIRITUAL/RELIGIOUS POLICE POSTER style. Keep the EXACT same face, same identity. Dress them in Indonesian Polri uniform. Place them in a serene setting with soft golden light rays from above, peaceful background. Pose: contemplative, hand on heart or in gentle prayer-like gesture, calm wise expression. Soft divine lighting, photorealistic poster quality. Vertical portrait.`,
      himbauan: `Transform this person into a PROFESSIONAL OFFICIAL POLICE POSTER style. Keep the EXACT same face, same identity. Dress them in formal Indonesian Polri (Police) uniform with rank insignia. Place them in front of a clean professional setting (Indonesian government building or clean blue background). Pose: confident, hand pointing forward or open palm gesture, persuasive expression. Bright clean lighting, sharp photorealistic poster quality. Vertical portrait.`,
    };

    const editPrompt = `${editStyleMap[poseStyle] || editStyleMap.humanis}

Context — the poster will say: "${headerText}". Pose and expression should match this message about "${tema}".
${profileJabatan ? `The person's rank is ${profileJabatan}.` : ""}
IMPORTANT: Preserve the person's exact facial identity. Only change clothing, pose, lighting, and background. Do NOT add any text or letters in the image.`;

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
