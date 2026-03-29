import { Toaster } from "@/components/ui/sonner";
import {
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { ThemeProvider } from "next-themes";
import pwaIcon192 from "/assets/generated/saminsta-icon.dim_192x192.png";
import pwaIcon512 from "/assets/generated/saminsta-icon.dim_512x512.png";
import AuthGuard from "./components/AuthGuard";
import Layout from "./components/Layout";
import Explore from "./pages/Explore";
import Home from "./pages/Home";
import Messages from "./pages/Messages";
import Notifications from "./pages/Notifications";
import PaymentFailure from "./pages/PaymentFailure";
import PaymentSuccess from "./pages/PaymentSuccess";
import Profile from "./pages/Profile";
import Reels from "./pages/Reels";
import Settings from "./pages/Settings";
import Stories from "./pages/Stories";
import Subscribe from "./pages/Subscribe";
import UserProfilePage from "./pages/UserProfilePage";

const rootRoute = createRootRoute({
  component: () => (
    <Layout>
      <AuthGuard />
    </Layout>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Home,
});
const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile",
  component: Profile,
});
const subscribeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/subscribe",
  component: Subscribe,
});
const storiesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/stories",
  component: Stories,
});
const reelsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/reels",
  component: Reels,
});
const exploreRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/explore",
  component: Explore,
});
const notificationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/notifications",
  component: Notifications,
});
const messagesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/messages",
  component: Messages,
});
const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings",
  component: Settings,
});
const paymentSuccessRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/payment-success",
  component: PaymentSuccess,
});
const paymentFailureRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/payment-failure",
  component: PaymentFailure,
});
const userProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/user/$userId",
  component: function UserProfileRouteComponent() {
    const { userId } = userProfileRoute.useParams();
    return <UserProfilePage userId={userId} />;
  },
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  profileRoute,
  subscribeRoute,
  storiesRoute,
  reelsRoute,
  exploreRoute,
  notificationsRoute,
  messagesRoute,
  settingsRoute,
  paymentSuccessRoute,
  paymentFailureRoute,
  userProfileRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark">
      {/* PWA icons referenced here so build pipeline preserves the files */}
      <img
        src={pwaIcon512}
        style={{ display: "none" }}
        aria-hidden="true"
        alt=""
      />
      <img
        src={pwaIcon192}
        style={{ display: "none" }}
        aria-hidden="true"
        alt=""
      />
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  );
}
