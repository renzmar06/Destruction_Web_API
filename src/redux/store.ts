import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import customerRequestsReducer from './slices/customerRequestsSlice';
import estimatesReducer from './slices/estimatesSlice';
import customersReducer from './slices/customersSlice';
import jobsReducer from './slices/jobsSlice';
import invoicesReducer from './slices/invoicesSlice';
import servicesReducer from './slices/servicesSlice';
import vendorsReducer from './slices/vendorsSlice';
import affidavitsReducer from './slices/affidavitsSlice';
import expensesReducer from './slices/expensesSlice';
import messagesReducer from './slices/messagesSlice';
import companyInfoReducer from './slices/companyInfoSlice';
import salesSettingsReducer from './slices/salesSettingsSlice';
import expenseSettingsReducer from './slices/expenseSettingsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    customerRequests: customerRequestsReducer,
    estimates: estimatesReducer,
    customers: customersReducer,
    jobs: jobsReducer,
    invoices: invoicesReducer,
    services: servicesReducer,
    vendors: vendorsReducer,
    affidavits: affidavitsReducer,
    expenses: expensesReducer,
    messages: messagesReducer,
    companyInfo: companyInfoReducer,
    salesSettings: salesSettingsReducer,
    expenseSettings: expenseSettingsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;