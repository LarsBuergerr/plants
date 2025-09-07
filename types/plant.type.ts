import type { Models } from "appwrite";
import { JourneyImage } from "./journey_image.type";
import { JourneyComment } from "./journey_comment.type";

export type Plant = Models.Document & {
  uid: string;
  name: string;
  lastWateredAt: Date;
  headerImage?: string;
  images?: string[];
  comments?: string[];
  favorite?: boolean;

  journeyImages: (JourneyImage & Models.Document)[];
  journeyComments: (JourneyComment & Models.Document)[];
};

export type PlantWithImages = Models.Document &
  Plant & {
    headerImageUrl?: string;
    imageUrls?: string[];
  };
