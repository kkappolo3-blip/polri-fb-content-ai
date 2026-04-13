import { useRef, useState, useEffect } from "react";
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

const STORAGE_KEY = "polri_profile";

const ProfileSection = ({ profile, onProfileChange }: ProfileSectionProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoUploaded, setPhotoUploaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as ProfileData;
        onProfileChange(parsed);
        if (parsed.photo) setPhotoUploaded(true);
      }
    } catch {}
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch {}
  }, [profile]);

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

  const inputClass =
    "w-full px-4 py-2.5 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all";

  return (
    <div className="newspaper-card rounded-xl p-6 space-y-5">
      <h2 className="font-serif-display text-lg font-bold text-foreground flex items-center gap-2 border-b border-border pb-3">
        <User className="w-5 h-5 text-primary" />
        Profil Kreator
      </h2>

      {/* Photo Upload */}
      <div className="flex flex-col items-center gap-3">
        <div
          className="relative group cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="w-28 h-28 rounded-full overflow-hidden bg-muted border-4 border-primary/20 flex items-center justify-center shadow-md">
            {profile.photo ? (
              <img src={profile.photo} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <Camera className="w-8 h-8 text-muted-foreground" />
            )}
          </div>
          <div className="absolute inset-0 rounded-full bg-foreground/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Camera className="w-6 h-6 text-background" />
          </div>
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />

        {photoUploaded ? (
          <div className="flex items-center gap-1.5 text-xs text-emerald-600">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Foto berhasil diupload
          </div>
        ) : (
          <p className="text-xs text-muted-foreground italic">Klik untuk upload foto</p>
        )}
      </div>

      {/* Input Fields */}
      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Nama Lengkap</label>
          <input type="text" placeholder="Bripka Ahmad Fauzi" value={profile.name}
            onChange={(e) => onProfileChange({ ...profile, name: e.target.value })}
            className={inputClass} />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Jabatan</label>
          <input type="text" placeholder="Bhabinkamtibmas" value={profile.jabatan}
            onChange={(e) => onProfileChange({ ...profile, jabatan: e.target.value })}
            className={inputClass} />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Unit / Satuan</label>
          <input type="text" placeholder="Polsek Kebayoran Baru" value={profile.unit}
            onChange={(e) => onProfileChange({ ...profile, unit: e.target.value })}
            className={inputClass} />
        </div>
      </div>
    </div>
  );
};

export default ProfileSection;
