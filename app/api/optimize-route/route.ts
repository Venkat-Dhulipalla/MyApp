import { NextResponse } from "next/server";

interface Location {
  address: string;
  priority?: number;
}

interface RouteRequest {
  mode: "multi" | "waypoint";
  locations: Location[];
  startPoint?: string;
  endPoint?: string;
}

function generateRandomTime() {
  const hours = Math.floor(Math.random() * 24)
    .toString()
    .padStart(2, "0");
  const minutes = Math.floor(Math.random() * 60)
    .toString()
    .padStart(2, "0");
  return `${hours}:${minutes}`;
}

export async function POST(request: Request) {
  const data: RouteRequest = await request.json();

  // Here you would typically call the Google Maps API to optimize the route
  // For this example, we'll just return a mock response with estimated times

  let sortedLocations: Location[];
  if (data.mode === "multi") {
    sortedLocations = [...data.locations].sort(
      (a, b) => (a.priority || 0) - (b.priority || 0)
    );
  } else {
    sortedLocations = data.locations;
  }

  const mockOptimizedRoute = {
    totalDistance: "75 km",
    totalTime: "2 hours 15 minutes",
    waypoints: [
      ...(data.mode === "waypoint"
        ? [
            {
              order: 0,
              location: data.startPoint!,
              type: "start",
              estimatedTime: generateRandomTime(),
            },
          ]
        : []),
      ...sortedLocations.map((location, index) => ({
        order: data.mode === "waypoint" ? index + 1 : index,
        location: location.address,
        type:
          data.mode === "multi"
            ? index % 2 === 0
              ? "pickup"
              : "dropoff"
            : "waypoint",
        estimatedTime: generateRandomTime(),
        priority: location.priority,
      })),
      ...(data.mode === "waypoint"
        ? [
            {
              order: sortedLocations.length + 1,
              location: data.endPoint!,
              type: "end",
              estimatedTime: generateRandomTime(),
            },
          ]
        : []),
    ],
    googleMapsUrl: `https://www.google.com/maps/dir/${
      data.mode === "waypoint"
        ? `${encodeURIComponent(data.startPoint!)}/${sortedLocations
            .map((loc) => encodeURIComponent(loc.address))
            .join("/")}/${encodeURIComponent(data.endPoint!)}`
        : sortedLocations
            .map((loc) => encodeURIComponent(loc.address))
            .join("/")
    }`,
    appleMapsUrl: `http://maps.apple.com/?${
      data.mode === "waypoint"
        ? `saddr=${encodeURIComponent(data.startPoint!)}&daddr=${sortedLocations
            .map((loc) => encodeURIComponent(loc.address))
            .join("+to:")}&daddr=${encodeURIComponent(data.endPoint!)}`
        : `daddr=${sortedLocations
            .map((loc) => encodeURIComponent(loc.address))
            .join("+to:")}`
    }`,
  };

  return NextResponse.json(mockOptimizedRoute);
}
