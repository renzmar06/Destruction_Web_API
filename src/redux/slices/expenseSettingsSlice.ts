import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export interface ExpenseSettings {
  _id?: string;
  user_id?: string;
  show_items_table: boolean;
  show_tags_field: boolean;
  track_by_customer: boolean;
  make_billable: boolean;
  markup_enabled: boolean;
  markup_rate: number;
  track_as_income: boolean;
  income_account_type: 'single' | 'multiple';
  charge_sales_tax: boolean;
  default_bill_payment_terms: 'net_15' | 'net_30' | 'net_45' | 'net_60' | 'due_on_receipt';
  use_purchase_orders: boolean;
  custom_transaction_numbers: boolean;
  default_po_message: string;
  po_email_use_greeting: boolean;
  po_email_greeting: 'Dear' | 'Hi' | 'Hello';
  po_email_name_format: '[first][last]' | '[Title][first]' | '[First]' | '[full name]' | '[Company name]' | '[Display name]';
  po_email_subject: string;
  po_email_message: string;
  po_email_copy_me: boolean;
  po_email_cc: string;
  po_email_bcc: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ExpenseSettingsState {
  settings: ExpenseSettings | null;
  loading: boolean;
  error: string | null;
}

const initialState: ExpenseSettingsState = {
  settings: null,
  loading: false,
  error: null,
};

export const fetchExpenseSettings = createAsyncThunk(
  'expenseSettings/fetchExpenseSettings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/expense-settings');
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

export const updateExpenseSettings = createAsyncThunk(
  'expenseSettings/updateExpenseSettings',
  async ({ id, settingsData }: { id: string; settingsData: Partial<ExpenseSettings> }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/expense-settings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsData),
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

export const createExpenseSettings = createAsyncThunk(
  'expenseSettings/createExpenseSettings',
  async (settingsData: Partial<ExpenseSettings>, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/expense-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsData),
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

export const deleteExpenseSettings = createAsyncThunk(
  'expenseSettings/deleteExpenseSettings',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/expense-settings/${id}`, {
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

const expenseSettingsSlice = createSlice({
  name: 'expenseSettings',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchExpenseSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExpenseSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.settings = action.payload;
      })
      .addCase(fetchExpenseSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateExpenseSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateExpenseSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.settings = action.payload;
      })
      .addCase(updateExpenseSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createExpenseSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createExpenseSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.settings = action.payload;
      })
      .addCase(createExpenseSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteExpenseSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteExpenseSettings.fulfilled, (state) => {
        state.loading = false;
        state.settings = null;
      })
      .addCase(deleteExpenseSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default expenseSettingsSlice.reducer;