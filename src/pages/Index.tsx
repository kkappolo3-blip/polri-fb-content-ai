import { useState } from "react";
import Header from "@/components/Header";
import ProfileSection from "@/components/ProfileSection";
import ContentCreation, { type ContentData } from "@/components/ContentCreation";
import CanvasPreview from "@/components/CanvasPreview";
import { toast } from "sonner";

const Index = () => {
  const [contentCount, setContentCount] = useState(0);
  const [generated, setGenerated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const [profile, setProfile] = useState({
    photo: null as string | null,
    name: "",
    jabatan: "",
    unit: "",
  });

  const [content, setContent] = useState<ContentData>({
    tema: "",
    caption: "",
    poseStyle: "melarang",
    headerText: "",
    pesanUtama: "",
    pesanTambahan: "",
  });

  const handleGenerate = () => {
    if (!content.headerText) {
      toast.error("Masukkan header teks terlebih dahulu!");
      return;
    }
    setIsGenerating(true);
    setGenerated(false);
    setTimeout(() => {
      setGenerated(true);
      setIsGenerating(false);
      setContentCount((c) => c + 1);
      toast.success("Konten berhasil di-generate! 🎉");
    }, 1200);
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
            isGenerating={isGenerating}
          />
        </div>

        {/* Right: Preview */}
        <div className="lg:col-span-5">
          <CanvasPreview
            profilePhoto={profile.photo}
            profileName={profile.name}
            profileJabatan={profile.jabatan}
            profileUnit={profile.unit}
            headerText={content.headerText}
            pesanUtama={content.pesanUtama}
            pesanTambahan={content.pesanTambahan}
            poseStyle={content.poseStyle}
            generated={generated}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
