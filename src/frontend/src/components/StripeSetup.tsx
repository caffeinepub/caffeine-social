import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSetStripeConfiguration } from '../hooks/useSetStripeConfiguration';
import { useIsStripeConfigured } from '../hooks/useIsStripeConfigured';
import AdminGuard from './AdminGuard';
import { toast } from 'sonner';

export default function StripeSetup() {
  const { data: isConfigured, isLoading } = useIsStripeConfigured();
  const { mutate: setConfig, isPending } = useSetStripeConfiguration();
  const [secretKey, setSecretKey] = useState('');
  const [countries, setCountries] = useState('US,CA,GB');

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (isConfigured) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!secretKey.trim()) {
      toast.error('Please enter your Stripe secret key');
      return;
    }

    const allowedCountries = countries
      .split(',')
      .map((c) => c.trim().toUpperCase())
      .filter((c) => c.length === 2);

    if (allowedCountries.length === 0) {
      toast.error('Please enter at least one valid country code');
      return;
    }

    setConfig(
      {
        secretKey: secretKey.trim(),
        allowedCountries,
      },
      {
        onSuccess: () => {
          toast.success('Stripe configured successfully!');
          setSecretKey('');
        },
        onError: (error) => {
          toast.error('Failed to configure Stripe: ' + error.message);
        },
      }
    );
  };

  return (
    <AdminGuard>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Configure Stripe Payments</CardTitle>
          <CardDescription>
            Set up Stripe to enable subscription payments. You'll need your Stripe secret key.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="secretKey">Stripe Secret Key</Label>
              <Input
                id="secretKey"
                type="password"
                placeholder="sk_test_..."
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="countries">Allowed Countries (comma-separated)</Label>
              <Input
                id="countries"
                placeholder="US,CA,GB"
                value={countries}
                onChange={(e) => setCountries(e.target.value)}
                disabled={isPending}
              />
              <p className="text-xs text-muted-foreground">
                Enter 2-letter country codes separated by commas
              </p>
            </div>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Configuring...' : 'Configure Stripe'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </AdminGuard>
  );
}
