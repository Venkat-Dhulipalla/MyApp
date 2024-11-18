"use client";

import { useState, useEffect, useRef } from "react";
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
import { Trash2, Plus, MapPin, Navigation } from "lucide-react";

interface Location {
  address: string;
  priority: number;
}

interface Passenger {
  name: string;
  pickup: Location;
  dropoff: Location;
}

interface FormData {
  currentLocation: string;
  passengers: Passenger[];
}

const libraries = ["places"];

export default function RouteGeneratorForm() {
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
      initializeAutocomplete("currentLocation");
      formData.passengers.forEach((_, index) => {
        initializeAutocomplete(`pickup-${index}`);
        initializeAutocomplete(`dropoff-${index}`);
      });
    }
  }, [isLoaded, formData.passengers.length]);

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
        if (id === "currentLocation") {
          setFormData((prev) => ({
            ...prev,
            currentLocation: place.formatted_address!,
          }));
        } else {
          const [type, index] = id.split("-");
          const passengerIndex = parseInt(index);
          setFormData((prev) => ({
            ...prev,
            passengers: prev.passengers.map((passenger, i) =>
              i === passengerIndex
                ? {
                    ...passenger,
                    [type]: {
                      ...passenger[type as "pickup" | "dropoff"],
                      address: place.formatted_address!,
                    },
                  }
                : passenger
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

  const validateForm = () => {
    const newErrors: any = {};
    if (!formData.currentLocation) {
      newErrors.currentLocation = "Current location is required";
    }
    formData.passengers.forEach((passenger, index) => {
      if (!passenger.name) {
        newErrors[`passengers.${index}.name`] = "Passenger name is required";
      }
      if (!passenger.pickup.address) {
        newErrors[`passengers.${index}.pickup`] = "Pickup location is required";
      }
      if (!passenger.dropoff.address) {
        newErrors[`passengers.${index}.dropoff`] =
          "Drop-off location is required";
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
        const apiRequestData = {
          mode: "multi",
          locations: formData.passengers.flatMap((passenger) => [
            {
              address: passenger.pickup.address,
              priority: passenger.pickup.priority,
            },
            {
              address: passenger.dropoff.address,
              priority: passenger.dropoff.priority,
            },
          ]),
        };

        const response = await fetch("/api/optimize-route", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(apiRequestData),
        });

        if (!response.ok) {
          throw new Error("Failed to optimize route");
        }
        const result = await response.json();
        window.location.href = `/results?routeData=${encodeURIComponent(
          JSON.stringify(result)
        )}`;
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handlePassengerChange = (
    index: number,
    field: string,
    value: string | { address: string; priority: number }
  ) => {
    setFormData((prev) => ({
      ...prev,
      passengers: prev.passengers.map((passenger, i) =>
        i === index
          ? {
              ...passenger,
              [field]: typeof value === "string" ? value : { ...value },
            }
          : passenger
      ),
    }));
  };

  const handleLocationChange = (
    index: number,
    type: "pickup" | "dropoff",
    address: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      passengers: prev.passengers.map((passenger, i) =>
        i === index
          ? {
              ...passenger,
              [type]: {
                ...passenger[type],
                address,
                priority: passenger[type].priority || 1,
              },
            }
          : passenger
      ),
    }));
  };

  const handleLocationPriorityChange = (
    index: number,
    type: "pickup" | "dropoff",
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      passengers: prev.passengers.map((passenger, i) =>
        i === index
          ? {
              ...passenger,
              [type]: { ...passenger[type], priority: parseInt(value) },
            }
          : passenger
      ),
    }));
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

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Multi-Pickup & Drop-off</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="currentLocation"
                className="block text-sm font-medium text-gray-700"
              >
                Current Location
              </label>
              <div className="flex gap-2">
                <Input
                  id="currentLocation"
                  value={formData.currentLocation}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      currentLocation: e.target.value,
                    }))
                  }
                  className={errors.currentLocation ? "border-red-500" : ""}
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
              {errors.currentLocation && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.currentLocation}
                </p>
              )}
            </div>

            {formData.passengers.map((passenger, index) => (
              <Card key={index} className="border-2">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">
                        Passenger {index + 1}
                      </h3>
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

                    <div>
                      <label
                        htmlFor={`name-${index}`}
                        className="block text-sm font-medium text-gray-700"
                      >
                        Passenger Name
                      </label>
                      <Input
                        id={`name-${index}`}
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
                      {errors[`passengers.${index}.name`] && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors[`passengers.${index}.name`]}
                        </p>
                      )}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor={`pickup-${index}`}
                          className="block text-sm font-medium text-gray-700"
                        >
                          Pickup Location
                        </label>
                        <div className="mt-1 space-y-2">
                          <Input
                            id={`pickup-${index}`}
                            value={passenger.pickup.address || ""}
                            onChange={(e) =>
                              handleLocationChange(
                                index,
                                "pickup",
                                e.target.value
                              )
                            }
                            className={
                              errors[`passengers.${index}.pickup`]
                                ? "border-red-500"
                                : ""
                            }
                          />
                          <Select
                            value={passenger.pickup.priority?.toString() || "1"}
                            onValueChange={(value) =>
                              handleLocationPriorityChange(
                                index,
                                "pickup",
                                value
                              )
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
                        {errors[`passengers.${index}.pickup`] && (
                          <p className="mt-1 text-sm text-red-500">
                            {errors[`passengers.${index}.pickup`]}
                          </p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor={`dropoff-${index}`}
                          className="block text-sm font-medium text-gray-700"
                        >
                          Drop-off Location
                        </label>
                        <div className="mt-1 space-y-2">
                          <Input
                            id={`dropoff-${index}`}
                            value={passenger.dropoff.address || ""}
                            onChange={(e) =>
                              handleLocationChange(
                                index,
                                "dropoff",
                                e.target.value
                              )
                            }
                            className={
                              errors[`passengers.${index}.dropoff`]
                                ? "border-red-500"
                                : ""
                            }
                          />
                          <Select
                            value={
                              passenger.dropoff.priority?.toString() || "1"
                            }
                            onValueChange={(value) =>
                              handleLocationPriorityChange(
                                index,
                                "dropoff",
                                value
                              )
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
                        {errors[`passengers.${index}.dropoff`] && (
                          <p className="mt-1 text-sm text-red-500">
                            {errors[`passengers.${index}.dropoff`]}
                          </p>
                        )}
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
        </CardContent>
      </Card>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Generating Route..." : "Generate Route"}
      </Button>
    </form>
  );
}
