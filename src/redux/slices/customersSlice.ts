import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

interface Customer {
  _id?: string;
  id?: string;
  title: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  suffix: string;
  legal_company_name: string;
  display_name: string;
  email: string;
  phone: string;
  cc_email: string;
  bcc_email: string;
  mobile: string;
  fax: string;
  other_contact: string;
  website: string;
  print_on_check_name: string;
  is_sub_customer: boolean;
  email_marketing_consent: boolean;
  billing_street_1: string;
  billing_street_2: string;
  billing_city: string;
  billing_state: string;
  billing_zip: string;
  billing_country: string;
  shipping_same_as_billing: boolean;
  shipping_street_1: string;
  shipping_street_2: string;
  shipping_city: string;
  shipping_state: string;
  shipping_zip: string;
  shipping_country: string;
  primary_payment_method: string;
  payment_terms: string;
  delivery_method: string;
  invoice_language: string;
  credit_limit: number;
  customer_type: string;
  tax_exempt: boolean;
  tax_rate_id: string;
  opening_balance: number;
  opening_balance_date: string;
  customer_role: string;
  primary_product_type: string;
  requires_certificate: boolean;
  requires_affidavit: boolean;
  requires_photo_video_proof: boolean;
  witness_required: boolean;
  scrap_resale_allowed: boolean;
  special_handling_notes: string;
  internal_notes: string;
  customer_status: "active" | "on_hold" | "archived";
}

interface CustomersState {
  customers: Customer[];
  loading: boolean;
  error: string | null;
}

const initialState: CustomersState = {
  customers: [],
  loading: false,
  error: null,
};

export const fetchCustomers = createAsyncThunk('customers/fetchCustomers', async () => {
  const response = await fetch('/api/customers');
  if (!response.ok) throw new Error('Failed to fetch customers');
  return response.json();
});

export const createCustomer = createAsyncThunk('customers/createCustomer', async (customer: Omit<Customer, '_id' | 'id'>) => {
  const response = await fetch('/api/customers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(customer),
  });
  if (!response.ok) throw new Error('Failed to create customer');
  return response.json();
});

export const updateCustomer = createAsyncThunk('customers/updateCustomer', async ({ id, customer }: { id: string; customer: Partial<Customer> }) => {
  const response = await fetch(`/api/customers/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(customer),
  });
  if (!response.ok) throw new Error('Failed to update customer');
  return response.json();
});

export const deleteCustomer = createAsyncThunk('customers/deleteCustomer', async (id: string) => {
  const response = await fetch(`/api/customers/${id}`, { method: 'DELETE' });
  if (!response.ok) throw new Error('Failed to delete customer');
  return id;
});

const customersSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.loading = false;
        state.customers = action.payload;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch customers';
      })
      .addCase(createCustomer.fulfilled, (state, action) => {
        state.customers.unshift(action.payload);
      })
      .addCase(updateCustomer.fulfilled, (state, action) => {
        const index = state.customers.findIndex(c => c._id === action.payload._id);
        if (index !== -1) state.customers[index] = action.payload;
      })
      .addCase(deleteCustomer.fulfilled, (state, action) => {
        state.customers = state.customers.filter(c => c._id !== action.payload);
      });
  },
});

export default customersSlice.reducer;