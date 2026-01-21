import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import customerRequestsReducer from './slices/customerRequestsSlice';
import estimatesReducer from './slices/estimatesSlice';
import customersReducer from './slices/customersSlice';
import jobsReducer from './slices/jobsSlice';
import invoicesReducer from './slices/invoicesSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    customerRequests: customerRequestsReducer,
    estimates: estimatesReducer,
    customers: customersReducer,
    jobs: jobsReducer,
    invoices: invoicesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;