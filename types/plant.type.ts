import type { Models } from "appwrite";
import { JourneyEntry } from "./journey_entry.type";

export type Plant = Models.Document & {
  uid: string;
  name: string;
  botanicalName?: string;
  lastWateredAt: Date;
  lastFertilizedAt?: Date;
  lastRepottedAt?: Date;
  headerImage?: string;
  favorite?: boolean;

  journeyEntries: (JourneyEntry & Models.Document)[];
};

export type PlantWithImages = Models.Document &
  Plant & {
    headerImageUrl?: string;
    imageUrls?: string[];
  };
