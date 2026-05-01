import { useState } from "react";
import Header from "@/components/Header";
import ProfileSection from "@/components/ProfileSection";
import ContentCreation, { type ContentData } from "@/components/ContentCreation";
import CanvasPreview from "@/components/CanvasPreview";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type CreditStatus = "unknown" | "ok" | "rate_limited" | "exhausted";

const Index = () => {
  const [contentCount, setContentCount] = useState(0);
  const [generated, setGenerated] = useState(false);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [editedPhoto, setEditedPhoto] = useState<string | null>(null);
  const [creditStatus, setCreditStatus] = useState<CreditStatus>("unknown");

  const [profile, setProfile] = useState({
    photo: null as string | null,
    name: "",
    jabatan: "",
    unit: "",
  });

  const [content, setContent] = useState<ContentData>({
    tema: "",
    poseStyle: "humanis",
    imageModel: "google/gemini-3.1-flash-image-preview",
  });

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
    if (!profile.photo) {
      toast.error("Upload foto profil terlebih dahulu!");
      return;
    }

    setIsLoadingAI(true);
    setGenerated(false);
    setEditedPhoto(null);
    setAiText({ headerText: "", pesanUtama: "", pesanTambahan: "" });

    try {
      const { data, error } = await supabase.functions.invoke("generate-poster", {
        body: {
          poseStyle: content.poseStyle,
          tema: content.tema,
          imageModel: content.imageModel,
          profilePhoto: profile.photo,
          profileName: profile.name,
          profileJabatan: profile.jabatan,
          profileUnit: profile.unit,
        },
      });

      if (error) {
        console.error("Edge function error:", error);
        const ctx: any = (error as any).context;
        const status = ctx?.status ?? ctx?.response?.status;
        if (status === 402) {
          setCreditStatus("exhausted");
          toast.error("Kredit AI habis. Top up di Settings → Workspace.");
        } else if (status === 429) {
          setCreditStatus("rate_limited");
          toast.error("Terlalu banyak request. Coba lagi sebentar.");
        } else {
          toast.error("Gagal generate konten. Coba lagi.");
        }
      } else if (data?.error) {
        if (data.creditStatus === "exhausted") setCreditStatus("exhausted");
        else if (data.creditStatus === "rate_limited") setCreditStatus("rate_limited");
        toast.error(data.error);
      } else {
        setCreditStatus("ok");
        if (data?.editedPhotoUrl) setEditedPhoto(data.editedPhotoUrl);
        setAiText({
          headerText: data?.headerText || "POLRI HADIR UNTUK ANDA",
          pesanUtama: data?.pesanUtama || "",
          pesanTambahan: data?.pesanTambahan || "",
        });
        toast.success("Foto & teks berhasil di-generate AI! 🎨");
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
      <Header contentCount={contentCount} creditStatus={creditStatus} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-3">
          <ProfileSection profile={profile} onProfileChange={setProfile} />
        </div>

        <div className="lg:col-span-4">
          <ContentCreation
            content={content}
            onContentChange={setContent}
            onGenerate={handleGenerate}
            isGenerating={isLoadingAI}
          />
        </div>

        <div className="lg:col-span-5">
          <CanvasPreview
            profilePhoto={editedPhoto || profile.photo}
            profileName={profile.name}
            profileJabatan={profile.jabatan}
            profileUnit={profile.unit}
            headerText={aiText.headerText}
            pesanUtama={aiText.pesanUtama}
            pesanTambahan={aiText.pesanTambahan}
            poseStyle={content.poseStyle}
            generated={generated}
            aiBackground={null}
            isLoadingAI={isLoadingAI}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
