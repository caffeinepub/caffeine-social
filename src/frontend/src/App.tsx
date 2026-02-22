import { RouterProvider, createRouter, createRoute, createRootRoute } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import Layout from './components/Layout';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Subscribe from './pages/Subscribe';
import Stories from './pages/Stories';
import Reels from './pages/Reels';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailure from './pages/PaymentFailure';
import AuthGuard from './components/AuthGuard';

const rootRoute = createRootRoute({
  component: () => (
    <Layout>
      <AuthGuard />
    </Layout>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Home,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  component: Profile,
});

const subscribeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/subscribe',
  component: Subscribe,
});

const storiesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/stories',
  component: Stories,
});

const reelsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reels',
  component: Reels,
});

const paymentSuccessRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/payment-success',
  component: PaymentSuccess,
});

const paymentFailureRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/payment-failure',
  component: PaymentFailure,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  profileRoute,
  subscribeRoute,
  storiesRoute,
  reelsRoute,
  paymentSuccessRoute,
  paymentFailureRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  );
}
