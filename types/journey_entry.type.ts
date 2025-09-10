import type { Models } from "appwrite";
import { Plant } from "./plant.type";

export type JourneyEntry = Models.Document & {
  imageId?: string;
  comment?: string;
  date: Date;
  icon?: string;
  plant: Plant & Models.Document;
};

export type JourneyEntryWithUrl = Models.Document &
  JourneyEntry & {
    imageUrl?: string;
  };
