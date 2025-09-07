import type { Models } from "appwrite";
import { Plant } from "./plant.type";

export type JourneyComment = Models.Document & {
  comment: string;
  date: Date;
  plant: Plant & Models.Document;
};
