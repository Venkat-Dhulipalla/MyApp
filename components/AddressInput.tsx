"use client";

import React, { useRef, useEffect, useState } from "react";
import { useLoadScript } from "@react-google-maps/api";
import { Input } from "@/components/ui/input";
import { MAPS_CONFIG, libraries } from "@/lib/maps-config";

interface AddressInputProps {
  id: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  region?: string; // ISO Alpha-2 country code for restriction
}

export function AddressInput({
  id,
  value,
  onChange,
  error,
  placeholder,
  region = MAPS_CONFIG.defaultRegion,
}: AddressInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [isAutocompleteInitialized, setIsAutocompleteInitialized] =
    useState(false);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: libraries as any,
  });

  useEffect(() => {
    if (!isLoaded || !inputRef.current || isAutocompleteInitialized) return;

    try {
      autocompleteRef.current = new google.maps.places.Autocomplete(
        inputRef.current,
        {
          types: MAPS_CONFIG.types as any,
          fields: MAPS_CONFIG.fields as any,
          componentRestrictions: region ? { country: region } : undefined,
        }
      );

      autocompleteRef.current.addListener("place_changed", () => {
        const place = autocompleteRef.current?.getPlace();
        const address =
          place?.name && place?.formatted_address
            ? `${place.name}, ${place.formatted_address}`
            : place?.formatted_address;

        if (address) {
          onChange(address);
        }
      });

      setIsAutocompleteInitialized(true);
    } catch (error) {
      console.error("Error initializing autocomplete:", error);
    }
  }, [isLoaded, isAutocompleteInitialized, onChange, region]);

  const handlePaste = async (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData("text");

    // Validate URL
    if (
      pastedText.includes("maps.app.goo.gl") ||
      pastedText.includes("goo.gl/maps") ||
      pastedText.includes("google.com/maps") ||
      pastedText.match(/maps\?q=/)
    ) {
      e.preventDefault();
      onChange("Loading address...");

      try {
        const response = await fetch("/api/parse-map-url", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url: pastedText }),
        });

        const data = await response.json();

        if (response.ok && data.address) {
          onChange(data.address);
        } else {
          console.error("Error:", data.error);
          alert("Could not extract address from URL. Please enter manually.");
          onChange("");
        }
      } catch (error) {
        console.error("Error processing URL:", error);
        alert("Failed to process URL. Please enter manually.");
        onChange("");
      }
    }
  };

  return (
    <div className="w-full">
      <Input
        ref={inputRef}
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onPaste={handlePaste}
        className={error ? "border-red-500" : ""}
        placeholder={placeholder}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
