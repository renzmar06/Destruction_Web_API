import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface CompanyInfo {
  _id?: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  email: string;
  phone: string;
  website: string;
  ein_ssn: string;
  company_logo_url?: string;
  user_id?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface CompanyInfoState {
  companyInfo: CompanyInfo | null;
  loading: boolean;
  error: string | null;
}

const initialState: CompanyInfoState = {
  companyInfo: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchCompanyInfo = createAsyncThunk('companyInfo/fetchCompanyInfo', async () => {
  const response = await fetch('/api/company-info');
  const result = await response.json();
  if (!result.success) throw new Error(result.message);
  return result.data;
});

export const saveCompanyInfo = createAsyncThunk('companyInfo/saveCompanyInfo', async (companyData: Omit<CompanyInfo, '_id' | 'user_id' | 'createdAt' | 'updatedAt'>) => {
  const response = await fetch('/api/company-info', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(companyData),
  });
  const result = await response.json();
  if (!result.success) throw new Error(result.message);
  return result.data;
});

const companyInfoSlice = createSlice({
  name: 'companyInfo',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch company info
      .addCase(fetchCompanyInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompanyInfo.fulfilled, (state, action) => {
        state.loading = false;
        state.companyInfo = action.payload;
      })
      .addCase(fetchCompanyInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch company info';
      })
      // Save company info
      .addCase(saveCompanyInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveCompanyInfo.fulfilled, (state, action) => {
        state.loading = false;
        state.companyInfo = action.payload;
      })
      .addCase(saveCompanyInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to save company info';
      });
  },
});

export default companyInfoSlice.reducer;