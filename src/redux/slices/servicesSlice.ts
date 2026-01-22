import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export interface Service {
  _id?: string;
  user_id?: string;
  service_name: string;
  item_type: string;
  service_category: string;
  description: string;
  pricing_unit: string;
  default_rate: number;
  packaging_type: string;
  estimated_cost_per_unit: number;
  expected_margin_percent: number;
  internal_notes: string;
  is_taxable: boolean;
  include_by_default_on_estimates: boolean;
  allow_price_override_on_invoice: boolean;
  service_status: 'active' | 'inactive';
  sku: string;
  image_url: string;
  i_sell_service: boolean;
  i_purchase_service: boolean;
  income_account: string;
  sales_tax_category: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ServicesState {
  services: Service[];
  loading: boolean;
  error: string | null;
}

const initialState: ServicesState = {
  services: [],
  loading: false,
  error: null,
};

export const fetchServices = createAsyncThunk('services/fetchServices', async () => {
  const response = await fetch('/api/services');
  const result = await response.json();
  if (!result.success) throw new Error(result.message);
  return result.data;
});

export const createService = createAsyncThunk('services/createService', async (serviceData: Omit<Service, '_id' | 'user_id' | 'createdAt' | 'updatedAt'>) => {
  const response = await fetch('/api/services', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(serviceData),
  });
  const result = await response.json();
  if (!result.success) throw new Error(result.message);
  return result.data;
});

export const updateService = createAsyncThunk('services/updateService', async ({ id, data }: { id: string; data: Partial<Service> }) => {
  const response = await fetch(`/api/services/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (!result.success) throw new Error(result.message);
  return result.data;
});

export const deleteService = createAsyncThunk('services/deleteService', async (id: string) => {
  const response = await fetch(`/api/services/${id}`, { method: 'DELETE' });
  const result = await response.json();
  if (!result.success) throw new Error(result.message);
  return id;
});

const servicesSlice = createSlice({
  name: 'services',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch services
      .addCase(fetchServices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServices.fulfilled, (state, action) => {
        state.loading = false;
        state.services = action.payload;
      })
      .addCase(fetchServices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch services';
      })
      // Create service
      .addCase(createService.fulfilled, (state, action) => {
        state.services.unshift(action.payload);
      })
      // Update service
      .addCase(updateService.fulfilled, (state, action) => {
        const index = state.services.findIndex(service => service._id === action.payload._id);
        if (index !== -1) {
          state.services[index] = action.payload;
        }
      })
      // Delete service
      .addCase(deleteService.fulfilled, (state, action) => {
        state.services = state.services.filter(service => service._id !== action.payload);
      });
  },
});

export default servicesSlice.reducer;