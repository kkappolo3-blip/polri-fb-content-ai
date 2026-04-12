import { useRef, useState } from "react";
import { Camera, CheckCircle2, User } from "lucide-react";

interface ProfileData {
  photo: string | null;
  name: string;
  jabatan: string;
  unit: string;
}

interface ProfileSectionProps {
  profile: ProfileData;
  onProfileChange: (profile: ProfileData) => void;
}

const ProfileSection = ({ profile, onProfileChange }: ProfileSectionProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoUploaded, setPhotoUploaded] = useState(false);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      onProfileChange({ ...profile, photo: result });
      setPhotoUploaded(true);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="glass-strong rounded-3xl p-6 space-y-6">
      <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
        <User className="w-5 h-5 text-primary" />
        Profil Kreator
      </h2>

      {/* Photo Upload */}
      <div className="flex flex-col items-center gap-3">
        <div
          className="relative group cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          {/* Animated gradient border */}
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-primary via-accent to-secondary animate-spin" style={{ animationDuration: '4s' }} />
          <div className="relative w-28 h-28 rounded-full overflow-hidden bg-muted border-4 border-background flex items-center justify-center">
            {profile.photo ? (
              <img src={profile.photo} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <Camera className="w-8 h-8 text-muted-foreground" />
            )}
          </div>
          <div className="absolute inset-0 rounded-full bg-background/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Camera className="w-6 h-6 text-foreground" />
          </div>
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />

        {photoUploaded && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Foto berhasil diupload
          </div>
        )}
        {!photoUploaded && (
          <p className="text-xs text-muted-foreground">Klik untuk upload foto</p>
        )}
      </div>

      {/* Input Fields */}
      <div className="space-y-3">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Nama Lengkap</label>
          <input
            type="text"
            placeholder="Bripka Ahmad Fauzi"
            value={profile.name}
            onChange={(e) => onProfileChange({ ...profile, name: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl bg-input/50 border border-border/50 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Jabatan</label>
          <input
            type="text"
            placeholder="Bhabinkamtibmas"
            value={profile.jabatan}
            onChange={(e) => onProfileChange({ ...profile, jabatan: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl bg-input/50 border border-border/50 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Unit / Satuan</label>
          <input
            type="text"
            placeholder="Polsek Kebayoran Baru"
            value={profile.unit}
            onChange={(e) => onProfileChange({ ...profile, unit: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl bg-input/50 border border-border/50 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
        </div>
      </div>
    </div>
  );
};

export default ProfileSection;
