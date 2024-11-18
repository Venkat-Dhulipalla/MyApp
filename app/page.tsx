import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { MapPin, Route } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex flex-col items-center justify-center">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-8">
          SmartRoute Planner
        </h1>
        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Multi-Pickup & Drop-off</CardTitle>
              <CardDescription>
                Optimize routes for multiple pickup and drop-off locations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/planner?mode=multi">
                <Button className="w-full">
                  <MapPin className="mr-2 h-4 w-4" />
                  Start Planning
                </Button>
              </Link>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Waypoint Route Planner</CardTitle>
              <CardDescription>
                Plan a route with a fixed start and end point, including
                multiple waypoints
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/planner?mode=waypoint">
                <Button className="w-full">
                  <Route className="mr-2 h-4 w-4" />
                  Start Planning
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
