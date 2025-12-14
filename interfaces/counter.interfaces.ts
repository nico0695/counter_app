export type MediaType = "IMAGE" | "VIDEO";

export interface ICounter {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  titleFont?: string | null;
  titleColor?: string | null;
  titleSize?: string | null;
  descriptionFont?: string | null;
  descriptionColor?: string | null;
  descriptionSize?: string | null;
  bgUrl?: string | null;
  posterUrl?: string | null;
  mediaType: MediaType;
  counter?: string | null;
  targetDate: Date;
  timezone: string;
  userId: string;
  enabled: boolean;
  twitter?: string | null;
  instagram?: string | null;
  tiktok?: string | null;
  facebook?: string | null;
  externalLink1?: string | null;
  externalLink2?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
