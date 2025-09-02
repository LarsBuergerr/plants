import { Plant } from "@/types/plant.type";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { databases } from "@/lib/appwrite";
import { Models, Query } from "appwrite";

interface AppState {
  plants: (Models.Document & Plant)[];
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
      ).documents;
      return data as Models.Document[];
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
    builder.addCase(fetchPlants.pending, (state, action) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchPlants.fulfilled, (state, action) => {
      state.plants = action.payload as (Models.Document & Plant)[];
      state.loading = false;
    });
    builder.addCase(fetchPlants.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { resetPlants } = plantSlice.actions;
export default plantSlice.reducer;
