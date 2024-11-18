"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Route } from "lucide-react";

interface OptimizedRoute {
  totalDistance: string;
  totalTime: string;
  waypoints: Array<{
    order: number;
    location: string;
    type: string;
    estimatedTime: string;
    priority?: number;
  }>;
  googleMapsUrl: string;
  appleMapsUrl: string;
}

export default function ResultsPage() {
  const [optimizedRoute, setOptimizedRoute] = useState<OptimizedRoute | null>(
    null
  );
  const searchParams = useSearchParams();

  useEffect(() => {
    const routeData = searchParams.get("routeData");
    if (routeData) {
      setOptimizedRoute(JSON.parse(routeData));
    }
  }, [searchParams]);

  if (!optimizedRoute) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6 text-center">
        Your Optimized Route
      </h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Route Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center">
              <Route className="w-6 h-6 mr-2" />
              <p>Total Distance: {optimizedRoute.totalDistance}</p>
            </div>
            <div className="flex items-center">
              <Clock className="w-6 h-6 mr-2" />
              <p>Total Time: {optimizedRoute.totalTime}</p>
            </div>
          </div>
          <h2 className="text-xl font-semibold mt-4 mb-2">Waypoints:</h2>
          <ul className="space-y-2">
            {optimizedRoute.waypoints.map((waypoint, index) => (
              <li
                key={index}
                className="flex items-center bg-gray-100 p-2 rounded-lg"
              >
                <span className="inline-flex items-center justify-center w-8 h-8 mr-3 text-lg font-semibold text-blue-800 bg-blue-200 rounded-full">
                  {waypoint.order}
                </span>
                <div>
                  <p className="font-medium">{waypoint.location}</p>
                  <p className="text-sm text-gray-600">{waypoint.type}</p>
                  <p className="text-sm text-gray-600">
                    Estimated Time: {waypoint.estimatedTime}
                  </p>
                  {waypoint.priority && (
                    <p className="text-sm text-gray-600">
                      Priority: {waypoint.priority}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <Button
              className="flex-1"
              onClick={() =>
                window.open(optimizedRoute.googleMapsUrl, "_blank")
              }
            >
              <MapPin className="w-5 h-5 mr-2" />
              Open in Google Maps
            </Button>
            <Button
              className="flex-1"
              onClick={() => window.open(optimizedRoute.appleMapsUrl, "_blank")}
            >
              <MapPin className="w-5 h-5 mr-2" />
              Open in Apple Maps
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}