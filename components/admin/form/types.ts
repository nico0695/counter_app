import type { PreviewData } from "../CounterPreview";

export type Counter = {
  id: string;
  title: string;
  description: string | null;
  bgUrl: string | null;
  posterUrl?: string | null;
  mediaType?: "IMAGE" | "VIDEO" | "image" | "video";
  targetDate: string;
  timezone: string;
  counter?: string | null;
  twitter?: string | null;
  instagram?: string | null;
  tiktok?: string | null;
  facebook?: string | null;
  externalLink1?: string | null;
  externalLink2?: string | null;
  titleFont?: string | null;
  titleColor?: string | null;
  titleSize?: string | null;
  descriptionFont?: string | null;
  descriptionColor?: string | null;
  descriptionSize?: string | null;
};

export type FieldChangeHandler = (updates: Partial<PreviewData>) => void;

export type SectionProps = {
  counter?: Counter;
  onFieldChange: FieldChangeHandler;
};
