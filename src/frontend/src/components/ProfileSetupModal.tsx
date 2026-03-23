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
          <DialogTitle className="text-2xl">Welcome! 🎉</DialogTitle>
          <DialogDescription>
            Let&apos;s set up your profile to get started on Saminsta.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isPending}
            />
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
            />
          </div>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Creating Profile..." : "Create Profile"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
