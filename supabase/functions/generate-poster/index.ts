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
    const { poseStyle, tema } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Step 1: Generate text content using AI
    const styleDescriptions: Record<string, string> = {
      melarang: "tegas, serius, peringatan keras, gaya larangan/pencegahan",
      humanis: "hangat, ramah, empati, penuh perhatian, motivasi positif, gaya humanis",
      religius: "bijak, spiritual, penuh hikmah, mengajak refleksi, gaya religius",
      himbauan: "edukatif, mengingatkan, persuasif, gaya himbauan kepolisian",
    };

    const styleDesc = styleDescriptions[poseStyle] || styleDescriptions.humanis;

    const textPrompt = `Kamu adalah kreator konten media sosial untuk anggota Polri (Kepolisian Republik Indonesia). 
Buatkan teks konten poster untuk Facebook dengan gaya: ${styleDesc}.
Tema: ${tema || "kepolisian dan masyarakat"}.

PENTING: Buat teks yang HIDUP, ENERGIK, dan RELEVAN seperti konten viral polisi di Facebook. 
Bukan seperti berita kematian atau duka cita!
Gunakan bahasa Indonesia yang mengalir, bisa lucu, bijak, atau tegas sesuai gaya.

Format jawaban HARUS tepat seperti ini (tanpa tambahan apapun):
HEADER: [judul besar 3-6 kata, HURUF BESAR, impactful]
PESAN: [pesan utama 2-4 kalimat, mengalir dan powerful]
TAMBAHAN: [1 kalimat penutup/call-to-action singkat]`;

    const textResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "user", content: textPrompt }],
      }),
    });

    let headerText = "";
    let pesanUtama = "";
    let pesanTambahan = "";

    if (textResponse.ok) {
      const textData = await textResponse.json();
      const rawText = textData.choices?.[0]?.message?.content || "";
      console.log("AI text response:", rawText);

      const headerMatch = rawText.match(/HEADER:\s*(.+)/i);
      const pesanMatch = rawText.match(/PESAN:\s*(.+)/i);
      const tambahanMatch = rawText.match(/TAMBAHAN:\s*(.+)/i);

      headerText = headerMatch?.[1]?.trim() || "POLRI HADIR UNTUK ANDA";
      pesanUtama = pesanMatch?.[1]?.trim() || "Keamanan dan ketertiban adalah tanggung jawab kita bersama.";
      pesanTambahan = tambahanMatch?.[1]?.trim() || "Hubungi 110 untuk bantuan.";
    } else {
      console.error("Text generation failed:", textResponse.status);
      headerText = "POLRI HADIR UNTUK ANDA";
      pesanUtama = "Keamanan dan ketertiban adalah tanggung jawab kita bersama.";
      pesanTambahan = "Hubungi 110 untuk bantuan.";
    }

    // Step 2: Generate background scene (NO person, just scenery/atmosphere)
    const sceneDescriptions: Record<string, string> = {
      melarang: "dramatic dark moody background with red and blue police lights, urban city street at night, cinematic atmosphere, NO people, NO text",
      humanis: "warm golden hour village scene, Indonesian rural community setting, friendly warm atmosphere, beautiful sunset light, NO people, NO text",
      religius: "peaceful mosque or spiritual setting with golden light rays, serene atmosphere, bokeh lights, warm tones, NO people, NO text",
      himbauan: "professional modern Indonesian cityscape, clean blue sky, official government building or road scene, NO people, NO text",
    };

    const sceneDesc = sceneDescriptions[poseStyle] || sceneDescriptions.humanis;
    const bgPrompt = `Create a vertical portrait background image (NO people, NO text, NO faces). 
Scene: ${sceneDesc}. 
Theme context: ${tema || "Indonesian police community service"}.
Style: Cinematic, dramatic lighting, high quality, photorealistic, suitable as poster background.
The image must have NO humans, NO officers, NO text - ONLY scenic/atmospheric background.`;

    const imageResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [{ role: "user", content: bgPrompt }],
        modalities: ["image", "text"],
      }),
    });

    let imageUrl = null;

    if (imageResponse.ok) {
      const imgData = await imageResponse.json();
      imageUrl = imgData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    } else {
      if (imageResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (imageResponse.status === 402) {
        return new Response(JSON.stringify({ error: "Credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      console.error("Image generation failed:", imageResponse.status);
    }

    return new Response(JSON.stringify({ 
      imageUrl, 
      headerText, 
      pesanUtama, 
      pesanTambahan 
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
