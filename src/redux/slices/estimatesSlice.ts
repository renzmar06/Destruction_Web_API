import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface Estimate {
  _id?: string;
  estimate_number: string;
  customer_id: string;
  customer_name: string;
  estimate_status: 'draft' | 'sent' | 'accepted' | 'expired' | 'cancelled';
  estimate_date: string;
  valid_until_date: string;
  destruction_type?: string;
  primary_service_location_id?: string;
  job_reference?: string;
  internal_notes?: string;
  estimated_volume_weight?: string;
  allowed_variance: number;
  what_is_included?: string;
  what_is_excluded?: string;
  note_to_customer?: string;
  memo_on_statement?: string;
  subtotal: number;
  discount_amount: number;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  taxable_subtotal: number;
  tax_amount: number;
  tax_rate: number;
  shipping_amount: number;
  total_amount: number;
  sent_date?: string;
  accepted_date?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface EstimatesState {
  estimates: Estimate[];
  loading: boolean;
  error: string | null;
  currentEstimate: Estimate | null;
}

const initialState: EstimatesState = {
  estimates: [],
  loading: false,
  error: null,
  currentEstimate: null,
};

// Async thunks
export const fetchEstimates = createAsyncThunk('estimates/fetchEstimates', async () => {
  const response = await fetch('/api/estimates');
  const data = await response.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
});

export const createEstimate = createAsyncThunk('estimates/createEstimate', async (estimate: Partial<Estimate>) => {
  const response = await fetch('/api/estimates', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(estimate),
  });
  const data = await response.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
});

export const updateEstimate = createAsyncThunk('estimates/updateEstimate', async ({ id, estimate }: { id: string; estimate: Partial<Estimate> }) => {
  const response = await fetch(`/api/estimates/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(estimate),
  });
  const data = await response.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
});

export const deleteEstimate = createAsyncThunk('estimates/deleteEstimate', async (id: string) => {
  const response = await fetch(`/api/estimates/${id}`, { method: 'DELETE' });
  const data = await response.json();
  if (!data.success) throw new Error(data.error);
  return id;
});

const estimatesSlice = createSlice({
  name: 'estimates',
  initialState,
  reducers: {
    setCurrentEstimate: (state, action: PayloadAction<Estimate | null>) => {
      state.currentEstimate = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch estimates
      .addCase(fetchEstimates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEstimates.fulfilled, (state, action) => {
        state.loading = false;
        state.estimates = action.payload;
      })
      .addCase(fetchEstimates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch estimates';
      })
      // Create estimate
      .addCase(createEstimate.fulfilled, (state, action) => {
        state.estimates.unshift(action.payload);
        state.currentEstimate = action.payload;
      })
      // Update estimate
      .addCase(updateEstimate.fulfilled, (state, action) => {
        const index = state.estimates.findIndex(e => e._id === action.payload._id);
        if (index !== -1) {
          state.estimates[index] = action.payload;
        }
        state.currentEstimate = action.payload;
      })
      // Delete estimate
      .addCase(deleteEstimate.fulfilled, (state, action) => {
        state.estimates = state.estimates.filter(e => e._id !== action.payload);
        if (state.currentEstimate?._id === action.payload) {
          state.currentEstimate = null;
        }
      });
  },
});

export const { setCurrentEstimate, clearError } = estimatesSlice.actions;
export default estimatesSlice.reducer;