// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import postsReducer from './slices/postsSlice';
// Import other slices as needed

export const store = configureStore({
    reducer: {
        posts: postsReducer,
        // add more slices here
    },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;