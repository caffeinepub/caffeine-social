import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, CreditCard, Crown, Shield, Star, Zap } from "lucide-react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import StripeSetup from "../components/StripeSetup";
import { useCreateCheckoutSession } from "../hooks/useCreateCheckoutSession";
import { useGetCallerUserProfile } from "../hooks/useGetCallerUserProfile";
import { useIsStripeConfigured } from "../hooks/useIsStripeConfigured";

export default function Subscribe() {
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: isStripeConfigured, isLoading: configLoading } =
    useIsStripeConfigured();
  const { mutate: createCheckout, isPending } = useCreateCheckoutSession();

  const handleSubscribe = () => {
    const items = [
      {
        productName: "Saminsta Premium",
        productDescription: "Monthly premium subscription to Saminsta",
        priceInCents: BigInt(999),
        currency: "usd",
        quantity: BigInt(1),
      },
    ];

    const baseUrl = `${window.location.protocol}//${window.location.host}`;
    createCheckout(
      {
        items,
        successUrl: `${baseUrl}/payment-success`,
        cancelUrl: `${baseUrl}/payment-failure`,
      },
      {
        onSuccess: (session) => {
          if (!session?.url) {
            toast.error("Failed to create checkout session");
            return;
          }
          window.location.href = session.url;
        },
        onError: (err) =>
          toast.error(`Failed to start checkout: ${err.message}`),
      },
    );
  };

  if (configLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!isStripeConfigured) return <StripeSetup />;

  const features = [
    { icon: Star, text: "Ad-free experience" },
    { icon: Crown, text: "Exclusive premium badge" },
    { icon: Zap, text: "Priority content visibility" },
    { icon: Shield, text: "Advanced privacy controls" },
    { icon: Check, text: "Early access to new features" },
    { icon: Check, text: "Custom profile themes" },
  ];

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 gradient-bg rounded-full mx-auto mb-4 flex items-center justify-center shadow-glow">
          <Crown className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold mb-2">
          <span className="gradient-text">Saminsta</span> Premium
        </h1>
        <p className="text-muted-foreground">
          Unlock the full Saminsta experience
        </p>
      </div>

      {userProfile?.subscription && (
        <div className="gradient-bg rounded-2xl p-4 mb-6 flex items-center gap-3">
          <Crown className="w-6 h-6 text-white" />
          <p className="text-white font-semibold">
            You&apos;re already a Premium member! 🎉
          </p>
        </div>
      )}

      {/* Pricing card */}
      <Card
        className="border-primary/50 bg-card shadow-glow mb-6"
        data-ocid="subscribe.card"
      >
        <CardHeader className="text-center pb-2">
          <div className="inline-flex items-baseline gap-1 justify-center">
            <span className="text-5xl font-bold gradient-text">$9.99</span>
            <span className="text-muted-foreground">/month</span>
          </div>
          <CardTitle className="text-sm text-muted-foreground font-normal">
            Cancel anytime
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3 mb-6">
            {features.map((f) => (
              <li key={f.text} className="flex items-center gap-3">
                <div className="w-5 h-5 gradient-bg rounded-full flex items-center justify-center flex-shrink-0">
                  <f.icon className="w-3 h-3 text-white" />
                </div>
                <span className="text-sm">{f.text}</span>
              </li>
            ))}
          </ul>
          <Button
            onClick={handleSubscribe}
            disabled={isPending || userProfile?.subscription}
            className="w-full gradient-bg border-0 text-white font-semibold hover:opacity-90 h-12 rounded-xl"
            data-ocid="subscribe.primary_button"
            size="lg"
          >
            {isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" /> Processing...
              </>
            ) : userProfile?.subscription ? (
              "Already Subscribed ✓"
            ) : (
              <>
                <CreditCard className="w-5 h-5 mr-2" /> Subscribe Now
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground">
        Secure payment via Stripe. Your subscription helps support Saminsta.
      </p>
    </div>
  );
}
