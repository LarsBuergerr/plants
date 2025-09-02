import { configureStore } from "@reduxjs/toolkit";
import appReducer from "./appSlice";
import plantsReducer from "./plantSlice";

export const store = configureStore({
  reducer: {
    app: appReducer,
    plants: plantsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
