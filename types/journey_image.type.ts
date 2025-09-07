import type { Models } from "appwrite";
import { Plant } from "./plant.type";

export type JourneyImage = Models.Document & {
  imageId: string;
  date: Date;
  plant: Plant & Models.Document;
};

export type JourneyImageWithUrl = Models.Document &
  JourneyImage & {
    imageUrl?: string;
  };
