"use client";

import React, { useState, useEffect, useRef } from "react";
import { useLoadScript } from "@react-google-maps/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus, Navigation } from "lucide-react";

interface Waypoint {
  location: string;
  priority: number;
}

interface FormData {
  startPoint: string;
  endPoint: string;
  waypoints: Waypoint[];
}

const libraries = ["places"];

export default function WaypointRoutePlanner() {
  const [formData, setFormData] = useState<FormData>({
    startPoint: "",
    endPoint: "",
    waypoints: [{ location: "", priority: 1 }],
  });
  const [errors, setErrors] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: libraries as any,
  });

  const autocompleteRefs = useRef<{
    [key: string]: google.maps.places.Autocomplete | null;
  }>({});

  useEffect(() => {
    if (isLoaded) {
      initializeAutocomplete("startPoint");
      initializeAutocomplete("endPoint");
      formData.waypoints.forEach((_, index) => {
        initializeAutocomplete(`waypoint-${index}`);
      });
    }
  }, [isLoaded, formData.waypoints.length]);

  const initializeAutocomplete = (id: string) => {
    if (!document.getElementById(id)) return;

    const autocomplete = new google.maps.places.Autocomplete(
      document.getElementById(id) as HTMLInputElement,
      { types: ["geocode"] }
    );
    autocompleteRefs.current[id] = autocomplete;

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (place.formatted_address) {
        if (id === "startPoint" || id === "endPoint") {
          setFormData((prev) => ({ ...prev, [id]: place.formatted_address! }));
        } else {
          const index = parseInt(id.split("-")[1]);
          setFormData((prev) => ({
            ...prev,
            waypoints: prev.waypoints.map((wp, i) =>
              i === index ? { ...wp, location: place.formatted_address! } : wp
            ),
          }));
        }
      }
    });
  };

  const getCurrentLocation = () => {
    setIsLoadingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
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
            console.error("Error getting address:", error);
          } finally {
            setIsLoadingLocation(false);
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          setIsLoadingLocation(false);
        }
      );
    } else {
      setIsLoadingLocation(false);
      alert("Geolocation is not supported by your browser");
    }
  };

  const validateForm = () => {
    const newErrors: any = {};
    if (!formData.startPoint) {
      newErrors.startPoint = "Start point is required";
    }
    if (!formData.endPoint) {
      newErrors.endPoint = "End point is required";
    }
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
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        const response = await fetch("/api/optimize-route", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            mode: "waypoint",
            startPoint: formData.startPoint,
            endPoint: formData.endPoint,
            waypoints: formData.waypoints.map((wp) => ({
              location: wp.location,
            })),
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
          error instanceof Error
            ? error.message
            : "An unexpected error occurred"
        );
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleWaypointChange = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      waypoints: prev.waypoints.map((wp, i) =>
        i === index ? { ...wp, location: value } : wp
      ),
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

  if (!isLoaded) return <div>Loading...</div>;

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
                <label
                  htmlFor="startPoint"
                  className="block text-sm font-medium text-gray-700"
                >
                  Start Point
                </label>
                <div className="flex gap-2">
                  <Input
                    id="startPoint"
                    value={formData.startPoint}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        startPoint: e.target.value,
                      }))
                    }
                    className={errors.startPoint ? "border-red-500" : ""}
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
                {errors.startPoint && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.startPoint}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="endPoint"
                  className="block text-sm font-medium text-gray-700"
                >
                  End Point
                </label>
                <Input
                  id="endPoint"
                  value={formData.endPoint}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      endPoint: e.target.value,
                    }))
                  }
                  className={errors.endPoint ? "border-red-500" : ""}
                />
                {errors.endPoint && (
                  <p className="mt-1 text-sm text-red-500">{errors.endPoint}</p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">Waypoints</h3>
              {formData.waypoints.map((waypoint, index) => (
                <Card key={index} className="border-2">
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
                          <label
                            htmlFor={`waypoint-${index}`}
                            className="block text-sm font-medium text-gray-700"
                          >
                            Location
                          </label>
                          <Input
                            id={`waypoint-${index}`}
                            value={waypoint.location}
                            onChange={(e) =>
                              handleWaypointChange(index, e.target.value)
                            }
                            className={
                              errors[`waypoints.${index}`]
                                ? "border-red-500"
                                : ""
                            }
                          />
                          {errors[`waypoints.${index}`] && (
                            <p className="mt-1 text-sm text-red-500">
                              {errors[`waypoints.${index}`]}
                            </p>
                          )}
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
