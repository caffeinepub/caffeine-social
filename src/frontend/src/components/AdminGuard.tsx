import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";
import { useIsCallerAdmin } from "../hooks/useIsCallerAdmin";

interface AdminGuardProps {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const { data: isAdmin, isLoading } = useIsCallerAdmin();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <ShieldAlert className="w-16 h-16 mx-auto mb-4 text-destructive" />
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don&apos;t have permission to access this page. Admin
              privileges are required.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
