"use client";

import React, { useRef, useEffect } from "react";
import { useLoadScript } from "@react-google-maps/api";
import { Input } from "@/components/ui/input";

interface AddressInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
}

const libraries = ["places"];

export function AddressInput({
  id,
  value,
  onChange,
  error,
  placeholder,
}: AddressInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: libraries as any,
  });

  useEffect(() => {
    if (!isLoaded || !inputRef.current) return;

    try {
      autocompleteRef.current = new google.maps.places.Autocomplete(
        inputRef.current,
        { types: ["geocode"] }
      );

      autocompleteRef.current.addListener("place_changed", () => {
        const place = autocompleteRef.current?.getPlace();
        if (place?.formatted_address) {
          onChange(place.formatted_address);
        }
      });
    } catch (error) {
      console.error("Error initializing autocomplete:", error);
    }
  }, [isLoaded, onChange]);

  const handlePaste = async (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData("text");
    console.log("Paste event triggered with text:", pastedText);

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
        console.log("Response from parse-map-url:", data);

        if (response.ok && data.address) {
          onChange(data.address);
        } else {
          console.error("Error:", data.error);
          onChange("");
          alert(
            "Could not get address from URL. Please try entering it manually."
          );
        }
      } catch (error) {
        console.error("Error processing URL:", error);
        onChange("");
        alert(
          "Error processing URL. Please try entering the address manually."
        );
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
