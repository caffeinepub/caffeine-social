import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Outlet } from "@tanstack/react-router";
import { useEffect } from "react";
import { useActor } from "../hooks/useActor";
import { useGetCallerUserProfile } from "../hooks/useGetCallerUserProfile";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useSaveCallerUserProfile } from "../hooks/useSaveCallerUserProfile";

export default function AuthGuard() {
  const { identity, login, isInitializing } = useInternetIdentity();
  const { actor } = useActor();
  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched,
  } = useGetCallerUserProfile();
  const { mutate: saveProfile, isPending: isSavingProfile } =
    useSaveCallerUserProfile();

  const isAuthenticated = !!identity;
  const showProfileSetup =
    isAuthenticated && !profileLoading && isFetched && userProfile === null;

  useEffect(() => {
    if (showProfileSetup && identity && !isSavingProfile) {
      saveProfile({
        username: identity.getPrincipal().toString(),
        email: "",
        subscription: false,
      });
    }
  }, [showProfileSetup, identity, isSavingProfile, saveProfile]);

  // Ensure the user exists in the backend after profile is set up
  useEffect(() => {
    if (
      identity &&
      actor &&
      !profileLoading &&
      isFetched &&
      userProfile !== null
    ) {
      actor.createUser().catch(() => {
        // Ignore "already exists" errors
      });
    }
  }, [identity, actor, profileLoading, isFetched, userProfile]);

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold gradient-text">
              Welcome to Saminsta
            </CardTitle>
            <CardDescription className="text-base mt-2">
              Connect, share, and discover amazing content
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <p className="text-center text-muted-foreground">
              Please log in to access your feed, stories, and connect with
              others.
            </p>
            <Button
              onClick={login}
              size="lg"
              className="w-full gradient-bg border-0 text-white"
            >
              Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showProfileSetup || isSavingProfile) {
    return (
      <div
        className="flex items-center justify-center min-h-[60vh]"
        data-ocid="auth.loading_state"
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Setting up your profile...</p>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
