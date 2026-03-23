import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Outlet } from "@tanstack/react-router";
import { useGetCallerUserProfile } from "../hooks/useGetCallerUserProfile";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import ProfileSetupModal from "./ProfileSetupModal";

export default function AuthGuard() {
  const { identity, login, isInitializing } = useInternetIdentity();
  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched,
  } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;

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
              Login with Internet Identity
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const showProfileSetup =
    isAuthenticated && !profileLoading && isFetched && userProfile === null;

  return (
    <>
      {showProfileSetup && <ProfileSetupModal />}
      <Outlet />
    </>
  );
}
