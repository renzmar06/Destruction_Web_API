import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface Invoice {
  _id?: string;
  invoice_number: string;
  customer_name: string;
  customer_email: string;
  invoice_status: 'draft' | 'sent' | 'finalized' | 'paid' | 'void';
  issue_date: string;
  due_date: string;
  total_amount: number;
  balance_due: number;
  payment_terms: string;
  bill_to_address: string;
  ship_to_address: string;
  notes_to_customer: string;
  internal_notes: string;
  createdAt?: string;
  updatedAt?: string;
}

interface InvoicesState {
  invoices: Invoice[];
  currentInvoice: Invoice | null;
  loading: boolean;
  error: string | null;
}

const initialState: InvoicesState = {
  invoices: [],
  currentInvoice: null,
  loading: false,
  error: null,
};

export const fetchInvoices = createAsyncThunk(
  'invoices/fetchInvoices',
  async () => {
    const response = await fetch('/api/invoices');
    if (!response.ok) throw new Error('Failed to fetch invoices');
    return response.json();
  }
);

export const createInvoice = createAsyncThunk(
  'invoices/createInvoice',
  async (invoiceData: Omit<Invoice, '_id'>) => {
    const response = await fetch('/api/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invoiceData),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to create invoice');
    }
    
    return result;
  }
);

export const updateInvoice = createAsyncThunk(
  'invoices/updateInvoice',
  async ({ id, data }: { id: string; data: Partial<Invoice> }) => {
    const response = await fetch(`/api/invoices/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update invoice');
    return response.json();
  }
);

export const deleteInvoice = createAsyncThunk(
  'invoices/deleteInvoice',
  async (id: string) => {
    const response = await fetch(`/api/invoices/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete invoice');
    return id;
  }
);

const invoicesSlice = createSlice({
  name: 'invoices',
  initialState,
  reducers: {
    setCurrentInvoice: (state, action: PayloadAction<Invoice | null>) => {
      state.currentInvoice = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInvoices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.loading = false;
        state.invoices = action.payload;
      })
      .addCase(fetchInvoices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch invoices';
      })
      .addCase(createInvoice.fulfilled, (state, action) => {
        state.invoices.unshift(action.payload);
      })
      .addCase(updateInvoice.fulfilled, (state, action) => {
        const index = state.invoices.findIndex(inv => inv._id === action.payload._id);
        if (index !== -1) {
          state.invoices[index] = action.payload;
        }
        if (state.currentInvoice?._id === action.payload._id) {
          state.currentInvoice = action.payload;
        }
      })
      .addCase(deleteInvoice.fulfilled, (state, action) => {
        state.invoices = state.invoices.filter(inv => inv._id !== action.payload);
        if (state.currentInvoice?._id === action.payload) {
          state.currentInvoice = null;
        }
      });
  },
});

export const { setCurrentInvoice, clearError } = invoicesSlice.actions;
export default invoicesSlice.reducer;