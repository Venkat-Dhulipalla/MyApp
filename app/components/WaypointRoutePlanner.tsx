"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { AddressInput } from "@/components/AddressInput";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus, Navigation } from "lucide-react";
import { FormErrors } from "@/app/types";

interface Waypoint {
  location: string;
  priority: number;
}

interface FormData {
  startPoint: string;
  endPoint: string;
  waypoints: Waypoint[];
}

export default function WaypointRoutePlanner() {
  const [formData, setFormData] = useState<FormData>({
    startPoint: "",
    endPoint: "",
    waypoints: [{ location: "", priority: 1 }],
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const getCurrentLocation = async () => {
    setIsLoadingLocation(true);
    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        }
      );

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${position.coords.latitude},${position.coords.longitude}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();

      if (data.results[0]) {
        setFormData((prev) => ({
          ...prev,
          startPoint: data.results[0].formatted_address,
        }));
      }
    } catch (error) {
      console.error("Error getting location:", error);
      alert("Could not get current location. Please enter address manually.");
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};
    if (!formData.startPoint) newErrors.startPoint = "Start point is required";
    if (!formData.endPoint) newErrors.endPoint = "End point is required";
    formData.waypoints.forEach((waypoint, index) => {
      if (!waypoint.location) {
        newErrors[`waypoints.${index}`] = "Waypoint location is required";
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/optimize-route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "waypoint",
          startPoint: formData.startPoint,
          endPoint: formData.endPoint,
          waypoints: formData.waypoints,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to optimize route");
      }

      const result = await response.json();
      const params = new URLSearchParams();
      params.append("routeData", JSON.stringify(result));
      window.location.href = `/results?${params.toString()}`;
    } catch (error) {
      console.error("Error:", error);
      alert(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const addWaypoint = () => {
    setFormData((prev) => ({
      ...prev,
      waypoints: [...prev.waypoints, { location: "", priority: 1 }],
    }));
  };

  const removeWaypoint = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      waypoints: prev.waypoints.filter((_, i) => i !== index),
    }));
  };

  const handlePriorityChange = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      waypoints: prev.waypoints.map((wp, i) =>
        i === index ? { ...wp, priority: parseInt(value) } : wp
      ),
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Waypoint Route Planner</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Start Point
                </label>
                <div className="flex gap-2">
                  <AddressInput
                    id="startPoint"
                    label="Start Point"
                    value={formData.startPoint}
                    onChange={(value) =>
                      setFormData((prev) => ({ ...prev, startPoint: value }))
                    }
                    error={errors.startPoint}
                    placeholder="Enter start point"
                    region="us"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={getCurrentLocation}
                    disabled={isLoadingLocation}
                  >
                    {isLoadingLocation ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
                    ) : (
                      <Navigation className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  End Point
                </label>
                <AddressInput
                  id="endPoint"
                  label="End Point"
                  value={formData.endPoint}
                  onChange={(value) =>
                    setFormData((prev) => ({ ...prev, endPoint: value }))
                  }
                  error={errors.endPoint}
                  placeholder="Enter end point"
                  region="us"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">Waypoints</h3>
              {formData.waypoints.map((waypoint, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium">
                          Waypoint {index + 1}
                        </h4>
                        {index > 0 && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeWaypoint(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Location
                          </label>
                          <AddressInput
                            id={`waypoint-${index}`}
                            value={waypoint.location}
                            label="Location"
                            onChange={(value) =>
                              setFormData((prev) => ({
                                ...prev,
                                waypoints: prev.waypoints.map((wp, i) =>
                                  i === index ? { ...wp, location: value } : wp
                                ),
                              }))
                            }
                            error={errors[`waypoints.${index}`]}
                            placeholder="Enter location"
                            region="us"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Priority
                          </label>
                          <Select
                            value={waypoint.priority.toString()}
                            onValueChange={(value) =>
                              handlePriorityChange(index, value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                            <SelectContent>
                              {[1, 2, 3, 4, 5, 6].map((priority) => (
                                <SelectItem
                                  key={priority}
                                  value={priority.toString()}
                                >
                                  Priority {priority}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={addWaypoint}
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Waypoint
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Generating Route..." : "Generate Route"}
      </Button>
    </form>
  );
}
