export interface FormErrors {
  [key: string]: string;
}

export interface AutocompleteRefs {
  [key: string]: google.maps.places.Autocomplete | null;
}
