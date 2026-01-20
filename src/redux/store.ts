import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import customerRequestsReducer from './slices/customerRequestsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    customerRequests: customerRequestsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;