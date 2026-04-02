import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { useSaveCallerUserProfile } from "../hooks/useSaveCallerUserProfile";

export default function ProfileSetupModal() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const { mutate: saveProfile, isPending } = useSaveCallerUserProfile();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim() || !email.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    saveProfile(
      { username: username.trim(), email: email.trim(), subscription: false },
      {
        onSuccess: () => {
          toast.success("Profile created successfully!");
        },
        onError: (error) => {
          toast.error(`Failed to create profile: ${error.message}`);
        },
      },
    );
  };

  return (
    <Dialog open={true}>
      <DialogContent
        className="sm:max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Welcome to Saminsta! 🎉
          </DialogTitle>
          <DialogDescription>
            Choose your @username to get started. This is how people will find
            you.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <div className="flex items-center border border-input rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 overflow-hidden">
              <span className="px-3 py-2 bg-muted text-muted-foreground text-sm font-semibold border-r border-input select-none">
                @
              </span>
              <Input
                id="username"
                placeholder="yourname"
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value.replace(/[^a-zA-Z0-9_.]/g, ""))
                }
                disabled={isPending}
                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none"
                data-ocid="profile_setup.input"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Only letters, numbers, underscores and dots allowed.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isPending}
              data-ocid="profile_setup.input"
            />
          </div>
          <Button
            type="submit"
            className="w-full gradient-bg text-white border-0 hover:opacity-90"
            disabled={isPending}
            data-ocid="profile_setup.submit_button"
          >
            {isPending ? "Creating Profile..." : "Create Profile"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
