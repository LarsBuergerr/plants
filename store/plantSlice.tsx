import { Plant, PlantWithImages } from "@/types/plant.type";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { databases, storage } from "@/lib/appwrite";
import { Models, Query } from "appwrite";
import { ID } from "appwrite";

interface AppState {
  plants: (Models.Document & PlantWithImages)[];
  loading: boolean;
  error: string | null;
}

const initialState: AppState = {
  plants: [],
  loading: false,
  error: null,
};

export const fetchPlants = createAsyncThunk(
  "plants/fetchPlants",
  async (uid: string, { rejectWithValue }) => {
    try {
      const data = (
        await databases.listDocuments(
          "68a70f580027558c1ff5",
          "68a70f5f00300c65a93e",
          [Query.equal("uid", uid)]
        )
      ).documents as Models.Document[] as Models.Document & PlantWithImages[];

      for (const plant of data) {
        if (plant.headerImage) {
          try {
            const imageLink = await storage.getFileView(
              "plant_header_images",
              plant.headerImage
            );
            plant.headerImageUrl = imageLink;
          } catch (error) {
            console.error("Error fetching image preview:", error);
          }
        }
      }
      return data;
    } catch (error) {
      return rejectWithValue(error);
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
          plant.headerImageUrl = await storage.getFileView(
            "plant_header_images",
            plant.headerImage
          );
        } catch (error) {
          console.error("Error fetching header image:", error);
        }
      }

      return plant;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const createPlant = createAsyncThunk(
  "plants/createPlant",
  async (
    {
      uid,
      name,
      lastWateredAt,
      headerImage,
    }: {
      uid: string;
      name: string;
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
        { uid, name, lastWateredAt, headerImage }
      )) as Models.Document & PlantWithImages;

      if (newDoc.headerImage) {
        try {
          newDoc.headerImageUrl = await storage.getFileView(
            "plant_header_images",
            newDoc.headerImage
          );
        } catch (error) {
          console.error("Error fetching image preview:", error);
        }
      }

      return newDoc;
    } catch (error) {
      return rejectWithValue(error);
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
          updatedDoc.headerImageUrl = await storage.getFileView(
            "plant_header_images",
            updatedDoc.headerImage
          );
        } catch (error) {
          console.error("Error fetching image preview:", error);
        }
      }

      return updatedDoc;
    } catch (error) {
      return rejectWithValue(error);
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
      state.plants = action.payload;
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
  },
});

export const { resetPlants } = plantSlice.actions;
export default plantSlice.reducer;
