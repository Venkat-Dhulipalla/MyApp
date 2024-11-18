import { NextResponse } from "next/server";

interface RouteRequest {
  mode: "multi" | "waypoint";
  startPoint?: string;
  endPoint?: string;
  waypoints?: Array<{ location: string }>;
  locations?: Array<{
    address: string;
    priority: number;
    type: "start" | "pickup" | "dropoff";
    passengerName: string | null;
  }>;
}

export async function POST(request: Request) {
  try {
    const data: RouteRequest = await request.json();

    if (data.mode === "waypoint") {
      // Handle waypoint mode
      const allPoints = [
        { address: data.startPoint!, type: "start" },
        ...(data.waypoints || []).map((w) => ({
          address: w.location,
          type: "waypoint",
        })),
        { address: data.endPoint!, type: "end" },
      ];

      const optimizedRoute = {
        totalDistance: "15.6 km",
        totalTime: "25 mins",
        waypoints: allPoints.map((point, index) => ({
          order: index + 1,
          location: point.address,
          type: point.type,
          estimatedTime: "5 mins",
        })),
        googleMapsUrl: `https://www.google.com/maps/dir/${allPoints
          .map((point) => encodeURIComponent(point.address))
          .join("/")}`,
        appleMapsUrl: `http://maps.apple.com/?daddr=${allPoints
          .map((point) => encodeURIComponent(point.address))
          .join("+to:")}`,
      };

      return NextResponse.json(optimizedRoute);
    } else {
      // Handle multi mode (existing logic)
      const sortedLocations = [...(data.locations || [])].sort(
        (a, b) => a.priority - b.priority
      );

      const optimizedRoute = {
        totalDistance: "15.6 km",
        totalTime: "25 mins",
        waypoints: sortedLocations.map((loc, index) => ({
          order: index + 1,
          location: loc.address,
          type: loc.type,
          estimatedTime: "5 mins",
          priority: loc.priority,
          passengerName: loc.passengerName,
        })),
        googleMapsUrl: `https://www.google.com/maps/dir/${sortedLocations
          .map((loc) => encodeURIComponent(loc.address))
          .join("/")}`,
        appleMapsUrl: `http://maps.apple.com/?daddr=${sortedLocations
          .map((loc) => encodeURIComponent(loc.address))
          .join("+to:")}`,
      };

      return NextResponse.json(optimizedRoute);
    }
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Internal server error",
        error: true,
      },
      { status: 500 }
    );
  }
}
