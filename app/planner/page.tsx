"use client";

import { useSearchParams } from "next/navigation";
import RouteGeneratorForm from "../components/RouteGeneratorForm";

export default function PlannerPage() {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") as "multi" | "waypoint";

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-8">
          {mode === "multi"
            ? "Multi-Pickup & Drop-off Planner"
            : "Waypoint Route Planner"}
        </h1>
        <RouteGeneratorForm initialMode={mode} />
      </div>
    </div>
  );
}
