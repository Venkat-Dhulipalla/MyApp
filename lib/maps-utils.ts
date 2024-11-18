import { Client } from "@googlemaps/google-maps-services-js";

const client = new Client({});

async function getPlaceDetails(placeId: string) {
  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    throw new Error("Google Maps API key is not configured");
  }

  try {
    const placeDetails = await client.placeDetails({
      params: {
        place_id: placeId,
        fields: ["formatted_address", "geometry"],
        key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
      },
    });

    return placeDetails.data.result;
  } catch (error) {
    console.error("Error fetching place details:", error);
    return null;
  }
}

function extractPlaceIdFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);

    // Try to get place_id from URL parameters
    let placeId = urlObj.searchParams.get("place_id");

    if (!placeId) {
      // Try different regex patterns to extract place ID
      const patterns = [
        /!1s([^!]+)!/, // Pattern 1
        /[!/]([0-9a-fx]+:[0-9a-fx]+)!/i, // Pattern 2
        /place\/([^\/]+)/, // Pattern 3
      ];

      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
          placeId = match[1];
          break;
        }
      }
    }

    return placeId;
  } catch (error) {
    console.error("Error extracting place ID:", error);
    return null;
  }
}

export async function getAddressFromShortUrl(
  shortUrl: string
): Promise<string | null> {
  try {
    // Ensure the URL is properly formatted
    const fullUrl = shortUrl.startsWith("http")
      ? shortUrl
      : `https://maps.app.goo.gl/${shortUrl}`;

    const response = await fetch(fullUrl, {
      method: "GET",
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    const expandedUrl = response.url;
    console.log("Expanded URL:", expandedUrl);

    const placeId = extractPlaceIdFromUrl(expandedUrl);
    console.log("Extracted place ID:", placeId);

    if (placeId) {
      const placeDetails = await getPlaceDetails(placeId);
      if (placeDetails?.formatted_address) {
        return placeDetails.formatted_address;
      }
    }

    // Fallback to coordinates if no place ID found
    const coordsMatch = expandedUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (coordsMatch) {
      const [, lat, lng] = coordsMatch;
      const geocodeResponse = await client.reverseGeocode({
        params: {
          latlng: { lat: parseFloat(lat), lng: parseFloat(lng) },
          key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
        },
      });

      if (geocodeResponse.data.results?.[0]) {
        return geocodeResponse.data.results[0].formatted_address;
      }
    }

    return null;
  } catch (error) {
    console.error("Error resolving place:", error);
    return null;
  }
}
