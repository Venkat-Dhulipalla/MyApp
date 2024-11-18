"use client";

import MultiPickupPlanner from "./MultiPickupPlanner";
import WaypointRoutePlanner from "./WaypointRoutePlanner";

interface RouteGeneratorFormProps {
  initialMode: "multi" | "waypoint";
}

export default function RouteGeneratorForm({
  initialMode,
}: RouteGeneratorFormProps) {
  return initialMode === "multi" ? (
    <MultiPickupPlanner />
  ) : (
    <WaypointRoutePlanner />
  );
}
