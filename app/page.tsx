import { Button } from "@/components/ui/button";
import { SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white">
      <div className="container mx-auto px-4 py-16">
        <header className="flex justify-between items-center mb-16">
          <h1 className="text-3xl font-bold text-blue-600">SmartRoute</h1>
          <SignedOut>
            <SignInButton
              mode="modal"
              fallbackRedirectUrl="/home"
              signUpFallbackRedirectUrl="/home"
            >
              <Button variant="outline">Sign In</Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <Link href="/home">
              <Button variant="outline">Go to Dashboard</Button>
            </Link>
          </SignedIn>
        </header>

        <main className="text-center">
          <h2 className="text-5xl font-bold mb-6">
            Optimize Your Routes with SmartRoute
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Efficient route planning for multiple stops and waypoints
          </p>
          <SignedOut>
            <SignInButton
              mode="modal"
              fallbackRedirectUrl="/home"
              signUpFallbackRedirectUrl="/home"
            >
              <Button size="lg" className="text-lg">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <Link href="/home">
              <Button size="lg" className="text-lg">
                Go to Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </SignedIn>
        </main>
      </div>
    </div>
  );
}
