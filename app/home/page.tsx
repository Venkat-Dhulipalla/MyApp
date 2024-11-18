import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

export default async function HomePage() {
  try {
    const { userId } = await auth();

    // If no userId, redirect to landing page
    if (!userId) {
      redirect("/");
    }

    // Fetch user data safely
    const user = await currentUser();
    if (!user) {
      redirect("/");
    }

    return (
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow">
          <div className="container mx-auto px-4 py-6 flex justify-between items-center">
            <h1 className="text-3xl font-bold text-blue-600">SmartRoute</h1>
            <UserButton afterSignOutUrl="/" />
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <h2 className="text-2xl font-semibold mb-6">
            Welcome, {user?.firstName || "User"}!
          </h2>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Link href="/planner?mode=multi">
              <Button variant="outline" className="w-full h-32 text-lg">
                Multi-Pickup & Drop-off Planner
              </Button>
            </Link>
            <Link href="/planner?mode=waypoint">
              <Button variant="outline" className="w-full h-32 text-lg">
                Waypoint Route Planner
              </Button>
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
