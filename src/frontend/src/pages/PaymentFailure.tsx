import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, XCircle } from "lucide-react";

export default function PaymentFailure() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
            <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-3xl">Payment Failed</CardTitle>
          <CardDescription className="text-base mt-2">
            We couldn't process your payment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Don't worry, you haven't been charged. Please try again or contact
            support if the problem persists.
          </p>
          <div className="flex flex-col gap-2">
            <Button
              onClick={() => navigate({ to: "/subscribe" })}
              className="w-full"
            >
              Try Again
            </Button>
            <Button
              onClick={() => navigate({ to: "/" })}
              variant="outline"
              className="w-full gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
