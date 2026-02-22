import { CreditCard, Check, Crown } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGetCallerUserProfile } from '../hooks/useGetCallerUserProfile';
import { useCreateCheckoutSession } from '../hooks/useCreateCheckoutSession';
import { useIsStripeConfigured } from '../hooks/useIsStripeConfigured';
import StripeSetup from '../components/StripeSetup';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function Subscribe() {
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: isStripeConfigured, isLoading: configLoading } = useIsStripeConfigured();
  const { mutate: createCheckout, isPending } = useCreateCheckoutSession();

  const handleSubscribe = () => {
    const items = [
      {
        productName: 'Caffeine Social Premium',
        productDescription: 'Monthly subscription to Caffeine Social Premium',
        priceInCents: BigInt(999),
        currency: 'usd',
        quantity: BigInt(1),
      },
    ];

    const baseUrl = `${window.location.protocol}//${window.location.host}`;
    const successUrl = `${baseUrl}/payment-success`;
    const cancelUrl = `${baseUrl}/payment-failure`;

    createCheckout(
      { items, successUrl, cancelUrl },
      {
        onSuccess: (session) => {
          if (!session?.url) {
            toast.error('Failed to create checkout session');
            return;
          }
          window.location.href = session.url;
        },
        onError: (error) => {
          toast.error('Failed to start checkout: ' + error.message);
        },
      }
    );
  };

  if (configLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!isStripeConfigured) {
    return <StripeSetup />;
  }

  const features = [
    'Ad-free experience',
    'Exclusive content access',
    'Priority support',
    'Custom profile themes',
    'Advanced analytics',
    'Early access to new features',
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 bg-clip-text text-transparent">
          Upgrade to Premium
        </h1>
        <p className="text-xl text-muted-foreground">
          Unlock exclusive features and support Caffeine Social
        </p>
      </div>

      {userProfile?.subscription && (
        <Card className="mb-8 border-primary">
          <CardContent className="py-6">
            <div className="flex items-center justify-center gap-2 text-primary">
              <Crown className="w-6 h-6" />
              <p className="text-lg font-semibold">You're already a Premium member!</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Free Plan</CardTitle>
            <CardDescription>Perfect for getting started</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <p className="text-4xl font-bold">$0</p>
              <p className="text-muted-foreground">forever</p>
            </div>
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <Check className="w-5 h-5 text-primary" />
                <span>Basic features</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-5 h-5 text-primary" />
                <span>Create posts</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-5 h-5 text-primary" />
                <span>View stories</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-primary shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">Premium Plan</CardTitle>
              <Badge className="bg-gradient-to-r from-orange-500 to-amber-500">
                <Crown className="w-3 h-3 mr-1" />
                Popular
              </Badge>
            </div>
            <CardDescription>Everything you need to shine</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <p className="text-4xl font-bold">$9.99</p>
              <p className="text-muted-foreground">per month</p>
            </div>
            <ul className="space-y-3 mb-6">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Button
              onClick={handleSubscribe}
              disabled={isPending || userProfile?.subscription}
              className="w-full gap-2"
              size="lg"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : userProfile?.subscription ? (
                'Already Subscribed'
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  Subscribe Now
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
