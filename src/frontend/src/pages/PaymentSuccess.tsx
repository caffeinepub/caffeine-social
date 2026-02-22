import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSubscribeUser } from '../hooks/useSubscribeUser';
import { toast } from 'sonner';

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const { mutate: subscribeUser } = useSubscribeUser();

  useEffect(() => {
    subscribeUser(undefined, {
      onSuccess: () => {
        toast.success('Welcome to Premium! 🎉');
      },
      onError: (error) => {
        console.error('Failed to update subscription:', error);
      },
    });
  }, [subscribeUser]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-3xl">Payment Successful!</CardTitle>
          <CardDescription className="text-base mt-2">
            Thank you for subscribing to Caffeine Social Premium
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Your premium features are now active. Enjoy your enhanced experience!
          </p>
          <Button onClick={() => navigate({ to: '/profile' })} className="w-full gap-2">
            Go to Profile
            <ArrowRight className="w-4 h-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
