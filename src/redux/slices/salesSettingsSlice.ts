import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export interface SalesSettings {
  _id?: string;
  user_id?: string;
  preferred_invoice_terms: string;
  preferred_delivery_method: string;
  shipping_enabled: boolean;
  custom_fields_enabled: boolean;
  custom_transaction_numbers: boolean;
  service_date_enabled: boolean;
  discount_enabled: boolean;
  deposit_enabled: boolean;
  accept_tips_enabled: boolean;
  tags_enabled: boolean;
  turn_on_price_rules: boolean;
  accept_credit_cards: boolean;
  accept_ach: boolean;
  accept_paypal: boolean;
  customer_pays_fee: boolean;
  payment_instructions: string;
  customer_financing_enabled: boolean;
  show_product_service_column: boolean;
  show_sku_column: boolean;
  track_quantity_price: boolean;
  track_inventory: boolean;
  inventory_valuation_method: 'fifo' | 'lifo' | 'average_cost';
  track_inventory_sales_channels: boolean;
  late_fees_enabled: boolean;
  progress_invoicing_enabled: boolean;
  default_email_message: string;
  default_invoice_reminder_message: string;
  automatic_invoice_reminders: boolean;
  ask_work_request: boolean;
  ask_review_feedback: boolean;
  ask_referral: boolean;
  feedback_frequency_days: number;
  online_delivery_enabled: boolean;
  show_aging_table: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface SalesSettingsState {
  salesSettings: SalesSettings | null;
  loading: boolean;
  error: string | null;
}

const initialState: SalesSettingsState = {
  salesSettings: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchSalesSettings = createAsyncThunk('salesSettings/fetchSalesSettings', async () => {
  const response = await fetch('/api/sales-settings');
  const result = await response.json();
  if (!result.success) throw new Error(result.message);
  return result.data;
});

export const saveSalesSettings = createAsyncThunk('salesSettings/saveSalesSettings', async (salesData: Omit<SalesSettings, '_id' | 'user_id' | 'createdAt' | 'updatedAt'>) => {
  const response = await fetch('/api/sales-settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(salesData),
  });
  const result = await response.json();
  if (!result.success) throw new Error(result.message);
  return result.data;
});

const salesSettingsSlice = createSlice({
  name: 'salesSettings',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch sales settings
      .addCase(fetchSalesSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSalesSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.salesSettings = action.payload;
      })
      .addCase(fetchSalesSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch sales settings';
      })
      // Save sales settings
      .addCase(saveSalesSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveSalesSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.salesSettings = action.payload;
      })
      .addCase(saveSalesSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to save sales settings';
      });
  },
});

export default salesSettingsSlice.reducer;