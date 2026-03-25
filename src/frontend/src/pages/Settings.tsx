import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Bell,
  ChevronRight,
  Globe,
  Info,
  Loader2,
  Lock,
  Pencil,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import LoginButton from "../components/LoginButton";
import { useGetCallerUserProfile } from "../hooks/useGetCallerUserProfile";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useSaveCallerUserProfile } from "../hooks/useSaveCallerUserProfile";

function SectionHeader({
  icon: Icon,
  title,
}: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2 px-4 py-3">
      <Icon className="w-4 h-4 text-primary" />
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        {title}
      </h2>
    </div>
  );
}

function SettingsRow({
  label,
  value,
  onClick,
  rightElement,
}: {
  label: string;
  value?: string;
  onClick?: () => void;
  rightElement?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center justify-between px-4 py-3.5 hover:bg-secondary/50 transition-colors text-left ${
        onClick ? "cursor-pointer" : "cursor-default"
      }`}
    >
      <span className="text-sm font-medium">{label}</span>
      <div className="flex items-center gap-2">
        {value && (
          <span className="text-sm text-muted-foreground truncate max-w-[160px]">
            {value}
          </span>
        )}
        {rightElement}
        {onClick && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
      </div>
    </button>
  );
}

export default function Settings() {
  const { identity } = useInternetIdentity();
  const { data: profile, isLoading } = useGetCallerUserProfile();
  const { mutate: saveProfile, isPending: isSaving } =
    useSaveCallerUserProfile();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");
  const [editingProfile, setEditingProfile] = useState(false);

  // Privacy toggles
  const [publicAccount, setPublicAccount] = useState(
    () => localStorage.getItem("privacy_public") !== "false",
  );
  const [activityStatus, setActivityStatus] = useState(
    () => localStorage.getItem("privacy_activity") !== "false",
  );
  const [allowTags, setAllowTags] = useState(
    () => localStorage.getItem("privacy_tags") !== "false",
  );

  // Notification toggles
  const [notifLikes, setNotifLikes] = useState(
    () => localStorage.getItem("notif_likes") !== "false",
  );
  const [notifComments, setNotifComments] = useState(
    () => localStorage.getItem("notif_comments") !== "false",
  );
  const [notifFollows, setNotifFollows] = useState(
    () => localStorage.getItem("notif_follows") !== "false",
  );
  const [notifMessages, setNotifMessages] = useState(
    () => localStorage.getItem("notif_messages") !== "false",
  );

  useEffect(() => {
    if (profile) {
      setUsername(profile.username ?? "");
      setEmail(profile.email ?? "");
      setBio(profile.bio ?? "");
      setWebsite(profile.website ?? "");
    }
  }, [profile]);

  const handleSaveProfile = () => {
    saveProfile(
      {
        username,
        email,
        bio: bio || undefined,
        website: website || undefined,
        subscription: profile?.subscription ?? false,
      },
      {
        onSuccess: () => {
          setEditingProfile(false);
          toast.success("Profile updated!");
        },
        onError: () => toast.error("Failed to update profile"),
      },
    );
  };

  const setPrivacy = (
    key: string,
    setter: (v: boolean) => void,
    value: boolean,
  ) => {
    localStorage.setItem(key, String(value));
    setter(value);
  };

  const setNotif = (
    key: string,
    setter: (v: boolean) => void,
    value: boolean,
  ) => {
    localStorage.setItem(key, String(value));
    setter(value);
  };

  if (!identity) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-lg font-semibold mb-2">Login to access settings</p>
        <LoginButton />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center min-h-[60vh]"
        data-ocid="settings.loading_state"
      >
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto pb-20" data-ocid="settings.panel">
      <div className="px-4 py-4 border-b border-border">
        <h1 className="text-xl font-bold">Settings</h1>
      </div>

      {/* Edit Profile Section */}
      <div className="mt-2">
        <SectionHeader icon={Pencil} title="Edit Profile" />
        <div className="bg-card border-y border-border">
          {!editingProfile ? (
            <>
              <SettingsRow
                label="Username"
                value={username || "Not set"}
                onClick={() => setEditingProfile(true)}
              />
              <Separator />
              <SettingsRow
                label="Email"
                value={email || "Not set"}
                onClick={() => setEditingProfile(true)}
              />
              <Separator />
              <SettingsRow
                label="Bio"
                value={bio || "Add bio"}
                onClick={() => setEditingProfile(true)}
              />
              <Separator />
              <SettingsRow
                label="Website"
                value={website || "Add website"}
                onClick={() => setEditingProfile(true)}
              />
            </>
          ) : (
            <div className="p-4 space-y-4" data-ocid="settings.modal">
              <div className="space-y-1.5">
                <Label
                  htmlFor="s-username"
                  className="text-xs text-muted-foreground"
                >
                  Username
                </Label>
                <Input
                  id="s-username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Your username"
                  data-ocid="settings.input"
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="s-email"
                  className="text-xs text-muted-foreground"
                >
                  Email
                </Label>
                <Input
                  id="s-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email"
                  data-ocid="settings.input"
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="s-bio"
                  className="text-xs text-muted-foreground"
                >
                  Bio
                </Label>
                <Textarea
                  id="s-bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell your story..."
                  rows={3}
                  data-ocid="settings.textarea"
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="s-website"
                  className="text-xs text-muted-foreground"
                >
                  Website
                </Label>
                <Input
                  id="s-website"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://yoursite.com"
                  data-ocid="settings.input"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="gradient-bg text-white border-0 flex-1"
                  data-ocid="settings.save_button"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : null}
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setEditingProfile(false)}
                  data-ocid="settings.cancel_button"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Account Section */}
      <div className="mt-6">
        <SectionHeader icon={User} title="Account" />
        <div className="bg-card border-y border-border">
          <SettingsRow
            label="Principal ID"
            value={`${identity?.getPrincipal().toString().slice(0, 16)}...`}
          />
          <Separator />
          <SettingsRow
            label="Subscription"
            value={profile?.subscription ? "Premium ✨" : "Free"}
          />
        </div>
      </div>

      {/* Privacy Section */}
      <div className="mt-6">
        <SectionHeader icon={Lock} title="Privacy" />
        <div className="bg-card border-y border-border divide-y divide-border">
          <div className="flex items-center justify-between px-4 py-3.5">
            <span className="text-sm font-medium">Public account</span>
            <Switch
              checked={publicAccount}
              onCheckedChange={(v) =>
                setPrivacy("privacy_public", setPublicAccount, v)
              }
              data-ocid="settings.switch"
            />
          </div>
          <div className="flex items-center justify-between px-4 py-3.5">
            <span className="text-sm font-medium">Show activity status</span>
            <Switch
              checked={activityStatus}
              onCheckedChange={(v) =>
                setPrivacy("privacy_activity", setActivityStatus, v)
              }
              data-ocid="settings.switch"
            />
          </div>
          <div className="flex items-center justify-between px-4 py-3.5">
            <span className="text-sm font-medium">Allow tags</span>
            <Switch
              checked={allowTags}
              onCheckedChange={(v) =>
                setPrivacy("privacy_tags", setAllowTags, v)
              }
              data-ocid="settings.switch"
            />
          </div>
        </div>
      </div>

      {/* Notifications Section */}
      <div className="mt-6">
        <SectionHeader icon={Bell} title="Notifications" />
        <div className="bg-card border-y border-border divide-y divide-border">
          <div className="flex items-center justify-between px-4 py-3.5">
            <span className="text-sm font-medium">Likes</span>
            <Switch
              checked={notifLikes}
              onCheckedChange={(v) => setNotif("notif_likes", setNotifLikes, v)}
              data-ocid="settings.switch"
            />
          </div>
          <div className="flex items-center justify-between px-4 py-3.5">
            <span className="text-sm font-medium">Comments</span>
            <Switch
              checked={notifComments}
              onCheckedChange={(v) =>
                setNotif("notif_comments", setNotifComments, v)
              }
              data-ocid="settings.switch"
            />
          </div>
          <div className="flex items-center justify-between px-4 py-3.5">
            <span className="text-sm font-medium">New followers</span>
            <Switch
              checked={notifFollows}
              onCheckedChange={(v) =>
                setNotif("notif_follows", setNotifFollows, v)
              }
              data-ocid="settings.switch"
            />
          </div>
          <div className="flex items-center justify-between px-4 py-3.5">
            <span className="text-sm font-medium">Messages</span>
            <Switch
              checked={notifMessages}
              onCheckedChange={(v) =>
                setNotif("notif_messages", setNotifMessages, v)
              }
              data-ocid="settings.switch"
            />
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="mt-6">
        <SectionHeader icon={Info} title="About" />
        <div className="bg-card border-y border-border divide-y divide-border">
          <SettingsRow label="App Name" value="Saminsta" />
          <Separator />
          <SettingsRow label="Version" value="1.0.0" />
          <Separator />
          <div className="flex items-center justify-between px-4 py-3.5">
            <span className="text-sm font-medium">Built with</span>
            <a
              href="https://caffeine.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm gradient-text font-semibold hover:opacity-80"
            >
              caffeine.ai
            </a>
          </div>
          <Separator />
          <div className="px-4 py-3.5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Globe className="w-4 h-4" />
              <span>Running on Internet Computer</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
