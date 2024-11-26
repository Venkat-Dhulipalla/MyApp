"use client";

import React, { useState } from "react";
import { useLoadScript } from "@react-google-maps/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
import { libraries } from "@/lib/maps-config";

interface Passenger {
  name: string;
  pickup: { address: string; priority: number };
  dropoff: { address: string; priority: number };
}

interface FormData {
  currentLocation: string;
  passengers: Passenger[];
}

export default function MultiPickupPlanner() {
  const [formData, setFormData] = useState<FormData>({
    currentLocation: "",
    passengers: [
      {
        name: "",
        pickup: { address: "", priority: 1 },
        dropoff: { address: "", priority: 1 },
      },
    ],
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: libraries,
  });

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.currentLocation?.trim()) {
      newErrors.currentLocation = "Current location is required";
    }

    formData.passengers.forEach((passenger, index) => {
      if (!passenger.pickup.address?.trim()) {
        newErrors[`passengers.${index}.pickup`] = "Pickup location is required";
      }
      if (!passenger.dropoff.address?.trim()) {
        newErrors[`passengers.${index}.dropoff`] =
          "Drop-off location is required";
      }
    });

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!validateForm()) {
        console.log("Form validation failed");
        return;
      }

      setIsSubmitting(true);

      console.log("Current form data:", formData);

      const locations = [];

      if (formData.currentLocation) {
        locations.push({
          address: formData.currentLocation,
          priority: 0,
          type: "start",
          passengerName: null,
        });
      }

      formData.passengers.forEach((passenger) => {
        locations.push({
          address: passenger.pickup.address,
          priority: passenger.pickup.priority,
          type: "pickup",
          passengerName: passenger.name,
        });

        locations.push({
          address: passenger.dropoff.address,
          priority: passenger.dropoff.priority,
          type: "dropoff",
          passengerName: passenger.name,
        });
      });

      const requestData = {
        mode: "multi",
        locations: locations,
      };

      console.log("Request data:", requestData);

      const response = await fetch("/api/optimize-route", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to optimize route");
      }

      const result = await response.json();

      console.log("API response:", result);

      if (result) {
        const queryParam = encodeURIComponent(JSON.stringify(result));
        window.location.href = `/results?routeData=${queryParam}`;
      } else {
        throw new Error("No result data received from API");
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);

      alert(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    } finally {
      setIsSubmitting(false);
    }
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
                currentLocation: data.results[0].formatted_address,
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

  const addPassenger = () => {
    setFormData((prev) => ({
      ...prev,
      passengers: [
        ...prev.passengers,
        {
          name: "",
          pickup: { address: "", priority: 1 },
          dropoff: { address: "", priority: 1 },
        },
      ],
    }));
  };

  const removePassenger = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      passengers: prev.passengers.filter((_, i) => i !== index),
    }));
  };

  const handlePassengerChange = (
    index: number,
    field: string,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      passengers: prev.passengers.map((passenger, i) => {
        if (i === index) {
          return { ...passenger, [field]: value };
        }
        return passenger;
      }),
    }));
  };

  const handleLocationChange = (
    index: number,
    type: "pickup" | "dropoff",
    field: "address" | "priority",
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      passengers: prev.passengers.map((passenger, i) => {
        if (i === index) {
          return {
            ...passenger,
            [type]: {
              ...passenger[type],
              [field]: value,
            },
          };
        }
        return passenger;
      }),
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Multi-Pickup & Drop-off Planner</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Current Location */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Current Location</label>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <AddressInput
                    id="currentLocation"
                    label="Current Location"
                    value={formData.currentLocation}
                    onChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        currentLocation: value,
                      }))
                    }
                    error={errors.currentLocation}
                    placeholder="Enter your current location"
                    region="us"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={getCurrentLocation}
                  disabled={isLoadingLocation}
                  className="h-9"
                >
                  <Navigation className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Passengers */}
            <div className="space-y-4">
              <h3 className="font-medium">Passengers</h3>
              {formData.passengers.map((passenger, index) => (
                <Card key={index} className="border-2">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium">
                          Passenger {index + 1}
                        </h4>
                        {index > 0 && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removePassenger(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Passenger Name (Optional)
                        </label>
                        <Input
                          value={passenger.name}
                          onChange={(e) =>
                            handlePassengerChange(index, "name", e.target.value)
                          }
                          className={
                            errors[`passengers.${index}.name`]
                              ? "border-red-500"
                              : ""
                          }
                        />
                      </div>

                      <div className="space-y-4">
                        <div>
                          <div className="md:grid md:grid-cols-[1fr,auto] md:gap-4">
                            <div className="mb-2 md:mb-0">
                              <label>Pickup Location</label>
                              <AddressInput
                                id={`pickup-${index}`}
                                label="Pickup Location"
                                value={passenger.pickup.address}
                                onChange={(value) =>
                                  handleLocationChange(
                                    index,
                                    "pickup",
                                    "address",
                                    value
                                  )
                                }
                                error={errors[`passengers.${index}.pickup`]}
                                placeholder="Enter pickup location"
                                region="us"
                              />
                            </div>
                            <div className="w-24">
                              <label>Priority</label>
                              <Select
                                value={passenger.pickup.priority.toString()}
                                onValueChange={(value) =>
                                  handleLocationChange(
                                    index,
                                    "pickup",
                                    "priority",
                                    parseInt(value)
                                  )
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="1" />
                                </SelectTrigger>
                                <SelectContent>
                                  {[1, 2, 3, 4, 5].map((n) => (
                                    <SelectItem key={n} value={n.toString()}>
                                      {n}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>

                        <div>
                          <div className="md:grid md:grid-cols-[1fr,auto] md:gap-4">
                            <div className="mb-2 md:mb-0">
                              <label>Drop-off Location</label>
                              <AddressInput
                                id={`dropoff-${index}`}
                                label="Drop-off Location"
                                value={passenger.dropoff.address}
                                onChange={(value) =>
                                  handleLocationChange(
                                    index,
                                    "dropoff",
                                    "address",
                                    value
                                  )
                                }
                                error={errors[`passengers.${index}.dropoff`]}
                                placeholder="Enter drop-off location"
                                region="us"
                              />
                            </div>
                            <div className="w-24">
                              <label>Priority</label>
                              <Select
                                value={passenger.dropoff.priority.toString()}
                                onValueChange={(value) =>
                                  handleLocationChange(
                                    index,
                                    "dropoff",
                                    "priority",
                                    parseInt(value)
                                  )
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="1" />
                                </SelectTrigger>
                                <SelectContent>
                                  {[1, 2, 3, 4, 5].map((n) => (
                                    <SelectItem key={n} value={n.toString()}>
                                      {n}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={addPassenger}
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Passenger
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
