import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export interface Vendor {
  _id?: string;
  vendor_name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  payment_terms: string;
  vendor_category: string;
  tax_id: string;
  notes: string;
  vendor_status: 'active' | 'archived';
  user_id?: string;
}

interface VendorsState {
  vendors: Vendor[];
  loading: boolean;
  error: string | null;
}

const initialState: VendorsState = {
  vendors: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchVendors = createAsyncThunk(
  'vendors/fetchVendors',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/vendors');
      const result = await response.json();
      
      if (!result.success) {
        return rejectWithValue(result.message);
      }
      
      return result.data;
    } catch (error) {
      return rejectWithValue('Failed to fetch vendors');
    }
  }
);

export const createVendor = createAsyncThunk(
  'vendors/createVendor',
  async (vendorData: Partial<Vendor>, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/vendors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(vendorData),
      });
      
      const result = await response.json();
      
      if (!result.success) {
        return rejectWithValue(result.message);
      }
      
      return result.data;
    } catch (error) {
      return rejectWithValue('Failed to create vendor');
    }
  }
);

export const updateVendor = createAsyncThunk(
  'vendors/updateVendor',
  async ({ id, data }: { id: string; data: Partial<Vendor> }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/vendors/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (!result.success) {
        return rejectWithValue(result.message);
      }
      
      return result.data;
    } catch (error) {
      return rejectWithValue('Failed to update vendor');
    }
  }
);

export const deleteVendor = createAsyncThunk(
  'vendors/deleteVendor',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/vendors/${id}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (!result.success) {
        return rejectWithValue(result.message);
      }
      
      return id;
    } catch (error) {
      return rejectWithValue('Failed to delete vendor');
    }
  }
);

const vendorsSlice = createSlice({
  name: 'vendors',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch vendors
      .addCase(fetchVendors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVendors.fulfilled, (state, action) => {
        state.loading = false;
        state.vendors = action.payload;
      })
      .addCase(fetchVendors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create vendor
      .addCase(createVendor.fulfilled, (state, action) => {
        state.vendors.unshift(action.payload);
      })
      // Update vendor
      .addCase(updateVendor.fulfilled, (state, action) => {
        const index = state.vendors.findIndex(v => v._id === action.payload._id);
        if (index !== -1) {
          state.vendors[index] = action.payload;
        }
      })
      // Delete vendor
      .addCase(deleteVendor.fulfilled, (state, action) => {
        state.vendors = state.vendors.filter(v => v._id !== action.payload);
      });
  },
});

export default vendorsSlice.reducer;