import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import promptReducer from './slices/promptSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    prompts: promptReducer,
  },
});