import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export interface Affidavit {
  _id?: string;
  id?: string;
  affidavit_number: string;
  affidavit_status: 'pending' | 'issued' | 'locked' | 'revoked';
  job_id: string;
  job_reference: string;
  customer_name: string;
  service_provider_name: string;
  service_provider_ein: string;
  service_provider_address: string;
  job_location: string;
  job_completion_date: string;
  destruction_method: string;
  description_of_materials?: string;
  description_of_process?: string;
  date_issued?: string;
  attached_documents?: {
    document_id: string;
    file_name: string;
    file_path: string;
    file_type: string;
    upload_date: Date;
  }[];
  user_id?: string;
}

interface AffidavitsState {
  affidavits: Affidavit[];
  loading: boolean;
  error: string | null;
}

const initialState: AffidavitsState = {
  affidavits: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchAffidavits = createAsyncThunk(
  'affidavits/fetchAffidavits',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/affidavits');
      const result = await response.json();
      
      if (!result.success) {
        return rejectWithValue(result.message);
      }
      
      return result.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createAffidavit = createAsyncThunk(
  'affidavits/createAffidavit',
  async (affidavitData: Partial<Affidavit>, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/affidavits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(affidavitData),
      });
      
      const result = await response.json();
      
      if (!result.success) {
        return rejectWithValue(result.message);
      }
      
      return result.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateAffidavit = createAsyncThunk(
  'affidavits/updateAffidavit',
  async ({ id, data }: { id: string; data: Partial<Affidavit> }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/affidavits/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (!result.success) {
        return rejectWithValue(result.message);
      }
      
      return result.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteAffidavit = createAsyncThunk(
  'affidavits/deleteAffidavit',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/affidavits/${id}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (!result.success) {
        return rejectWithValue(result.message);
      }
      
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const affidavitsSlice = createSlice({
  name: 'affidavits',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch affidavits
      .addCase(fetchAffidavits.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAffidavits.fulfilled, (state, action) => {
        state.loading = false;
        state.affidavits = action.payload;
      })
      .addCase(fetchAffidavits.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create affidavit
      .addCase(createAffidavit.fulfilled, (state, action) => {
        state.affidavits.push(action.payload);
      })
      // Update affidavit
      .addCase(updateAffidavit.fulfilled, (state, action) => {
        const index = state.affidavits.findIndex(
          (affidavit) => affidavit._id === action.payload._id || affidavit.id === action.payload.id
        );
        if (index !== -1) {
          state.affidavits[index] = action.payload;
        }
      })
      // Delete affidavit
      .addCase(deleteAffidavit.fulfilled, (state, action) => {
        state.affidavits = state.affidavits.filter(
          (affidavit) => affidavit._id !== action.payload && affidavit.id !== action.payload
        );
      });
  },
});

export default affidavitsSlice.reducer;