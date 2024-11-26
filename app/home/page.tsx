import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MapPin, Navigation, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  try {
    const { userId } = await auth();
    if (!userId) redirect("/");

    const user = await currentUser();
    if (!user) redirect("/");

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        {/* Header */}
        <header className="border-b bg-white/50 backdrop-blur-xl dark:bg-slate-900/50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white lg:text-3xl">
                  SmartRoute
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  {user.firstName}
                </span>
                <UserButton afterSignOutUrl="/" />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-12">
          <div className="mb-12 space-y-2">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Welcome back, {user.firstName}!
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Choose a route planning option to get started
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Multi-Pickup Card */}
            <Link href="/planner?mode=multi" className="group">
              <Card className="h-full overflow-hidden border-slate-200 transition-all duration-300 hover:border-blue-500/50 hover:shadow-lg dark:border-slate-800 dark:hover:border-blue-500/50">
                <CardHeader className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 pb-12 pt-6 dark:from-blue-600 dark:to-indigo-700">
                  <div className="absolute inset-0 bg-grid-white/10"></div>
                  <CardTitle className="text-lg font-semibold text-white">
                    Multi-Pickup & Drop-off
                  </CardTitle>
                  <CardDescription className="text-blue-100">
                    Optimize routes with multiple stops and deliveries
                  </CardDescription>
                  <MapPin className="absolute bottom-4 right-4 h-8 w-8 text-white/20" />
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
                    <span>Plan complex delivery routes</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Waypoint Card */}
            <Link href="/planner?mode=waypoint" className="group">
              <Card className="h-full overflow-hidden border-slate-200 transition-all duration-300 hover:border-green-500/50 hover:shadow-lg dark:border-slate-800 dark:hover:border-green-500/50">
                <CardHeader className="relative overflow-hidden bg-gradient-to-br from-green-500 to-emerald-600 pb-12 pt-6 dark:from-green-600 dark:to-emerald-700">
                  <div className="absolute inset-0 bg-grid-white/10"></div>
                  <CardTitle className="text-lg font-semibold text-white">
                    Waypoint Route Planner
                  </CardTitle>
                  <CardDescription className="text-green-100">
                    Create routes with specific waypoints
                  </CardDescription>
                  <Navigation className="absolute bottom-4 right-4 h-8 w-8 text-white/20" />
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
                    <span>Design custom travel routes</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </main>
      </div>
    );
  } catch (error) {
    console.error("Error in HomePage:", error);
    redirect("/");
  }
}
