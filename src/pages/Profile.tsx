import { useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, LogOut } from "lucide-react";
import { toast } from "sonner";

export default function Profile() {
  const { user, signOut } = useAuth();
  const { data: profile, updateProfile, uploadAvatar } = useProfile();
  const [displayName, setDisplayName] = useState("");
  const [editing, setEditing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    await updateProfile.mutateAsync({ display_name: displayName });
    setEditing(false);
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await uploadAvatar(file);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const initials = (profile?.display_name || user?.email || "U")
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Profile</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="text-lg">{initials}</AvatarFallback>
              </Avatar>
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md"
              >
                <Camera className="h-3.5 w-3.5" />
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>
            <div>
              <p className="font-semibold">{profile?.display_name || "No name set"}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          <div className="space-y-3">
            {editing ? (
              <div className="flex gap-2">
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Display name"
                />
                <Button onClick={handleSave} disabled={updateProfile.isPending}>Save</Button>
                <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={() => {
                  setDisplayName(profile?.display_name || "");
                  setEditing(true);
                }}
              >
                Edit Name
              </Button>
            )}
          </div>

          <Button variant="destructive" onClick={signOut} className="gap-2">
            <LogOut className="h-4 w-4" /> Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
