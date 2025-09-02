import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AppState {
  currUid: string | null;
  authLoading: boolean;
  error: string | null;
}

const initialState: AppState = {
  currUid: null,
  authLoading: true,
  error: null,
};

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setCurrUid: (state, action: PayloadAction<string | null>) => {
      state.currUid = action.payload;
    },
    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.authLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.authLoading = false;
    },
  },
});

export const { setCurrUid, setAuthLoading, setError } = appSlice.actions;
export default appSlice.reducer;
