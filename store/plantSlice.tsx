import { Plant, PlantWithImages } from "@/types/plant.type";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { databases, storage } from "@/lib/appwrite";
import { Models, Query } from "appwrite";
import { ID } from "appwrite";
import { JourneyComment } from "@/types/journey_comment.type";
import { JourneyImage } from "@/types/journey_image.type";

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
          plant.headerImageUrl = await storage.getFileView(
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
        {
          uid,
          name,
          lastWateredAt,
          headerImage,
          journeyImages: [],
          journeyComments: [],
        }
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
          updatedDoc.headerImageUrl = await storage.getFileView(
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

export const addJourneyComment = createAsyncThunk(
  "plants/addJourneyComment",
  async (
    {
      plantId,
      comment,
      date,
    }: { plantId: string; comment: string; date: Date },
    { rejectWithValue }
  ) => {
    try {
      const newComment = (await databases.createDocument(
        "68a70f580027558c1ff5",
        "68bc57f7000de0726cba",
        ID.unique(),
        {
          plant: plantId,
          comment,
          date,
        }
      )) as Models.Document;
      return newComment as Models.Document & JourneyComment;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const addJourneyImage = createAsyncThunk(
  "plants/addJourneyImage",
  async (
    {
      plantId,
      imageId,
      date,
    }: { plantId: string; imageId: string; date: Date },
    { rejectWithValue }
  ) => {
    try {
      const newImage = (await databases.createDocument(
        "68a70f580027558c1ff5",
        "68bc571800090c2c0f11",
        ID.unique(),
        {
          plant: plantId,
          imageId,
          date,
        }
      )) as Models.Document;
      return newImage as Models.Document & JourneyImage;
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

    // DELETE
    builder.addCase(deletePlantById.fulfilled, (state, action) => {
      state.plants = state.plants.filter((p) => p.$id !== action.payload);
    });

    builder.addCase(deletePlantById.rejected, (state, action) => {
      state.error = action.payload as string;
    });

    builder.addCase(addJourneyComment.rejected, (state, action) => {
      state.error = action.payload as string;
    });

    builder.addCase(addJourneyComment.fulfilled, (state, action) => {
      const plant = state.plants.find(
        (p) => p.$id === action.payload.plant.$id
      );
      if (plant) {
        plant.journeyComments.push(action.payload);
      }
    });

    builder.addCase(addJourneyImage.rejected, (state, action) => {
      state.error = action.payload as string;
    });

    builder.addCase(addJourneyImage.fulfilled, (state, action) => {
      const plant = state.plants.find(
        (p) => p.$id === action.payload.plant.$id
      );
      if (plant) {
        plant.journeyImages.push(action.payload);
      }
    });
  },
});

export const { resetPlants } = plantSlice.actions;
export default plantSlice.reducer;
