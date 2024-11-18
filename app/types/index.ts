export interface FormErrors {
  currentLocation?: string;
  startPoint?: string;
  endPoint?: string;
  [key: string]: string | undefined;
}

export interface AutocompleteRefs {
  [key: string]: google.maps.places.Autocomplete | null;
}
