import { Button } from "@/components/ui/button";
import { SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { ArrowRight, MapPin, Navigation, Zap } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="container mx-auto flex-grow px-4">
        {/* Header */}
        <header className="flex h-20 items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold text-primary">SmartRoute</h1>
          </div>
          <div>
            <SignedOut>
              <SignInButton
                mode="modal"
                fallbackRedirectUrl="/home"
                signUpFallbackRedirectUrl="/home"
              >
                <Button variant="outline" className="font-medium">
                  Sign In
                </Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link href="/home">
                <Button variant="outline" className="font-medium">
                  Go to Dashboard
                </Button>
              </Link>
            </SignedIn>
          </div>
        </header>

        {/* Hero Section */}
        <main className="py-20">
          <div className="mx-auto max-w-5xl text-center">
            <h2 className="mb-8 text-6xl font-bold tracking-tight text-foreground sm:text-7xl">
              Optimize Your Routes with SmartRoute
            </h2>
            <p className="mx-auto mb-12 max-w-2xl text-xl text-muted-foreground">
              Plan efficient routes, save time, and reduce costs with our
              advanced route optimization platform. Perfect for delivery
              services and field operations.
            </p>
            <div className="flex justify-center gap-4">
              <SignedOut>
                <SignInButton
                  mode="modal"
                  fallbackRedirectUrl="/home"
                  signUpFallbackRedirectUrl="/home"
                >
                  <Button size="lg" className="gap-2 text-lg">
                    Get Started
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <Link href="/home">
                  <Button size="lg" className="gap-2 text-lg">
                    Go to Dashboard
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
              </SignedIn>
            </div>
          </div>

          {/* Features Grid */}
          <div className="mx-auto mt-32 max-w-5xl">
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {/* Feature 1 */}
              <div className="group rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md">
                <div className="mb-4 inline-block rounded-lg bg-primary/10 p-3">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-card-foreground">
                  Multi-Stop Planning
                </h3>
                <p className="text-muted-foreground">
                  Optimize routes with multiple pickup and delivery points
                  automatically.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="group rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md">
                <div className="mb-4 inline-block rounded-lg bg-primary/10 p-3">
                  <Navigation className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-card-foreground">
                  Waypoint Routing
                </h3>
                <p className="text-muted-foreground">
                  Create efficient routes with specific waypoints and stops.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="group rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md">
                <div className="mb-4 inline-block rounded-lg bg-primary/10 p-3">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-card-foreground">
                  Real-time Updates
                </h3>
                <p className="text-muted-foreground">
                  Get live updates and optimize routes on the go.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="mt-20 border-t bg-muted py-12 text-muted-foreground">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
            <div>
              <h3 className="mb-4 text-lg font-semibold text-foreground">
                SmartRoute
              </h3>
              <p className="text-sm">
                Optimizing routes for businesses worldwide.
              </p>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase">Product</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="hover:text-primary">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary">
                    API
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase">Company</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="hover:text-primary">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary">
                    Careers
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="hover:text-primary">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary">
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-border pt-8 text-center text-sm">
            <p>
              &copy; {new Date().getFullYear()} SmartRoute. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
