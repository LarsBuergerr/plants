import { Plant, PlantWithImages } from "@/types/plant.type";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { databases, storage } from "@/lib/appwrite";
import { Models, Query } from "appwrite";
import { ID } from "appwrite";
import { JourneyEntry, JourneyEntryWithUrl } from "@/types/journey_entry.type";

interface EntriesState {
  entries: (Models.Document & JourneyEntryWithUrl)[];
  hasMore: boolean;
  lastCursor?: string;
}

interface AppState {
  plants: (Models.Document & PlantWithImages)[];
  loading: boolean;
  error: string | null;
  entriesByPlant: Record<string, EntriesState>;
}

const initialState: AppState = {
  plants: [],
  loading: false,
  error: null,
  entriesByPlant: {},
};

export const fetchPlants = createAsyncThunk(
  "plants/fetchPlants",
  async (
    {
      uid,
      limit = 10,
      cursor,
    }: { uid: string; limit?: number; cursor?: string },
    { rejectWithValue }
  ) => {
    try {
      const queries = [Query.equal("uid", uid), Query.limit(limit)];
      if (cursor) {
        queries.push(Query.cursorAfter(cursor));
      }

      const data = (
        await databases.listDocuments(
          "68a70f580027558c1ff5",
          "68a70f5f00300c65a93e",
          queries
        )
      ).documents as Models.Document[] as Models.Document & PlantWithImages[];

      for (const plant of data) {
        if (plant.headerImage) {
          try {
            const imageLink = storage.getFilePreview(
              "plant_header_images",
              plant.headerImage,
              undefined,
              undefined,
              undefined,
              50
            );
            plant.headerImageUrl = imageLink;
          } catch (error) {
            console.error("Error fetching image preview:", error);
          }
        }
      }

      return { data, cursor };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchPlantById = createAsyncThunk(
  "plants/fetchPlantById",
  async ({ id }: { id: string }, { rejectWithValue }) => {
    try {
      const plant = (await databases.getDocument(
        "68a70f580027558c1ff5",
        "68a70f5f00300c65a93e",
        id
      )) as Models.Document & PlantWithImages;

      if (plant.headerImage) {
        try {
          plant.headerImageUrl = await storage.getFilePreview(
            "plant_header_images",
            plant.headerImage
          );
        } catch (error) {
          console.error("Error fetching header image:", error);
        }
      }

      return plant;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createPlant = createAsyncThunk(
  "plants/createPlant",
  async (
    {
      uid,
      name,
      botanicalName,
      lastWateredAt,
      headerImage,
    }: {
      uid: string;
      name: string;
      botanicalName?: string;
      lastWateredAt: Date;
      headerImage?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const newDoc = (await databases.createDocument(
        "68a70f580027558c1ff5",
        "68a70f5f00300c65a93e",
        ID.unique(),
        {
          uid: uid,
          name: name,
          botanicalName: botanicalName,
          lastWateredAt: lastWateredAt,
          headerImage: headerImage,
          journeyEntries: [],
        }
      )) as Models.Document & PlantWithImages;

      if (newDoc.headerImage) {
        try {
          newDoc.headerImageUrl = await storage.getFilePreview(
            "plant_header_images",
            newDoc.headerImage
          );
        } catch (error) {
          console.error("Error fetching image preview:", error);
        }
      }

      return newDoc;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updatePlant = createAsyncThunk(
  "plants/updatePlant",
  async (
    { id, data }: { id: string; data: Partial<Plant> },
    { rejectWithValue }
  ) => {
    try {
      const updatedDoc = (await databases.updateDocument(
        "68a70f580027558c1ff5",
        "68a70f5f00300c65a93e",
        id,
        data as Models.DataWithoutDocumentKeys & Partial<Plant>
      )) as Models.Document & PlantWithImages;

      if (updatedDoc.headerImage) {
        try {
          updatedDoc.headerImageUrl = await storage.getFilePreview(
            "plant_header_images",
            updatedDoc.headerImage
          );
        } catch (error: any) {
          console.error("Error fetching image preview:", error);
        }
      }

      return updatedDoc;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deletePlantById = createAsyncThunk(
  "plants/deletePlantById",
  async ({ id }: { id: string }, { rejectWithValue }) => {
    try {
      await databases.deleteDocument(
        "68a70f580027558c1ff5",
        "68a70f5f00300c65a93e",
        id
      );
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const addJourneyEntry = createAsyncThunk(
  "plants/addJourneyEntry",
  async (
    {
      plant,
      imageId,
      comment,
      icon,
      date,
    }: {
      plant: string;
      imageId?: string;
      comment?: string;
      icon?: string;
      date: Date;
    },
    { rejectWithValue }
  ) => {
    try {
      const newEntry = (await databases.createDocument(
        "68a70f580027558c1ff5",
        "journey_entries",
        ID.unique(),
        {
          plant,
          imageId,
          comment,
          icon,
          date,
        }
      )) as Models.Document;

      return {
        ...newEntry,
        imageUrl: imageId
          ? storage.getFilePreview("plant_journey_images", imageId)
          : undefined,
      } as Models.Document & JourneyEntryWithUrl;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateJourneyEntry = createAsyncThunk(
  "plants/updateJourneyEntry",
  async (
    {
      id,
      data,
      plantId,
    }: { id: string; data: Partial<JourneyEntry>; plantId: string },
    { rejectWithValue }
  ) => {
    try {
      const updatedEntry = (await databases.updateDocument(
        "68a70f580027558c1ff5",
        "journey_entries",
        id,
        data as Models.DataWithoutDocumentKeys & Partial<JourneyEntry>
      )) as Models.Document & JourneyEntryWithUrl;

      if (updatedEntry.imageId) {
        updatedEntry.imageUrl = storage.getFilePreview(
          "plant_journey_images",
          updatedEntry.imageId
        );
      }

      return { updatedEntry, plantId }; // pass plantId separately
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);
export const fetchJourneyEntries = createAsyncThunk(
  "plants/fetchJourneyEntries",
  async (
    {
      plantId,
      limit = 5,
      cursor,
    }: { plantId: string; limit?: number; cursor?: string },
    { rejectWithValue }
  ) => {
    try {
      const queries = [Query.equal("plant", plantId), Query.limit(limit)];
      if (cursor) {
        queries.push(Query.cursorAfter(cursor));
      }

      const docs = (
        await databases.listDocuments(
          "68a70f580027558c1ff5",
          "journey_entries",
          queries
        )
      ).documents as Models.Document[] as (Models.Document &
        JourneyEntryWithUrl)[];

      const data = docs.map((entry) => ({
        ...entry,
        imageUrl: entry.imageId
          ? storage.getFilePreview("plant_journey_images", entry.imageId)
          : undefined,
      }));

      return { plantId, data, cursor };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const plantSlice = createSlice({
  name: "plants",
  initialState,
  reducers: {
    resetPlants: (state) => {
      state.plants = [];
    },
  },
  extraReducers: (builder) => {
    // FETCH
    builder.addCase(fetchPlants.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchPlants.fulfilled, (state, action) => {
      const { data, cursor } = action.payload as {
        data: (Models.Document & PlantWithImages)[];
        cursor?: string;
      };

      if (cursor) {
        state.plants = [...state.plants, ...data];
      } else {
        state.plants = data;
      }

      state.loading = false;
    });
    builder.addCase(fetchPlants.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    builder.addCase(fetchPlantById.fulfilled, (state, action) => {
      const index = state.plants.findIndex((p) => p.$id === action.payload.$id);
      if (index !== -1) {
        state.plants[index] = action.payload;
      } else {
        state.plants.push(action.payload);
      }
    });
    builder.addCase(fetchPlantById.rejected, (state, action) => {
      state.error = action.payload as string;
    });

    // CREATE
    builder.addCase(createPlant.fulfilled, (state, action) => {
      state.plants.push(action.payload);
    });

    // UPDATE
    builder.addCase(updatePlant.fulfilled, (state, action) => {
      const index = state.plants.findIndex((p) => p.$id === action.payload.$id);
      if (index !== -1) {
        state.plants[index] = action.payload;
      }
    });

    builder.addCase(deletePlantById.fulfilled, (state, action) => {
      state.plants = state.plants.filter((p) => p.$id !== action.payload);
    });

    builder.addCase(deletePlantById.rejected, (state, action) => {
      state.error = action.payload as string;
    });

    builder.addCase(addJourneyEntry.rejected, (state, action) => {
      state.error = action.payload as string;
    });

    builder.addCase(addJourneyEntry.fulfilled, (state, action) => {
      const newEntry = action.payload as JourneyEntryWithUrl;
      const plantId = newEntry.plant.$id;

      const plant = state.plants.find((p) => p.$id === plantId);
      if (plant) {
        plant.journeyEntries.push(newEntry);
      }

      const prev = state.entriesByPlant[plantId] || {
        entries: [],
        hasMore: true,
      };

      state.entriesByPlant[plantId] = {
        ...prev,
        entries: [...prev.entries, newEntry].filter(
          (entry, idx, arr) => arr.findIndex((e) => e.$id === entry.$id) === idx
        ),
      };
    });

    builder.addCase(fetchJourneyEntries.fulfilled, (state, action) => {
      const { plantId, data, cursor } = action.payload as {
        plantId: string;
        data: (Models.Document & JourneyEntryWithUrl)[];
        cursor?: string;
      };

      const prev = state.entriesByPlant[plantId] || {
        entries: [],
        hasMore: true,
      };

      state.entriesByPlant[plantId] = {
        entries: [...prev.entries, ...data].filter(
          (entry, idx, arr) => arr.findIndex((e) => e.$id === entry.$id) === idx
        ),
        hasMore: data.length > 0,
        lastCursor:
          data.length > 0 ? data[data.length - 1].$id : prev.lastCursor,
      };
    });

    builder.addCase(updateJourneyEntry.fulfilled, (state, action) => {
      const { updatedEntry, plantId } = action.payload;

      const plant = state.plants.find((p) => p.$id === plantId);
      if (plant) {
        const index = plant.journeyEntries.findIndex(
          (e) => e.$id === updatedEntry.$id
        );
        if (index !== -1) plant.journeyEntries[index] = updatedEntry;
      }

      const prev = state.entriesByPlant[plantId];
      if (prev) {
        const index = prev.entries.findIndex((e) => e.$id === updatedEntry.$id);
        if (index !== -1) prev.entries[index] = updatedEntry;
      }
    });

    builder.addCase(updateJourneyEntry.rejected, (state, action) => {
      state.error = action.payload as string;
    });
  },
});

export const { resetPlants } = plantSlice.actions;
export default plantSlice.reducer;
