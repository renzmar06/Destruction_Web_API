import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

interface ServiceRequest {
  id: string;
  requestNumber: string;
  serviceType: string;
  productType: string;
  materialCondition?: string;
  estimatedWeight?: string;
  unitCount?: string;
  palletCount?: number;
  palletType?: string;
  shrinkWrapped?: boolean;
  destructionType?: string;
  certificateRequired?: boolean;
  logisticsType?: string;
  pickupAddress?: string;
  pickupHours?: string;
  truckingService?: boolean;
  palletSwap?: boolean;
  additionalLabor?: boolean;
  hazardousNotes?: string;
  timeConstraints?: string;
  preferredDate: string;
  urgency?: string;
  contactName: string;
  contactPhone: string;
  quantityBreakdown?: string;
  scheduleFrequency?: string;
  problemDescription?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface CustomerRequestsState {
  requests: ServiceRequest[];
  loading: boolean;
  error: string | null;
  submitLoading: boolean;
}

const initialState: CustomerRequestsState = {
  requests: [],
  loading: false,
  error: null,
  submitLoading: false,
};

export const createServiceRequest = createAsyncThunk(
  'customerRequests/create',
  async (requestData: any, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/customer-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });
      
      if (!response.ok) {
        const data = await response.json();
        return rejectWithValue(data.message || 'Failed to create request');
      }
      
      const data = await response.json();
      
      if (!data.success) {
        return rejectWithValue(data.message);
      }
      
      return data;
    } catch (error) {
      return rejectWithValue('Failed to create service request');
    }
  }
);

export const fetchServiceRequests = createAsyncThunk(
  'customerRequests/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/customer-requests');
      
      if (!response.ok) {
        const data = await response.json();
        return rejectWithValue(data.message || 'Failed to fetch requests');
      }
      
      const data = await response.json();
      
      if (!data.success) {
        return rejectWithValue(data.message);
      }
      
      return data.data;
    } catch (error) {
      return rejectWithValue('Failed to fetch service requests');
    }
  }
);

export const updateServiceRequest = createAsyncThunk(
  'customerRequests/update',
  async ({ id, requestData }: { id: string; requestData: any }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/customer-requests/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        return rejectWithValue(data.message || 'Failed to update request');
      }
      
      return data.data;
    } catch (error) {
      return rejectWithValue('Failed to update service request');
    }
  }
);

export const deleteServiceRequest = createAsyncThunk(
  'customerRequests/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/customer-requests/${id}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        return rejectWithValue(data.message || 'Failed to delete request');
      }
      
      return id;
    } catch (error) {
      return rejectWithValue('Failed to delete service request');
    }
  }
);

const customerRequestsSlice = createSlice({
  name: 'customerRequests',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearRequests: (state) => {
      state.requests = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createServiceRequest.pending, (state) => {
        state.submitLoading = true;
        state.error = null;
      })
      .addCase(createServiceRequest.fulfilled, (state, action) => {
        state.submitLoading = false;
        state.requests.unshift(action.payload.data);
      })
      .addCase(createServiceRequest.rejected, (state, action) => {
        state.submitLoading = false;
        state.error = action.payload as string || 'Failed to create request';
      })
      .addCase(fetchServiceRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServiceRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.requests = action.payload;
      })
      .addCase(fetchServiceRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to fetch requests';
      })
      .addCase(updateServiceRequest.fulfilled, (state, action) => {
        const index = state.requests.findIndex(req => req.id === action.payload.id);
        if (index !== -1) {
          state.requests[index] = action.payload;
        }
      })
      .addCase(updateServiceRequest.rejected, (state, action) => {
        state.error = action.payload as string || 'Failed to update request';
      })
      .addCase(deleteServiceRequest.fulfilled, (state, action) => {
        state.requests = state.requests.filter(req => req.id !== action.payload);
      })
      .addCase(deleteServiceRequest.rejected, (state, action) => {
        state.error = action.payload as string || 'Failed to delete request';
      });
  },
});

export const { clearError, clearRequests } = customerRequestsSlice.actions;
export default customerRequestsSlice.reducer;