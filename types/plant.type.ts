import type { Models } from "appwrite";

export type Plant = Models.Document & {
  uid: string;
  name: string;
  lastWateredAt: Date;
  headerImage?: string;
  images?: string[];
  comments?: string[];
  favorite?: boolean;
};

export type PlantWithImages = Models.Document &
  Plant & {
    headerImageUrl?: string;
    imageUrls?: string[];
  };
