export type FontOption = { id: string; name: string; family: string };
export type SizeOption = { id: string; name: string; value: string };

/**
 * Google Fonts available for text styling
 * The 'family' field is used in the Google Fonts API URL
 */
export const fontOptions: FontOption[] = [
  { id: "roboto", name: "Roboto", family: "Roboto" },
  { id: "open-sans", name: "Open Sans", family: "Open+Sans" },
  { id: "lato", name: "Lato", family: "Lato" },
  { id: "montserrat", name: "Montserrat", family: "Montserrat" },
  { id: "oswald", name: "Oswald", family: "Oswald" },
  { id: "source-sans-pro", name: "Source Sans Pro", family: "Source+Sans+Pro" },
  { id: "raleway", name: "Raleway", family: "Raleway" },
  { id: "pt-sans", name: "PT Sans", family: "PT+Sans" },
  { id: "merriweather", name: "Merriweather", family: "Merriweather" },
  { id: "nunito", name: "Nunito", family: "Nunito" },
  { id: "playfair-display", name: "Playfair Display", family: "Playfair+Display" },
  { id: "ubuntu", name: "Ubuntu", family: "Ubuntu" },
  { id: "poppins", name: "Poppins", family: "Poppins" },
  { id: "lora", name: "Lora", family: "Lora" },
  { id: "bebas-neue", name: "Bebas Neue", family: "Bebas+Neue" },
  { id: "dancing-script", name: "Dancing Script", family: "Dancing+Script" },
  { id: "pacifico", name: "Pacifico", family: "Pacifico" },
  { id: "indie-flower", name: "Indie Flower", family: "Indie+Flower" },
  { id: "permanent-marker", name: "Permanent Marker", family: "Permanent+Marker" },
  { id: "caveat", name: "Caveat", family: "Caveat" },
];

/**
 * Predefined font sizes for text styling
 */
export const sizeOptions: SizeOption[] = [
  { id: "xs", name: "Extra Small", value: "1rem" },
  { id: "sm", name: "Small", value: "1.5rem" },
  { id: "md", name: "Medium", value: "2rem" },
  { id: "lg", name: "Large", value: "2.5rem" },
  { id: "xl", name: "Extra Large", value: "3rem" },
  { id: "xxl", name: "Extra Extra Large", value: "4rem" },
];

/**
 * Default styling values
 */
export const defaultFontId = fontOptions[0].id; // 'roboto'
export const defaultSizeId = sizeOptions[2].id; // 'md'
export const defaultColor = "#FFFFFF"; // white

/**
 * Helper to get Google Fonts URL for a given font family
 */
export function getGoogleFontsUrl(families: string[]): string {
  if (families.length === 0) return "";
  const uniqueFamilies = [...new Set(families)];
  return `https://fonts.googleapis.com/css2?${uniqueFamilies.map((f) => `family=${f}`).join("&")}&display=swap`;
}

/**
 * Helper to get CSS font-family value from font ID
 */
export function getFontFamily(fontId: string): string {
  const font = fontOptions.find((f) => f.id === fontId);
  return font ? font.name : fontOptions[0].name;
}

/**
 * Helper to get font size value from size ID
 */
export function getFontSize(sizeId: string): string {
  const size = sizeOptions.find((s) => s.id === sizeId);
  return size ? size.value : sizeOptions[2].value;
}
