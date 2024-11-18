import { NextResponse } from "next/server";
import { getAddressFromShortUrl } from "@/lib/maps-utils";

export async function POST(request: Request) {
  try {
    const { url } = await request.json();
    console.log("Received URL to parse:", url);

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const address = await getAddressFromShortUrl(url);
    console.log("Resolved address:", address);

    if (!address) {
      return NextResponse.json(
        { error: "Could not resolve address from URL" },
        { status: 400 }
      );
    }

    return NextResponse.json({ address });
  } catch (error) {
    console.error("Error in parse-map-url:", error);
    return NextResponse.json(
      { error: "Failed to parse map URL" },
      { status: 500 }
    );
  }
}
