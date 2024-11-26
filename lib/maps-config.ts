export const MAPS_CONFIG = {
  types: ["establishment", "geocode"],
  fields: ["formatted_address", "name"],
  defaultRegion: "us",
} as const;

export type GoogleMapsLibraries = (
  | "places"
  | "geometry"
  | "drawing"
  | "visualization"
)[];

export const libraries: GoogleMapsLibraries = ["places"];
