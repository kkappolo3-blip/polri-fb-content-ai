import { useState } from "react";
import Header from "@/components/Header";
import ProfileSection from "@/components/ProfileSection";
import ContentCreation, { type ContentData } from "@/components/ContentCreation";
import CanvasPreview from "@/components/CanvasPreview";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [contentCount, setContentCount] = useState(0);
  const [generated, setGenerated] = useState(false);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiBackground, setAiBackground] = useState<string | null>(null);

  const [profile, setProfile] = useState({
    photo: null as string | null,
    name: "",
    jabatan: "",
    unit: "",
  });

  const [content, setContent] = useState<ContentData>({
    tema: "",
    poseStyle: "humanis",
  });

  // AI-generated text
  const [aiText, setAiText] = useState({
    headerText: "",
    pesanUtama: "",
    pesanTambahan: "",
  });

  const handleGenerate = async () => {
    if (!content.tema) {
      toast.error("Masukkan tema konten terlebih dahulu!");
      return;
    }

    setIsLoadingAI(true);
    setGenerated(false);
    setAiBackground(null);
    setAiText({ headerText: "", pesanUtama: "", pesanTambahan: "" });

    try {
      const { data, error } = await supabase.functions.invoke("generate-poster", {
        body: { poseStyle: content.poseStyle, tema: content.tema },
      });

      if (error) {
        console.error("Edge function error:", error);
        toast.error("Gagal generate konten. Coba lagi.");
      } else if (data?.error) {
        console.error("AI error:", data.error);
        toast.error(data.error);
      } else {
        if (data?.imageUrl) {
          setAiBackground(data.imageUrl);
        }
        setAiText({
          headerText: data?.headerText || "POLRI HADIR UNTUK ANDA",
          pesanUtama: data?.pesanUtama || "",
          pesanTambahan: data?.pesanTambahan || "",
        });
        toast.success("Konten AI berhasil di-generate! 🎨");
      }
    } catch (err) {
      console.error("Generate error:", err);
      toast.error("Terjadi kesalahan. Coba lagi.");
    }

    setGenerated(true);
    setIsLoadingAI(false);
    setContentCount((c) => c + 1);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 max-w-7xl mx-auto">
      <Header contentCount={contentCount} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Profile */}
        <div className="lg:col-span-3">
          <ProfileSection profile={profile} onProfileChange={setProfile} />
        </div>

        {/* Center: Content Creation */}
        <div className="lg:col-span-4">
          <ContentCreation
            content={content}
            onContentChange={setContent}
            onGenerate={handleGenerate}
            isGenerating={isLoadingAI}
          />
        </div>

        {/* Right: Preview */}
        <div className="lg:col-span-5">
          <CanvasPreview
            profilePhoto={profile.photo}
            profileName={profile.name}
            profileJabatan={profile.jabatan}
            profileUnit={profile.unit}
            headerText={aiText.headerText}
            pesanUtama={aiText.pesanUtama}
            pesanTambahan={aiText.pesanTambahan}
            poseStyle={content.poseStyle}
            generated={generated}
            aiBackground={aiBackground}
            isLoadingAI={isLoadingAI}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
