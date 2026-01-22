import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export interface Invoice {
  _id?: string;
  user_id?: string;
  invoice_number: string;
  customer_id?: string;
  customer_name: string;
  customer_email: string;
  job_id?: string;
  invoice_status: 'draft' | 'sent' | 'finalized' | 'paid' | 'void';
  issue_date: string;
  due_date: string;
  payment_terms: string;
  bill_to_address: string;
  ship_to_address: string;
  total_amount: number;
  balance_due: number;
  notes_to_customer: string;
  internal_notes: string;
  sent_date?: string;
  paid_date?: string;
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

// Async thunks
export const fetchInvoices = createAsyncThunk('invoices/fetchInvoices', async () => {
  const response = await fetch('/api/invoices');
  const result = await response.json();
  if (!result.success) throw new Error(result.message);
  return result.data;
});

export const createInvoice = createAsyncThunk('invoices/createInvoice', async (invoiceData: Omit<Invoice, '_id' | 'user_id' | 'createdAt' | 'updatedAt'>) => {
  const response = await fetch('/api/invoices', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(invoiceData),
  });
  const result = await response.json();
  if (!result.success) throw new Error(result.message);
  return result.data;
});

export const updateInvoice = createAsyncThunk('invoices/updateInvoice', async ({ id, data }: { id: string; data: Partial<Invoice> }) => {
  const response = await fetch(`/api/invoices/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (!result.success) throw new Error(result.message);
  return result.data;
});

export const deleteInvoice = createAsyncThunk('invoices/deleteInvoice', async (id: string) => {
  const response = await fetch(`/api/invoices/${id}`, { method: 'DELETE' });
  const result = await response.json();
  if (!result.success) throw new Error(result.message);
  return id;
});

const invoicesSlice = createSlice({
  name: 'invoices',
  initialState,
  reducers: {
    setCurrentInvoice: (state, action) => {
      state.currentInvoice = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch invoices
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
      // Create invoice
      .addCase(createInvoice.fulfilled, (state, action) => {
        state.invoices.unshift(action.payload);
      })
      // Update invoice
      .addCase(updateInvoice.fulfilled, (state, action) => {
        const index = state.invoices.findIndex(invoice => invoice._id === action.payload._id);
        if (index !== -1) {
          state.invoices[index] = action.payload;
        }
      })
      // Delete invoice
      .addCase(deleteInvoice.fulfilled, (state, action) => {
        state.invoices = state.invoices.filter(invoice => invoice._id !== action.payload);
      });
  },
});

export const { setCurrentInvoice } = invoicesSlice.actions;
export default invoicesSlice.reducer;